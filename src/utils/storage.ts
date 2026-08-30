import { Chore, Reward, Submission, Redemption, UserStats, AppSettings } from '../types';
import { calculateLevelFromLifetimeStars } from './levelCurve';

const INITIAL_CHORES: Chore[] = [
  {
    id: 'chore-1',
    title: 'Make Your Bed',
    description: 'Fold your blanket and arrange your pillows neatly',
    icon: '🛏️',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Neatly made bed with folded or straightened blanket and arranged pillows',
    active: true,
    category: 'self_care',
    unlockLevel: 1,
  },
  {
    id: 'chore-2',
    title: 'Put Away Toys & Books',
    description: 'Put toys and books back where they belong after playing',
    icon: '🧸',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Toys and books put away on shelves or in bins, floor clear of clutter',
    active: true,
    category: 'organizing',
    unlockLevel: 1,
  },
  {
    id: 'chore-3',
    title: 'Hang Up Coat & Backpack',
    description: 'Hang your coat and backpack on the hook when you get home',
    icon: '🎒',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Coat and backpack hung on hook or placed in designated spot, not on floor',
    active: true,
    category: 'self_care',
    unlockLevel: 1,
  },
  {
    id: 'chore-4',
    title: 'Match Socks Into Pairs',
    description: 'Sort clean socks and match them into pairs',
    icon: '🧦',
    starReward: 5,
    frequency: 'weekly',
    aiPrompt: 'Socks matched into pairs, folded or rolled together',
    active: true,
    category: 'laundry',
    unlockLevel: 1,
  },
  {
    id: 'chore-5',
    title: 'Water the Houseplants',
    description: 'Give a cup of water to the houseplants',
    icon: '🪴',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Potted plants watered on porch, balcony, or living room',
    active: true,
    category: 'other',
    unlockLevel: 1,
  },
  {
    id: 'chore-6',
    title: 'Feed Pet Dog / Cat',
    description: 'Fill the pet bowl with dry food and fresh water',
    icon: '🐶',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Pet food bowl filled with dry food or water beside pet station',
    active: true,
    category: 'pet_care',
    unlockLevel: 1,
  },
  {
    id: 'chore-7',
    title: 'Set the Table',
    description: 'Put out plates, cups, and utensils before meals',
    icon: '🍽️',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Table set with plates, cups, and utensils ready for a meal',
    active: true,
    category: 'kitchen',
    unlockLevel: 1,
  },
  {
    id: 'chore-8',
    title: 'Clear Your Own Plate',
    description: 'Bring your plate and cup to the sink after eating',
    icon: '🥣',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Empty plate and cup placed beside or in the sink after a meal',
    active: true,
    category: 'kitchen',
    unlockLevel: 1,
  },
  {
    id: 'chore-9',
    title: 'Help Wash Fruits & Vegetables',
    description: 'Rinse fruits and vegetables in the sink before eating',
    icon: '🍎',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Fruits or vegetables rinsed clean in a colander or sink',
    active: true,
    category: 'kitchen',
    unlockLevel: 1,
  },
  {
    id: 'chore-10',
    title: 'Pour Your Own Drink or Cereal',
    description: 'Pour your own cereal or drink at breakfast',
    icon: '🥛',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Bowl of cereal or a poured drink at the table, milk/cereal box nearby',
    active: true,
    category: 'kitchen',
    unlockLevel: 1,
  },
  {
    id: 'chore-11',
    title: 'Bring Dirty Laundry to the Hamper',
    description: 'Put your dirty clothes in the laundry hamper',
    icon: '🧺',
    starReward: 5,
    frequency: 'daily',
    aiPrompt: 'Dirty clothes placed inside the laundry hamper, none left on the floor',
    active: true,
    category: 'laundry',
    unlockLevel: 1,
  },
  {
    id: 'chore-12',
    title: 'Dust a Shelf or Surface',
    description: 'Wipe the dust off a shelf, table, or windowsill',
    icon: '🪶',
    starReward: 5,
    frequency: 'weekly',
    aiPrompt: 'Shelf, table, or windowsill wiped clean and dust-free',
    active: true,
    category: 'cleaning',
    unlockLevel: 1,
  },
  {
    id: 'chore-13',
    title: 'Help a Sibling or Parent',
    description: 'Help a family member with a small task they need done',
    icon: '🤝',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'A small helpful task done for a family member (parent notes what it was)',
    active: true,
    category: 'family',
    unlockLevel: 1,
  },
  {
    id: 'chore-14',
    title: 'Tidy Your Room (10 Minutes)',
    description: 'Spend 10 minutes tidying up your bedroom',
    icon: '🧹',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Bedroom floor and surfaces clear of clutter, items put in their place',
    active: true,
    category: 'organizing',
    unlockLevel: 1,
  },
  {
    id: 'chore-15',
    title: 'Help Load the Dishwasher',
    description: 'Help put dirty dishes into the dishwasher.',
    icon: '🍽️',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Dirty dishes, plates, cups, or bowls loaded neatly into the dishwasher',
    active: true,
    category: 'kitchen',
    unlockLevel: 5,
  },
  {
    id: 'chore-16',
    title: 'Wipe Kitchen Counters & Table',
    description: 'Wipe down the kitchen counters and table after meals.',
    icon: '🧽',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Kitchen counters and table wiped clean, no crumbs or spills',
    active: true,
    category: 'kitchen',
    unlockLevel: 5,
  },
  {
    id: 'chore-17',
    title: 'Sweep a Small Area',
    description: 'Sweep up crumbs or dirt from a small floor area.',
    icon: '🧹',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Small floor area swept clean, dirt or crumbs collected in a dustpan',
    active: true,
    category: 'cleaning',
    unlockLevel: 5,
  },
  {
    id: 'chore-18',
    title: 'Empty Small Trash Bins',
    description: 'Empty the small trash bins around the house.',
    icon: '🗑️',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Small trash bin emptied and a clean liner put back in',
    active: true,
    category: 'cleaning',
    unlockLevel: 5,
  },
  {
    id: 'chore-19',
    title: 'Put Clean Clothes Away',
    description: 'Put your folded clean clothes away in drawers.',
    icon: '👕',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Folded clean clothes put away neatly in drawers or wardrobe',
    active: true,
    category: 'laundry',
    unlockLevel: 5,
  },
  {
    id: 'chore-20',
    title: 'Fold Small Laundry Items',
    description: 'Fold towels or your own small clothes neatly.',
    icon: '🧺',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Folded towels or clothes neatly stacked in a pile',
    active: true,
    category: 'laundry',
    unlockLevel: 10,
  },
  {
    id: 'chore-21',
    title: 'Pack Your Own School Bag',
    description: 'Pack your school bag the night before.',
    icon: '🎒',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'School bag packed with books and supplies, ready by the door',
    active: true,
    category: 'self_care',
    unlockLevel: 10,
  },
  {
    id: 'chore-22',
    title: 'Dry & Put Away Dishes',
    description: 'Dry clean dishes and put them back in the cabinet.',
    icon: '🍽️',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Dried dishes stacked and put away in the cabinet',
    active: true,
    category: 'kitchen',
    unlockLevel: 10,
  },
  {
    id: 'chore-23',
    title: 'Walk the Dog (With an Adult)',
    description: 'Take the dog for a walk together with a grown-up.',
    icon: '🐕',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Dog on a leash outdoors during a walk, or just back from one',
    active: true,
    category: 'pet_care',
    unlockLevel: 10,
  },
  {
    id: 'chore-24',
    title: 'Take Out Trash & Recycling',
    description: 'Take the household trash or recycling out.',
    icon: '♻️',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Trash or recycling bin taken out to the curb or collection point',
    active: true,
    category: 'cleaning',
    unlockLevel: 15,
  },
  {
    id: 'chore-25',
    title: 'Organize Desk & Homework Area',
    description: 'Tidy up your desk or homework area.',
    icon: '🗂️',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Desk or homework area organized, papers and supplies put in place',
    active: true,
    category: 'organizing',
    unlockLevel: 15,
  },
  {
    id: 'chore-26',
    title: 'Help Make a Simple Sandwich',
    description: 'Make yourself a simple sandwich.',
    icon: '🥪',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'A simple sandwich assembled and ready to eat',
    active: true,
    category: 'kitchen',
    unlockLevel: 15,
  },
  {
    id: 'chore-27',
    title: 'Help Pack School Lunch',
    description: 'Help pack your own lunch for school.',
    icon: '🍱',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Packed lunch box or bag with food ready for school',
    active: true,
    category: 'kitchen',
    unlockLevel: 15,
  },
  {
    id: 'chore-28',
    title: 'Wipe Bathroom Sink',
    description: 'Wipe down the bathroom sink and counter.',
    icon: '🚰',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Bathroom sink and counter wiped clean and dry',
    active: true,
    category: 'cleaning',
    unlockLevel: 20,
  },
  {
    id: 'chore-29',
    title: 'Write a Thank-You Note',
    description: 'Write a short thank-you note or card to someone.',
    icon: '✉️',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'A handwritten thank-you note or card, finished and ready to give',
    active: true,
    category: 'family',
    unlockLevel: 20,
  },
  {
    id: 'chore-30',
    title: 'Help Measure Ingredients (Supervised)',
    description: 'Help measure or stir ingredients while cooking with an adult.',
    icon: '🥄',
    starReward: 10,
    frequency: 'weekly',
    aiPrompt: 'Measuring cups/spoons or a mixing bowl in use during supervised cooking',
    active: true,
    category: 'kitchen',
    unlockLevel: 20,
  },
  {
    id: 'chore-32',
    title: 'Vacuum One Room',
    description: 'Vacuum a whole room by yourself.',
    icon: '🧹',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'A room\'s floor freshly vacuumed, vacuum cleaner visible',
    active: true,
    category: 'cleaning',
    unlockLevel: 25,
  },
  {
    id: 'chore-31',
    title: 'Help With Yard Work',
    description: 'Help rake leaves or sweep the porch outside.',
    icon: '🍂',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Yard or porch area cleared of leaves or debris, rake or broom visible',
    active: true,
    category: 'outdoor',
    unlockLevel: 30,
  },
  {
    id: 'chore-34',
    title: 'Use the Microwave Safely (Supervised)',
    description: 'Heat up a simple food item in the microwave with supervision.',
    icon: '🍲',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Food container placed in or taken out of the microwave',
    active: true,
    category: 'kitchen',
    unlockLevel: 35,
  },
  {
    id: 'chore-33',
    title: 'Help Wash the Family Car',
    description: 'Help wash and dry the family car outside.',
    icon: '🚗',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Car being washed or freshly cleaned, sponge or hose visible',
    active: true,
    category: 'outdoor',
    unlockLevel: 40,
  },
  {
    id: 'chore-35',
    title: 'Prepare a No-Cook Snack Alone',
    description: 'Make yourself a simple snack without any cooking.',
    icon: '🍇',
    starReward: 15,
    frequency: 'daily',
    aiPrompt: 'A simple no-cook snack, like fruit or a cut-up plate, ready to eat',
    active: true,
    category: 'kitchen',
    unlockLevel: 40,
  },
  {
    id: 'chore-36',
    title: 'Help Start the Washing Machine (Supervised)',
    description: 'Help load and start the washing machine with an adult.',
    icon: '🧺',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Washing machine loaded with clothes and detergent, door closed and running',
    active: true,
    category: 'laundry',
    unlockLevel: 45,
  },
  {
    id: 'chore-37',
    title: 'Hang Clothes to Dry / Use the Dryer',
    description: 'Hang wet laundry to dry or load the dryer.',
    icon: '👚',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Wet clothes hung on a drying rack or line, or loaded into the dryer',
    active: true,
    category: 'laundry',
    unlockLevel: 50,
  },
  {
    id: 'chore-38',
    title: 'Clean Your Own Bathroom',
    description: 'Clean your bathroom sink and mirror by yourself.',
    icon: '🪞',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'Bathroom sink and mirror cleaned and streak-free',
    active: true,
    category: 'cleaning',
    unlockLevel: 55,
  },
  {
    id: 'chore-39',
    title: 'Fold & Put Away a Full Laundry Load',
    description: 'Fold an entire load of laundry and put it all away.',
    icon: '🧺',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'A full laundry load folded and put away, no leftover pile',
    active: true,
    category: 'laundry',
    unlockLevel: 60,
  },
  {
    id: 'chore-40',
    title: 'Help Plan a Family Activity',
    description: 'Help plan or organize something fun for the family to do.',
    icon: '🗓️',
    starReward: 15,
    frequency: 'weekly',
    aiPrompt: 'A written or drawn plan for a family activity (parent confirms verbally if no photo fits)',
    active: true,
    category: 'family',
    unlockLevel: 65,
  },
  {
    id: 'chore-41',
    title: 'Help Plan a Family Meal',
    description: 'Help choose and plan one family meal for the week.',
    icon: '🍛',
    starReward: 20,
    frequency: 'weekly',
    aiPrompt: 'A written meal plan or ingredients laid out for the planned meal',
    active: true,
    category: 'kitchen',
    unlockLevel: 70,
  },
  {
    id: 'chore-42',
    title: 'Teach a Younger Kid a Chore',
    description: 'Teach a younger sibling or friend a chore you\'ve mastered.',
    icon: '🧑‍🏫',
    starReward: 20,
    frequency: 'weekly',
    aiPrompt: 'Photo of the two of you doing the chore together (parent confirms verbally if no clear photo fits)',
    active: true,
    category: 'family',
    unlockLevel: 75,
  },
  {
    id: 'chore-43',
    title: 'Cook a Simple Recipe (Supervised)',
    description: 'Cook one simple recipe from start to finish with an adult.',
    icon: '👩‍🍳',
    starReward: 25,
    frequency: 'weekly',
    aiPrompt: 'A finished home-cooked dish made with adult supervision',
    active: true,
    category: 'kitchen',
    unlockLevel: 80,
  },
];

const INITIAL_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    title: '30 Minutes iPad / Gaming Time',
    description: 'Extra 30 mins of Roblox, Minecraft, or iPad game time',
    icon: '🎮',
    costInStars: 50,
    availableStock: -1,
    active: true,
  },
  {
    id: 'reward-2',
    title: 'Special Ice Cream / Boba Treat',
    description: 'Pick your favorite ice cream flavor on the weekend outing',
    icon: '🍦',
    costInStars: 40,
    availableStock: -1,
    active: true,
  },
  {
    id: 'reward-3',
    title: 'Choose Weekend Movie / Dinner',
    description: 'You get to pick what movie we watch or where we eat dinner!',
    icon: '🍿',
    costInStars: 75,
    availableStock: -1,
    active: true,
  },
  {
    id: 'reward-4',
    title: 'Lego / Toy Wishlist Item',
    description: 'Unlock a new Lego set or toy from your saved wishlist',
    icon: '🧩',
    costInStars: 300,
    availableStock: 1,
    active: true,
  },
  {
    id: 'reward-5',
    title: 'Stay Up 30 Mins Later',
    description: 'Extend your bedtime by 30 mins on Friday or Saturday night',
    icon: '🌙',
    costInStars: 60,
    availableStock: -1,
    active: true,
  },
];

const INITIAL_STATS: UserStats = {
  totalStars: 45,
  starBalance: 45,
  lifetimeStarsEarned: 45,
  currentStreak: 3,
  lastCompletedDate: new Date().toISOString().split('T')[0],
  level: 11,
  levelTitle: 'Helper-in-Training I',
  tierIcon: '🧽',
  motivationPhrase: 'You\'re not just helping -- you\'re learning real skills.',
};

const INITIAL_SETTINGS: AppSettings = {
  parentPin: '1234',
  geminiApiKey: '',
  soundEnabled: true,
  aiAutoApproveThreshold: 0.95,
  kidName: 'Hero Kid',
  levelCurveBase: 0.3,
  levelCurvePower: 1.5,
};

const KEYS = {
  CHORES: 'hh_chores_v2',
  REWARDS: 'hh_rewards_v1',
  SUBMISSIONS: 'hh_submissions_v1',
  REDEMPTIONS: 'hh_redemptions_v1',
  STATS: 'hh_stats_v2',
  SETTINGS: 'hh_settings_v2',
};

export const storage = {
  getChores(): Chore[] {
    const data = localStorage.getItem(KEYS.CHORES);
    if (!data) return INITIAL_CHORES;
    const parsed: Chore[] = JSON.parse(data);
    // Ensure all 43 chores are loaded or merged
    if (parsed.length < INITIAL_CHORES.length) {
      return INITIAL_CHORES;
    }
    return parsed;
  },

  saveChores(chores: Chore[]): void {
    localStorage.setItem(KEYS.CHORES, JSON.stringify(chores));
  },

  getRewards(): Reward[] {
    const data = localStorage.getItem(KEYS.REWARDS);
    return data ? JSON.parse(data) : INITIAL_REWARDS;
  },

  saveRewards(rewards: Reward[]): void {
    localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  },

  getSubmissions(): Submission[] {
    const data = localStorage.getItem(KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveSubmissions(submissions: Submission[]): void {
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
  },

  addSubmission(submission: Submission): void {
    const subs = this.getSubmissions();
    subs.unshift(submission);
    this.saveSubmissions(subs);
  },

  getRedemptions(): Redemption[] {
    const data = localStorage.getItem(KEYS.REDEMPTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveRedemptions(redemptions: Redemption[]): void {
    localStorage.setItem(KEYS.REDEMPTIONS, JSON.stringify(redemptions));
  },

  addRedemption(redemption: Redemption): void {
    const red = this.getRedemptions();
    red.unshift(redemption);
    this.saveRedemptions(red);
  },

  getStats(): UserStats {
    const data = localStorage.getItem(KEYS.STATS);
    if (!data) return INITIAL_STATS;
    const stats: UserStats = JSON.parse(data);
    if (stats.lifetimeStarsEarned === undefined) {
      stats.lifetimeStarsEarned = stats.totalStars || 45;
      stats.starBalance = stats.totalStars || 45;
    }
    return stats;
  },

  saveStats(stats: UserStats): void {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  /**
   * Rule 4: Lifetime Stars vs. Star Balance
   * - Positive amount (chores/dad bonus): increases lifetimeStarsEarned AND starBalance
   * - Negative amount (rewards claimed): decreases starBalance ONLY (lifetimeStarsEarned never decreases!)
   * - Level is recalculated strictly from lifetimeStarsEarned!
   */
  updateStars(amount: number): UserStats {
    const stats = this.getStats();
    const settings = this.getSettings();

    if (amount > 0) {
      stats.lifetimeStarsEarned = (stats.lifetimeStarsEarned || 0) + amount;
      stats.starBalance = (stats.starBalance || 0) + amount;
    } else if (amount < 0) {
      stats.starBalance = Math.max(0, (stats.starBalance || 0) + amount);
    }
    stats.totalStars = stats.starBalance;

    // Recalculate level using Level Curve algorithm
    const levelInfo = calculateLevelFromLifetimeStars(stats.lifetimeStarsEarned, {
      base: settings.levelCurveBase || 0.3,
      power: settings.levelCurvePower || 1.5,
    });

    stats.level = levelInfo.level;
    stats.levelTitle = levelInfo.statusName;
    stats.tierIcon = levelInfo.tierIcon;
    stats.motivationPhrase = levelInfo.motivationPhrase;

    this.saveStats(stats);
    return stats;
  },

  recalculateLevel(overrideSettings?: { base?: number; power?: number }): UserStats {
    const stats = this.getStats();
    const settings = this.getSettings();
    const base = overrideSettings?.base ?? settings.levelCurveBase ?? 0.3;
    const power = overrideSettings?.power ?? settings.levelCurvePower ?? 1.5;

    const levelInfo = calculateLevelFromLifetimeStars(stats.lifetimeStarsEarned || 0, { base, power });

    stats.level = levelInfo.level;
    stats.levelTitle = levelInfo.statusName;
    stats.tierIcon = levelInfo.tierIcon;
    stats.motivationPhrase = levelInfo.motivationPhrase;

    this.saveStats(stats);
    return stats;
  },

  resetStats(): UserStats {
    const stats: UserStats = {
      totalStars: 0,
      starBalance: 0,
      lifetimeStarsEarned: 0,
      currentStreak: 0,
      lastCompletedDate: null,
      level: 1,
      levelTitle: 'Tidy Sprout I',
      tierIcon: '🌱',
      motivationPhrase: 'Every big helper starts with one small step.',
    };
    this.saveStats(stats);
    return stats;
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) return INITIAL_SETTINGS;
    const settings: AppSettings = JSON.parse(data);
    if (!settings.aiAutoApproveThreshold || settings.aiAutoApproveThreshold < 0.95) {
      settings.aiAutoApproveThreshold = 0.95;
    }
    if (!settings.levelCurveBase) settings.levelCurveBase = 0.3;
    if (!settings.levelCurvePower) settings.levelCurvePower = 1.5;
    return settings;
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportConfigJSON(): string {
    return JSON.stringify({
      chores: this.getChores(),
      rewards: this.getRewards(),
      settings: { ...this.getSettings(), geminiApiKey: '' }, // exclude sensitive API key from export
    }, null, 2);
  },

  importConfigJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.chores && Array.isArray(parsed.chores)) {
        this.saveChores(parsed.chores);
      }
      if (parsed.rewards && Array.isArray(parsed.rewards)) {
        this.saveRewards(parsed.rewards);
      }
      return true;
    } catch {
      return false;
    }
  }
};
