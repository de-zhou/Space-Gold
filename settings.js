// ============================================================================
// FICHIER DE RÉGLAGES - SPACE GOLD (VERSION RÉELLE DE L'ÉTUDE)
//
// Les deux conditions sont décrites dans group_vars (valeur de la récompense, nombre maximum de
// connexions par jour, délai entre deux connexions) et dans instruction_pages (images d'instructions).
// Les questionnaires SRBAI (chaque jour) et SIMS (chaque semaine) se règlent dans les blocs srbai et sims.
// ============================================================================
window.app_settings = {
  server: {
    base_address: "https://space-gold.onrender.com",
    ws_base_address: "wss://space-gold.onrender.com"
  },
  app_base_adress: "https://de-zhou.github.io",
  context: "Space-Gold", // doit être identique au nom du dépôt GitHub (Space-Gold) : il sert dans l'adresse du site
  app_display_name: "Space Gold", // nom affiché sous l'icône et dans le titre de la page
  one_time_link: true,
  installation_guide_extension: "jpg", // guides d'installation : images/instructions/installation_guide_iOS.png et installation_guide_Android.png
  // Participants de TEST : leur lien est réutilisable par plusieurs personnes, sans limite d'essais par jour,
  // sans délai d'attente, sans fin d'étude, et les questionnaires leur sont reposés à chaque essai.
  // Ne pas les inclure dans l'analyse des données (le numéro 299 est dans la tranche du groupe B).
  test_subjects: [299],
  showEntranceRocket: false, // true = la fusée atterrit à chaque entrée (ancienne version) ; false = on passe directement aux deux appuis
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
    rewardConstantSum: 1, // valeur par défaut ; la valeur réelle dépend du groupe (voir group_vars)
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
  forceDeval: null,
  // Deux conditions, déterminées par le numéro du participant (voir group_assignment_by_subject_number) :
  //   group_A : 1 connexion par jour puis l'appli se bloque, 10 or à chaque récompense (images 8_A et 10_A)
  //   group_B : 10 connexions par jour (espacées d'au moins 30 minutes) puis l'appli se bloque, 1 or à chaque récompense (images 8_B et 10_B)
  // Le total possible par jour est le même (10 or) dans les deux conditions.
  group_vars: {
    group_A: {
      dayToFinishExperiment: 29, // 28 jours de jeu : à partir du jour 29, l'appli affiche l'écran de fin
      daysWithControlManipulations: [],
      daysWithDevaluationManipulations: [],
      dailyEntriesMax: 1,   // nombre maximum d'essais par jour ; ensuite l'appli est bloquée jusqu'au lendemain (5 h du matin)
      rewardPerWin: 10      // valeur d'une récompense
    },
    group_B: {
      dayToFinishExperiment: 29, // 28 jours de jeu : à partir du jour 29, l'appli affiche l'écran de fin
      daysWithControlManipulations: [],
      daysWithDevaluationManipulations: [],
      dailyEntriesMax: 10,
      rewardPerWin: 1,
      minMinutesBetweenEntries: 30 // délai minimum entre deux essais (compté depuis la fin du précédent) ; avant, l'appli affiche l'image d'attente
    }
  },
  // Tranches de numéros de participants par groupe (identiques à celles gérées par logic.js et par le script de liens)
  group_assignment_by_subject_number: {
    group_A: [101, 199],
    group_B: [201, 299]
  },
  // Écran affiché quand le maximum d'essais du jour est atteint : une image que tu crées toi-même.
  // Place ton image dans le dossier images, sous le nom indiqué ci-dessous (ou change le nom ici).
  dailyLimit: {
    image: "images/blocked.jpg",    // écran de fin de journée (maximum d'essais atteint)
    waitImage: "images/wait.jpg",   // écran "trop tôt" (groupe B : moins de 30 minutes depuis l'essai précédent)
    endImage: "images/study_end.jpg", // écran de fin d'étude (à partir du jour 29)
    backgroundColor: "#d6f5ff",     // couleur autour de l'image si elle ne remplit pas tout l'écran
    logBlockedAttempts: true,       // enregistrer chaque tentative d'ouverture bloquée (heure, jour, nombre d'essais déjà faits)
    // Textes de secours : affichés seulement si l'image correspondante est introuvable
    fallbackText: "Vous avez terminé pour aujourd’hui.<br><br>À demain !",
    waitFallbackText: "Merci de revenir un peu plus tard.",
    endFallbackText: "L’étude est terminée.<br><br>Vous allez recevoir un mail de récapitulatif.<br>Merci pour votre participation !"
  },
  // Réglages communs aux questionnaires (SRBAI et SIMS), posés après l'essai.
  // Ils sont posés à la fin d'un essai, ou à l'ouverture suivante si le participant a quitté l'appli avant d'avoir répondu.
  questionnaires: {
    enabled: true,
    randomizeOrder: false,          // false = énoncés dans l'ordre normal ; true = ordre mélangé à chaque passation (l'ordre vu est alors enregistré)
    scaleMax: 7,
    title: "Question",
    minLabel: "Pas du tout d’accord",
    maxLabel: "Tout à fait d’accord",
    nextText: "Suivant",
    finishText: "Terminer"
  },
  // SRBAI : une fois par jour (premier essai du jour), après l'essai
  srbai: {
    stem: "Ouvrir l’application quand je la vois sur mon écran est quelque chose…",
    items: [
      "… que je fais automatiquement",
      "… que je fais sans avoir besoin d’en prendre conscience",
      "… que je fais sans réfléchir",
      "… que je commence à faire avant même de me rendre compte que je le fais"
    ]
  },
  // SIMS (version adaptée) : une fois par semaine (jours 1, 8, 15, 22 de chaque participant), après le SRBAI
  sims: {
    stem: "Pourquoi avez-vous ouvert l’application ?",
    weekLength: 7,
    items: [
      "Parce que je trouve qu’ouvrir l’application est intéressant et plaisant",
      "Parce que je sens que je suis supposé·e le faire",
      "Parce que je souhaite obtenir de l’or dans l’application et gagner la loterie"
    ]
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
    surface_disappearance: 700
  },
  text: {
    confirmationCodeTextMessage: "\nVeuillez saisir les lettres suivantes pour confirmer que vous avez lu le message : ",
    realGameBegins: "Le vrai jeu commence maintenant.<br>L’or que vous accumulerez à partir de maintenant sera converti en tickets pour le tirage au sort.<br><br>Bonne chance !",
    endExperiment: function (baselineAccumulatedReward) {
      return 'L’étude est terminée. Merci de votre participation !' + '<br><br>' +
        'Vous avez rapporté ' + baselineAccumulatedReward + ' unités d’or !'
    },
    noConnectionToEndExperiment: "Impossible de se connecter au serveur.<br><br>Vérifiez votre connexion internet puis réessayez.",
    loadingDataError: "Un problème est survenu !<br><br>A. Vérifiez que vous êtes bien connecté·e à internet.<br>B. Essayez de fermer l’application puis de la rouvrir.<br><br>Si cela ne fonctionne toujours pas, contactez dzhou@parisnanterre.fr."
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
      a: "Nous avons préparé une démonstration avec un écran virtuel qui simule un smartphone.<br>Touchez l’application pour lancer votre vaisseau à la recherche d’or.",
      b: "Touchez maintenant la moitié basse de l’écran, puis la moitié haute, pour retirer la couche de glace et lancer la recherche d’or. Après quelques secondes de recherche, le résultat s’affiche.",
      c: "Cette fois, vous avez trouvé de l’or !<br>Juste après, le message de fin apparaît (« À la prochaine ! »). Quand ce message s’affiche, cela signifie que le résultat de la recherche a bien été enregistré et que vous pouvez quitter l’application. Pour quitter l’application dans cette démonstration, touchez le bouton d’accueil du smartphone virtuel."
    },
    1: "Vous allez maintenant entrer (et sortir) de l’application une nouvelle fois. Chaque entrée se déroule exactement de la même façon : vous touchez la moitié basse puis la moitié haute de l’écran, et le résultat s’affiche."
  },
  instructionsFileName: "instructions.html",
  // Images d'instructions vues par chaque groupe, dans l'ordre. Chaque nom correspond au fichier
  // images/instructions/instructions_<nom>.jpg  (ex. 8_A -> instructions_8_A.jpg).
  // Pages propres à chaque groupe : 8 (8_A / 8_B) et 10 (10_A / 10_B). Pages retirées par rapport à la version d'origine : 9, 11, 13, 14, 15, 16, 17.
  // Les deux avant-dernières et dernières pages (23 et 24) doivent rester en dernier :
  // la page 23 est celle qui annonce la démo.
  instruction_pages: {
    group_A: [1, 2, 3, 4, 5, 6, 7, "8_A", 9, "10_A", 11, 12, 13],
    group_B: [1, 2, 3, 4, 5, 6, 7, "8_B", 9, "10_B", 11, 12, 13]
  },
  lastInstructionsPageExplainsDemo: true,
  instructions_test_questions: function (group) {
    var g = this.group_vars[group] || this.group_vars.group_A;
    var perDay = g.dailyEntriesMax;
    var reward = g.rewardPerWin;
    var units = function (n) { return n + (n === 1 ? " unité d’or" : " unités d’or"); };
    var otherAmounts = [1, 5, 10, 15].filter(function (n) { return n !== reward; }).slice(0, 2);
    var questions = {
      1: {
        question: "Combien de fois par jour puis-je ouvrir l’application pour chercher de l’or ?",
        correct_answer: perDay === 1 ? "Une seule fois par jour." : "Jusqu’à " + perDay + " fois par jour.",
        distractor_1: "Autant de fois que je le souhaite.",
        distractor_2: perDay === 2 ? "Une seule fois par jour." : "Deux fois par jour.",
        distractor_3: "Seulement certains jours de la semaine."
      },
      2: {
        question: "Combien d’or reçois-je à chaque fois que je trouve de l’or ?",
        correct_answer: units(reward) + ".",
        distractor_1: units(otherAmounts[0]) + ".",
        distractor_2: units(otherAmounts[1]) + ".",
        distractor_3: "La quantité change à chaque fois."
      },
      3: {
        question: "Ouvrir l’application a-t-il un coût ?",
        correct_answer: "Non, ouvrir l’application est gratuit.",
        distractor_1: "Oui, cela coûte 1 unité d’or.",
        distractor_2: "Oui, cela coûte 10 unités d’or.",
        distractor_3: "Oui, le coût change à chaque fois."
      },
      4: {
        question: "Que dois-je faire une fois l’application ouverte ?",
        correct_answer: "Toucher la moitié basse de l’écran, puis la moitié haute.",
        distractor_1: "Toucher la moitié haute de l’écran, puis la moitié basse.",
        distractor_2: "Toucher le milieu de l’écran autant de fois que possible.",
        distractor_3: "Rien, je dois simplement attendre."
      },
      5: {
        question: "Quand puis-je fermer l’application ?",
        correct_answer: "Quand le message « À la prochaine ! » apparaît.",
        distractor_1: "Dès que je vois le résultat.",
        distractor_2: "Juste après les deux touchers.",
        distractor_3: "Au bout d’une minute."
      },
      6: {
        question: "Que se passe-t-il quand j’ai déjà utilisé l’application le nombre maximum de fois aujourd’hui ?",
        correct_answer: "Je dois attendre le lendemain pour l’utiliser à nouveau.",
        distractor_1: "Je peux continuer à l’utiliser, mais je ne gagne plus d’or.",
        distractor_2: "Je perds l’or que j’ai collecté.",
        distractor_3: "Le jeu s’arrête définitivement pour moi."
      },
      toRandomizeQuestions: false,
      dont_know_answer: "Je ne sais pas."
    };
    if (typeof g.minMinutesBetweenEntries === 'number') { // groupe avec un délai minimum entre deux essais
      var m = g.minMinutesBetweenEntries;
      var otherMinutes = [5, 10, 60, 120].filter(function (n) { return n !== m; }).slice(0, 2);
      questions[7] = {
        question: "Combien de temps dois-je attendre entre deux ouvertures de l’application ?",
        correct_answer: "Au moins " + m + " minutes.",
        distractor_1: "Au moins " + otherMinutes[0] + " minutes.",
        distractor_2: "Au moins " + otherMinutes[1] + " minutes.",
        distractor_3: "Aucun délai : je peux la rouvrir tout de suite."
      };
    }
    return questions;
  },
  instructions_HTML_title: "Instructions",
  instructions_main_HTML_element: "instructions_iframe",
  App_HTML_title: function () { return this.app_display_name || this.context.replace(/_/g, ' ') },
  App_main_HTML_element: "main_container",
  dataVarList: ["serial","uniqueEntryID","subId","group","context","day","isWin","isLoss","reward","baselineAccumulatedReward","resetContainer","resetContainerConfirmationTime","manipulationToday","activateManipulation","isUnderManipulation","hideOutcome","isFirstTime","todayInitialOutcomes","startTime","press1Time","press2Time","outcomeTime","endTime","manipulationAlertTime","showInstructions","instructionsStartedFlag","completedInstructions","isDemo","demoTrialNum","isDialogOn","coin_task_finish_status","endExperiment","manipulationConfirmationTime","manipCheckAlertTime","manipChecConfirmationTime","srbaiDay","simsDay","localSessionId"]
}
