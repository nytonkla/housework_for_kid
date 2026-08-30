import React, { useState } from 'react';
import { Chore, Reward, Submission, UserStats, AppSettings } from '../types';
import { storage } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { testGeminiApiKey } from '../utils/aiVision';
import { calculateLevelFromLifetimeStars } from '../utils/levelCurve';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Settings,
  Sparkles,
  Share2,
  Star,
  Award,
  Key,
  Shield,
  Upload,
  Download,
  Info,
  HelpCircle,
  ExternalLink,
  X,
  Wifi,
  Loader2,
  Maximize2,
  Trophy,
  RotateCcw,
  RefreshCw,
  User,
} from 'lucide-react';

interface ParentDashboardProps {
  chores: Chore[];
  rewards: Reward[];
  submissions: Submission[];
  stats: UserStats;
  settings: AppSettings;
  onExitAdmin: () => void;
  onUpdateChores: (chores: Chore[]) => void;
  onUpdateRewards: (rewards: Reward[]) => void;
  onUpdateSubmissions: (submissions: Submission[]) => void;
  onUpdateStats: (stats: UserStats) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  chores,
  rewards,
  submissions,
  stats,
  settings,
  onExitAdmin,
  onUpdateChores,
  onUpdateRewards,
  onUpdateSubmissions,
  onUpdateStats,
  onUpdateSettings,
}) => {
  const [adminTab, setAdminTab] = useState<'submissions' | 'chores' | 'rewards' | 'settings' | 'share'>('submissions');

  // Chore Edit Modal state
  const [editingChore, setEditingChore] = useState<Partial<Chore> | null>(null);
  // Reward Edit Modal state
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);
  const [showApiKeyGuide, setShowApiKeyGuide] = useState<boolean>(false);

  // API Key Connection Test state
  const [isTestingApiKey, setIsTestingApiKey] = useState<boolean>(false);
  const [apiTestResult, setApiTestResult] = useState<{ type: 'success' | 'error' | 'none'; message: string }>({
    type: 'none',
    message: '',
  });

  const handleTestConnection = async () => {
    soundManager.playPop();
    if (!settings.geminiApiKey || settings.geminiApiKey.trim().length < 10) {
      soundManager.playError();
      setApiTestResult({ type: 'error', message: 'Please enter a valid API Key first.' });
      return;
    }

    setIsTestingApiKey(true);
    setApiTestResult({ type: 'none', message: '' });

    const result = await testGeminiApiKey(settings.geminiApiKey);
    setIsTestingApiKey(false);

    if (result.success) {
      soundManager.playFanfare();
      setApiTestResult({ type: 'success', message: result.message });
    } else {
      soundManager.playError();
      setApiTestResult({ type: 'error', message: result.message });
    }
  };

  // Full photo modal state
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<Submission | null>(null);

  // Quick Star Adjustment State
  const [manualStarAmount, setManualStarAmount] = useState<number>(10);
  const [manualAdjustmentReason, setManualAdjustmentReason] = useState<string>('');
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Level Curve tuning states & notice
  const [tempBase, setTempBase] = useState<number>(settings.levelCurveBase || 0.3);
  const [tempPower, setTempPower] = useState<number>(settings.levelCurvePower || 1.5);
  const [tuningNotice, setTuningNotice] = useState<string | null>(null);

  const handleManualStarAdjustment = (amount: number) => {
    if (!manualAdjustmentReason || manualAdjustmentReason.trim().length === 0) {
      soundManager.playError();
      return;
    }

    soundManager.playFanfare();
    const updatedStats = storage.updateStars(amount);
    onUpdateStats(updatedStats);

    const record: Submission = {
      id: `sub-adj-${Date.now()}`,
      choreId: 'manual-adj',
      choreTitle: amount >= 0 ? `⭐ Bonus Stars from Dad` : `⭐ Star Adjustment by Dad`,
      submittedAt: new Date().toISOString(),
      mediaUrl: '',
      mediaType: 'photo',
      status: 'approved',
      aiConfidenceScore: 1.0,
      aiAnalysisReason: `Dad's Note: "${manualAdjustmentReason.trim()}"`,
      starsEarned: amount,
      parentNote: manualAdjustmentReason.trim(),
      isManualAdjustment: true,
    };

    storage.addSubmission(record);
    onUpdateSubmissions(storage.getSubmissions());
    setManualAdjustmentReason('');
  };

  // Reset Kid Score Handler (Request 1)
  const handleResetKidScore = () => {
    if (window.confirm(`Are you sure you want to reset ${settings.kidName || 'your kid'}'s star balance and lifetime stars to 0?`)) {
      soundManager.playPop();
      const reset = storage.resetStats();
      onUpdateStats(reset);
      setTuningNotice(`Kid star score has been reset to 0!`);
      setTimeout(() => setTuningNotice(null), 3000);
    }
  };

  // Clear History Handler (Request 2)
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all work-done history check-ins and reward claim logs?")) {
      soundManager.playPop();
      storage.saveSubmissions([]);
      storage.saveRedemptions([]);
      onUpdateSubmissions([]);
      setTuningNotice("All work-done history check-ins have been cleared!");
      setTimeout(() => setTuningNotice(null), 3000);
    }
  };

  // Commit Level Curve Tuning Handler (Request 4)
  const handleCommitLevelCurveTuning = () => {
    soundManager.playFanfare();
    const updatedSettings = {
      ...settings,
      levelCurveBase: tempBase,
      levelCurvePower: tempPower,
    };
    onUpdateSettings(updatedSettings);
    storage.saveSettings(updatedSettings);

    const recalculatedStats = storage.recalculateLevel({ base: tempBase, power: tempPower });
    onUpdateStats(recalculatedStats);

    setTuningNotice(`Level Curve updated! Recalculated level: Level ${recalculatedStats.level} (${recalculatedStats.levelTitle})`);
    setTimeout(() => setTuningNotice(null), 4000);
  };

  // Reset Level Curve Tuning Handler (Request 5)
  const handleResetLevelCurveTuning = () => {
    soundManager.playPop();
    const defaultBase = 0.3;
    const defaultPower = 1.5;

    setTempBase(defaultBase);
    setTempPower(defaultPower);

    const updatedSettings = {
      ...settings,
      levelCurveBase: defaultBase,
      levelCurvePower: defaultPower,
    };
    onUpdateSettings(updatedSettings);
    storage.saveSettings(updatedSettings);

    const recalculatedStats = storage.recalculateLevel({ base: defaultBase, power: defaultPower });
    onUpdateStats(recalculatedStats);

    setTuningNotice(`Restored Level Curve to original defaults (Base: 0.3, Power: 1.5)! Recalculated level: Level ${recalculatedStats.level}`);
    setTimeout(() => setTuningNotice(null), 4000);
  };

  // Submission Approval Action
  const handleApproveSubmission = (sub: Submission) => {
    soundManager.playFanfare();
    const updatedSubs = submissions.map((s) =>
      s.id === sub.id ? { ...s, status: 'approved' as const } : s
    );
    onUpdateSubmissions(updatedSubs);
    storage.saveSubmissions(updatedSubs);

    // Credit stars to kid
    const updatedStats = storage.updateStars(sub.starsEarned);
    onUpdateStats(updatedStats);
  };

  const handleRejectSubmission = (sub: Submission) => {
    soundManager.playError();
    const updatedSubs = submissions.map((s) =>
      s.id === sub.id
        ? {
            ...s,
            status: 'rejected' as const,
            aiAnalysisReason: `Dad reviewed: Asked to try again for "${s.choreTitle}" ❌`,
          }
        : s
    );
    onUpdateSubmissions(updatedSubs);
    storage.saveSubmissions(updatedSubs);
  };

  // Chore CRUD
  const handleSaveChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore || !editingChore.title) return;

    soundManager.playPop();
    let newChores: Chore[];
    if (editingChore.id) {
      newChores = chores.map((c) => (c.id === editingChore.id ? ({ ...c, ...editingChore } as Chore) : c));
    } else {
      const created: Chore = {
        id: `chore-${Date.now()}`,
        title: editingChore.title || 'New Chore',
        description: editingChore.description || '',
        icon: editingChore.icon || '🧹',
        starReward: Number(editingChore.starReward) || 10,
        frequency: editingChore.frequency || 'daily',
        aiPrompt: editingChore.aiPrompt || editingChore.title,
        active: editingChore.active !== false,
        category: editingChore.category || 'cleaning',
      };
      newChores = [created, ...chores];
    }

    onUpdateChores(newChores);
    storage.saveChores(newChores);
    setEditingChore(null);
  };

  const handleDeleteChore = (id: string) => {
    soundManager.playPop();
    const newChores = chores.filter((c) => c.id !== id);
    onUpdateChores(newChores);
    storage.saveChores(newChores);
  };

  // Reward CRUD
  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward || !editingReward.title) return;

    soundManager.playPop();
    let newRewards: Reward[];
    if (editingReward.id) {
      newRewards = rewards.map((r) => (r.id === editingReward.id ? ({ ...r, ...editingReward } as Reward) : r));
    } else {
      const created: Reward = {
        id: `reward-${Date.now()}`,
        title: editingReward.title || 'New Reward',
        description: editingReward.description || '',
        icon: editingReward.icon || '🎁',
        costInStars: Number(editingReward.costInStars) || 50,
        availableStock: Number(editingReward.availableStock) || -1,
        active: editingReward.active !== false,
      };
      newRewards = [created, ...rewards];
    }

    onUpdateRewards(newRewards);
    storage.saveRewards(newRewards);
    setEditingReward(null);
  };

  const handleDeleteReward = (id: string) => {
    soundManager.playPop();
    const newRewards = rewards.filter((r) => r.id !== id);
    onUpdateRewards(newRewards);
    storage.saveRewards(newRewards);
  };

  // Share Config Export
  const handleExportJSON = () => {
    soundManager.playPop();
    const configStr = storage.exportConfigJSON();
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'housework_hero_config.json';
    a.click();
    URL.revokeObjectURL(url);
    setShareNotice('Preset JSON downloaded! You can share this file with other dads.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (storage.importConfigJSON(content)) {
        onUpdateChores(storage.getChores());
        onUpdateRewards(storage.getRewards());
        soundManager.playFanfare();
        setShareNotice('Preset imported successfully!');
      } else {
        soundManager.playError();
        setShareNotice('Error reading JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-12">
      {/* Admin Top Navigation Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Dad Admin Control Center</span>
              <span className="bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                PIN Protected
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Manage chores, rewards, review submissions, and share with other dads</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playPop();
            onExitAdmin();
          }}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center space-x-2 transition-all transform active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit to Kid Mode</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto bg-slate-100 p-2 border-b border-slate-200 hide-scrollbar">
        {[
          { id: 'submissions', label: `Submission Queue (${submissions.filter((s) => s.status === 'pending_parent').length})`, icon: Sparkles },
          { id: 'chores', label: `Manage Chores (${chores.length})`, icon: Award },
          { id: 'rewards', label: `Manage Rewards (${rewards.length})`, icon: Star },
          { id: 'share', label: 'Share with Other Dads 🚀', icon: Share2 },
          { id: 'settings', label: 'App & AI Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playPop();
                setAdminTab(tab.id as any);
              }}
              className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap flex items-center space-x-2 transition-all ${
                adminTab === tab.id
                  ? 'bg-white text-purple-700 shadow-md scale-105'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="p-6 sm:p-8">
        {/* SUBMISSIONS QUEUE TAB */}
        {adminTab === 'submissions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-between">
              <span>Kid Work-Done Submissions Queue</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                {submissions.length} Total Submissions
              </span>
            </h3>

            {submissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="font-bold text-slate-600">No submissions yet!</p>
                <p className="text-xs text-slate-400">When your kid snaps a photo check-in, it will appear here for review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-3xl p-5 border-2 shadow-sm flex flex-col justify-between space-y-4 ${
                      sub.status === 'pending_parent'
                        ? 'border-amber-300 bg-amber-50/20'
                        : sub.status === 'approved'
                        ? 'border-emerald-200'
                        : 'border-red-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-slate-800 text-base">{sub.choreTitle}</span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sub.status === 'pending_parent'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sub.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Photo Thumbnail */}
                      {sub.mediaUrl ? (
                        <div
                          onClick={() => {
                            soundManager.playPop();
                            setSelectedPhotoForModal(sub);
                          }}
                          className="relative rounded-2xl overflow-hidden bg-slate-900 max-h-56 mb-3 border border-slate-200 cursor-pointer group hover:opacity-95 transition-all"
                          title="Click to view full photo"
                        >
                          <img src={sub.mediaUrl} alt={sub.choreTitle} className="w-full h-full object-cover max-h-56" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                            <Maximize2 className="w-5 h-5" />
                            <span>Click to View Full Photo</span>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-md font-mono">
                            AI Confidence: {Math.round(sub.aiConfidenceScore * 100)}%
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-700 font-bold mb-3 flex items-center gap-2">
                          <span>👨‍👧‍👦</span>
                          <span>Dad Star Adjustment Note</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 font-medium mb-1">{sub.aiAnalysisReason}</p>
                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Action buttons if pending */}
                    {sub.status === 'pending_parent' ? (
                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={() => handleRejectSubmission(sub)}
                          className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Ask to Retry</span>
                        </button>
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve (+{sub.starsEarned} Stars)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 pt-1 border-t border-slate-100">
                        Reviewed & Status Finalized
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHORES CRUD TAB */}
        {adminTab === 'chores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-800">Chore Definitions</h3>
              <button
                onClick={() => {
                  soundManager.playPop();
                  setEditingChore({
                    title: '',
                    description: '',
                    icon: '🧹',
                    starReward: 10,
                    frequency: 'daily',
                    aiPrompt: '',
                    active: true,
                    category: 'cleaning',
                  });
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Chore</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chores.map((chore) => (
                <div
                  key={chore.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl p-3 bg-purple-50 rounded-2xl border border-purple-100">{chore.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">{chore.title}</h4>
                        <p className="text-xs text-purple-600 font-bold">
                          ⭐ {chore.starReward} Stars • Unlocks at Level {chore.unlockLevel || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          soundManager.playPop();
                          setEditingChore(chore);
                        }}
                        className="p-2 text-slate-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChore(chore.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">{chore.description}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-700">AI Target Prompt:</span> "{chore.aiPrompt}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REWARDS CRUD TAB */}
        {adminTab === 'rewards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-800">Reward Catalog Setup</h3>
              <button
                onClick={() => {
                  soundManager.playPop();
                  setEditingReward({
                    title: '',
                    description: '',
                    icon: '🎁',
                    costInStars: 50,
                    availableStock: -1,
                    active: true,
                  });
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Reward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl p-3 bg-amber-50 rounded-2xl border border-amber-100">{reward.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">{reward.title}</h4>
                        <p className="text-xs text-amber-600 font-bold">Cost: ⭐ {reward.costInStars} Stars</p>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          soundManager.playPop();
                          setEditingReward(reward);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHARE WITH OTHER DADS TAB */}
        {adminTab === 'share' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl p-6 shadow-md">
              <h3 className="text-2xl font-extrabold mb-2 flex items-center gap-2">
                <Share2 className="w-6 h-6" />
                <span>Share Housework Hero with Other Dads!</span>
              </h3>
              <p className="text-sm text-purple-100 font-medium leading-relaxed">
                You can easily export your customized chores and rewards configuration to share with other parents, or import preset templates!
              </p>
            </div>

            {shareNotice && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{shareNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  <span>Export Preset JSON</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Download your active chore list and reward catalog as a clean JSON file to share via message or email.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md"
                >
                  Export Preset Config
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span>Import Preset JSON</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Load another dad's configuration file to quickly populate chores and rewards.
                </p>
                <label className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md flex items-center justify-center cursor-pointer">
                  <span>Choose Preset File</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                <Info className="w-5 h-5 text-amber-600" />
                <span>How to Install on iPad Home Screen (For Other Dads)</span>
              </h4>
              <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside font-medium leading-relaxed">
                <li>Open this web application link in <strong>Safari on iPad</strong>.</li>
                <li>Tap the iPad <strong>Share icon</strong> (square with arrow pointing up).</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>Add</strong>. Your kid can now open it with 1-tap from the Home Screen with zero browser bars!</li>
              </ol>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {adminTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-xl font-extrabold text-slate-800">App & AI Verification Settings</h3>

            {tuningNotice && (
              <div className="p-4 bg-purple-600 text-white font-extrabold rounded-2xl text-xs shadow-md animate-fade-in flex items-center justify-between">
                <span>{tuningNotice}</span>
                <button onClick={() => setTuningNotice(null)} className="p-1 hover:bg-white/20 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Kid Profile & Name Settings (Request 3) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-purple-600" />
                <span>Kid's Profile & Name</span>
              </h4>
              <p className="text-xs text-slate-500">
                Customize your kid's display name shown on the header greeting and dashboard.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kid's Display Name</label>
                <input
                  type="text"
                  value={settings.kidName || ''}
                  onChange={(e) => {
                    const updated = { ...settings, kidName: e.target.value };
                    onUpdateSettings(updated);
                    storage.saveSettings(updated);
                  }}
                  placeholder="e.g. Nalin or Hero Kid"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Star Adjuster & Data Maintenance (Requests 1 & 2) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Adjust Kid's Star Balance & Reset Controls</span>
              </h4>
              <p className="text-xs text-slate-500">
                Spendable Balance: <strong className="text-purple-600 font-extrabold text-base">{stats.starBalance ?? stats.totalStars} Stars</strong> • Lifetime Earned: <strong className="text-emerald-600 font-extrabold text-base">{stats.lifetimeStarsEarned ?? stats.totalStars} Stars</strong>
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Adjustment <span className="text-red-500">* Required for Kid History</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra help carrying grocery bags or missed bed making"
                  value={manualAdjustmentReason}
                  onChange={(e) => setManualAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm mb-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-[11px] text-purple-600 font-medium">
                  This note will be recorded and shown in your kid's work-done history log!
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => handleManualStarAdjustment(-manualStarAmount)}
                  disabled={!manualAdjustmentReason.trim()}
                  className="px-4 py-2.5 bg-red-100 hover:bg-red-200 disabled:opacity-40 text-red-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Subtract -{manualStarAmount} Stars
                </button>
                <input
                  type="number"
                  value={manualStarAmount}
                  onChange={(e) => setManualStarAmount(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-xl font-bold text-center text-sm"
                />
                <button
                  onClick={() => handleManualStarAdjustment(manualStarAmount)}
                  disabled={!manualAdjustmentReason.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Add +{manualStarAmount} Stars
                </button>
              </div>

              {/* Data Reset Action Buttons (Requests 1 & 2) */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                <button
                  onClick={handleResetKidScore}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Kid's Star Score to 0</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Work-Done History Log</span>
                </button>
              </div>
            </div>

            {/* Level Curve Algorithm Tuning (Requests 4 & 5) */}
            {(() => {
              const previewInfo = calculateLevelFromLifetimeStars(stats.lifetimeStarsEarned || 0, {
                base: tempBase,
                power: tempPower,
              });

              return (
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    <span>Level Curve Progression Tuning (100 Levels)</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formula: <code className="bg-slate-200 px-2 py-0.5 rounded font-mono text-purple-700 font-bold">Stars = ROUND(Base × (Level - 1)^Power)</code>.
                    Early levels come quickly for fast encouragement, while higher levels represent genuine long-term independence (~11,853 total stars to Level 100).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Base Multiplier (Default: 0.3)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={tempBase}
                        onChange={(e) => setTempBase(Math.max(0.01, Number(e.target.value)))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Power Exponent (Default: 1.5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={tempPower}
                        onChange={(e) => setTempPower(Math.max(1.0, Number(e.target.value)))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Impact Explanation & Preview Box (Request 4) */}
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs space-y-2">
                    <h5 className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-600" />
                      <span>Level Curve Impact Explanation</span>
                    </h5>
                    <p className="text-indigo-800 leading-relaxed">
                      Changing <strong>Base</strong> alters overall star requirements across all levels. Changing <strong>Power</strong> alters curve steepness (higher exponent makes upper levels require significantly more stars).
                    </p>
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-200/80 font-bold text-indigo-950">
                      <span>Lifetime Stars: ⭐ {stats.lifetimeStarsEarned || 0}</span>
                      <span>Current: Level {stats.level}</span>
                      <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-[11px]">
                        Recalculated Preview: Level {previewInfo.level} ({previewInfo.statusName})
                      </span>
                    </div>
                  </div>

                  {/* Tuning Buttons (Requests 4 & 5) */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleCommitLevelCurveTuning}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commit & Recalculate Levels</span>
                    </button>

                    <button
                      onClick={handleResetLevelCurveTuning}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-2xl flex items-center space-x-1.5 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-600" />
                      <span>Reset to Default Curve (Base: 0.3, Power: 1.5)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Gemini API Key Configuration */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
                  <Key className="w-5 h-5 text-purple-600" />
                  <span>Google Gemini AI Vision API Key</span>
                </h4>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setShowApiKeyGuide(true);
                  }}
                  className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How to Get a Free Key (1-Min Guide)</span>
                </button>
              </div>

              {/* API Connection Status Badge */}
              <div className="p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border">
                <div className="flex items-center space-x-2">
                  {apiTestResult.type === 'success' || (apiTestResult.type === 'none' && settings.geminiApiKey.length > 10) ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-emerald-700">CONNECTED (Gemini 3.6 Flash Online)</span>
                    </>
                  ) : apiTestResult.type === 'error' ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-red-700">CONNECTION ERROR</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-blue-700">OFFLINE MODE (Smart Built-in Local AI Active)</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {apiTestResult.message || (settings.geminiApiKey ? 'Key saved in local storage' : 'No API key needed for local mode')}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                (Optional) Enter your Gemini API key to enable online AI image verification. Click <strong>Test & Connect</strong> to verify your connection!
              </p>

              {/* Input + Connect Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.geminiApiKey}
                  onChange={(e) => {
                    const updated = { ...settings, geminiApiKey: e.target.value };
                    onUpdateSettings(updated);
                    storage.saveSettings(updated);
                    setApiTestResult({ type: 'none', message: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <button
                  onClick={handleTestConnection}
                  disabled={isTestingApiKey}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isTestingApiKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                      <span>CONNECTING...</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 text-purple-200" />
                      <span>TEST & CONNECT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Parent PIN */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-slate-800 text-base">Parent Security PIN</h4>
              <input
                type="text"
                maxLength={4}
                value={settings.parentPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const updated = { ...settings, parentPin: val };
                  onUpdateSettings(updated);
                  storage.saveSettings(updated);
                }}
                className="w-32 px-4 py-3 border border-slate-300 rounded-2xl text-center font-extrabold text-lg tracking-widest"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chore Edit Modal Overlay */}
      {editingChore && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveChore}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-xl font-extrabold text-slate-800">
              {editingChore.id ? 'Edit Chore' : 'Create New Chore'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  value={editingChore.title || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, title: e.target.value })}
                  placeholder="e.g. Wash & Stack Dishes"
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    required
                    value={editingChore.icon || ''}
                    onChange={(e) => setEditingChore({ ...editingChore, icon: e.target.value })}
                    placeholder="🍽️"
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Star Reward</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingChore.starReward || 5}
                    onChange={(e) => setEditingChore({ ...editingChore, starReward: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unlock Level</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editingChore.unlockLevel || 1}
                    onChange={(e) => setEditingChore({ ...editingChore, unlockLevel: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description (for Kid)</label>
                <textarea
                  rows={2}
                  value={editingChore.description || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, description: e.target.value })}
                  placeholder="Describe what needs to be done..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">AI Target Prompt (Visual Check)</label>
                <textarea
                  rows={2}
                  value={editingChore.aiPrompt || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, aiPrompt: e.target.value })}
                  placeholder="e.g. Clean plates, glasses stacked beside sink or inside dishwasher machine"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingChore(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md"
              >
                Save Chore
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reward Edit Modal Overlay */}
      {editingReward && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveReward}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-xl font-extrabold text-slate-800">
              {editingReward.id ? 'Edit Reward' : 'Create New Reward'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reward Title</label>
                <input
                  type="text"
                  required
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  placeholder="e.g. 30 Mins Gaming Time"
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    required
                    value={editingReward.icon || ''}
                    onChange={(e) => setEditingReward({ ...editingReward, icon: e.target.value })}
                    placeholder="🎮"
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Star Cost</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingReward.costInStars || 50}
                    onChange={(e) => setEditingReward({ ...editingReward, costInStars: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  placeholder="Describe the reward..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm shadow-md"
              >
                Save Reward
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Gemini API Key How-To Guide Modal */}
      {showApiKeyGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">How to Get a Free Gemini API Key</h3>
                  <p className="text-xs text-emerald-600 font-bold">Takes 1 minute • 100% Free for Family Use</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyGuide(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl space-y-2">
                <p className="font-bold text-sm">Step 1: Open Google AI Studio</p>
                <p className="text-purple-100 text-xs">
                  Click the button below to open Google's official API Key page in a new tab.
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-purple-50 transition-colors mt-1"
                >
                  <span>Open Google AI Studio Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <p className="pt-0.5 leading-relaxed">
                    <strong>Sign In:</strong> Log in with your regular Google/Gmail account.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <p className="pt-0.5 leading-relaxed">
                    <strong>Create Key:</strong> Click the blue <strong>"Create API key"</strong> button at the top left.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">4</span>
                  <p className="pt-0.5 leading-relaxed">
                    <strong>Copy & Paste:</strong> Click <strong>"Copy"</strong> on the generated key string (starts with <code>AIzaSy...</code>) and paste it into the Gemini API Key input field in settings!
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 font-medium">
                <p className="font-bold flex items-center gap-1.5 text-xs mb-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Don't want to get a key right now?</span>
                </p>
                <p className="text-xs leading-relaxed text-amber-800">
                  No problem at all! If you leave the API key blank, Housework Hero uses its built-in smart offline verification engine so your kid can check in chores seamlessly immediately!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApiKeyGuide(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl"
            >
              Got It! Close Guide
            </button>
          </div>
        </div>
      )}
      {/* Full Photo Preview Modal */}
      {selectedPhotoForModal && (
        <div
          onClick={() => setSelectedPhotoForModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-100"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{selectedPhotoForModal.choreTitle}</h3>
                <p className="text-xs text-purple-200">
                  Submitted: {new Date(selectedPhotoForModal.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhotoForModal(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-950 flex-1 flex items-center justify-center p-2 min-h-[320px] overflow-hidden">
              <img
                src={selectedPhotoForModal.mediaUrl}
                alt={selectedPhotoForModal.choreTitle}
                className="w-full h-full object-contain max-h-[65vh] rounded-xl"
              />
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-700 font-medium">
                <strong className="text-slate-800">AI Result:</strong> {selectedPhotoForModal.aiAnalysisReason}
              </div>
              <div className="bg-purple-100 text-purple-700 font-extrabold px-3.5 py-1.5 rounded-xl whitespace-nowrap self-start sm:self-auto">
                AI Confidence: {Math.round(selectedPhotoForModal.aiConfidenceScore * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
