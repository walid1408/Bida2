import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, ArrowRight, X } from 'lucide-react';
import { Language } from '../types';

interface AppLockModalProps {
  isLocked: boolean;
  onUnlock: (pin: string) => boolean;
  language: Language;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isLocked,
  onUnlock,
  language
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/50 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-100 flex items-center justify-center gap-2">
            <span>{language === 'fr' ? 'Application Verrouillée' : 'التطبيق مقفل برمز السر'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'fr'
              ? 'Veuillez saisir votre code PIN pour accéder à Mawada.'
              : 'أدخل رمز الحماية (PIN) الخاص بك لفتح تطبيق مودة.'}
          </p>
        </div>

        {/* PIN Display Dots */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-amber-400 border-amber-400 scale-110 shadow-md shadow-amber-400/50'
                    : 'bg-slate-800 border-slate-700'
                } ${error ? 'border-rose-500 bg-rose-500/30 animate-bounce' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>{language === 'fr' ? 'Code PIN incorrect' : 'رمز السر غير صحيح، حاول مجدداً'}</span>
            </p>
          )}

          {/* Numerical Keypad */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-16 h-14 mx-auto rounded-2xl bg-[#0A0F1D] border border-slate-800 hover:border-amber-500/40 text-slate-100 font-bold text-lg active:scale-95 transition-all flex items-center justify-center shadow-md"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleDelete}
              className="w-16 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center"
            >
              {language === 'fr' ? 'Effacer' : 'حذف'}
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-14 mx-auto rounded-2xl bg-[#0A0F1D] border border-slate-800 hover:border-amber-500/40 text-slate-100 font-bold text-lg active:scale-95 transition-all flex items-center justify-center shadow-md"
            >
              0
            </button>

            <button
              type="submit"
              disabled={pin.length === 0}
              className="w-16 h-14 mx-auto rounded-2xl bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-amber-950/40"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
