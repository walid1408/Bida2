import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Shield, UserX, FileText, CheckCircle2, Bell, MessageSquare, Trash2, AlertTriangle, ShieldAlert, Lock, X, KeyRound, Users, Check, UserPlus, UserCheck, LifeBuoy } from 'lucide-react';
import { Language, Theme, Profile } from '../types';
import { translations } from '../data/translations';

interface SettingsViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  blockedProfiles: Profile[];
  onUnblockProfile: (profileId: string) => void;
  onDeleteAccountPermanently?: () => void;
  onOpenAdminPanel?: () => void;
  isAppLockEnabled: boolean;
  appPinCode: string;
  onToggleAppLock: (enabled: boolean, newPin?: string) => void;
  onLockApp: () => void;
  onOpenFriendsModal: () => void;
  friendsCount: number;
  hideFriendsList?: boolean;
  onToggleHideFriendsList?: (hide: boolean) => void;
  onOpenContactUs?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  blockedProfiles,
  onUnblockProfile,
  onDeleteAccountPermanently,
  onOpenAdminPanel,
  isAppLockEnabled,
  appPinCode,
  onToggleAppLock,
  onLockApp,
  onOpenFriendsModal,
  friendsCount,
  hideFriendsList = false,
  onToggleHideFriendsList,
  onOpenContactUs
}) => {
  const t = translations[language];

  // Notification settings - defaults: messages enabled, friend acceptance & request disabled
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyFriendAccept, setNotifyFriendAccept] = useState(false);
  const [notifyFriendRequest, setNotifyFriendRequest] = useState(false);

  // App Lock PIN Edit Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState(appPinCode || '1234');
  const [pinSavedSuccess, setPinSavedSuccess] = useState(false);

  // Account Deletion Modals State
  // Step 0: closed, Step 1: First Delete Confirmation, Step 2: Secondary Verification Modal (رسالة أخرى للتحقق من الغلق نهائيا)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmCheckboxChecked, setConfirmCheckboxChecked] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-100 flex items-center space-x-2.5 rtl:space-x-reverse">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>{t.settingsTitle}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {language === 'fr' 
            ? 'Personnalisez votre expérience, gérez votre sécurité et vos notifications.'
            : 'خصص تجربتك، أدر أمانك وإشعاراتك.'}
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Appearance & Language Card */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">
            {t.theme} & {t.language}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Theme Control */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  {theme === 'light' ? t.lightMode : t.darkMode}
                </span>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] text-slate-200 border border-slate-800 hover:border-amber-500/30 transition-all shadow-sm"
              >
                {theme === 'light' ? t.darkMode : t.lightMode}
              </button>
            </div>

            {/* Language Control */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Globe className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">
                  {language === 'fr' ? 'Français (LTR)' : 'العربية (RTL)'}
                </span>
              </div>
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] text-slate-200 border border-slate-800 hover:border-amber-500/30 transition-all shadow-sm"
              >
                {language === 'fr' ? 'العربية' : 'Français'}
              </button>
            </div>

          </div>
        </div>

        {/* Application Password Protection Card (Protection d'application par mot de passe) */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-amber-400">
              <Lock className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {language === 'fr' ? 'Protection d\'application par mot de passe' : 'حماية التطبيق برمز سر (PIN)'}
              </h3>
            </div>
            {isAppLockEnabled && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                {language === 'fr' ? 'Actif' : 'مفعل'}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {language === 'fr' ? 'Verrouillage par code PIN' : 'تفعيل قفل التطبيق برمز PIN الحماية'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'fr'
                      ? 'Exiger un code PIN sécurisé à chaque ouverture de l’application.'
                      : 'طلب رمز سر مجدد عند دخول التطبيق لحماية الخصوصية.'}
                  </p>
                </div>
              </div>

              {/* Protection Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  if (isAppLockEnabled) {
                    onToggleAppLock(false);
                  } else {
                    setIsPinModalOpen(true);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  isAppLockEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    isAppLockEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Controls if Enabled */}
            {isAppLockEnabled && (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span>{language === 'fr' ? 'Code PIN actuel :' : 'رمز السر الحالي:'}</span>
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold tracking-widest">
                    ••••
                  </span>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    {language === 'fr' ? 'Modifier le code PIN' : 'تغيير رمز PIN'}
                  </button>

                  <button
                    type="button"
                    onClick={onLockApp}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Verrouiller maintenant' : 'قفل التطبيق الآن'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Friends List Card (قائمة الأصدقاء والخصوصية) */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-amber-400">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {language === 'fr' ? 'Qaima Al-Asdiqa (قائمة الأصدقاء والخصوصية)' : 'قائمة الأصدقاء والخصوصية'}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold">
              {friendsCount} {language === 'fr' ? 'amis' : 'أصدقاء'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'fr' ? 'Gérer votre liste d’amis' : 'إدارة واستعراض قائمة الأصدقاء'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                {language === 'fr'
                  ? 'Consultez le statut en ligne (point vert ou durée hors ligne) de vos amis.'
                  : 'تفقّد الأصدقاء المتصلين الآن (النقطة الخضراء) أو مدة التواجد السابق وحالتهم.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenFriendsModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-950/40 shrink-0 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'fr' ? 'Ouvrir la liste' : 'عرض قائمة الأصدقاء'}</span>
            </button>
          </div>

          {/* Hide Friends List Toggle Switch (إخفاء قائمة الأصدقاء عن الآخرين) */}
          <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">
                  {language === 'fr' ? 'Masquer ma liste d’amis' : 'إخفاء قائمة أصدقائي عن باقي المستخدمين'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'fr'
                    ? 'Empêcher les autres membres de voir vos أصدقاء lors de la visite de votre profil.'
                    : 'منع الأعضاء الآخرين من تصفّح قائمة أصدقائك عند دخول ملفك الشخصي.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleHideFriendsList && onToggleHideFriendsList(!hideFriendsList)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                hideFriendsList ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                  hideFriendsList ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Support & Contact Us Card (قسم اتصل بنا والشكاوى والدعم الفني) */}
        {onOpenContactUs && (
          <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-amber-500/30 space-y-4">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-amber-400">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {language === 'fr' ? 'Centre d\'Aide & Contact' : 'مركز اتصل بنا والدعم والشكاوى'}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {language === 'fr' ? 'Besoin d\'aide ou une réclamation ?' : 'هل لديك شكوى، استفسار أو مشكلة تقنية؟'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                    {language === 'fr'
                      ? 'Envoyez un message direct à notre équipe avec le type de votre demande (Réclamation, Bug, Compte, Suggestion).'
                      : 'أرسل طلبك مباشرة لإدارة المنصة واختر نوع الطلب (شكوى، خلل تقني، توثيق حساب، اقتراح).'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenContactUs}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>{language === 'fr' ? 'Ouvrir "Nous Contacter"' : 'فتح زر "اتصل بنا"'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications Card */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-amber-400">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              {language === 'fr' ? 'Paramètres de notification' : 'إعدادات الإشعارات'}
            </h3>
          </div>

          <div className="space-y-3">
            {/* 1. Notifications de messages */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {language === 'fr' ? 'Notifications de messages' : 'إشعارات الرسائل'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'fr' 
                      ? 'Alertes activées lors de la réception d’un nouveau message.'
                      : 'التنبيهات عند استلام رسالة جديدة.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNotifyMessages(!notifyMessages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifyMessages ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    notifyMessages ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 2. Acceptation d'amitié */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {language === 'fr' ? 'Acceptation d\'amitié' : 'قبول طلب الصداقة'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'fr' 
                      ? 'Alertes lorsqu’un utilisateur accepte votre demande d’amitié.'
                      : 'التنبيهات عند قبول شخص لطلب صداقتك.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNotifyFriendAccept(!notifyFriendAccept)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifyFriendAccept ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    notifyFriendAccept ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 3. Demande d'ajout */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {language === 'fr' ? 'Demande d\'ajout' : 'طلب إضافة صديق'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'fr' 
                      ? 'Alertes lors de la réception d’une nouvelle demande d’amitié.'
                      : 'التنبيهات عند استلام طلب إضافة صديق جديد.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNotifyFriendRequest(!notifyFriendRequest)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifyFriendRequest ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    notifyFriendRequest ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Blocked Users Card */}
        <div className="bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-amber-400">
            <UserX className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              {t.blockedUsers}
            </h3>
          </div>

          {blockedProfiles.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {blockedProfiles.map((profile) => (
                <div key={profile.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-800"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">
                        {profile.name}, {profile.age}
                      </h4>
                      <span className="text-[10px] text-slate-400">{profile.city}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onUnblockProfile(profile.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-colors"
                  >
                    {t.unblock}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">
              {t.noBlockedUsers}
            </p>
          )}
        </div>

        {/* Safety Tips Card */}
        <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-amber-400">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              {t.safetyTipsTitle}
            </h3>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start space-x-2.5 rtl:space-x-reverse">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.safetyTip1}</span>
            </li>
            <li className="flex items-start space-x-2.5 rtl:space-x-reverse">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.safetyTip2}</span>
            </li>
            <li className="flex items-start space-x-2.5 rtl:space-x-reverse">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.safetyTip3}</span>
            </li>
          </ul>
        </div>

        {/* Danger Zone: Permanent Account Deletion Card */}
        <div className="bg-gradient-to-br from-rose-950/40 via-[#0F172A] to-[#0F172A] rounded-3xl p-6 border border-rose-900/50 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              {language === 'fr' ? 'Zone de Danger - Suppression de Compte' : 'منطقة الحذر - غلق الحساب نهائياً'}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0A0F1D] border border-rose-950/80">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'fr' ? 'Gérer ou غلق الحساب نهائياً' : 'ميزة غلق وحذف الحساب نهائياً'}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                {language === 'fr'
                  ? 'Fermez définitivement votre profil. Toutes vos données, photos, messages et matchs seront immédiatement et définitivement effacés.'
                  : 'غلق حسابك نهائياً وتصفية كامل ملفك الشخصي. سيتم محو الصور والمحادثات والإعجابات بشكل نهائي وغير قابل للاسترجاع.'}
              </p>
            </div>

            <button
              onClick={() => {
                setDeleteStep(1);
                setConfirmCheckboxChecked(false);
                setDeleteError(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/40 transition-all shrink-0 flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'fr' ? 'Fermer le compte نهائياً' : 'غلق الحساب نهائياً'}</span>
            </button>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse text-xs text-slate-500 pt-4">
          <button className="hover:underline flex items-center space-x-1 rtl:space-x-reverse hover:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
            <span>{t.privacyPolicy}</span>
          </button>
          <span>•</span>
          <button className="hover:underline flex items-center space-x-1 rtl:space-x-reverse hover:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
            <span>{t.termsOfService}</span>
          </button>
        </div>

      </div>

      {/* STEP 1: First Delete Confirmation Dialog */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
            <button
              onClick={() => setDeleteStep(0)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-slate-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400 pt-1">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  {language === 'fr' ? 'Avertissement de fermeture' : 'تنبيه غلق الحساب (الخطوة 1 من 2)'}
                </h3>
                <p className="text-[11px] text-rose-400">
                  {language === 'fr' ? 'Action majeure irrreversible' : 'إجراء حساس وغير قابل للتراجع'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-100">
                {language === 'fr'
                  ? 'Si vous décidez de fermer votre compte نهائياً :'
                  : 'عند غلق الحساب نهائياً، سيحدث ما يلي:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>{language === 'fr' ? 'Suppression définitive de votre profil et photos.' : 'حذف وإلغاء ملفك الشخصي وصورك نهائياً.'}</li>
                <li>{language === 'fr' ? 'Effacement irréversible de tous vos messages et discussions.' : 'تطهير وحذف جميع المحادثات والرسائل.'}</li>
                <li>{language === 'fr' ? 'Perte complète des matchs et listes d’amis.' : 'إلغاء قائمة الأصدقاء والإعجابات المتبادلة.'}</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2">
              <button
                type="button"
                onClick={() => setDeleteStep(0)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                {language === 'fr' ? 'Annuler' : 'إلغاء والتراجع'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep(2)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <span>{language === 'fr' ? 'Continuer vers la vérification finale' : 'المتابعة للتحقق النهائي ←'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Secondary Verification Modal (رسالة أخرى للتحقق من الغلق نهائيا) */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0F172A] border-2 border-rose-600/60 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
            
            <button
              onClick={() => setDeleteStep(0)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-slate-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Message another verification as explicitly requested */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-rose-400">
                {language === 'fr'
                  ? 'Vérification Finale de Fermeture Définitive'
                  : 'رسالة التحقق الأخيرة - التأكيد النهائي لغلق الحساب'}
              </h3>
              <p className="text-xs text-slate-300 px-2 leading-relaxed font-medium">
                {language === 'fr'
                  ? 'Ceci est la deuxième confirmation de sécurité obligatoire avant le verrouillage définitif.'
                  : 'هذه رسالة التحقق الثانية والأخيرة للتأكد التام من رغبتك في غلق وتطهير الحساب نهائياً.'}
              </p>
            </div>

            {/* Mandatory Checkbox for secondary confirmation */}
            <div className="space-y-2">
              <label className={`flex items-start space-x-3 rtl:space-x-reverse p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                deleteError
                  ? 'border-rose-500 bg-rose-500/10'
                  : confirmCheckboxChecked
                  ? 'border-rose-500/80 bg-rose-500/15'
                  : 'border-slate-800 bg-[#0A0F1D] hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={confirmCheckboxChecked}
                  onChange={(e) => {
                    setConfirmCheckboxChecked(e.target.checked);
                    if (e.target.checked) setDeleteError(false);
                  }}
                  className="mt-0.5 rounded accent-rose-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-relaxed font-medium">
                  {language === 'fr'
                    ? 'Je confirme expressément et définitivement la fermeture de mon compte. Je comprends que mes données seront totalement effacées.'
                    : 'أؤكد صراحةً وبشكل نهائي غلق وحذف حسابي. وأعلم أن كافة بياناتي ستُمحى تماماً ولا يمكنني استرجاعها بأي شكل.'}
                </span>
              </label>

              {deleteError && (
                <p className="text-[11px] text-rose-400 font-bold px-1 text-center">
                  {language === 'fr'
                    ? 'Veuillez cocher la case de confirmation finale pour valider le verrouillage.'
                    : 'يرجى تفعيل خيار التأكيد أعلاه أولاً لإكمال غلق الحساب نهائياً!'}
                </p>
              )}
            </div>

            {/* Final Irreversible Execution Button */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!confirmCheckboxChecked) {
                    setDeleteError(true);
                    return;
                  }
                  setDeleteStep(0);
                  if (onDeleteAccountPermanently) {
                    onDeleteAccountPermanently();
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-950/70 flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {language === 'fr'
                    ? 'Fermer & Supprimer le Compte Définitivement'
                    : 'تأكيد غلق الحساب نهائياً وتطهير البيانات الآن'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteStep(0)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors"
              >
                {language === 'fr' ? 'Annuler et conserver mon compte' : 'إلغاء والاحتفاظ بحسابي'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PIN Change/Setup Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-slate-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 rtl:space-x-reverse text-amber-400 pt-1">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  {language === 'fr' ? 'Mot de passe d\'application' : 'رمز السر لحماية التطبيق (PIN)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Saisissez de 4 à 6 chiffres' : 'أدخل من 4 إلى 6 أرقام سرية'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="block text-xs font-semibold text-slate-300">
                {language === 'fr' ? 'Nouveau code PIN :' : 'رمز السر الجديد:'}
              </label>
              <input
                type="password"
                maxLength={6}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full text-center tracking-widest text-xl font-mono py-3 rounded-2xl bg-[#0A0F1D] border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {pinSavedSuccess && (
              <p className="text-xs font-bold text-emerald-400 text-center flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                <span>{language === 'fr' ? 'Code PIN enregistré avec succès !' : 'تم حفظ رمز PIN وتفعيل الحماية بنجاح!'}</span>
              </p>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                {language === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
              <button
                type="button"
                disabled={inputPin.length < 4}
                onClick={() => {
                  onToggleAppLock(true, inputPin);
                  setPinSavedSuccess(true);
                  setTimeout(() => {
                    setPinSavedSuccess(false);
                    setIsPinModalOpen(false);
                  }, 800);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all"
              >
                {language === 'fr' ? 'Enregistrer' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
