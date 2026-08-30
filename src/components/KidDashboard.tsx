import React, { useState } from 'react';
import { Chore, Submission, UserStats } from '../types';
import { Camera, Sparkles, CheckCircle2, Clock, Trophy, Star, XCircle, Lock } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { calculateLevelFromLifetimeStars } from '../utils/levelCurve';

interface KidDashboardProps {
  chores: Chore[];
  submissions: Submission[];
  stats: UserStats;
  onSelectChore: (chore: Chore) => void;
}

export const KidDashboard: React.FC<KidDashboardProps> = ({
  chores,
  submissions,
  stats,
  onSelectChore,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const lifetimeStars = stats.lifetimeStarsEarned ?? stats.totalStars ?? 45;
  const levelProgress = calculateLevelFromLifetimeStars(lifetimeStars);

  const activeChores = chores.filter((c) => c.active !== false);
  const filteredChores =
    selectedCategory === 'all'
      ? activeChores
      : activeChores.filter((c) => c.category === selectedCategory);

  // Sort chores: unlocked first, then locked
  const sortedChores = [...filteredChores].sort((a, b) => {
    const unlockA = a.unlockLevel || 1;
    const unlockB = b.unlockLevel || 1;
    const isUnlockedA = levelProgress.level >= unlockA;
    const isUnlockedB = levelProgress.level >= unlockB;
    if (isUnlockedA && !isUnlockedB) return -1;
    if (!isUnlockedA && isUnlockedB) return 1;
    return unlockA - unlockB;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Level & Level Curve Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-200">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Level {levelProgress.level} of 100 • {levelProgress.tier}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{levelProgress.tierIcon}</span>
              <span>{levelProgress.statusName}</span>
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm font-medium italic bg-white/10 p-3 rounded-2xl border border-white/10">
              "{levelProgress.motivationPhrase}"
            </p>
          </div>

          {/* Level Progress Meter */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[280px] space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-xs font-bold text-purple-100">
              <span className="flex items-center gap-1">
                <span>⭐ Level {levelProgress.level}</span>
              </span>
              <span>Level {Math.min(100, levelProgress.level + 1)} ⭐</span>
            </div>

            <div className="w-full bg-purple-950/40 rounded-full h-4 p-0.5 overflow-hidden border border-white/20">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-inner"
                style={{ width: `${levelProgress.progressPercent}%` }}
              ></div>
            </div>

            {levelProgress.level < 100 ? (
              <p className="text-right text-xs font-extrabold text-amber-300">
                {levelProgress.starsInCurrentLevel} / {levelProgress.starsNeededForNextLevel} Stars to Level {levelProgress.level + 1}!
              </p>
            ) : (
              <p className="text-right text-xs font-extrabold text-amber-300">
                MAX LEVEL ACHIEVED! 🏆
              </p>
            )}

            <div className="pt-2 border-t border-white/10 flex justify-between text-[11px] font-bold text-purple-200">
              <span>Lifetime Stars: ⭐ {lifetimeStars}</span>
              <span>Spendable: ⭐ {stats.starBalance ?? stats.totalStars}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chore Categories Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        {[
          { id: 'all', label: 'All Chores ✨' },
          { id: 'kitchen', label: 'Kitchen & Dining 🍽️' },
          { id: 'cleaning', label: 'Cleaning 🧼' },
          { id: 'organizing', label: 'Organizing 📦' },
          { id: 'laundry', label: 'Laundry 🧺' },
          { id: 'pet_care', label: 'Pet Care 🐶' },
          { id: 'family', label: 'Family & Helping 🤝' },
          { id: 'self_care', label: 'Self Care 🎒' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundManager.playPop();
              setSelectedCategory(cat.id);
            }}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chore Cards Grid */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>Chores & Responsibilities</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">
              {sortedChores.length} Total
            </span>
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChores.map((chore) => {
            const unlockLevel = chore.unlockLevel || 1;
            const isUnlocked = levelProgress.level >= unlockLevel;

            return (
              <div
                key={chore.id}
                className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  isUnlocked
                    ? 'border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transform hover:-translate-y-1'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border ${
                        isUnlocked
                          ? 'bg-purple-50 border-purple-100 group-hover:scale-110 transition-transform'
                          : 'bg-slate-200 border-slate-300 grayscale'
                      }`}
                    >
                      {chore.icon}
                    </div>

                    {isUnlocked ? (
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-3.5 py-1.5 rounded-2xl font-black text-sm flex items-center space-x-1 shadow-md">
                        <Star className="w-4 h-4 fill-slate-900" />
                        <span>+{chore.starReward}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-amber-300 px-3 py-1.5 rounded-2xl font-extrabold text-xs flex items-center space-x-1 shadow-md">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Level {unlockLevel}</span>
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-extrabold text-slate-800 mb-1 leading-tight group-hover:text-purple-600 transition-colors">
                    {chore.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
                    {chore.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center text-xs text-purple-600 font-semibold gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>AI Auto-Approval (95% Confidence)</span>
                      </div>

                      <button
                        onClick={() => {
                          soundManager.playPop();
                          onSelectChore(chore);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transform active:scale-95 transition-all"
                      >
                        <Camera className="w-5 h-5" />
                        <span>SNAP & CHECK IN</span>
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-200 text-slate-500 font-bold text-xs rounded-2xl flex items-center justify-center space-x-1.5 cursor-not-allowed border border-slate-300"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Unlocks at Level {unlockLevel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Stream */}
      {submissions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
            <span>Recent Work-Done History</span>
            <span className="text-xs text-slate-500 font-semibold">{submissions.length} Total Entries</span>
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {submissions.slice(0, 10).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-purple-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-100 border border-purple-200 flex-shrink-0 flex items-center justify-center text-xl">
                    {sub.mediaUrl ? (
                      <img src={sub.mediaUrl} alt={sub.choreTitle} className="w-full h-full object-cover" />
                    ) : sub.choreTitle.includes('Reward') || sub.choreTitle.includes('🎁') ? (
                      <span>🎁</span>
                    ) : (
                      <span>👨‍👧‍👦</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{sub.choreTitle}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sub.aiAnalysisReason}
                    </p>
                  </div>
                </div>

                <div>
                  {sub.status === 'approved' ? (
                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      sub.starsEarned >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 ${sub.starsEarned >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                      <span>{sub.starsEarned >= 0 ? `+${sub.starsEarned}` : sub.starsEarned} Stars</span>
                    </div>
                  ) : sub.status === 'rejected' ? (
                    <div className="flex items-center space-x-1.5 bg-red-100 text-red-800 px-3 py-1 rounded-xl text-xs font-bold">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Try Again ❌</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Dad Reviewing</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
