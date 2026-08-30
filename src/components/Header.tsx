import React from 'react';
import { UserStats } from '../types';
import { Lock, Sparkles, Flame, Star } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  stats: UserStats;
  kidName: string;
  onOpenAdminPin: () => void;
  activeTab: 'chores' | 'rewards';
  setActiveTab: (tab: 'chores' | 'rewards') => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  kidName,
  onOpenAdminPin,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Kid Greeting */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md transform hover:scale-105 transition-transform">
            🌟
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Housework Hero
            </h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <span>{kidName}'s Dashboard</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-purple-600 font-bold">{stats.levelTitle}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Switcher (Chores vs Rewards) */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('chores');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'chores'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105'
                : 'text-slate-600 hover:text-purple-600 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chores & Check-in</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('rewards');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                : 'text-slate-600 hover:text-amber-600 hover:bg-slate-200/60'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-300" />
            <span>Rewards Catalog</span>
          </button>
        </div>

        {/* Gamification Counters & Dad PIN Lock */}
        <div className="flex items-center space-x-3">
          {/* Streak Counter */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 px-3.5 py-2 rounded-2xl flex items-center space-x-1.5 shadow-sm">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="font-extrabold text-orange-600 text-sm sm:text-base">
              {stats.currentStreak} Day Streak!
            </span>
          </div>

          {/* Star Balance Badge */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-md transform hover:scale-105 transition-transform cursor-pointer" title={`Spendable Stars: ${stats.starBalance ?? stats.totalStars} | Lifetime Earned: ${stats.lifetimeStarsEarned ?? stats.totalStars}`}>
            <Star className="w-6 h-6 fill-slate-900 animate-star-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-800 leading-tight">Balance</span>
              <span className="text-xl font-black leading-none">{stats.starBalance ?? stats.totalStars}</span>
            </div>
          </div>

          {/* Dad Admin PIN Lock Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenAdminPin();
            }}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-md transition-colors"
            title="Dad Admin Access (PIN Protected)"
          >
            <Lock className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Dad Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
