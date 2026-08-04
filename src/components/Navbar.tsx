import React, { useRef } from 'react';
import { Heart, Sparkles, MessageSquare, User, Settings, Sun, Moon, Globe, LogIn, Shield, Users, Lock, LifeBuoy } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { BidayaLogo } from './BidayaLogo';

interface NavbarProps {
  activeTab: 'discovery' | 'messages' | 'profile' | 'settings';
  setActiveTab: (tab: 'discovery' | 'messages' | 'profile' | 'settings') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  unreadMessagesCount: number;
  pendingRequestsCount?: number;
  friendsCount?: number;
  onOpenFriendsModal?: () => void;
  isAppLockEnabled?: boolean;
  onLockApp?: () => void;
  onOpenAuthModal: () => void;
  onOpenAdminPanel?: () => void;
  onOpenContactUs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  theme,
  setTheme,
  unreadMessagesCount,
  pendingRequestsCount = 0,
  friendsCount = 0,
  onOpenFriendsModal,
  isAppLockEnabled = false,
  onLockApp,
  onOpenAuthModal,
  onOpenAdminPanel,
  onOpenContactUs
}) => {
  const t = translations[language];

  // Secret admin trigger tracking (7 rapid taps on logo)
  const logoTapCountRef = useRef(0);
  const lastLogoTapRef = useRef(0);

  const handleLogoTapSecret = () => {
    setActiveTab('discovery');
    if (onOpenAdminPanel) {
      const now = Date.now();
      if (now - lastLogoTapRef.current < 1200) {
        logoTapCountRef.current += 1;
      } else {
        logoTapCountRef.current = 1;
      }
      lastLogoTapRef.current = now;

      if (logoTapCountRef.current >= 7) {
        logoTapCountRef.current = 0;
        onOpenAdminPanel();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0F172A]/95 border-b border-slate-800 transition-colors duration-200">
      
      {/* Top Strip Bar (الشريط العلوي الخاص بشعار واسم التطبيق - الشعار في الوسط) */}
      <div className="bg-[#070B14] border-b border-amber-500/20 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          
          {/* Logo & Brand Name in Top Bar (Centered, Click 7 times to trigger Admin Panel) */}
          <div
            onClick={handleLogoTapSecret}
            title={t.appName}
            className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse cursor-pointer group select-none active:scale-95 transition-transform"
          >
            <BidayaLogo size="sm" showText={true} showArabic={true} />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline border-r rtl:border-r-0 rtl:border-l border-slate-700 px-2.5">
              {language === 'fr' ? 'Plateforme Algérienne de Mariage' : 'منصة التعارف والزواج في الجزائر'}
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Main Logo & Brand (Also triggers 7-tap admin unlock) */}
          <div 
            onClick={handleLogoTapSecret}
            title={t.appName}
            className="flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer group select-none active:scale-95 transition-transform"
          >
            <BidayaLogo size="md" showText={true} showArabic={true} />
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse bg-[#0A0F1D]/70 p-1.5 rounded-full border border-slate-800">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === 'discovery'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.navDiscovery}</span>
            </button>

            {/* Friends & Requests Button (right before Messages) */}
            {onOpenFriendsModal && (
              <button
                onClick={onOpenFriendsModal}
                className="relative flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                title={language === 'fr' ? 'Liste d\'amis & Demandes' : 'قائمة الأصدقاء والطلبات'}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>{language === 'fr' ? 'Amis & Demandes' : 'الأصدقاء والطلبات'}</span>
                {pendingRequestsCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                    {pendingRequestsCount}
                  </span>
                ) : friendsCount > 0 ? (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-800 text-amber-400 rounded-full border border-slate-700">
                    {friendsCount}
                  </span>
                ) : null}
              </button>
            )}

            <button
              onClick={() => setActiveTab('messages')}
              className={`relative flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{t.navMessages}</span>
              {unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Controls (Language, Theme, Friends, Profile Quick Access) */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            
            {/* Friends List Button (قائمة الأصدقاء) */}
            {onOpenFriendsModal && (
              <button
                onClick={onOpenFriendsModal}
                className="relative flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-full text-xs font-bold bg-[#0A0F1D] text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors shadow-sm"
                title={language === 'fr' ? 'Qaima Al-Asdiqa (Liste d\'amis)' : 'قائمة الأصدقاء المعارف'}
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Amis' : 'الأصدقاء'}</span>
                {pendingRequestsCount > 0 ? (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                    {pendingRequestsCount}
                  </span>
                ) : friendsCount > 0 ? (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                    {friendsCount}
                  </span>
                ) : null}
              </button>
            )}

            {/* Quick Lock Button if App Protection is ON */}
            {isAppLockEnabled && onLockApp && (
              <button
                onClick={onLockApp}
                className="p-2 rounded-full text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-sm"
                title={language === 'fr' ? 'Verrouiller l\'application' : 'قفل التطبيق الآن برمز PIN'}
              >
                <Lock className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Login / Register Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Connexion' : 'دخول'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 hover:border-amber-500/50 border border-slate-700 transition-colors"
              title="Changer de langue / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">{language === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full text-slate-300 bg-slate-800 hover:border-amber-500/50 border border-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-1 rounded-full border transition-all ${
                activeTab === 'profile'
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-slate-700 hover:border-amber-400'
              }`}
              title={t.navProfile}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-slate-950 font-bold text-xs">
                <User className="w-4 h-4 text-[#0A0F1D]" />
              </div>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors ${
                activeTab === 'settings' ? 'text-amber-400' : ''
              }`}
              title={t.navSettings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 py-2.5 px-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'discovery' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[11px]">{t.navDiscovery}</span>
          </button>

          {/* Amis & Demandes Button */}
          {onOpenFriendsModal && (
            <button
              onClick={onOpenFriendsModal}
              className="relative flex flex-col items-center space-y-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-[11px]">{language === 'fr' ? 'Amis' : 'الأصدقاء'}</span>
              {pendingRequestsCount > 0 ? (
                <span className="absolute -top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {pendingRequestsCount}
                </span>
              ) : friendsCount > 0 ? (
                <span className="absolute -top-1 right-1 px-1.5 py-0.2 text-[9px] font-bold bg-slate-800 text-amber-400 border border-slate-700 rounded-full">
                  {friendsCount}
                </span>
              ) : null}
            </button>
          )}

          <button
            onClick={() => setActiveTab('messages')}
            className={`relative flex flex-col items-center space-y-1 ${
              activeTab === 'messages' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[11px]">{t.navMessages}</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px]">{t.navProfile}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'settings' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px]">{t.navSettings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
