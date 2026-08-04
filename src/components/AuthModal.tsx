import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, Calendar, CheckCircle2, ArrowRight, ShieldCheck, FileText, AlertCircle, Users } from 'lucide-react';
import { Language, UserProfile, Gender } from '../types';
import { ALGERIAN_WILAYAS } from '../data/translations';
import { getDefaultAvatar } from '../data/defaultAvatars';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (userProfileData: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'social' | 'email_login' | 'email_register'>('social');
  
  // Registration / Login Form state (Username, Wilaya, Age, Gender)
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [wilaya, setWilaya] = useState('01 - Adrar');
  const [age, setAge] = useState<number>(25);
  const [ageError, setAgeError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successProvider, setSuccessProvider] = useState('');

  // Email OTP Verification Step state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Mandatory Terms & Privacy Policy Acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  if (!isOpen) return null;

  const handleSocialAuth = (provider: 'Google' | 'Facebook') => {
    if (age < 18 || isNaN(age)) {
      setAgeError(true);
      return;
    }
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }

    // If username is provided, use it; otherwise generate a clean default from provider
    const displayName = username.trim() || (provider === 'Google' ? 'Utilisateur_Gmail' : 'Utilisateur_FB');
    
    setSuccessProvider(provider);
    setIsSuccess(true);
    
    setTimeout(() => {
      onLoginSuccess({
        name: displayName,
        city: wilaya,
        age: Math.max(18, age),
        gender: gender,
        photos: [getDefaultAvatar(gender)]
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age < 18 || isNaN(age)) {
      setAgeError(true);
      return;
    }
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }

    // Switch to Email OTP Verification screen
    setIsVerifyingEmail(true);
    setOtpCode('');
    setOtpError(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setOtpError(true);
      return;
    }

    const displayName = username.trim() || email.split('@')[0] || 'Utilisateur';

    setIsVerifyingEmail(false);
    setSuccessProvider('Email (Vérifié / مفعّل)');
    setIsSuccess(true);

    setTimeout(() => {
      onLoginSuccess({
        name: displayName,
        city: wilaya,
        age: Math.max(18, age),
        gender: gender,
        photos: [getDefaultAvatar(gender)]
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-[#0000] z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rtl:left-5 rtl:right-auto p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-amber-500 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30">
            <span className="text-[#0A0F1D] font-extrabold text-2xl tracking-tighter">Dz</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            {language === 'fr' ? 'Connexion & Inscription' : 'تسجيل الدخول والتسجيل'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'fr' 
              ? 'Choisissez votre méthode de connexion préférée'
              : 'اختر طريقة التسجيل المفضلة لديك'}
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-100">
              {language === 'fr' ? `Connecté avec ${successProvider} !` : `تم تسجيل الدخول بنجاح عبر ${successProvider}!`}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'fr' ? 'Bienvenue sur Mawada' : 'مرحباً بك في مودة'}
            </p>
          </div>
        ) : isVerifyingEmail ? (
          /* Email OTP / Verification Screen */
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                {language === 'fr' ? 'Vérification de votre adresse E-mail' : 'تأكيد البريد الإلكتروني'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fr' ? (
                  <>Un code de confirmation à 6 chiffres a été envoyé à <strong className="text-amber-300">{email || 'votre email'}</strong>. Veuillez le saisir ci-dessous pour activer votre compte.</>
                ) : (
                  <>تم إرسال رمز تأكيد مكوّن من 6 أرقام إلى بريدك <strong className="text-amber-300">{email || 'الإلكتروني'}</strong>. يرجى إدخال الرمز لتفعيل حسابك ومتابعة التسجيل.</>
                )}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block text-center">
                  {language === 'fr' ? 'Saisissez le code de confirmation :' : 'أدخل رمز التأكيد المرسل :'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (e.target.value) setOtpError(false);
                  }}
                  placeholder="1 2 3 4 5 6"
                  className="w-full text-center tracking-[0.4em] font-mono text-lg py-3 rounded-2xl bg-[#0A0F1D] border border-amber-500/40 text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
                {otpError && (
                  <p className="text-[11px] text-rose-400 text-center font-bold">
                    {language === 'fr' ? 'Veuillez saisir un code valide' : 'يرجى إدخال رمز تأكيد صحيح!'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'fr' ? 'Vérifier & Activer le compte' : 'تأكيد الرمز وتفعيل الحساب'}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsVerifyingEmail(false)}
                  className="text-slate-400 hover:text-slate-200 underline font-medium"
                >
                  {language === 'fr' ? '← Modifier l’email' : '← تغيير البريد'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResendSent(true);
                    setTimeout(() => setResendSent(false), 4000);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  {resendSent
                    ? (language === 'fr' ? 'Code réenvoyé !' : 'تم إعادة الإرسال!')
                    : (language === 'fr' ? 'Réenvoyer le code' : 'إعادة إرسال الرمز')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Quick Registration Fields (Username, Wilaya, Age) required by user */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800/90 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                {language === 'fr' ? 'Informations requises :' : 'المعلومات المطلوبة:'}
              </span>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'fr' ? "Nom d'utilisateur" : 'اسم المستخدم'}</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: Karim_23' : 'مثال: كريم_23'}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Genre / Gender Selection for Default Avatar */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'fr' ? 'Genre (Photo par défaut)' : 'الجنس (الصورة الافتراضية)'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      gender === 'male'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>👨</span>
                    <span>{language === 'fr' ? 'Homme' : 'رجل'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      gender === 'female'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>👩</span>
                    <span>{language === 'fr' ? 'Femme' : 'امرأة'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Wilaya */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'fr' ? 'Wilaya' : 'الولاية'}</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'fr' ? 'Âge' : 'السن'}</span>
                    </span>
                    <span className="text-[9px] font-bold text-amber-400/90">
                      {language === 'fr' ? '18+' : '18+'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={age || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAge(val);
                      if (val >= 18) {
                        setAgeError(false);
                      } else {
                        setAgeError(true);
                      }
                    }}
                    placeholder="18"
                    className={`w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border text-xs text-slate-100 focus:outline-none transition-colors ${
                      ageError || age < 18
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {(ageError || age < 18) && (
                    <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{language === 'fr' ? 'Vous devez avoir au moins 18 ans.' : 'يجب أن يكون عمرك 18 سنة على الأقل.'}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mandatory Terms of Service & Privacy Policy Acceptance Checkbox */}
            <div className="space-y-1.5 pt-1">
              <label className={`flex items-start space-x-2.5 rtl:space-x-reverse text-xs cursor-pointer select-none p-3 rounded-2xl border transition-all ${
                termsError
                  ? 'border-rose-500 bg-rose-500/10'
                  : acceptedTerms
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-slate-800 bg-[#0A0F1D] hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="mt-0.5 rounded accent-amber-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  {language === 'fr' ? (
                    <>
                      J'accepte expressément les{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-amber-400 font-bold underline hover:text-amber-300"
                      >
                        Conditions d'Utilisation
                      </button>{' '}
                      et la{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-amber-400 font-bold underline hover:text-amber-300"
                      >
                        Politique de Confidentialité
                      </button>{' '}
                      avant de commencer.
                    </>
                  ) : (
                    <>
                      أوافق صراحةً على{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-amber-400 font-bold underline hover:text-amber-300"
                      >
                        شروط الاستخدام
                      </button>{' '}
                      و{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-amber-400 font-bold underline hover:text-amber-300"
                      >
                        سياسة الخصوصية
                      </button>{' '}
                      للبدء في استخدام المنصة.
                    </>
                  )}
                </span>
              </label>

              {termsError && (
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-rose-400 text-[11px] font-semibold px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {language === 'fr'
                      ? 'Veuillez cocher l’acceptation des conditions d’utilisation pour continuer.'
                      : 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية أولاً للمتابعة!'}
                  </span>
                </div>
              )}
            </div>

            {/* Social Authentication Buttons */}
            <div className="space-y-2.5">
              {/* Gmail / Google button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-md transition-all active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>
                  {language === 'fr' ? 'Continuer avec Google (Gmail)' : 'المتابعة باستخدام Google (Gmail)'}
                </span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Facebook')}
                className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-md transition-all active:scale-[0.99]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>
                  {language === 'fr' ? 'Continuer avec Facebook' : 'المتابعة باستخدام فيسبوك'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800"></div>
              <span className="absolute px-3 bg-[#0F172A] text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                {language === 'fr' ? 'Ou par Email' : 'أو بالبريد الإلكتروني'}
              </span>
            </div>

            {/* Standard Email Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'fr' ? 'Adresse e-mail' : 'البريد الإلكتروني'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@mail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'fr' ? 'Mot de passe' : 'كلمة المرور'}</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 hover:brightness-110 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <span>{language === 'fr' ? "S'inscrire / Se connecter avec Email" : 'التسجيل / الدخول بالبريد الإلكتروني'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>

          </div>
        )}

      </div>

      {/* Terms & Privacy Policy Viewer Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col text-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-amber-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {language === 'fr' ? 'Conditions d’Utilisation & Confidentialité' : 'شروط الاستخدام وسياسة الخصوصية'}
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className="overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed pr-2 custom-scrollbar flex-1">
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  {language === 'fr' ? '1. Protection des données et vie privée' : '1. حماية البيانات والخصوصية'}
                </h4>
                <p>
                  {language === 'fr'
                    ? 'Toutes vos données personnelles restent strictement sécurisées et confidentielles. Vos coordonnées bancaires ou informations sensibles ne sont jamais partagées.'
                    : 'جميع بياناتك الشخصية تظل محمية ومحفوظة بسرية تامة. لا يتم مشاركة معلوماتك أو تفاصيلك الحساسة مع أي طرف ثالث.'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  {language === 'fr' ? '2. Respect et courtoisie' : '2. الاحترام والاحتشام في التعامل'}
                </h4>
                <p>
                  {language === 'fr'
                    ? 'Chaque membre s’engage à respecter la charte de bienséance et d’échanges respectueux. Tout comportement inapproprié, harcèlement ou spams entraîne la suspension immédiate du compte.'
                    : 'يلتزم كل عضو بالقواعد والأخلاق العامة في التعامل. أي سلوك غير لائق أو مضايقة أو إزعاج يؤدي مباشرة إلى حظر الحساب نهائياً.'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  {language === 'fr' ? '3. Sécurité des échanges' : '3. أمان المراسلات والرسائل'}
                </h4>
                <p>
                  {language === 'fr'
                    ? 'Les messageries privées bénéficient d’une protection stricte. Vous disposez de la possibilité de bloquer tout profil ou d’activer le blocage de tout nouveau compte créé par cet utilisateur.'
                    : 'تتميز المراسلات الخاصة بأمان عالٍ. تتوفر لك ميزة حظر أي حساب وكذلك خيار حظر أي حساب جديد يحاول نفس الشخص إنشاءه مستقبلاً.'}
                </p>
              </div>
            </div>

            {/* Accept Button inside terms modal */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setTermsError(false);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                {language === 'fr' ? 'J’accepte et je comprends' : 'أوافق وأفهم الشروط'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
