import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, UserX, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { Profile, Language, ReportReason } from '../types';
import { translations } from '../data/translations';

interface ReportModalProps {
  profile: Profile | null;
  onClose: () => void;
  language: Language;
  onConfirmReport: (profileId: string, reason: ReportReason, blockAlso: boolean, blockFutureAccounts: boolean) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  profile,
  onClose,
  language,
  onConfirmReport
}) => {
  if (!profile) return null;

  const t = translations[language];
  const [selectedReason, setSelectedReason] = useState<ReportReason>('inappropriate_messages');
  const [blockAlso, setBlockAlso] = useState(true);
  const [blockFutureAccounts, setBlockFutureAccounts] = useState(true);
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReport(profile.id, selectedReason, blockAlso, blockFutureAccounts);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      
      <div className="bg-[#0F172A] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5 relative text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-slate-400 hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <h3 className="font-bold text-lg font-serif text-slate-100">
                {t.reportTitle} : {profile.name}
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              {t.reportReasonPrompt}
            </p>

            {/* Reason Selection */}
            <div className="space-y-2 text-xs">
              {[
                { id: 'fake_profile', label: t.reasonFake },
                { id: 'inappropriate_messages', label: t.reasonInappropriate },
                { id: 'harassment', label: t.reasonHarassment },
                { id: 'spam', label: t.reasonSpam },
                { id: 'other', label: t.reasonOther },
              ].map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                      : 'border-slate-800 bg-[#0A0F1D] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id as ReportReason)}
                    className="accent-amber-500"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            {/* Comments input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                {t.reportComments}
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            {/* Also block checkbox */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockAlso}
                  onChange={(e) => setBlockAlso(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <UserX className="w-4 h-4 text-amber-400" />
                  <span>{t.confirmBlock}</span>
                </span>
              </label>

              {/* Advanced Block Box: Block any new account opened by this user in the future */}
              {blockAlso && (
                <div className="p-3 rounded-2xl bg-[#0A0F1D] border border-amber-500/30 space-y-1.5 animate-fadeIn">
                  <label className="flex items-start space-x-2.5 rtl:space-x-reverse text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={blockFutureAccounts}
                      onChange={(e) => setBlockFutureAccounts(e.target.checked)}
                      className="mt-0.5 rounded accent-amber-500 w-4 h-4 shrink-0 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                        {language === 'fr'
                          ? 'Bloquer également tout nouveau compte créé par cet utilisateur'
                          : 'حظر أي حساب جديد يقوم بإنشائه مستقبلاً'}
                      </span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {language === 'fr'
                          ? 'Empêche définitivement cette personne de vous recontacter même s’elle crée un nouveau profil sur Mawada.'
                          : 'يمنع هذا الشخص نهائياً من التواصل معك مجدداً حتى لو قام بفتح حساب جديد على مودة.'}
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400"
              >
                {t.submitReport}
              </button>
            </div>

          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-100">
              {t.reportedSuccess}
            </h4>
            {blockAlso && (
              <p className="text-xs text-amber-400 font-semibold">{t.blockedSuccess}</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
