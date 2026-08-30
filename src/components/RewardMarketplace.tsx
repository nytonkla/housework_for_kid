import React, { useState } from 'react';
import { Reward, UserStats } from '../types';
import { Star, Gift, Check, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface RewardMarketplaceProps {
  rewards: Reward[];
  stats: UserStats;
  onClaimReward: (reward: Reward) => void;
}

export const RewardMarketplace: React.FC<RewardMarketplaceProps> = ({
  rewards,
  stats,
  onClaimReward,
}) => {
  const [claimedRewardId, setClaimedRewardId] = useState<string | null>(null);
  const activeRewards = rewards.filter((r) => r.active);

  const spendableStars = stats.starBalance ?? stats.totalStars;

  const handleClaim = (reward: Reward) => {
    if (spendableStars < reward.costInStars) {
      soundManager.playError();
      return;
    }

    soundManager.playFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FF6B9B', '#8B5CF6', '#3B82F6'],
    });

    setClaimedRewardId(reward.id);
    onClaimReward(reward);

    setTimeout(() => {
      setClaimedRewardId(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100">
            <Gift className="w-3.5 h-3.5" />
            <span>Reward Store</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Exchange Stars for Rewards!
          </h2>
          <p className="text-amber-100 text-sm font-medium">
            Spendable Balance: <strong className="text-white text-lg font-black">{spendableStars} ⭐</strong>
            <span className="text-xs text-amber-200 block font-normal pt-0.5">
              (Lifetime Earned: ⭐ {stats.lifetimeStarsEarned ?? stats.totalStars} — spending stars never reduces your Level!)
            </span>
          </p>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRewards.map((reward) => {
          const canAfford = spendableStars >= reward.costInStars;
          const isJustClaimed = claimedRewardId === reward.id;

          return (
            <div
              key={reward.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between group ${
                canAfford
                  ? 'border-amber-200 shadow-md hover:shadow-xl hover:border-amber-400 transform hover:-translate-y-1'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner border border-amber-100">
                    {reward.icon}
                  </div>

                  <div className="bg-slate-900 text-amber-300 px-4 py-1.5 rounded-2xl font-black text-sm flex items-center space-x-1.5 shadow-md">
                    <Star className="w-4 h-4 fill-amber-300" />
                    <span>{reward.costInStars}</span>
                  </div>
                </div>

                <h4 className="text-lg font-extrabold text-slate-800 mb-1 leading-tight">
                  {reward.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
                  {reward.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {isJustClaimed ? (
                  <button className="w-full py-3.5 bg-emerald-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 animate-bounce">
                    <Check className="w-5 h-5" />
                    <span>CLAIMED! 🎉</span>
                  </button>
                ) : canAfford ? (
                  <button
                    onClick={() => handleClaim(reward)}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center space-x-2 transform active:scale-95 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-amber-200" />
                    <span>CLAIM THIS REWARD</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 cursor-not-allowed border border-slate-200"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Need {reward.costInStars - spendableStars} More Stars</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
