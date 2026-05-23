// Curated YouTube form-tutorial videos for each exercise.
// Same name → same video; new exercises fall through to a category default.

const embed = (id) =>
  `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&playsinline=1`;

// Hand-picked tutorial videos. If any ID is removed/changed on YouTube the
// iframe still renders cleanly ("Video unavailable") and the page keeps working.
const VIDEOS = {
  // Chest
  benchPress: embed('vcBig73ojpE'),       // Athlean-X — How To Bench Press
  inclinePress: embed('8iPEnn-ltC8'),     // Incline dumbbell press
  chestFly: embed('eozdVDA78K0'),         // Dumbbell chest fly
  pushUp: embed('IODxDxX7oi4'),           // Perfect push-up form
  dipBars: embed('2z8JmcrW-As'),          // Chest dip form

  // Back
  pullUp: embed('eGo4IYlbE5g'),           // Athlean-X — How To Do A Pull Up
  latPulldown: embed('CAwf7n6Luuc'),      // Lat pulldown
  barbellRow: embed('vT2GjY_Umpw'),       // Barbell row
  dumbbellRow: embed('roCP6wCXPqo'),      // One-arm dumbbell row
  deadlift: embed('r4MzxtBKyNE'),         // Deadlift form

  // Legs
  squat: embed('bEv6CCg2BC8'),            // Squat University — How To Squat With Proper Form
  bodyweightSquat: embed('YaXPRqUwItQ'),  // Bodyweight squat form
  frontSquat: embed('uYumuL_G_V0'),       // Front squat
  legPress: embed('IZxyjW7MPJQ'),         // Leg press
  lunge: embed('QOVaHwm-Q6U'),            // Lunge form
  calfRaise: embed('-M4-G8p8fmc'),        // Calf raise
  hipThrust: embed('LM8XHLYJoYs'),        // Hip thrust

  // Shoulders
  shoulderPress: embed('B-aVuyhvLHU'),    // Overhead press
  lateralRaise: embed('3VcKaXpzqRo'),     // Lateral raise
  arnoldPress: embed('3ml7BH7mNwQ'),      // Arnold press

  // Arms
  bicepCurl: embed('ykJmrZ5v0Oo'),        // Bicep curl
  hammerCurl: embed('zC3nLlEvin4'),       // Hammer curl
  tricepDip: embed('6kALZikXxLc'),        // Tricep dip
  tricepExtension: embed('_gsUck-7M74'),  // Overhead tricep extension

  // Abs / core
  plank: embed('ASdvN_XEl_c'),            // Plank form
  crunch: embed('Xyd_fa5zoEU'),           // Crunch
  legRaise: embed('JB2oyawG9KI'),         // Hanging leg raise
  russianTwist: embed('wkD8rjkodUI'),     // Russian twist
  mountainClimber: embed('nmwgirgXLYM'),  // Mountain climber

  // Cardio / conditioning
  running: embed('_kGESn8ArrU'),          // Running form
  sprint: embed('hLqVu7nWuKY'),           // Sprint technique
  treadmill: embed('-XPv5BkUVNg'),        // Treadmill running
  cycling: embed('xY5edpnAg5g'),          // Cycling workout
  rowingMachine: embed('S7HEm-fd534'),    // Rowing machine
  jumpingJack: embed('iSSAk4XCsRA'),      // Jumping jacks
  jumpRope: embed('1BZM2Vre5oc'),         // Jump rope
  burpee: embed('auBLPXO8Fww'),           // Burpee form
  boxJump: embed('hxldG9FX4j4'),          // Box jump

  // Olympic / kettlebell
  kettlebell: embed('YBcLDDP8YZw'),       // Kettlebell basics
  kettlebellSwing: embed('mKDfijs2kAM'),  // Mark Wildman — Kettlebell Swing
  cleanAndJerk: embed('PrwM2GuJoyk'),     // Clean & jerk
  snatch: embed('9HyWjAk7fhY'),           // Snatch
  crossfit: embed('tzD9BkXGJ1M'),         // Crossfit WOD demo

  // Mobility / mind-body
  yoga: embed('v7AYKMP6rOE'),             // Beginner yoga
  pilates: embed('K56Z12XNQ5c'),          // Pilates basics
  stretching: embed('sTxC3J3gQEU'),       // Full-body stretching
};

// Category defaults — used if no name pattern matches.
const CATEGORY_DEFAULT = {
  chest: VIDEOS.benchPress,
  back: VIDEOS.pullUp,
  legs: VIDEOS.squat,
  shoulders: VIDEOS.shoulderPress,
  arms: VIDEOS.bicepCurl,
  abs: VIDEOS.plank,
  cardio: VIDEOS.running,
  full_body: VIDEOS.crossfit,
};

// Exercise-name regex → video. Order matters — most specific first.
const NAME_MATCH = [
  // Chest
  [/incline\s*(bench)?\s*press/i, VIDEOS.inclinePress],
  [/decline\s*(bench)?\s*press/i, VIDEOS.benchPress],
  [/bench\s*press|chest\s*press/i, VIDEOS.benchPress],
  [/chest\s*fly|fly|flye|pec\s*deck/i, VIDEOS.chestFly],
  [/push[- ]?up/i, VIDEOS.pushUp],
  [/dip(s)?/i, VIDEOS.dipBars],

  // Back
  [/lat\s*pull|pull\s*down|pulldown/i, VIDEOS.latPulldown],
  [/pull[- ]?up|chin[- ]?up/i, VIDEOS.pullUp],
  [/dumbbell\s*row|db\s*row|one[- ]?arm\s*row/i, VIDEOS.dumbbellRow],
  [/barbell\s*row|bent[- ]?over\s*row|t[- ]?bar\s*row|row(?!ing)/i, VIDEOS.barbellRow],
  [/dead\s*lift|deadlift|rdl|romanian/i, VIDEOS.deadlift],

  // Legs
  [/front\s*squat/i, VIDEOS.frontSquat],
  [/bodyweight\s*squat|air\s*squat/i, VIDEOS.bodyweightSquat],
  [/back\s*squat|barbell\s*squat|goblet\s*squat|squat/i, VIDEOS.squat],
  [/leg\s*press|hack\s*squat/i, VIDEOS.legPress],
  [/lunge/i, VIDEOS.lunge],
  [/calf\s*raise|calf/i, VIDEOS.calfRaise],
  [/hip\s*thrust|glute\s*bridge|glute/i, VIDEOS.hipThrust],

  // Shoulders
  [/arnold\s*press/i, VIDEOS.arnoldPress],
  [/lateral\s*raise|side\s*raise|front\s*raise|rear\s*delt/i, VIDEOS.lateralRaise],
  [/overhead\s*press|military\s*press|shoulder\s*press|ohp/i, VIDEOS.shoulderPress],

  // Arms
  [/hammer\s*curl/i, VIDEOS.hammerCurl],
  [/bicep|biceps|barbell\s*curl|dumbbell\s*curl|curl/i, VIDEOS.bicepCurl],
  [/tricep\s*extension|skull\s*crusher|overhead\s*tricep/i, VIDEOS.tricepExtension],
  [/tricep|triceps/i, VIDEOS.tricepDip],

  // Abs / core
  [/mountain\s*climber/i, VIDEOS.mountainClimber],
  [/plank/i, VIDEOS.plank],
  [/leg\s*raise|hanging\s*leg/i, VIDEOS.legRaise],
  [/russian\s*twist|woodchopper/i, VIDEOS.russianTwist],
  [/crunch|sit[- ]?up|ab\s*wheel/i, VIDEOS.crunch],

  // Cardio / conditioning
  [/treadmill/i, VIDEOS.treadmill],
  [/sprint|interval/i, VIDEOS.sprint],
  [/jog|run(ning)?/i, VIDEOS.running],
  [/cycling|spin|bike/i, VIDEOS.cycling],
  [/row(ing)?\s*machine|erg/i, VIDEOS.rowingMachine],
  [/jump[- ]?rope|skip(ping)?\s*rope/i, VIDEOS.jumpRope],
  [/jumping\s*jack/i, VIDEOS.jumpingJack],
  [/burpee/i, VIDEOS.burpee],
  [/box\s*jump|plyo|broad\s*jump/i, VIDEOS.boxJump],
  [/kettlebell\s*swing|swing/i, VIDEOS.kettlebellSwing],
  [/kettlebell/i, VIDEOS.kettlebell],

  // Mobility / mind-body
  [/yoga|sun\s*salutation|namaste|warrior/i, VIDEOS.yoga],
  [/pilates/i, VIDEOS.pilates],
  [/stretch|mobility/i, VIDEOS.stretching],

  // Olympic / crossfit
  [/clean(\s*and)?\s*jerk|clean/i, VIDEOS.cleanAndJerk],
  [/snatch/i, VIDEOS.snatch],
  [/thruster|wod|metcon|crossfit/i, VIDEOS.crossfit],
];

/**
 * Returns a YouTube embed URL for an exercise. Tries name-pattern matching
 * first, then falls back to the exercise's category default, then to a
 * generic crossfit demo.
 */
// Convert an embed URL back to a regular youtube.com watch URL.
export const watchUrl = (embedUrl) => {
  const m = /youtube\.com\/embed\/([^/?]+)/.exec(embedUrl || '');
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl;
};

export const exerciseVideo = (exercise) => {
  if (!exercise) return CATEGORY_DEFAULT.full_body;
  const name = exercise.name || '';
  for (const [pattern, vid] of NAME_MATCH) {
    if (pattern.test(name)) return vid;
  }
  return CATEGORY_DEFAULT[exercise.category] || CATEGORY_DEFAULT.full_body;
};
