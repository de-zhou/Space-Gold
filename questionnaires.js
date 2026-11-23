// Questionnaires posés dans l'appli, après l'essai :
//  - SRBAI (automaticité) : une fois par jour
//  - SIMS (motivation, version adaptée) : une fois par semaine, après le SRBAI
// Les textes se règlent dans settings.js (blocs questionnaires, srbai et sims).
// L'ordre des énoncés est mélangé à chaque passation et l'ordre vu est enregistré.

function qOrder(n, randomize) {
	var a = [];
	for (var i = 0; i < n; i++) { a.push(i); }
	if (randomize) { // Fisher-Yates
		for (var k = n - 1; k > 0; k--) {
			var j = Math.floor(Math.random() * (k + 1));
			var t = a[k]; a[k] = a[j]; a[j] = t;
		}
	}
	return a;
}

function qStorageKey(name) {
	return 'sg_' + name + '_' + data_helper.get_subject_id() + '_' + app_settings.context;
}
function qLocalDone(name, value) { // mémoire locale du téléphone (au cas où les données du serveur ne seraient pas encore à jour)
	try { return localStorage.getItem(qStorageKey(name)) === String(value); } catch (e) { return false; }
}
function qMarkDone(name, value) {
	try { localStorage.setItem(qStorageKey(name), String(value)); } catch (e) { }
}

function qInjectStyle() {
	if (document.getElementById('questionnaire_style')) { return; }
	var st = document.createElement('style');
	st.id = 'questionnaire_style';
	st.textContent =
		'#questionnaire_overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:var(--sg-bg,#d6f5ff);z-index:2147483000;display:flex;align-items:center;justify-content:center;font-family:\'League Spartan\',Arial,Helvetica,sans-serif;color:var(--sg-text,#06465b)}' +
		'#q_card{width:92%;max-width:520px;text-align:center}' +
		'#q_progress{font-size:4.4vw;opacity:.7;margin-bottom:5vh;font-weight:600}' +
		'#q_stem{font-size:5.6vw;line-height:1.3;margin-bottom:3vh;font-weight:600}' +
		'#q_item{font-size:6.6vw;font-weight:700;line-height:1.25;margin-bottom:6vh}' +
		'#q_scale{display:flex;justify-content:space-between;gap:1.2vw}' +
		'.q_btn{flex:1;font-family:inherit;font-size:6vw;padding:2.6vh 0;border:0.6vw solid var(--sg-text,#06465b);border-radius:12px;background:#ffffff;color:var(--sg-text,#06465b);touch-action:manipulation}' +
		'.q_btn.sel{background:var(--sg-text,#06465b);color:#ffffff;font-weight:700}' +
		'#q_labels{display:flex;justify-content:space-between;font-size:3.8vw;opacity:.85;margin:1.4vh 0 6vh;font-weight:600}' +
		'#q_next{font-family:inherit;font-size:5.6vw;font-weight:700;padding:2vh 10vw;border:none;border-radius:12px;background:var(--sg-text,#06465b);color:#ffffff}' +
		'#q_next:disabled{background:#9fb7bf;color:#ffffff}';
	document.head.appendChild(st);
}

// Affiche un questionnaire (un énoncé par écran, ordre éventuellement mélangé).
// Renvoie une promesse : { answers (dans l'ordre d'origine des énoncés), order (énoncés dans l'ordre vu, à partir de 1), times (ms par écran) }
function qShow(common, block) {
	return new Promise(function (resolve) {
		qInjectStyle();
		var n = block.items.length;
		var order = qOrder(n, common.randomizeOrder !== false);
		var answers = new Array(n), times = [], pos = 0, shownAt = 0, selected = null;

		var overlay = document.createElement('div');
		overlay.id = 'questionnaire_overlay';
		overlay.innerHTML =
			'<div id="q_card"><div id="q_progress"></div><div id="q_stem"></div><div id="q_item"></div>' +
			'<div id="q_scale"></div><div id="q_labels"><span></span><span></span></div>' +
			'<button id="q_next" disabled></button></div>';
		document.body.appendChild(overlay);

		var scale = overlay.querySelector('#q_scale');
		var next = overlay.querySelector('#q_next');
		overlay.querySelector('#q_stem').textContent = block.stem;
		overlay.querySelectorAll('#q_labels span')[0].textContent = common.minLabel;
		overlay.querySelectorAll('#q_labels span')[1].textContent = common.maxLabel;

		var buttons = [];
		for (var v = 1; v <= (common.scaleMax || 7); v++) {
			(function (value) {
				var b = document.createElement('button');
				b.className = 'q_btn'; b.textContent = value;
				b.onclick = function () {
					selected = value;
					buttons.forEach(function (x) { x.classList.remove('sel'); });
					b.classList.add('sel');
					next.disabled = false;
				};
				scale.appendChild(b); buttons.push(b);
			})(v);
		}

		function render() {
			selected = null; next.disabled = true;
			buttons.forEach(function (x) { x.classList.remove('sel'); });
			overlay.querySelector('#q_progress').textContent = common.title + ' ' + (pos + 1) + ' / ' + n;
			overlay.querySelector('#q_item').textContent = block.items[order[pos]];
			next.textContent = (pos === n - 1) ? common.finishText : common.nextText;
			shownAt = Date.now();
		}
		next.onclick = function () {
			if (selected === null) { return; }
			answers[order[pos]] = selected;
			times.push(Date.now() - shownAt);
			pos++;
			if (pos >= n) {
				overlay.remove();
				resolve({ answers: answers, order: order.map(function (i) { return i + 1; }), times: times });
			} else { render(); }
		};
		render();
	});
}

// Appelée par app.js : pose les questionnaires dus (SRBAI chaque jour, SIMS chaque semaine), un par un.
async function runDueQuestionnaires(runData) {
	var settings = app_settings;
	var common = settings.questionnaires;
	if (!common || !common.enabled || !runData || runData.isDemo) { return; }
	var test = isTestSubject(settings); // pour les participants de test : questionnaires posés à chaque essai
	var day = runData.day || 1;
	var week = runData.weekOfExperiment || 1;

	var due = [];
	if (settings.srbai && !runData.srbaiDoneToday && (test || !qLocalDone('srbai', day))) { due.push('srbai'); }
	if (settings.sims && !runData.simsDoneThisWeek && (test || !qLocalDone('sims', week))) { due.push('sims'); }

	for (var k = 0; k < due.length; k++) {
		var name = due[k];
		var block = settings[name];
		appRunning = false; // comme pour les boîtes de dialogue : n'empêche pas une nouvelle entrée de l'appli
		var startTime = new Date();
		var res = await qShow(common, block);
		var msg = { commitSession: true };
		msg[name + 'StartTime'] = startTime;
		msg[name + 'Time'] = new Date();
		msg[name + 'Day'] = day;
		msg[name + 'Week'] = week;
		msg[name + 'Order'] = res.order;
		msg[name + 'ResponseTimes_ms'] = res.times;
		res.answers.forEach(function (a, i) { msg[name + '_' + (i + 1)] = a; });
		if (name === 'srbai') {
			msg.srbaiMean = res.answers.reduce(function (s, x) { return s + x; }, 0) / res.answers.length;
		}
		subject_data_worker.postMessage(msg);
		qMarkDone(name, name === 'srbai' ? day : week);
		appRunning = true;
	}
}
