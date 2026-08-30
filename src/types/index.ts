export type ChoreFrequency = 'daily' | 'weekly' | 'one_time';

export type SubmissionStatus = 'approved' | 'pending_parent' | 'rejected';

export interface Chore {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or SVG name
  starReward: number;
  frequency: ChoreFrequency;
  aiPrompt: string; // Target image description for AI verification
  active: boolean;
  category: 'cleaning' | 'organizing' | 'pet_care' | 'learning' | 'other';
}

export interface Submission {
  id: string;
  choreId: string;
  choreTitle: string;
  submittedAt: string; // ISO date string
  mediaUrl: string; // Base64 data URL of photo or empty string for manual adjustment
  mediaType: 'photo' | 'video';
  status: SubmissionStatus;
  aiConfidenceScore: number; // 0.0 to 1.0 (e.g. 0.95 = 95%)
  aiAnalysisReason: string; // e.g. "Clean plates and glasses detected beside sink"
  starsEarned: number;
  parentNote?: string;
  isManualAdjustment?: boolean; // Flag for Dad manual star adjustments
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  costInStars: number;
  availableStock: number; // -1 for unlimited
  active: boolean;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  rewardIcon: string;
  claimedAt: string; // ISO date string
  status: 'claimed' | 'fulfilled';
  starsSpent: number;
}

export interface UserStats {
  totalStars: number;
  currentStreak: number;
  lastCompletedDate: string | null;
  level: number;
  levelTitle: string;
}

export interface AppSettings {
  parentPin: string; // default "1234"
  geminiApiKey: string; // optional Gemini API key for AI vision
  soundEnabled: boolean;
  aiAutoApproveThreshold: number; // default 0.95 (95%)
  kidName: string;
}
