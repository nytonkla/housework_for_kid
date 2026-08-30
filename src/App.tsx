import { useState, useEffect } from 'react';
import { Chore, Reward, Submission, UserStats, AppSettings } from './types';
import { storage } from './utils/storage';
import { Header } from './components/Header';
import { KidDashboard } from './components/KidDashboard';
import { RewardMarketplace } from './components/RewardMarketplace';
import { CameraModal } from './components/CameraModal';
import { AdminPinModal } from './components/AdminPinModal';
import { ParentDashboard } from './components/ParentDashboard';
import { InstallPwaBanner } from './components/InstallPwaBanner';

export function App() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<UserStats>(storage.getStats());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  const [activeTab, setActiveTab] = useState<'chores' | 'rewards'>('chores');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [selectedChoreForCamera, setSelectedChoreForCamera] = useState<Chore | null>(null);

  // Load initial data on mount
  useEffect(() => {
    setChores(storage.getChores());
    setRewards(storage.getRewards());
    setSubmissions(storage.getSubmissions());
    setStats(storage.getStats());
    setSettings(storage.getSettings());
  }, []);

  // Handle Photo Check-in Auto-Approved (AI Verified)
  const handleSuccessApproved = (
    starsEarned: number,
    submissionId: string,
    photoDataUrl: string,
    confidenceScore: number,
    reason: string
  ) => {
    if (!selectedChoreForCamera) return;

    // Create submission log
    const sub: Submission = {
      id: submissionId,
      choreId: selectedChoreForCamera.id,
      choreTitle: selectedChoreForCamera.title,
      submittedAt: new Date().toISOString(),
      mediaUrl: photoDataUrl, // actual snapped/uploaded image data URL!
      mediaType: 'photo',
      status: 'approved',
      aiConfidenceScore: confidenceScore,
      aiAnalysisReason: reason || `AI auto-approved photo for "${selectedChoreForCamera.title}"! 🎉`,
      starsEarned,
    };

    storage.addSubmission(sub);
    setSubmissions(storage.getSubmissions());

    // Award stars and update level
    const updatedStats = storage.updateStars(starsEarned);
    setStats(updatedStats);
    setSelectedChoreForCamera(null);
  };

  // Handle Photo Check-in Pending Dad Review
  const handleSuccessPending = (
    submissionId: string,
    photoDataUrl: string,
    confidenceScore: number,
    reason: string
  ) => {
    if (!selectedChoreForCamera) return;

    const sub: Submission = {
      id: submissionId,
      choreId: selectedChoreForCamera.id,
      choreTitle: selectedChoreForCamera.title,
      submittedAt: new Date().toISOString(),
      mediaUrl: photoDataUrl, // actual snapped/uploaded image data URL!
      mediaType: 'photo',
      status: 'pending_parent',
      aiConfidenceScore: confidenceScore,
      aiAnalysisReason: reason || `Sent for Dad's review on iPad ⭐`,
      starsEarned: selectedChoreForCamera.starReward,
    };

    storage.addSubmission(sub);
    setSubmissions(storage.getSubmissions());
    setSelectedChoreForCamera(null);
  };

  // Claim Reward
  const handleClaimReward = (reward: Reward) => {
    const updatedStats = storage.updateStars(-reward.costInStars);
    setStats(updatedStats);

    storage.addRedemption({
      id: `red-${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardIcon: reward.icon,
      claimedAt: new Date().toISOString(),
      status: 'claimed',
      starsSpent: reward.costInStars,
    });

    // Record in work-done history log!
    const rewardHistoryEntry: Submission = {
      id: `sub-reward-${Date.now()}`,
      choreId: 'reward-claim',
      choreTitle: `🎁 Claimed: ${reward.title}`,
      submittedAt: new Date().toISOString(),
      mediaUrl: '',
      mediaType: 'photo',
      status: 'approved',
      aiConfidenceScore: 1.0,
      aiAnalysisReason: `Spent ${reward.costInStars} stars for "${reward.title}" ${reward.icon}`,
      starsEarned: -reward.costInStars,
      parentNote: reward.description,
      isManualAdjustment: true,
    };

    storage.addSubmission(rewardHistoryEntry);
    setSubmissions(storage.getSubmissions());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-rounded selection:bg-purple-200">
      {/* Onboarding iPad PWA Installation Banner */}
      <InstallPwaBanner />

      {/* Top Navigation Header */}
      <Header
        stats={stats}
        kidName={settings.kidName}
        onOpenAdminPin={() => setShowAdminPinModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isAdminMode ? (
          <ParentDashboard
            chores={chores}
            rewards={rewards}
            submissions={submissions}
            stats={stats}
            settings={settings}
            onExitAdmin={() => setIsAdminMode(false)}
            onUpdateChores={setChores}
            onUpdateRewards={setRewards}
            onUpdateSubmissions={setSubmissions}
            onUpdateStats={setStats}
            onUpdateSettings={setSettings}
          />
        ) : activeTab === 'chores' ? (
          <KidDashboard
            chores={chores}
            submissions={submissions}
            stats={stats}
            onSelectChore={(chore) => setSelectedChoreForCamera(chore)}
          />
        ) : (
          <RewardMarketplace
            rewards={rewards}
            stats={stats}
            onClaimReward={handleClaimReward}
          />
        )}
      </main>

      {/* Camera Capture & AI Analysis Modal */}
      {selectedChoreForCamera && (
        <CameraModal
          chore={selectedChoreForCamera}
          settings={settings}
          onClose={() => setSelectedChoreForCamera(null)}
          onSuccessApproved={handleSuccessApproved}
          onSuccessPending={handleSuccessPending}
        />
      )}

      {/* Dad Admin PIN Entry Modal */}
      {showAdminPinModal && (
        <AdminPinModal
          correctPin={settings.parentPin}
          onClose={() => setShowAdminPinModal(false)}
          onSuccess={() => {
            setShowAdminPinModal(false);
            setIsAdminMode(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
