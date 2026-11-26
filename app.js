async function runApp() {
	appRunning = true; // used to determine whther a new session can start
	clearTimeout(checkIfAppStartedRunning) // Stop checking (through the index.html that app started running on the first time)
	var oldQuestionnaire = document.getElementById('questionnaire_overlay'); // remove a questionnaire left by a previous run
	if (oldQuestionnaire) { oldQuestionnaire.remove(); }
	var oldLimitScreen = document.getElementById('daily_limit_screen'); // remove the "daily limit" screen if it was shown by a previous run
	if (oldLimitScreen) { oldLimitScreen.remove(); }
	// ****************************************************************
	//           SET & INITIALIZE STUFF:
	// ----------------------------------------------------------------
	var startTime = new Date(); // Get time of entry:

	// log the app entry time immeditaly to stash
	var stash = offline_data_manager.stash.get() || {};
	if (!stash.appLoadTimes) {
		offline_data_manager.stash.append({ appLoadTimes: [startTime] });
	} else {
		stash.appLoadTimes.push(startTime);
		offline_data_manager.stash.append({ appLoadTimes: stash.appLoadTimes })
	}

	if (document.visibilityState !== 'visible') { return } // Stop if from some reason initiated when app is not visible

	// check if implemented as PWA and handle accordingly:
	// ********************************************************
	if (typeof isPWA === 'undefined') { isPWA = await checkAndHandlePWA() };
	if (!isPWA) { return }
	// ********************************************************

	// Check and Handle service worker updates (the methods will cause a full implementatin of the changes on the 2nd trial following the change in code):
	// ********************************************************
	if (!!reloadDueToNew_sw_installed) { window.location.reload(); return } // reload if service worker was updated ():
	if (typeof swRegObject !== 'undefined') { console.log('Service Worker: checkig for update'); swRegObject.update(); }; // check for update in sw if it's not the first trial after app (full) reload (in app full reload it is anyway set to check for new updates)
	// ********************************************************

	// make sure all images were appropriately loaded:
	// ********************************************************
	await Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = resolve; }))).then(() => {
		console.log('images finished loading');
	});
	if (!!Array.from(document.images).filter(img => img.id !== "installation_guide" && img.naturalHeight === 0).length) { // check that all images were successfully loaded - detects if there was an error in loading an image
		console.log('Problem in image loading');

		// log problem with image loading to stash
		if (!stash.imgLoadingProblem) {
			offline_data_manager.stash.append({ imgLoadingProblem: [new Date()] });
		} else {
			stash.imgLoadingProblem.push(new Date());
			offline_data_manager.stash.append({ imgLoadingProblem: stash.imgLoadingProblem })
		}

		// reload page after unregistering service worker and
		navigator.serviceWorker.getRegistration().then(function (reg) {
			if (reg) {
				reg.unregister().then(function () { clearCacheAndReload() });
			} else {
				clearCacheAndReload()
			}
		});
		return
	}
	// ********************************************************
	dom_helper.show('main_container')

	// Define variables used to prevent two instances of the app running in simultaniously when reloading
	let identifier = startTime.getTime(); // local within this instance
	recordIdentifier = identifier; // global to communicate with the handle_events.js file

	var settings = Object.assign({}, app_settings);

	// create new session with server only after logic is called! (important for demo to work)
	const sessionPrefix = 'app';
	data_helper.init_session(sessionPrefix, false);

	// get subject data from batch session
	var checkLoading = setTimeout(() => {
		console.log('data not loading... RELOADING page')
		location.reload()
	}, 10000)
	var timer = new Date();
	try {
		do {
			if (new Date() - timer < 5000) { // In case the data is taken before saving was completed from last session it will try for 5 seconds to get the data again and check that it's fine (measured by having a uniqueEntryID).
				var subData = await data_helper.get_subject_data(true).catch(function (e) {
					console.log('error getting subject data');
					console.log(e);
				});
			} else if (new Date() - timer < 7000) {
				try {
					Object.keys(subData).forEach(function (key) { // After 5 seconds in case there still no good data from what supposedly was the last run, it is probabale that a problem occured or that no data had the chance to be normally saved and the last "trial/s" will be removed.
						subData[key] = subData[key].slice(0, subData[key].length - 1);
					});
				} catch (err) {
					console.log(err)
					location.reload()
					return
				}
			} else {
				location.reload()
				return
			}
		} while (subData.uniqueEntryID.length > 1 && !subData.uniqueEntryID[subData.uniqueEntryID.length - 1])
	} catch (err) {
		console.log(err)
		await dialog_helper.show(settings.text.loadingDataError, img_id = '', confirmation = '', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false, preventFeedBack = true);
		return;
	}
	clearTimeout(checkLoading)

	// calculate run parameters
	var runData = logic.initialize(subData, settings);

	// try to resend missed messages again - this does not block execution
	offline_data_manager.resendMissed();

	// Giving a unique entry ID (should be assigned only once on each entry). Creating it as a global variable:
	if (!subData.uniqueEntryID[subData.uniqueEntryID.length - 1]) {// should be assigned once every entry
		uniqueEntryID = 1;
	} else {
		uniqueEntryID = subData.uniqueEntryID[subData.uniqueEntryID.length - 1] + 1;
	}

	// when we have uniqueEntryID, append stashed information to current sessionName
	data_helper.appendStashedData();

	// END OF THE STUDY (from day 29): only the end image is shown, no trial. The opening is recorded.
	if (runData.endExperiment) {
		subject_data_worker.postMessage({ subId: data_helper.get_subject_id(), day: runData.day, group: runData.group, studyEndOpenTime: startTime, dataLoadingTime: (new Date) - startTime, commitSession: true });
		dom_helper.hide('app_will_load_soon');
		dom_helper.hide('loading_animation');
		showDailyLimitScreen(settings, 'end');
		appRunning = false;
		return;
	}

	// SECOND APP BEFORE THE SWITCH DAY: this app is not in use yet. The very first opening is the installation check (shown once),
	// the next ones show a neutral "not yet" screen. These openings are recorded but they do NOT start the study (no startTime).
	if ((settings.app_role || 'first') === 'second' && (runData.showInstructions || runData.isFirstTime || !(runData.day >= settings.switch_day))) {
		var secondKind = runData.installCheckDone ? 'early' : 'install_check';
		subject_data_worker.postMessage({ subId: data_helper.get_subject_id(), appRole: 'second', day: runData.day, secondAppOpenTime: startTime, secondAppOpenKind: secondKind, dataLoadingTime: (new Date) - startTime, commitSession: true });
		dom_helper.hide('app_will_load_soon');
		dom_helper.hide('loading_animation');
		showDailyLimitScreen(settings, secondKind === 'install_check' ? 'install_ok' : 'not_yet');
		appRunning = false;
		return;
	}

	// FIRST APP FROM THE SWITCH DAY: the game continues in the second app. Opening this one is a "slip" (recorded), an image is shown.
	if ((settings.app_role || 'first') === 'first' && !runData.showInstructions && !runData.isFirstTime && runData.day >= settings.switch_day) {
		subject_data_worker.postMessage({ subId: data_helper.get_subject_id(), appRole: 'first', day: runData.day, group: runData.group, slipTime: startTime, dataLoadingTime: (new Date) - startTime, commitSession: true });
		dom_helper.hide('app_will_load_soon');
		dom_helper.hide('loading_animation');
		showDailyLimitScreen(settings, 'slip');
		appRunning = false;
		return;
	}

	// DAILY LIMIT: the participant already did all the entries allowed today -> show the "blocked" image and stop here
	if (runData.dailyLimitReached) {
		if (!settings.dailyLimit || settings.dailyLimit.logBlockedAttempts !== false) { // record the attempt (it is NOT counted as an entry)
			subject_data_worker.postMessage({ subId: data_helper.get_subject_id(), day: runData.day, group: runData.group, blockedAttemptTime: startTime, blockedEntriesToday: runData.entryNumberToday - 1, dailyEntriesMax: runData.dailyEntriesMax, dataLoadingTime: (new Date) - startTime, commitSession: true });
		}
		dom_helper.hide('app_will_load_soon');
		dom_helper.hide('loading_animation');
		await runDueQuestionnaires(runData); // questionnaires still due (the participant left the app before answering)
		await runSwitchReminder(runData);
		if (identifiersToClean.includes(identifier)) { appRunning = false; return };
		showDailyLimitScreen(settings);
		appRunning = false;
		return;
	}

	// MINIMUM TIME BETWEEN ENTRIES: it is too early for a new entry -> show the "come back later" image and stop here
	if (runData.waitRequired) {
		if (!settings.dailyLimit || settings.dailyLimit.logBlockedAttempts !== false) { // record the attempt (it is NOT counted as an entry)
			subject_data_worker.postMessage({ subId: data_helper.get_subject_id(), day: runData.day, group: runData.group, waitAttemptTime: startTime, waitMinutesLeft: Math.ceil(runData.minMinutesBetweenEntries - runData.minutesSincePreviousEntry), blockedEntriesToday: runData.entryNumberToday - 1, dataLoadingTime: (new Date) - startTime, commitSession: true });
		}
		dom_helper.hide('app_will_load_soon');
		dom_helper.hide('loading_animation');
		await runDueQuestionnaires(runData);
		await runSwitchReminder(runData);
		if (identifiersToClean.includes(identifier)) { appRunning = false; return };
		showDailyLimitScreen(settings, 'wait');
		appRunning = false;
		return;
	}

	// Save the data and refer to instructions if relevant:
	if (runData.showInstructions) {
		subject_data_worker.postMessage({ ...runData, startInstructionsTime: startTime, dataLoadingTime: (new Date) - startTime, visibilityStateOnFirstDataSaving: document.visibilityState, commitSession: true });
		appRunning = false
		// create instructions iframe:
		var instructionsUrl = "instructions.html" + location.search;
		instructionsElement = document.createElement('iframe');
		instructionsElement.setAttribute("id", 'instructions_iframe')
		instructionsElement.setAttribute("src", instructionsUrl)
		document.body.appendChild(instructionsElement)
		return;
	} else {
		subject_data_worker.postMessage({ ...runData, startTime: startTime, dataLoadingTime: (new Date) - startTime, commitSession: true });
	}

	// assign animation times according to settings:
	document.getElementById('outcome_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's'
	document.getElementById('outcome_loss').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's'
	document.getElementById('outcome_no_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's'
	document.getElementById('outcome_text_1_').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's'
	document.getElementById('superimposed_outcome_sum').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's'
	document.getElementById('lottery').style.animationDuration = String(settings.durations.lotteryAnim / 1000) + 's'  // add animation duration

	// ****************************************************************
	//           RUN THE APP
	// ----------------------------------------------------------------
	if (runData.isDemo) {
		await delay(500); // to account for time it takes the embedded app to be openned.
	}

	dom_helper.hide('app_will_load_soon');
	dom_helper.hide('loading_animation');

	if (runData.isFirstTime) { // a message that the real game begins (after instruction [and demo if relevant])
		subject_data_worker.postMessage({ realGameBeginsAlertTime: new Date() })
		await dialog_helper.show(settings.text.realGameBegins, img_id = 'game_begins_image');
		subject_data_worker.postMessage({ realGameBeginsConfirmationTime: new Date() })
	}

	// cover the outcome:
	if (runData.hideOutcome) {
		dom_helper.show("cover");
	}

	// show spaceship landing animation (only if settings.showEntranceRocket is true; off in this study):
	if (settings.showEntranceRocket) { dom_helper.show('spaceship'); }

	// define top & bottom click operations
	var lowerHalfClicked = false;

	var p1 = new Promise((resolve, reject) => {
		document.getElementById('lower_half').onclick = function () {
			if (!lowerHalfClicked) {
				dom_helper.remove_css_class('lower_half', 'blinkable');

				subject_data_worker.postMessage({ press1Time: new Date(), visibilityStatePress1: document.visibilityState });

				document.getElementById('ice_lower').style.animationDuration = String(settings.durations.surface_disappearance / 1000) + 's'
				document.getElementById('ice_lower').style.animationName = "ice_breaking";

				dom_helper.add_css_class('upper_half', 'blinkable');
				lowerHalfClicked = true;
				resolve();
			}
		}
	});

	var p2 = new Promise((resolve, reject) => {
		document.getElementById('upper_half').onclick = function () {
			if (lowerHalfClicked) {
				dom_helper.remove_css_class('upper_half', 'blinkable');

				subject_data_worker.postMessage({ press2Time: new Date(), visibilityStatePress2: document.visibilityState });

				document.getElementById('ice_upper').style.animationDuration = String(settings.durations.surface_disappearance / 1000) + 's'
				document.getElementById('ice_upper').style.animationName = "ice_breaking"

				resolve();
			}
		}
	});

	// load the lottery animation frames (during the spaceship animation)
	loadLotteryFrames(settings.lottery_N_frames)

	// hide entrance graphics and show the sequence pressing inteface
	if (settings.showEntranceRocket) { await delay(settings.durations.entranceMessage); }
	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)
	dom_helper.hide("spaceship");
	dom_helper.show("upper_half");
	dom_helper.show("lower_half");

	// For the flow of the demo:
	if (runData.isDemo) {
		subject_data_worker.postMessage({ broadcast: 'sequence_entering_stage_presented' });
	}

	// wait for 2 clicks to happen
	appRunning = false;
	await Promise.all([p1, p2]);
	appRunning = true;

	// hide sequence pressing inteface and show lottery animation
	document.getElementById('lower_half').onclick = undefined;
	document.getElementById('upper_half').onclick = undefined;

	dom_helper.hide("upper_half");
	dom_helper.hide("lower_half");

	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)

	runLottery(settings.durations.lotteryAnim / settings.lottery_N_frames, settings.lottery_N_frames, identifier);

	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)

	// wait until gif animation is finished
	await delay(settings.durations.intervalBetweenLotteryAndOutcomeAnim);
	setTimeout(() => {
		if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)
	}, settings.durations.lotteryAnim - settings.durations.intervalBetweenLotteryAndOutcomeAnim);

	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)

	if (!runData.hideOutcome) { // presenting the outcome:
		if (runData.isWin) {
			var outcomeText = "Vous avez trouvé " + runData.reward + (runData.reward === 1 ? " unité d’or" : " unités d’or")
			var outcomeElementID = 'outcome_win'
		} else if (runData.isLoss) {
			var outcomeText = "Vous avez perdu " + runData.reward + (runData.reward === 1 ? " unité d’or" : " unités d’or")
			var outcomeElementID = 'outcome_loss'
		} else {
			var outcomeText = "No gold this time"
			var outcomeElementID = 'outcome_no_win'
		}

		// show outcome:
		dom_helper.show(outcomeElementID);
		dom_helper.add_css_class(outcomeElementID, 'goUpOutcomeImage');

		// add a superimposed text on the outcome:
		dom_helper.set_text('superimposed_outcome_sum_txt', runData.reward);
		dom_helper.show('superimposed_outcome_sum');
		dom_helper.add_css_class('superimposed_outcome_sum', 'goUpOutcomeImage');

		// add text about the outcome below the outcome image:
		dom_helper.set_text('outcome_text_1_', outcomeText);
		dom_helper.show("outcome_text_1_");
		dom_helper.add_css_class('outcome_text_1_', 'appearSlowlyOutcomeText');
	}

	// get time of outcome presentation: **
	subject_data_worker.postMessage({ outcomeTime: new Date() });

	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)


	// show winning/loosing message for 2 seconds
	await delay(settings.durations.intervalBetweenOutcomeAndNextThing);

	//
	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)
	//

	// The questionnaires that are due (SRBAI every day, SIMS every week) come after the outcome
	await runDueQuestionnaires(runData);
	await runSwitchReminder(runData); // reminder (image + button) that the second app takes over soon
	if (identifiersToClean.includes(identifier)) { appRunning = false; return }; // Stop running the function if the app is reloaded (and thus a new instance started)

	// The trial is over (connection, two presses, animation, outcome, questionnaires): goodbye message and saving
	finishTrial(runData)
};

// Full-screen image shown instead of the game:
//   (default) the maximum number of entries of the day is reached  - settings.dailyLimit.image
//   'wait'       it is too early for a new entry                       - settings.dailyLimit.waitImage
//   'end'        the study is over (day 29 and after)                  - settings.dailyLimit.endImage
//   'slip'       first app after the switch day (the game moved to the second app) - settings.roleScreens.slipImage
//   'install_ok' second app, first opening (installation check)       - settings.roleScreens.installOkImage
//   'not_yet'    second app before the switch day                      - settings.roleScreens.notYetImage
// All images are created by the researcher; if an image cannot be loaded, a text message is shown instead.
function showDailyLimitScreen(settings, kind) {
	var cfg = settings.dailyLimit || {};
	var rs = settings.roleScreens || {};
	var screens = {
		end: [cfg.endImage || 'images/study_end.jpg', cfg.endFallbackText || 'L’étude est terminée.'],
		wait: [cfg.waitImage || 'images/wait.jpg', cfg.waitFallbackText || 'Merci de revenir un peu plus tard.'],
		slip: [rs.slipImage || 'images/slip.jpg', rs.slipFallbackText || 'Vous vous êtes trompé·e d’application.'],
		install_ok: [rs.installOkImage || 'images/install_ok.jpg', rs.installOkFallbackText || 'Installation réussie ✓'],
		not_yet: [rs.notYetImage || 'images/not_yet.jpg', rs.notYetFallbackText || 'Cette application n’est pas encore disponible.']
	};
	var chosen = screens[kind] || [cfg.image || 'images/blocked.jpg', cfg.fallbackText || 'Vous avez terminé pour aujourd’hui.<br><br>À demain !'];
	var old = document.getElementById('daily_limit_screen');
	if (old) { old.remove(); }
	var box = document.createElement('div');
	box.id = 'daily_limit_screen';
	box.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:' + (cfg.backgroundColor || '#d6f5ff') + ';';
	var img = document.createElement('img');
	img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
	img.onerror = function () {
		img.remove();
		var p = document.createElement('p');
		p.style.cssText = 'color:#06465b;font-family:\'League Spartan\',Arial,Helvetica,sans-serif;font-weight:600;font-size:6vw;text-align:center;padding:0 8vw;';
		p.innerHTML = chosen[1];
		box.appendChild(p);
	};
	img.src = chosen[0];
	box.appendChild(img);
	document.body.appendChild(box);
}
