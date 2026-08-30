import { Chore, Reward, Submission, Redemption, UserStats, AppSettings } from '../types';

const INITIAL_CHORES: Chore[] = [
  {
    id: 'chore-1',
    title: 'Dishwasher / Washing Dishes',
    description: 'Help put dirty dishes in dishwasher or wash & stack clean dishes beside the sink',
    icon: '🍽️',
    starReward: 15,
    frequency: 'daily',
    aiPrompt: 'Clean dishes, plates, cups, bowls stacked beside sink or inside dishwasher machine',
    active: true,
    category: 'cleaning',
  },
  {
    id: 'chore-2',
    title: 'Clean Bedroom & Make Bed',
    description: 'Fold your blanket, arrange pillows, and put away toys on the floor',
    icon: '🛏️',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Neatly made bed with folded blanket or organized bedroom floor without clutter',
    active: true,
    category: 'organizing',
  },
  {
    id: 'chore-3',
    title: 'Fold Laundry / Clothes',
    description: 'Fold your dry clothes neatly and put them in your cabinet',
    icon: '🧺',
    starReward: 20,
    frequency: 'daily',
    aiPrompt: 'Folded clothes, shirts, pants neatly stacked in pile or wardrobe',
    active: true,
    category: 'cleaning',
  },
  {
    id: 'chore-4',
    title: 'Water the Houseplants',
    description: 'Give a cup of water to houseplants on the porch or balcony',
    icon: '🪴',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Potted plants watered on porch, balcony, or living room',
    active: true,
    category: 'other',
  },
  {
    id: 'chore-5',
    title: 'Feed Pet Dog / Cat',
    description: 'Fill the pet bowl with dry food and fresh water',
    icon: '🐶',
    starReward: 10,
    frequency: 'daily',
    aiPrompt: 'Pet food bowl filled with dry food or water beside pet station',
    active: true,
    category: 'pet_care',
  },
  {
    id: 'chore-6',
    title: 'Read Book for 20 Mins',
    description: 'Read your storybook or chapter book peacefully',
    icon: '📚',
    starReward: 15,
    frequency: 'daily',
    aiPrompt: 'Open storybook, textbook, or reading desk setup',
    active: true,
    category: 'learning',
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
  currentStreak: 3,
  lastCompletedDate: new Date().toISOString().split('T')[0],
  level: 2,
  levelTitle: 'Super Helper 🌟',
};

const INITIAL_SETTINGS: AppSettings = {
  parentPin: '1234',
  geminiApiKey: '',
  soundEnabled: true,
  aiAutoApproveThreshold: 0.95,
  kidName: 'Hero Kid',
};

const KEYS = {
  CHORES: 'hh_chores_v1',
  REWARDS: 'hh_rewards_v1',
  SUBMISSIONS: 'hh_submissions_v1',
  REDEMPTIONS: 'hh_redemptions_v1',
  STATS: 'hh_stats_v1',
  SETTINGS: 'hh_settings_v1',
};

export const storage = {
  getChores(): Chore[] {
    const data = localStorage.getItem(KEYS.CHORES);
    return data ? JSON.parse(data) : INITIAL_CHORES;
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
    return data ? JSON.parse(data) : INITIAL_STATS;
  },

  saveStats(stats: UserStats): void {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  updateStars(amount: number): UserStats {
    const stats = this.getStats();
    stats.totalStars = Math.max(0, stats.totalStars + amount);
    
    // Level calculation (Level up every 100 stars)
    const newLevel = Math.floor(stats.totalStars / 100) + 1;
    stats.level = newLevel;
    if (newLevel === 1) stats.levelTitle = 'Junior Helper 🌱';
    else if (newLevel === 2) stats.levelTitle = 'Super Helper 🌟';
    else if (newLevel === 3) stats.levelTitle = 'Housework Master 🏆';
    else if (newLevel === 4) stats.levelTitle = 'Legendary Champion 👑';
    else stats.levelTitle = `Grand Master Lvl ${newLevel} 🚀`;

    this.saveStats(stats);
    return stats;
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) return INITIAL_SETTINGS;
    const settings: AppSettings = JSON.parse(data);
    if (!settings.aiAutoApproveThreshold || settings.aiAutoApproveThreshold < 0.95) {
      settings.aiAutoApproveThreshold = 0.95;
      this.saveSettings(settings);
    }
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
