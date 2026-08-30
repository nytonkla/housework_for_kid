import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Info } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const InstallPwaBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in PWA standalone mode
    const isStandalone =
      (window.navigator as any).standalone ||
      window.matchMedia('(display-mode: standalone)').matches;

    // Check if previously dismissed permanently
    const isDismissed = localStorage.getItem('hh_dismiss_pwa_banner') === 'true';

    if (!isStandalone && !isDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    soundManager.playPop();
    if (dontShowAgain) {
      localStorage.setItem('hh_dismiss_pwa_banner', 'true');
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white p-4 sm:p-5 shadow-lg border-b border-white/10 relative animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-amber-300 flex-shrink-0 mt-0.5">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <span>📱 Install on iPad Home Screen for 1-Tap Access!</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black">
                Dad Guide
              </span>
            </h3>
            <p className="text-xs text-purple-100 leading-relaxed font-medium">
              Give your kid a 1-tap app icon experience with <strong>zero browser bars</strong>:
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-200 font-bold pt-1">
              <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg">
                1. Tap Safari Share <Share className="w-3.5 h-3.5 inline text-white" />
              </span>
              <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg">
                2. Tap "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 inline text-white" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Dismiss Controls */}
        <div className="flex items-center space-x-4 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t border-white/10 md:border-t-0 w-full md:w-auto justify-between md:justify-end">
          <label className="flex items-center space-x-2 text-xs text-purple-200 cursor-pointer font-semibold select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-500"
            />
            <span>Don't show this again</span>
          </label>

          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
          >
            <span>Got It!</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
