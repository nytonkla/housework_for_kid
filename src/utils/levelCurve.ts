export interface LevelInfo {
  level: number;
  statusName: string;
  tier: string;
  tierIcon: string;
  motivationPhrase: string;
  starsToReachThisLevel: number;
  cumulativeStarsRequired: number;
}

export interface LevelCurveSettings {
  base: number;
  power: number;
}

const DEFAULT_SETTINGS: LevelCurveSettings = {
  base: 0.3,
  power: 1.5,
};

const LEVEL_TIERS: { minLevel: number; maxLevel: number; tier: string; tierIcon: string }[] = [
  { minLevel: 1, maxLevel: 10, tier: 'Tidy Sprout', tierIcon: '🌱' },
  { minLevel: 11, maxLevel: 20, tier: 'Helper-in-Training', tierIcon: '🧽' },
  { minLevel: 21, maxLevel: 30, tier: 'Chore Scout', tierIcon: '🧭' },
  { minLevel: 31, maxLevel: 40, tier: 'Task Ranger', tierIcon: '🏹' },
  { minLevel: 41, maxLevel: 50, tier: 'Home Guardian', tierIcon: '🛡️' },
  { minLevel: 51, maxLevel: 60, tier: 'Chore Knight', tierIcon: '⚔️' },
  { minLevel: 61, maxLevel: 70, tier: 'House Captain', tierIcon: '⚓' },
  { minLevel: 71, maxLevel: 80, tier: 'Domestic Strategist', tierIcon: '🧠' },
  { minLevel: 81, maxLevel: 90, tier: 'Household Sage', tierIcon: '📜' },
  { minLevel: 91, maxLevel: 100, tier: 'Home Champion', tierIcon: '🏆' },
];

const MOTIVATION_PHRASES: Record<number, string> = {
  1: "Every big helper starts with one small step.",
  2: "You're building a habit, one chore at a time.",
  3: "Look at you go -- small efforts are adding up!",
  4: "You're getting the hang of this already.",
  5: "Halfway to your first big milestone!",
  6: "Your effort is showing -- keep it up!",
  7: "You're turning chores into a habit.",
  8: "Almost a full Sprout -- so close!",
  9: "One more step to a brand-new tier.",
  10: "You did it! You're ready to grow even more.",
  11: "You're not just helping -- you're learning real skills.",
  20: "Training complete -- time for your next challenge!",
  30: "Mission complete -- you've scouted it all!",
  40: "Ranger training complete -- well earned!",
  50: "Guardian status earned -- incredible effort!",
  60: "Knighted! Your hard work has paid off.",
  70: "Captain's badge earned -- outstanding work!",
  80: "Strategist status earned -- brilliant work!",
  90: "Sage wisdom earned -- you've come so far!",
  100: "You've built real housework independence. You don't need this game to keep going -- you've got this for life.",
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * Calculates level curve for 1..100 levels dynamically based on Base and Power parameters.
 */
export function generateLevelCurve(settings: LevelCurveSettings = DEFAULT_SETTINGS): LevelInfo[] {
  const levels: LevelInfo[] = [];
  let cumulative = 0;

  for (let l = 1; l <= 100; l++) {
    const starsNeeded = l === 1 ? 0 : Math.round(settings.base * Math.pow(l - 1, settings.power));
    cumulative += starsNeeded;

    const tierObj = LEVEL_TIERS.find((t) => l >= t.minLevel && l <= t.maxLevel) || LEVEL_TIERS[0];
    const subIdx = (l - 1) % 10;
    const roman = ROMAN_NUMERALS[subIdx] || `${subIdx + 1}`;

    const statusName = l === 100 ? 'Independence Achieved -- Game Graduate' : `${tierObj.tier} ${roman}`;
    const motivationPhrase =
      MOTIVATION_PHRASES[l] || `Keep going! Your effort is building real life independence at Level ${l}.`;

    levels.push({
      level: l,
      statusName,
      tier: tierObj.tier,
      tierIcon: tierObj.tierIcon,
      motivationPhrase,
      starsToReachThisLevel: starsNeeded,
      cumulativeStarsRequired: cumulative,
    });
  }

  return levels;
}

export interface UserLevelProgress {
  level: number;
  statusName: string;
  tier: string;
  tierIcon: string;
  motivationPhrase: string;
  starsInCurrentLevel: number;
  starsNeededForNextLevel: number;
  progressPercent: number;
  cumulativeStarsForCurrentLevel: number;
  cumulativeStarsForNextLevel: number;
}

/**
 * Calculates current level and level progress details based on Lifetime Stars Earned.
 */
export function calculateLevelFromLifetimeStars(
  lifetimeStarsEarned: number,
  settings: LevelCurveSettings = DEFAULT_SETTINGS
): UserLevelProgress {
  const curve = generateLevelCurve(settings);

  let currentLevelObj = curve[0];
  for (let i = curve.length - 1; i >= 0; i--) {
    if (lifetimeStarsEarned >= curve[i].cumulativeStarsRequired) {
      currentLevelObj = curve[i];
      break;
    }
  }

  const currentLevelNum = currentLevelObj.level;

  if (currentLevelNum >= 100) {
    return {
      level: 100,
      statusName: 'Independence Achieved -- Game Graduate',
      tier: 'Home Champion',
      tierIcon: '🏆',
      motivationPhrase: MOTIVATION_PHRASES[100],
      starsInCurrentLevel: 0,
      starsNeededForNextLevel: 0,
      progressPercent: 100,
      cumulativeStarsForCurrentLevel: currentLevelObj.cumulativeStarsRequired,
      cumulativeStarsForNextLevel: currentLevelObj.cumulativeStarsRequired,
    };
  }

  const nextLevelObj = curve[currentLevelNum]; // index currentLevelNum is Level L+1
  const starsInCurrentLevel = Math.max(0, lifetimeStarsEarned - currentLevelObj.cumulativeStarsRequired);
  const starsNeededForNextLevel = Math.max(1, nextLevelObj.starsToReachThisLevel);
  const progressPercent = Math.min(100, Math.round((starsInCurrentLevel / starsNeededForNextLevel) * 100));

  return {
    level: currentLevelNum,
    statusName: currentLevelObj.statusName,
    tier: currentLevelObj.tier,
    tierIcon: currentLevelObj.tierIcon,
    motivationPhrase: currentLevelObj.motivationPhrase,
    starsInCurrentLevel,
    starsNeededForNextLevel,
    progressPercent,
    cumulativeStarsForCurrentLevel: currentLevelObj.cumulativeStarsRequired,
    cumulativeStarsForNextLevel: nextLevelObj.cumulativeStarsRequired,
  };
}
