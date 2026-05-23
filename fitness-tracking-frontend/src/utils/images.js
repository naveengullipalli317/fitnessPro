// Curated HD fitness imagery (Unsplash). All hotlinks include sizing + format params.
const PARAMS = '?auto=format&fit=crop&q=80';

const url = (id, w = 1600) => `https://images.unsplash.com/${id}${PARAMS}&w=${w}`;

// ---------------------------------------------------------------------------
// Hero / page background images
// ---------------------------------------------------------------------------
export const images = {
  heroAthlete: url('photo-1517836357463-d25dfeac3438', 1920),
  heroBarbell: url('photo-1534438327276-14e5300c3a48', 1920),
  heroGym: url('photo-1571019613454-1cb2f99b2d8b', 1920),
  heroRunner: url('photo-1546483875-ad9014c88eba', 1920),

  authLifting: url('photo-1583454110551-21f2fa2afe61', 1400),
  authYoga: url('photo-1518611012118-696072aa579a', 1400),

  strength: url('photo-1581009146145-b5ef050c2e1e', 800),
  cardio: url('photo-1538805060514-97d9cc17730c', 800),
  yoga: url('photo-1544367567-0f2fcb009e0b', 800),
  hiit: url('photo-1599058917212-d750089bc07e', 800),
  pilates: url('photo-1518310383802-640c2de311b2', 800),
  crossfit: url('photo-1526506118085-60ce8714f8c5', 800),
  other: url('photo-1517438476312-10d79c077509', 800),

  // Muscle-group hero (used by Exercise Library banner)
  chest: url('photo-1532029837206-abbe2b7620e3', 800),
  back: url('photo-1598971639058-fab3c3109a00', 800),
  legs: url('photo-1605296867424-35fc25c9212a', 800),
  shoulders: url('photo-1517344884509-a0c97ec11bcc', 800),
  arms: url('photo-1581009146145-b5ef050c2e1e', 800),
  abs: url('photo-1571019614242-c5c5dee9f50b', 800),
  full_body: url('photo-1534258936925-c58bed479fcb', 800),

  goal: url('photo-1571902943202-507ec2618e8f', 1200),
  routine: url('photo-1517963879433-6ad2b056d712', 1200),
  profileCover: url('photo-1517836357463-d25dfeac3438', 1600),
  dashboard: url('photo-1574680096145-d05b474e2155', 1600),
};

export const workoutImage = (type) => images[type] || images.other;

// ---------------------------------------------------------------------------
// Per-exercise image catalog
// ---------------------------------------------------------------------------
// Two layers:
//   1) NAME_MATCH: regex on exercise name -> hand-picked Unsplash photo IDs
//      that depict that movement. Same exercise always renders the same photo.
//   2) CATEGORY_POOL: 5-7 high-quality photos per muscle group. When a name
//      doesn't match a specific pattern, the exercise is hashed into the pool
//      so different exercises in the same category get different photos.

const ex = (id) => url(id, 900);

// Hand-picked, recognisable fitness photos. Each ID is a well-known Unsplash
// fitness shot. If any ID 404s the <img> onError fallback below catches it.
const PHOTOS = {
  benchPress: ex('photo-1532029837206-abbe2b7620e3'),
  inclinePress: ex('photo-1583500178690-f7eb89dc0b88'),
  chestFly: ex('photo-1581009137042-c552e485697a'),
  pushUp: ex('photo-1594381898411-846e7d193883'),
  dipBars: ex('photo-1571388208497-71bedc66e932'),

  pullUp: ex('photo-1598971639058-fab3c3109a00'),
  latPulldown: ex('photo-1581122584612-713f89daa8eb'),
  barbellRow: ex('photo-1591741535018-d042766c62eb'),
  dumbbellRow: ex('photo-1576678927484-cc907957088c'),
  deadlift: ex('photo-1534438327276-14e5300c3a48'),

  squat: ex('photo-1605296867424-35fc25c9212a'),
  frontSquat: ex('photo-1599058917212-d750089bc07e'),
  legPress: ex('photo-1517344884509-a0c97ec11bcc'),
  lunge: ex('photo-1607962837359-5e7e89f86776'),
  calfRaise: ex('photo-1540497077202-7c8a3999166f'),
  hipThrust: ex('photo-1583454152671-5d2d59a4a01a'),

  shoulderPress: ex('photo-1581009146145-b5ef050c2e1e'),
  lateralRaise: ex('photo-1583454110551-21f2fa2afe61'),
  arnoldPress: ex('photo-1571019613454-1cb2f99b2d8b'),

  bicepCurl: ex('photo-1581009137042-c552e485697a'),
  hammerCurl: ex('photo-1521804906057-1df8fdb718b7'),
  tricepDip: ex('photo-1581122584612-713f89daa8eb'),
  tricepExtension: ex('photo-1581009146145-b5ef050c2e1e'),

  plank: ex('photo-1571019614242-c5c5dee9f50b'),
  crunch: ex('photo-1518611012118-696072aa579a'),
  legRaise: ex('photo-1518611012118-696072aa579a'),
  russianTwist: ex('photo-1571019613454-1cb2f99b2d8b'),
  mountainClimber: ex('photo-1599058917212-d750089bc07e'),

  running: ex('photo-1546483875-ad9014c88eba'),
  sprint: ex('photo-1517836357463-d25dfeac3438'),
  treadmill: ex('photo-1538805060514-97d9cc17730c'),
  cycling: ex('photo-1517649763962-0c623066013b'), // outdoor road cyclist
  rowingMachine: ex('photo-1526506118085-60ce8714f8c5'),
  jumpingJack: ex('photo-1518310383802-640c2de311b2'),
  jumpRope: ex('photo-1591291621164-2c6367723315'), // jump rope training
  burpee: ex('photo-1599058917212-d750089bc07e'),
  kettlebell: ex('photo-1517438476312-10d79c077509'),
  kettlebellSwing: ex('photo-1583500178690-f7eb89dc0b88'),
  boxJump: ex('photo-1599058917212-d750089bc07e'),

  yoga: ex('photo-1544367567-0f2fcb009e0b'),
  pilates: ex('photo-1518310383802-640c2de311b2'),
  stretching: ex('photo-1518611012118-696072aa579a'),

  cleanAndJerk: ex('photo-1534258936925-c58bed479fcb'),
  snatch: ex('photo-1526506118085-60ce8714f8c5'),
  crossfit: ex('photo-1526506118085-60ce8714f8c5'),
};

// Map specific exercise name patterns to a curated photo.
// Order matters — most specific first.
const NAME_MATCH = [
  // Chest
  [/incline\s*(bench)?\s*press/i, PHOTOS.inclinePress],
  [/decline\s*(bench)?\s*press/i, PHOTOS.benchPress],
  [/bench\s*press|chest\s*press/i, PHOTOS.benchPress],
  [/chest\s*fly|fly|flye|pec\s*deck/i, PHOTOS.chestFly],
  [/push[- ]?up/i, PHOTOS.pushUp],
  [/dip(s)?/i, PHOTOS.dipBars],

  // Back
  [/lat\s*pull|pull\s*down|pulldown/i, PHOTOS.latPulldown],
  [/pull[- ]?up|chin[- ]?up/i, PHOTOS.pullUp],
  [/dumbbell\s*row|db\s*row|one[- ]?arm\s*row/i, PHOTOS.dumbbellRow],
  [/barbell\s*row|bent[- ]?over\s*row|t[- ]?bar\s*row|row/i, PHOTOS.barbellRow],
  [/dead\s*lift|deadlift|rdl|romanian/i, PHOTOS.deadlift],

  // Legs
  [/front\s*squat/i, PHOTOS.frontSquat],
  [/back\s*squat|barbell\s*squat|goblet\s*squat|squat/i, PHOTOS.squat],
  [/leg\s*press|hack\s*squat/i, PHOTOS.legPress],
  [/lunge/i, PHOTOS.lunge],
  [/calf\s*raise|calf/i, PHOTOS.calfRaise],
  [/hip\s*thrust|glute\s*bridge|glute/i, PHOTOS.hipThrust],

  // Shoulders
  [/arnold\s*press/i, PHOTOS.arnoldPress],
  [/lateral\s*raise|side\s*raise|front\s*raise|rear\s*delt/i, PHOTOS.lateralRaise],
  [/overhead\s*press|military\s*press|shoulder\s*press|ohp/i, PHOTOS.shoulderPress],

  // Arms
  [/hammer\s*curl/i, PHOTOS.hammerCurl],
  [/bicep|biceps|barbell\s*curl|dumbbell\s*curl|curl/i, PHOTOS.bicepCurl],
  [/tricep\s*extension|skull\s*crusher|overhead\s*tricep/i, PHOTOS.tricepExtension],
  [/tricep|triceps/i, PHOTOS.tricepDip],

  // Abs / core
  [/mountain\s*climber/i, PHOTOS.mountainClimber],
  [/plank/i, PHOTOS.plank],
  [/leg\s*raise|hanging\s*leg/i, PHOTOS.legRaise],
  [/russian\s*twist|woodchopper/i, PHOTOS.russianTwist],
  [/crunch|sit[- ]?up|ab\s*wheel/i, PHOTOS.crunch],

  // Cardio / conditioning
  [/treadmill/i, PHOTOS.treadmill],
  [/sprint|interval/i, PHOTOS.sprint],
  [/jog|run(ning)?/i, PHOTOS.running],
  [/cycling|spin|bike/i, PHOTOS.cycling],
  [/row(ing)?\s*machine|erg/i, PHOTOS.rowingMachine],
  [/jump[- ]?rope|skip(ping)?\s*rope/i, PHOTOS.jumpRope],
  [/jumping\s*jack/i, PHOTOS.jumpingJack],
  [/burpee/i, PHOTOS.burpee],
  [/box\s*jump|plyo|broad\s*jump/i, PHOTOS.boxJump],
  [/kettlebell\s*swing|swing/i, PHOTOS.kettlebellSwing],
  [/kettlebell/i, PHOTOS.kettlebell],

  // Mobility / mind-body
  [/yoga|sun\s*salutation|namaste|warrior/i, PHOTOS.yoga],
  [/pilates/i, PHOTOS.pilates],
  [/stretch|mobility/i, PHOTOS.stretching],

  // Olympic / crossfit
  [/clean(\s*and)?\s*jerk|clean/i, PHOTOS.cleanAndJerk],
  [/snatch/i, PHOTOS.snatch],
  [/thruster|wod|metcon|crossfit/i, PHOTOS.crossfit],
];

// Category-specific pools used when no name pattern matches.
const CATEGORY_POOL = {
  chest: [PHOTOS.benchPress, PHOTOS.pushUp, PHOTOS.chestFly, PHOTOS.inclinePress, PHOTOS.dipBars],
  back: [PHOTOS.pullUp, PHOTOS.barbellRow, PHOTOS.latPulldown, PHOTOS.dumbbellRow, PHOTOS.deadlift],
  legs: [PHOTOS.squat, PHOTOS.legPress, PHOTOS.lunge, PHOTOS.calfRaise, PHOTOS.hipThrust, PHOTOS.frontSquat],
  shoulders: [PHOTOS.shoulderPress, PHOTOS.lateralRaise, PHOTOS.arnoldPress],
  arms: [PHOTOS.bicepCurl, PHOTOS.hammerCurl, PHOTOS.tricepDip, PHOTOS.tricepExtension],
  abs: [PHOTOS.plank, PHOTOS.crunch, PHOTOS.russianTwist, PHOTOS.mountainClimber, PHOTOS.legRaise],
  cardio: [PHOTOS.running, PHOTOS.treadmill, PHOTOS.cycling, PHOTOS.rowingMachine, PHOTOS.sprint, PHOTOS.jumpingJack, PHOTOS.jumpRope],
  full_body: [PHOTOS.crossfit, PHOTOS.kettlebell, PHOTOS.burpee, PHOTOS.cleanAndJerk, PHOTOS.snatch],
};

// Deterministic non-negative hash for picking from a pool.
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

/**
 * Returns a hand-picked HD Unsplash image for an exercise.
 * Strategy:
 *   1) Name pattern match (squat -> squat photo, bench press -> bench photo, ...)
 *   2) Category pool, indexed by a stable hash of the exercise name
 *   3) Final fallback: the muscle-group hero photo
 */
export const exerciseImage = (exercise) => {
  if (!exercise) return images.full_body;
  const name = exercise.name || '';

  for (const [pattern, src] of NAME_MATCH) {
    if (pattern.test(name)) return src;
  }

  const pool = CATEGORY_POOL[exercise.category];
  if (pool && pool.length > 0) {
    const idx = hash(name || exercise._id || exercise.category) % pool.length;
    return pool[idx];
  }

  return images[exercise.category] || images.full_body;
};

// Fallback used by <img onError> so any 404 never leaves a broken card.
export const FALLBACK_IMAGE = url('photo-1534258936925-c58bed479fcb', 900);

// Legacy export — kept so other call sites keep working.
export const categoryImage = (cat) => images[cat] || images.full_body;
