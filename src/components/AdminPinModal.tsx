import React, { useState } from 'react';
import { Lock, X, Delete } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AdminPinModalProps {
  correctPin: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  correctPin,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    soundManager.playPop();
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        soundManager.playStarChime();
        onSuccess();
      } else {
        soundManager.playError();
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    soundManager.playPop();
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-white w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-transform ${
          error ? 'animate-bounce-short' : ''
        }`}
      >
        <div className="flex justify-between w-full items-center mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-1">Dad / Parent Access</h3>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Enter 4-digit PIN (Default: <strong className="text-purple-600">1234</strong>)
        </p>

        {/* PIN Dots Display */}
        <div className="flex space-x-3 mb-8">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'border-red-500 bg-red-100 scale-110'
                    : isFilled
                    ? 'border-purple-600 bg-purple-600 scale-110'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-xs text-red-500 font-bold mb-4">Incorrect PIN. Try again!</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-700 font-extrabold text-xl flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}
          <div className="h-14"></div>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-700 font-extrabold text-xl flex items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 font-bold text-sm flex items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
