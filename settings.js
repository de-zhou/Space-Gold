// ============================================================================
// FICHIER DE RÉGLAGES - VERSION RÉELLE DE L'ÉTUDE
//
// 1) A REMPLACER avant de générer les liens (3 endroits juste en dessous) :
//      - les deux adresses du serveur (celles que Render te donnera)
//      - l'adresse du site GitHub Pages
//      - le nom de l'appli (doit être IDENTIQUE au nom du dépôt GitHub)
// 2) Les blocs marqués [NOUVEAU] décrivent les règles par groupe (nombre
//    d'essais par jour, valeur des récompenses, fréquence du questionnaire).
//    Ils ne sont PAS ENCORE actifs : il faut d'abord que le code de l'appli
//    (logic.js, app.js, helpers.js) soit mis à jour pour les lire.
// ============================================================================
window.app_settings = {
  server: {
    base_address: "https://space-gold.onrender.com",
    ws_base_address: "wss://space-gold.onrender.com"
  },
  app_base_adress: "https://de-zhou.github.io/Space-Gold/",
  context: "Space Gold",
  one_time_link: true,
  downloadAllToLocalStorage: false,
  minDailyDataPointsToStoreLocally: 20,
  experimentalDayStartingHour: 5,
  pressesRequired: 2,
  rewards: {
    isRatioSchedule: true, // true = tirage à chaque essai (et non selon le temps écoulé)
    winningRate: 1, // 1 = récompense à CHAQUE essai (probabilité 1/1)
    winningChancePerUnit: function () {
			return 1 / this.winningRate;
		},
    isVariableReward: false,
    rewardConstantSum: 1, // valeur par défaut ; la valeur réelle dépend du groupe (voir group_vars, [NOUVEAU])
    minWinningSum: 1,
    maxWinningSum: 1,
    winAnywayIfMultipleNonWins: false,
    RelativeNonWinUnitsBeforeSureWinning: function () {
			return this.winningRate * 2;
		},
    enforceFirstEntryNoWinSecondEntryWin: false,
    enforce_n_random_winnings_during_minimum_entries: false,
    n_random_winnings_during_minimum_entries: 2,
    notifyRewardContainerReset: false, // l'entrepôt n'existe plus dans le jeu
    includeAversiveOutcome: false,
    losingRate: 3,
    losingChancePerUnit: function () {
			return 1 / this.losingRate;
		},
    isVariableLoss: false,
    lossConstantSum: 15,
    minLosingSum: 20,
    maxLosingSum: 30
  },
  cost: {
    isCost: false, // coût d'entrée désactivé : avec un coût de 1 et une récompense de 1, le groupe "10 fois par jour" ne gagnerait rien en net
    isCostPerPress: false,
    isVariableCost: false,
    minCostSum: 1,
    maxCostSum: 5,
    costConstantSum: 1,
    presentCost: true
  },
  forceDeval: null,
  // Deux groupes, déterminés par le numéro du participant (voir group_assignment_by_subject_number) :
  //   group_A = peu de répétition  : 1 essai par jour, récompense de 10 par essai
  //   group_B = beaucoup de répétition : 10 essais par jour, récompense de 1 par essai
  // Le total possible de récompenses par jour est le même (10) dans les deux groupes.
  group_vars: {
    group_A: {
      dayToFinishExperiment: 14,
      daysWithControlManipulations: [],
      daysWithDevaluationManipulations: [],
      dailyEntriesRequired: 1,   // [NOUVEAU] minimum d'essais par jour pour que les points comptent
      dailyEntriesMax: 1,        // [NOUVEAU] au-delà : l'appli est bloquée jusqu'au lendemain
      rewardPerWin: 10           // [NOUVEAU] valeur d'une récompense
    },
    group_B: {
      dayToFinishExperiment: 14,
      daysWithControlManipulations: [],
      daysWithDevaluationManipulations: [],
      dailyEntriesRequired: 10,
      dailyEntriesMax: 10,
      rewardPerWin: 1
    }
  },
  // Tranches de numéros de participants par groupe (identiques à celles déjà gérées par logic.js, et à celles du script de liens)
  group_assignment_by_subject_number: {
    group_A: [101, 199],
    group_B: [201, 299]
  },
  // [NOUVEAU] écran affiché quand le plafond d'essais du jour est atteint, et enregistrement des tentatives bloquées
  dailyLimit: {
    logBlockedAttempts: true,
    blockedMessage: "You have completed your sessions for today.<br><br>See you tomorrow!"
  },
  // [NOUVEAU] questionnaire d'automaticité (SRBAI), posé après l'essai, au maximum une fois par jour
  // ATTENTION : vérifier la formulation avec la version officielle validée (Gardner et al., 2012) et la langue des participants.
  srbai: {
    enabled: true,
    everyNDays: 1, // une fois par jour pour tous les participants
    title: "Question",
    stem: "Opening the app when I see it is something...",
    items: [
      "I do automatically",
      "I do without having to consciously remember",
      "I do without thinking",
      "I start doing before I realise I'm doing it"
    ],
    scaleMax: 7,
    minLabel: "Strongly disagree",
    maxLabel: "Strongly agree",
    nextText: "Next",
    finishText: "Finish"
  },
  feedback_in_devalued_actions: false,
  entry_to_manipulate_in: 0,
  hour_at_day_to_manipulate_anyway: 14,
  referenceDayPrecentileForManipulation: 0.5,
  nTimesToShowCaveIfNotEntering: 2,
  maxSecsToShowCaveAgainIfNotEntering: 30,
  nTrialsBeforeNotifyGameOver: 3,
  nDailyEntriesRequired: function () { return this.entry_to_manipulate_in; },
  msToRecordTimeSinceManipulationActivation: 500,
  coinCollectionTask: {
    includeRocks: true,
    includeBombs: false,
    duration: 5,
    openningAnimTime: 1500,
    element_disappearing_time: 150,
    nStim: 30,
    bg_img_path: "images/cave.jpg",
    outcome_win_image_path: "images/outcome_win.png",
    outcome_loss_image_path: "images/outcome_loss.png",
    outcome_no_win_image_path: "images/outcome_no_win.png",
    outcomeImageHeightWidthRatio: 0.9312320916905444,
    stimSizeProportionOfScreen: 0.15,
    textSizeProportionOfScreenWidth: 0.15,
    ProportionOfScreenWidthToPlaceCounter: 0.9,
    ProportionOfScreenHeightToPlaceCounter: 0.05,
    counterTextColor: [0,0,255],
    finishMessageTextColor: [0,0,255],
    finishMessage: "Goodbye",
    costPerPress: 10,
    rewardPerCoinStash: function () { return app_settings.rewards.rewardConstantSum }
  },
  hideOutcome: {
    hide: false,
    hideOnlyUnderManipulationPeriods: false,
    daysToHideAt_UntilTomorrow: {
      group_A: [],
      group_B: [],
      group_C: [],
      group_D: []
    },
    entry_to_hideOutcome_in: 0,
    daysToHideAt_Randomly: {
      group_A: [],
      group_B: [],
      group_C: [],
      group_D: []
    },
    chance_to_begin_hiding_batch_when_Random: 0,
    n_entriesToHide_when_Random: 0
  },
  lottery_N_frames: 35,
  durations: {
    entranceMessage: 800,
    lotteryAnim: 3500,
    intervalBetweenLotteryAndOutcomeAnim: 2800,
    outcomeAnim: 2000,
    intervalBetweenOutcomeAndNextThing: 1000,
    costAnim: 1500,
    surface_disappearance: 700
  },
  text: {
    confirmationCodeTextMessage: "\nPlease enter the following letters to confirm that you have read the message: ",
    realGameBegins: "The real game starts now.<br>The gold you will accumulate from now on is worth real money.<br><br>Good Luck!",
    endExperiment: function (baselineAccumulatedReward) {
			return 'The game is over. Thank you for participating!' + '<br><br>' +
				'You managed to bring to earth '
				+ baselineAccumulatedReward // This was designed to replace the line below.
				// + logic.calculateReward(subData, app_settings.coinCollectionTask, dayToFinishExperiment)
				+ ' Gold units!'
		},
    noConnectionToEndExperiment: "Unable to connect to the server.<br><br>Please verify you have network connection and try again.",
    loadingDataError: "There is a problem!<br><br>A. Please make sure you are connected to the internet.<br>B. Try closing the app and reentering.<br><br>If it is still not working, please contact [NAME] at: [PHONENUMBER]."
  },
  allowInstructions: true,
  allowDemo: true,
  demoCycle: {
    0: {
      isWin: true,
      isLoss: false,
      whichManipulation: null,
      activateManipulation: false,
      isUnderManipulation: false,
      toHideOutcome: false,
      resetContainer: false,
      consumptionTest: false
    },
    1: {
      isWin: true,
      isLoss: false,
      whichManipulation: null,
      activateManipulation: false,
      isUnderManipulation: false,
      toHideOutcome: false,
      resetContainer: false,
      consumptionTest: false
    }
  },
  demoCycleSupportingText: {
    0: {
      a: "We prepared a demo for you with a virtual screen that simulates a smartphone.<br> Tap the app to launch your spaceship to a gold-seeking mission. First, you will see your spaceship landing.",
      b: "Now tap the bottom half of the screen and then on the top half to remove the ice layer and enable the gold search. After a few seconds of searching, the outcome will be presented.",
      c: "In this round you have found gold!<br>Immediately afterwards, the end message appears (\"See you next time\"). When this message appears, it means that the search result has been recorded and you can exit the app. To exit the app in this demo, tap the home button on the virtual smartphone."
    },
    1: "Now you will enter (and exit) the app once more. Every entry works exactly the same way: you tap the bottom half and then the top half of the screen, and the outcome is presented."
  },
  instructionsFileName: "instructions.html",
  // Images d'instructions vues par chaque groupe, dans l'ordre. Chaque nom correspond au fichier
  // images/instructions/instructions_<nom>.jpg  (ex. 8_A -> instructions_8_A.jpg).
  // Pages retirées par rapport à la version d'origine : 9, 10, 11, 13, 14, 15, 16, 17.
  // Les deux avant-dernières et dernières pages (23 et 24) doivent rester en dernier :
  // la page 23 est celle qui annonce la démo.
  instruction_pages: {
    group_A: [1, 2, 3, 4, 5, 6, 7, "8_A", 12, 18, 19, 20, 21, 22, 23, 24],
    group_B: [1, 2, 3, 4, 5, 6, 7, "8_B", 12, 18, 19, 20, 21, 22, 23, 24]
  },
  lastInstructionsPageExplainsDemo: true,
  instructions_test_questions: function (group) {
    var g = this.group_vars[group] || this.group_vars.group_A;
    var perDay = g.dailyEntriesMax;
    var reward = g.rewardPerWin;
    var units = function (n) { return n + (n === 1 ? " gold unit" : " gold units"); };
    var otherAmounts = [1, 5, 10, 15].filter(function (n) { return n !== reward; }).slice(0, 2);
    return {
      1: {
        question: "How many times a day can I enter the app to look for gold?",
        correct_answer: perDay === 1 ? "Once a day." : "Up to " + perDay + " times a day.",
        distractor_1: "As many times as I want.",
        distractor_2: perDay === 2 ? "Once a day." : "Twice a day.",
        distractor_3: "Only on some days of the week."
      },
      2: {
        question: "How much gold am I given each time I find gold?",
        correct_answer: units(reward) + ".",
        distractor_1: units(otherAmounts[0]) + ".",
        distractor_2: units(otherAmounts[1]) + ".",
        distractor_3: "The amount changes every time."
      },
      3: {
        question: "Is there a cost to enter the app?",
        correct_answer: "No, entering the app is free.",
        distractor_1: "Yes, it costs 1 gold unit.",
        distractor_2: "Yes, it costs 10 gold units.",
        distractor_3: "Yes, the cost changes every time."
      },
      4: {
        question: "What do I have to do once the app is open?",
        correct_answer: "Tap the bottom half of the screen, and then the top half.",
        distractor_1: "Tap the top half of the screen, and then the bottom half.",
        distractor_2: "Tap the middle of the screen as many times as I can.",
        distractor_3: "Nothing, I just have to wait."
      },
      5: {
        question: "When can I close the app?",
        correct_answer: "When the message \"See you next time\" appears.",
        distractor_1: "As soon as I see the outcome.",
        distractor_2: "Right after the two taps.",
        distractor_3: "After one minute."
      },
      6: {
        question: "What happens when I have already used the app the maximum number of times today?",
        correct_answer: "I have to wait until the next day to use it again.",
        distractor_1: "I can keep using it, but I will not earn gold.",
        distractor_2: "I lose the gold I have collected.",
        distractor_3: "The game ends for me.",
      },
      toRandomizeQuestions: false,
      dont_know_answer: "I don't know."
    };
  },
  instructions_HTML_title: "Instructions",
  instructions_main_HTML_element: "instructions_iframe",
  App_HTML_title: function () { return this.context.replace(/_/g, ' ') },
  App_main_HTML_element: "main_container",
  dataVarList: ["serial","uniqueEntryID","subId","group","context","day","isWin","isLoss","reward","cost","baselineAccumulatedReward","resetContainer","resetContainerConfirmationTime","manipulationToday","activateManipulation","isUnderManipulation","hideOutcome","isFirstTime","todayInitialOutcomes","startTime","press1Time","press2Time","outcomeTime","endTime","manipulationAlertTime","showInstructions","instructionsStartedFlag","completedInstructions","isDemo","demoTrialNum","isDialogOn","coin_task_finish_status","endExperiment","manipulationConfirmationTime","manipCheckAlertTime","manipChecConfirmationTime","localSessionId"]
}
