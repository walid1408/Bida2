import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Users, 
  Plus, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  PhoneCall, 
  Settings, 
  UserCheck, 
  RefreshCw, 
  Zap, 
  Send, 
  Edit3, 
  Globe, 
  Search,
  Check,
  Lock,
  Eye,
  Sliders,
  ShieldAlert,
  Ban,
  UserX,
  FileText,
  Bell,
  CheckSquare,
  Navigation,
  Compass,
  MapPin,
  LifeBuoy,
  UserCheck as UserSwitch
} from 'lucide-react';
import { Profile, Language, Message, UserProfile } from '../types';
import { ALGERIAN_WILAYAS } from '../data/translations';
import { WILAYA_COORDINATES, getCalculatedDistance } from '../utils/geo';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  profiles: Profile[];
  messages: Message[];
  onAddProfile: (newProfile: Profile) => void;
  onUpdateProfile: (updatedProfile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onBanToggleProfile: (profileId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onClearConversation: (profileId: string) => void;
  totalMessagesCount: number;
  onSendMessageFromMock: (senderId: string, receiverId: string, text: string) => void;
  voiceUnlockCount: number;
  setVoiceUnlockCount: (count: number) => void;
  requireEmailVerification: boolean;
  setRequireEmailVerification: (req: boolean) => void;
  userProfile?: UserProfile;
  userLat?: number;
  userLng?: number;
  userCity?: string;
  isGpsActive?: boolean;
  onEnableGps?: () => void;
  onImpersonateSwitch?: (profile: Profile) => void;
}

const SAMPLE_FEMALE_NAMES = ['Amina', 'Sara', 'Manel', 'Khadidja', 'Imene', 'Siham', 'Meriem', 'Farah', 'Ines', 'Rania', 'Chaima', 'Lamia'];
const SAMPLE_MALE_NAMES = ['Sofiane', 'Billel', 'Mehdi', 'Yacine', 'Adel', 'Walid', 'Hamza', 'Khaled', 'Oussama', 'Reda', 'Fouad', 'Farid'];

const SAMPLE_PROFESSIONS_FR = ['Architecte', 'Médecin', 'Ingénieur Informatique', 'Enseignante', 'Pharmacien', 'Comptable', 'Designer UX', 'Entrepreneur', 'Avocat'];
const SAMPLE_PROFESSIONS_AR = ['مهندس إعلام آلي', 'طبيبة أسنان', 'أستاذ جامعي', 'صيدلانية', 'مهندس معماري', 'محاسب قانوني', 'مصممة ديكور', 'رائد أعمال'];

const SAMPLE_BIOS_AR = [
  'شخصية هادئة ومثقفة، أحب السفر ومطالعة الكتب، أبحث عن شريك حياة محترم وصادق لبناء أسرة سعيدة.',
  'ابن عائلة محترمة، مهتم بالتكنولوجيا والرياضة، أقدر الصدق والوضوح في العلاقات.',
  'إنسانية طموحة ومحبة للحياة والتطوع، أبحث عن التفاهم والاحترام المتبادل لبناء مستقبلي.',
  'عصامي وطموح، أحب الطبيعة والرحلات البحرية، أبحث عن شريكة حياة مخلصة ومتفهمة.'
];

const SAMPLE_FEMALE_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
];

const SAMPLE_MALE_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  language,
  profiles,
  messages,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onBanToggleProfile,
  onDeleteMessage,
  onClearConversation,
  totalMessagesCount,
  onSendMessageFromMock,
  voiceUnlockCount,
  setVoiceUnlockCount,
  requireEmailVerification,
  setRequireEmailVerification,
  userProfile,
  userLat,
  userLng,
  userCity = 'Alger',
  isGpsActive = false,
  onEnableGps,
  onImpersonateSwitch
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'chats' | 'security' | 'profiles' | 'create' | 'impersonate' | 'tickets'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<string>('p1');
  const [chatSearchKeyword, setChatSearchKeyword] = useState('');

  // Contact Tickets state
  const [ticketsList, setTicketsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('mawada_contact_tickets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'TKT-108492',
          type: 'complaint',
          typeName: 'شكوى / بلاغ رسمي',
          senderName: 'Karim',
          contactInfo: '0550123456',
          subject: 'إبلاغ عن حساب مزيف يستخدم صور غير حقيقية',
          message: 'أرجو مراجعة الحساب المسمى "Yasser"، يعطي معلومات مغلوطة ويطلب تحويلات مالية.',
          createdAt: '03 أغسطس 2026، 11:45',
          status: 'pending'
        }
      ];
    } catch (e) { return []; }
  });

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(25);
  const [newGender, setNewGender] = useState<'female' | 'male'>('female');
  const [newCity, setNewCity] = useState('Alger');
  const [newProfession, setNewProfession] = useState('Architecte');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [newVerified, setNewVerified] = useState(true);

  // Quick Impersonate Chat State
  const [impersonateSenderId, setImpersonateSenderId] = useState<string>(profiles[0]?.id || 'p1');
  const [impersonateText, setImpersonateText] = useState('');
  const [impersonateSuccessMsg, setImpersonateSuccessMsg] = useState('');

  // System Warning Broadcast State
  const [adminBroadcastText, setAdminBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'selected' | 'all'>('selected');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Admin Password Protection State (Default: ReTa$4N44512?)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [adminPinError, setAdminPinError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminPasswordSetting, setAdminPasswordSetting] = useState<string>(
    () => localStorage.getItem('mawada_admin_password') || 'ReTa$4N44512?'
  );
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);

  // Lockout countdown timer for anti-brute-force protection
  React.useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  if (!isOpen) return null;

  // Render Admin PIN Verification Modal if not authenticated yet
  if (!isAdminAuthenticated) {
    const handleAdminUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      if (lockoutTime > 0 || isAuthenticating) return;

      setIsAuthenticating(true);

      // Artificial security delay against high-speed automated brute force attacks
      await new Promise((res) => setTimeout(res, 500));

      const storedPassword = localStorage.getItem('mawada_admin_password') || 'ReTa$4N44512?';
      
      if (adminPinInput === storedPassword) {
        setIsAdminAuthenticated(true);
        setAdminPinError(false);
        setAdminPinInput('');
        setFailedAttempts(0);
        setLockoutTime(0);
      } else {
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);
        setAdminPinError(true);
        if (newCount >= 3) {
          // Lockout for 60 seconds after 3 failed attempts to defeat brute-force scripts
          setLockoutTime(60);
          setFailedAttempts(0);
        }
      }
      setIsAuthenticating(false);
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
        <div className="relative w-full max-w-xs bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleAdminUnlock} className="space-y-3 pt-2">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={adminPinInput}
                disabled={lockoutTime > 0 || isAuthenticating}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setAdminPinError(false);
                }}
                placeholder={language === 'fr' ? 'Mot de passe' : 'كلمة المرور'}
                autoFocus
                className="w-full text-center text-sm font-mono py-3 px-10 rounded-2xl bg-[#0A0F1D] border border-slate-700 text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {lockoutTime > 0 && (
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold animate-pulse">
                <span>
                  {language === 'fr'
                    ? `Réessayez dans ${lockoutTime}s`
                    : `حاول بعد ${lockoutTime} ثانية`}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={adminPinInput.trim().length === 0 || lockoutTime > 0 || isAuthenticating}
              className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-lg shadow-amber-950/40 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>OK</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handle Quick Auto-Generate Profile
  const handleGenerateRandomProfile = () => {
    const isFemale = Math.random() > 0.5;
    const gender = isFemale ? 'female' : 'male';
    const namesList = isFemale ? SAMPLE_FEMALE_NAMES : SAMPLE_MALE_NAMES;

    const randomName = namesList[Math.floor(Math.random() * namesList.length)];
    const randomAge = Math.floor(Math.random() * 12) + 22;
    const randomCity = ALGERIAN_WILAYAS[Math.floor(Math.random() * ALGERIAN_WILAYAS.length)];
    const randomProfession = language === 'fr'
      ? SAMPLE_PROFESSIONS_FR[Math.floor(Math.random() * SAMPLE_PROFESSIONS_FR.length)]
      : SAMPLE_PROFESSIONS_AR[Math.floor(Math.random() * SAMPLE_PROFESSIONS_AR.length)];
    const randomBio = SAMPLE_BIOS_AR[Math.floor(Math.random() * SAMPLE_BIOS_AR.length)];
    const coords = WILAYA_COORDINATES[randomCity] || { lat: 36.7538, lng: 3.0588 };

    const createdProfile: Profile = {
      id: 'p_mock_' + Date.now() + Math.random().toString().slice(2, 5),
      name: randomName,
      age: randomAge,
      gender,
      city: randomCity,
      lat: coords.lat,
      lng: coords.lng,
      profession: randomProfession,
      bio: randomBio,
      photos: [], // Strictly no photos, only names & info as requested
      interests: ['Voyage / أسفار', 'Café & Discuter / قهوة وحوار'],
      isVerified: true,
      distanceKm: Math.floor(Math.random() * 25) + 2,
      lookingFor: 'Mariage / Khetba',
      likesYou: true
    };

    onAddProfile(createdProfile);
  };

  // Handle Submit Custom Profile Form
  const handleCreateCustomProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const coords = WILAYA_COORDINATES[newCity] || { lat: 36.7538, lng: 3.0588 };

    const createdProfile: Profile = {
      id: 'p_custom_' + Date.now(),
      name: newName,
      age: Number(newAge),
      gender: newGender,
      city: newCity,
      lat: coords.lat,
      lng: coords.lng,
      profession: newProfession || 'Professionel',
      bio: newBio || 'مرحباً بكم في بروفايلي بـ مودة.',
      photos: [], // Strictly no photos
      interests: ['Voyage / أسفار', 'Café & Discuter / قهوة وحوار'],
      isVerified: newVerified,
      distanceKm: Math.floor(Math.random() * 15) + 3,
      lookingFor: 'Relation sérieuse / Mariage',
      likesYou: true
    };

    onAddProfile(createdProfile);
    setNewName('');
    setNewBio('');
    setNewPhoto('');
    setActiveTab('profiles');
  };

  // Handle Impersonate Send
  const handleSendAsMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateText || !impersonateSenderId) return;

    onSendMessageFromMock(impersonateSenderId, 'user', impersonateText);
    setImpersonateText('');
    setImpersonateSuccessMsg(language === 'fr' ? 'Message envoyé !' : 'تم إرسال الرسالة إلى الحساب الرئيسي بنجاح !');
    setTimeout(() => setImpersonateSuccessMsg(''), 3500);
  };

  // Send System Admin Intervention Warning
  const handleSendAdminBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBroadcastText) return;

    const formattedText = `⚠️ [تنبيه من إدارة التطبيق - Mawada Guard]:\n${adminBroadcastText}`;

    if (broadcastTarget === 'all') {
      profiles.forEach((p) => {
        onSendMessageFromMock(p.id, 'user', formattedText);
      });
      setBroadcastSuccess(language === 'fr' ? 'Avertissement envoyé à tous les fils !' : 'تم إرسال التنبيه الإداري لجميع الحسابات بنجاح !');
    } else {
      onSendMessageFromMock(selectedChatPartnerId, 'user', formattedText);
      setBroadcastSuccess(language === 'fr' ? 'Avertissement envoyé dans cette conversation !' : 'تم إرسال التنبيه الإداري في هذه المحادثة !');
    }

    setAdminBroadcastText('');
    setTimeout(() => setBroadcastSuccess(''), 3500);
  };

  const filteredProfiles = profiles.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered messages for the selected chat partner
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === selectedChatPartnerId && m.receiverId === 'user') ||
      (m.senderId === 'user' && m.receiverId === selectedChatPartnerId)
  ).filter((m) =>
    !chatSearchKeyword || m.text.toLowerCase().includes(chatSearchKeyword.toLowerCase())
  );

  const bannedProfilesCount = profiles.filter((p) => p.isBanned).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fadeIn">
      <div className="bg-[#0F172A] border border-amber-500/40 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Admin Navigation Tabs (Only options bar at top + Close Button) */}
        <div className="bg-[#0A0F1D] border-b border-slate-800 px-3 sm:px-4 pt-2.5 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{language === 'fr' ? 'Statistiques' : 'النظرة العامة'}</span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'chats'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{language === 'fr' ? 'MRAQABA CHATS' : 'مراقبة المحادثات'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'security'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{language === 'fr' ? 'HERASSA' : 'حراسة الحسابات والحظر'}</span>
              {bannedProfilesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px]">
                  {bannedProfilesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'profiles'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'fr' ? 'Hôtes & Comptes' : 'إدارة الحسابات'} ({profiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('impersonate')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'impersonate'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-4 h-4 text-blue-400" />
              <span>{language === 'fr' ? 'Répondre aux Clients' : 'الرد المباشر'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'tickets'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{language === 'fr' ? 'Réclamations' : 'الشكاوى والطلبات'}</span>
              {ticketsList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                  {ticketsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'create'
                  ? 'bg-[#0F172A] text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Créer Un Compte' : 'إضافة حساب'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* STATS OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <p className="text-xs text-amber-400 font-bold">
                    {language === 'fr' ? 'Comptes Enregistrés' : 'إجمالي الحسابات المسجلة'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                    {profiles.length}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <p className="text-xs text-emerald-400 font-bold">
                    {language === 'fr' ? 'Comptes Vérifiés (Badge)' : 'الحسابات الموثقة'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                    {profiles.filter((p) => p.isVerified).length}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                  <p className="text-xs text-blue-400 font-bold">
                    {language === 'fr' ? 'Messages Échangés' : 'إجمالي الرسائل في المحادثات'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                    {totalMessagesCount}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-1">
                  <p className="text-xs text-rose-400 font-bold">
                    {language === 'fr' ? 'الحسابات المحظورة (Banned)' : 'الحسابات المحظورة'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                    {bannedProfilesCount}
                  </p>
                </div>
              </div>

              {/* USER GEOLOCATION TRACKER CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0A0F1D] to-slate-900 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Navigation className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        <span>{language === 'fr' ? 'Géolocalisation & Suivi de l\'Utilisateur' : 'تتبع موقع المستخدم الجغرافي والـ GPS'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">LIVE LOCATION</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {language === 'fr'
                          ? 'Affiche la position GPS détectée de l\'utilisateur et sa distance avec tous les profils.'
                          : 'يُظهر موقع المستخدم الحالي بدقة، خط العرض والطول، والمسافة المحسوبة بـ كم مع باقي الحسابات'}
                      </p>
                    </div>
                  </div>
                  {onEnableGps && (
                    <button
                      type="button"
                      onClick={onEnableGps}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{isGpsActive ? (language === 'fr' ? 'GPS Actif (Actualiser)' : 'موقع GPS مباشر مفعّل') : (language === 'fr' ? 'Activer GPS' : 'تحديث الموقع الجغرافي')}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium block">{language === 'fr' ? 'Utilisateur Actif' : 'المستخدم الحالي'}</span>
                    <span className="font-bold text-amber-400 text-sm block">{userProfile?.name || 'Walid'} ({userProfile?.city || userCity || 'Alger'})</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium block">{language === 'fr' ? 'Coordonnées GPS (Lat, Lon)' : 'إحداثيات الموقع (عرض, طول)'}</span>
                    <span className="font-mono font-bold text-slate-100 text-xs block">
                      {userLat ? `${userLat.toFixed(5)}, ${userLng?.toFixed(5)}` : '36.7538, 3.0588 (مركز الجزائر)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium block">{language === 'fr' ? 'Statut Géolocalisation' : 'حالة الجغرافيا'}</span>
                    <span className={`font-bold text-xs block ${isGpsActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isGpsActive ? '📍 GPS مفعّل (دقة عالية)' : '📍 إحداثيات ولاية الجزائر'}
                    </span>
                  </div>
                </div>

                {/* Direct Google Maps link button */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 flex-wrap gap-2">
                  <span className="text-slate-400">
                    {language === 'fr' ? 'Voir la position sur la carte Google Maps :' : 'عرض موقع المستخدم الدقيق على الخريطة :'}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${userLat || 36.7538},${userLng || 3.0588}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Google Maps 🗺️</span>
                  </a>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-5 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{language === 'fr' ? 'Boost Rapide & Animation du Réseau' : 'التوليد السريع للحسابات (دعم النشاط الفوري)'}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'fr'
                    ? 'Ajoutez des profils algériens réalistes en un seul clic pour donner de la vitalité à votre plateforme.'
                    : 'يمكنك إضافة حسابات جزائرية حقيقية وتفاعلية بضغطة زر واحدة لتنشيط التطبيق وزيادة تفاعل المستخدمين.'}
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={handleGenerateRandomProfile}
                    className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'fr' ? '+ Générer 1 Profil Algérien' : '⚡ إنشاء حساب جزائري تلقائي فوراً'}</span>
                  </button>

                  <button
                    onClick={() => {
                      for (let i = 0; i < 3; i++) handleGenerateRandomProfile();
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{language === 'fr' ? '+ Générer 3 Profils d\'un coup' : '⚡ إنشاء 3 حسابات دفعة واحدة'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CHAT MONITOR TAB (مراقبة محادثات الجميع والتحكم بها) */}
          {activeTab === 'chats' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Eye className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {language === 'fr' ? 'Centre de Surveillance des Conversations en Direct' : 'مركز مراقبة المحادثات المباشرة والتحكم الكامل بها'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {language === 'fr'
                        ? 'Consultez tous les messages échangés, supprimez les contenus inappropriés ou envoyez des avertissements.'
                        : 'يمكنك قراءة جميع الرسائل المتبادلة بين الحسابات والمستخدم، حذف الرسائل المخالفة، أو إرسال تنبيه إداري.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onClearConversation(selectedChatPartnerId)}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Effacer cette conversation' : 'حذف كل هذه المحادثة'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Inspector Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Select Conversation Thread */}
                <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    {language === 'fr' ? 'Sélectionner la conversation :' : 'اختر طرف المحادثة للمراقبة :'}
                  </label>
                  <select
                    value={selectedChatPartnerId}
                    onChange={(e) => setSelectedChatPartnerId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0F172A] border border-amber-500/40 text-xs text-amber-400 font-bold focus:outline-none"
                  >
                    {profiles.map((p) => {
                      const count = messages.filter(
                        (m) =>
                          (m.senderId === p.id && m.receiverId === 'user') ||
                          (m.senderId === 'user' && m.receiverId === p.id)
                      ).length;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city}) - {count} msgs
                        </option>
                      );
                    })}
                  </select>

                  <div className="pt-1">
                    <input
                      type="text"
                      value={chatSearchKeyword}
                      onChange={(e) => setChatSearchKeyword(e.target.value)}
                      placeholder={language === 'fr' ? 'Filtrer par كلمة في الرسائل...' : 'البحث عن كلمة في الرسائل (التحقق من المخالفات)...'}
                      className="w-full py-2 px-3 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Message History Inspection Box */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3 flex flex-col h-[320px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>
                        {language === 'fr' ? 'Séquence des Messages' : 'سجل المحادثة الحي بين الحساب والمستخدم'}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {conversationMessages.length} {language === 'fr' ? 'messages enregistrés' : 'رسالة مسجلة'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {conversationMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        {language === 'fr' ? 'Aucun message dans ce fil de conversation.' : 'لا توجد رسائل مسجلة في هذه المحادثة حتى الآن.'}
                      </div>
                    ) : (
                      conversationMessages.map((msg) => {
                        const isFromUser = msg.senderId === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl text-xs flex items-start justify-between gap-3 border ${
                              isFromUser
                                ? 'bg-amber-500/10 border-amber-500/30 text-slate-100 ml-4 rtl:mr-4 rtl:ml-0'
                                : 'bg-slate-800/80 border-slate-700 text-slate-200 mr-4 rtl:ml-4 rtl:mr-0'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-[11px] ${isFromUser ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {isFromUser ? (language === 'fr' ? 'Utilisateur Principal (User)' : 'المستخدم الرئيسي') : profiles.find(p => p.id === msg.senderId)?.name || 'Hôte'}
                                </span>
                                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                              </div>
                              <p className="break-words text-xs leading-relaxed">{msg.text}</p>
                            </div>

                            <button
                              onClick={() => onDeleteMessage(msg.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                              title={language === 'fr' ? 'Supprimer ce message' : 'حذف هذه الرسالة'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Admin Intervention / Broadcast Form */}
              <form onSubmit={handleSendAdminBroadcast} className="p-4 rounded-2xl bg-[#0A0F1D] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{language === 'fr' ? 'إرسال تنبيه إداري مباشر في المحادثة (Admin Intervention)' : 'إرسال تحذير أو تنبيه إداري رسمي إلى المحادثة'}</span>
                  </label>

                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as 'selected' | 'all')}
                    className="py-1 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="selected">{language === 'fr' ? 'À cette conversation uniquement' : 'لهذه المحادثة فقط'}</option>
                    <option value="all">{language === 'fr' ? 'Avertissement global (Tous)' : 'تنبيه شامل لجميع المحادثات'}</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={adminBroadcastText}
                    onChange={(e) => setAdminBroadcastText(e.target.value)}
                    placeholder={language === 'fr' ? 'Ex: Veuillez respecter les conditions d\'utilisation du service Mawada...' : 'مثال: يُرجى الالتزام بشروط الاستخدام والاحترام المتبادل في محادثات مودة...'}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Envoyer' : 'إرسال التنبيه'}</span>
                  </button>
                </div>

                {broadcastSuccess && (
                  <p className="text-xs font-bold text-emerald-400 animate-pulse">
                    ✓ {broadcastSuccess}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* SECURITY & GUARD TAB (حراسة الحسابات والحظر والأمان) */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 rtl:space-x-reverse">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {language === 'fr' ? 'Centre de Guard & Protection des Comptes' : 'مركز حراسة الحسابات وحمايتها من الانتهاكات'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'fr'
                      ? 'Gérez la suspension des comptes, le blocage des profils suspects et les règles de sécurité.'
                      : 'تجميد وحظر الحسابات الوهمية أو المشبوهة، تفعيل التوثيق، وإدارة شروط الأمان بمرونة.'}
                  </p>
                </div>
              </div>

              {/* Banning List & Status Control */}
              <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <span>{language === 'fr' ? 'حالة الحظر وتجميد الحسابات (Account Banning List)' : 'قائمة حراسة وحظر الحسابات'}</span>
                </h4>

                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#0F172A] border border-slate-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {p.name} ({p.city})
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.isBanned ? (
                              <span className="text-rose-400 font-bold flex items-center gap-1">
                                <Ban className="w-3 h-3" /> {language === 'fr' ? 'Compte Suspendu (محظور)' : 'حساب محظور ومجمد'}
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {language === 'fr' ? 'Compte Actif (نشط)' : 'حساب آمن ونشط'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onBanToggleProfile(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            p.isBanned
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {p.isBanned ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{language === 'fr' ? 'Réactiver' : 'إلغاء الحظر'}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>{language === 'fr' ? 'حظر الحساب' : 'حظر الحساب فوراً'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Security Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span>{language === 'fr' ? 'Seuil des appels vocaux' : 'شرط فتح المكالمات والرسائل الصوتية'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'fr'
                      ? 'Nombre de messages mutuels requis avant d\'activer les appels.'
                      : 'عدد الرسائل المطلوبة لفتح الصوتيات (اجعلها 0 لفتح الصوتيات للجميع).'}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={voiceUnlockCount}
                      onChange={(e) => setVoiceUnlockCount(Number(e.target.value))}
                      className="w-20 py-1.5 px-3 rounded-xl bg-[#0F172A] border border-amber-500/40 text-center font-bold text-amber-400 text-xs focus:outline-none"
                    />
                    <span className="text-xs text-slate-300 font-bold">
                      {language === 'fr' ? 'messages' : 'رسالة متبادلة'}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => setVoiceUnlockCount(0)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30 hover:bg-amber-500/30 transition-all ml-auto rtl:mr-auto rtl:ml-0"
                    >
                      {language === 'fr' ? 'Débloquer Tout' : 'فتح للجميع (0)'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{language === 'fr' ? 'Vérification Email (OTP 6 chiffres)' : 'إجبار تأكيد البريد عند التسجيل'}</span>
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-300">
                      {language === 'fr' ? 'Exiger la saisie du رمز التأكيد للتفعيل' : 'تأكيد الحساب عبر رمز إيميل مكوّن من 6 أرقام'}
                    </span>
                    <input
                      type="checkbox"
                      checked={requireEmailVerification}
                      onChange={(e) => setRequireEmailVerification(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Admin Password Security Manager Card */}
                <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-amber-500/30 space-y-3 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{language === 'fr' ? 'Mot de Passe d\'accès Administrateur' : 'كلمة مرور لوحة التحكم والمشرفين'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'fr'
                      ? 'Mot de passe sécurisé avec protection anti-force brute (3 tentatives max avant blocage de 60s et temporisation d\'attaque).'
                      : 'كلمة مرور معززة للتطبيق وضد هجمات التخمين والقوة القاطعة (حظر تلقائي 60 ثانية بعد 3 محاولات خاطئة).'}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="text"
                      value={adminPasswordSetting}
                      onChange={(e) => setAdminPasswordSetting(e.target.value)}
                      className="flex-1 py-2 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminPasswordSetting.trim()) {
                          localStorage.setItem('mawada_admin_password', adminPasswordSetting.trim());
                          setPasswordSaveSuccess(true);
                          setTimeout(() => setPasswordSaveSuccess(false), 2500);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>{passwordSaveSuccess ? (language === 'fr' ? 'Enregistré !' : 'تم الحفظ !') : (language === 'fr' ? 'Enregistrer' : 'حفظ كلمة المرور')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILES LIST TAB */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === 'fr' ? 'Rechercher par nom ou wilaya...' : 'البحث باسم الحساب أو الولاية...'}
                    className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  onClick={handleGenerateRandomProfile}
                  className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'fr' ? 'Générer' : 'توليد سريع'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {filteredProfiles.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800/80 flex items-center justify-between hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                      {prof.photos && prof.photos.length > 0 && prof.photos[0] ? (
                        <img
                          src={prof.photos[0]}
                          alt={prof.name}
                          className="w-11 h-11 rounded-full object-cover border border-amber-500/40 shrink-0"
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                          prof.gender === 'female' 
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/40' 
                            : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                        }`}>
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-100 truncate">
                            {prof.name}, {prof.age}
                          </h4>
                          {prof.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                          )}
                          {prof.isBanned && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">
                              {language === 'fr' ? 'محظور' : 'محظور'}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                            {prof.gender === 'female' ? (language === 'fr' ? 'Femme' : 'أنثى') : (language === 'fr' ? 'Homme' : 'ذكر')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          📍 {prof.city} • {prof.profession} {userLat && prof.lat && `(${getCalculatedDistance(userLat, userLng, userCity, prof.lat, prof.lng, prof.city, prof.distanceKm)} كم)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                      {/* Impersonate & Switch Session Button */}
                      {onImpersonateSwitch && (
                        <button
                          type="button"
                          onClick={() => {
                            onImpersonateSwitch(prof);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                          title={language === 'fr' ? 'Se connecter en tant que ce profil' : 'التبديل والدخول بهذا الحساب كـ مستخدم'}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{language === 'fr' ? 'Basculer' : 'دخول بحسابه'}</span>
                        </button>
                      )}

                      {/* Toggle Verification Badge */}
                      <button
                        onClick={() => {
                          onUpdateProfile({
                            ...prof,
                            isVerified: !prof.isVerified
                          });
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          prof.isVerified
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title={language === 'fr' ? 'Activer/Désactiver le badge' : 'تفعيل/إلغاء التوثيق'}
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>

                      {/* Impersonate button */}
                      <button
                        onClick={() => {
                          setImpersonateSenderId(prof.id);
                          setActiveTab('impersonate');
                        }}
                        className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold hover:bg-blue-500/30 transition-all"
                        title={language === 'fr' ? 'Envoyer un message en tant que ce profil' : 'الدردشة والرد باسم هذا الحساب'}
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      {/* Toggle Ban */}
                      <button
                        onClick={() => onBanToggleProfile(prof.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          prof.isBanned
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                        title={language === 'fr' ? 'حظر / إلغاء حظر الحساب' : 'حظر أو فك حظر الحساب'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      {/* Delete profile */}
                      <button
                        onClick={() => onDeleteProfile(prof.id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                        title={language === 'fr' ? 'Supprimer ce profil' : 'حذف الحساب نهائياً'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CREATE PROFILE FORM TAB */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateCustomProfileSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'Nom du profil :' : 'اسم الحساب :'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Yasmine, Samy..."
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'Âge :' : 'العمر :'}
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'Genre :' : 'الجنس :'}
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'female' | 'male')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="female">{language === 'fr' ? 'Femme (أنثى)' : 'أنثى'}</option>
                    <option value="male">{language === 'fr' ? 'Homme (ذكر)' : 'ذكر'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'Wilaya :' : 'الولاية :'}
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  {language === 'fr' ? 'Profession :' : 'المهنة :'}
                </label>
                <input
                  type="text"
                  value={newProfession}
                  onChange={(e) => setNewProfession(e.target.value)}
                  placeholder="e.g. Médecin, Ingénieur..."
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  {language === 'fr' ? 'URL de la photo (Unsplash ou lien direct) :' : 'رابط صورة الحساب (اختياري) :'}
                </label>
                <input
                  type="url"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  {language === 'fr' ? 'Bio / Description :' : 'نبذة عن الشخصية :'}
                </label>
                <textarea
                  rows={3}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder={language === 'fr' ? 'Présentation du profil...' : 'وصف البروفايل...'}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'fr' ? 'Enregistrer le nouveau profil' : 'حفظ وإضافة الحساب'}</span>
              </button>
            </form>
          )}

          {/* IMPERSONATE / DIRECT CHAT TAB */}
          {activeTab === 'impersonate' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Envoyer un message en tant qu\'hôte' : 'إرسال رسالة مباشرة للمستخدم الحقيقي باسم حساب وهمي'}</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  {language === 'fr'
                    ? 'Sélectionnez un profil d\'hôte pour répondre directement à l\'utilisateur connecté.'
                    : 'اختر أحد الحسابات لتراسل بها المستخدم الرئيسي وتجعل التطبيق يبدو حياً ومتفاعلاً للغاية.'}
                </p>
              </div>

              <form onSubmit={handleSendAsMock} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'Choisir le profil expéditeur :' : 'اختر الحساب الذي تريد المراسلة به :'}
                  </label>
                  <select
                    value={impersonateSenderId}
                    onChange={(e) => setImpersonateSenderId(e.target.value)}
                    className="w-full py-3 px-3 rounded-xl bg-[#0A0F1D] border border-amber-500/40 text-xs text-amber-400 font-bold focus:outline-none"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.city} • {p.gender === 'female' ? 'أنثى' : 'ذكر'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {language === 'fr' ? 'نص الرسالة :' : 'محتوى الرسالة :'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={impersonateText}
                    onChange={(e) => setImpersonateText(e.target.value)}
                    placeholder={language === 'fr' ? 'Écrivez votre message ici...' : 'اكتب الرسالة التي ستصل للمستخدم فوراً...'}
                    className="w-full p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {impersonateSuccessMsg && (
                  <p className="text-xs font-bold text-emerald-400 text-center animate-pulse">
                    ✓ {impersonateSuccessMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'fr' ? 'إرسال الرسالة فوراً' : 'إرسال الرسالة إلى المستخدم الآن'}</span>
                </button>
              </form>
            </div>
          )}

          {/* CONTACT TICKETS & COMPLAINTS TAB */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 p-4 rounded-2xl bg-[#0A0F1D] border border-amber-500/30">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <LifeBuoy className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100">
                      {language === 'fr' ? 'Gestion des Réclamations et Tickets Client' : 'إدارة شكاوى واستفسارات المستخدمين'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'fr'
                        ? 'Visualisez les demandes envoyées via le formulaire "Nous Contacter".'
                        : 'عرض البلاغات، الشكاوى، وطلبات المساعدة الواردة من زر اتصل بنا.'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">
                  {ticketsList.length} {language === 'fr' ? 'tickets enregistrés' : 'طلب مسجل'}
                </span>
              </div>

              {ticketsList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="text-sm font-bold text-slate-200">
                    {language === 'fr' ? 'Aucune réclamation en attente' : 'لا توجد أي شكاوى أو طلبات جديدة حالياً'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketsList.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold">
                            {t.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold">
                            {t.typeName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{t.createdAt}</span>
                          <button
                            onClick={() => {
                              const updated = ticketsList.filter((_, i) => i !== idx);
                              setTicketsList(updated);
                              localStorage.setItem('mawada_contact_tickets', JSON.stringify(updated));
                            }}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title={language === 'fr' ? 'Supprimer' : 'حذف الطلب'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-100">{t.subject}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A] p-3 rounded-xl border border-slate-800/60">
                          {t.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2 text-slate-400">
                        <div>
                          <span>{language === 'fr' ? 'De : ' : 'من : '}</span>
                          <span className="font-bold text-slate-200">{t.senderName}</span>
                          {t.contactInfo && (
                            <span className="text-amber-400 font-mono text-[11px] mx-2">({t.contactInfo})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = [...ticketsList];
                              updated[idx].status = updated[idx].status === 'resolved' ? 'pending' : 'resolved';
                              setTicketsList(updated);
                              localStorage.setItem('mawada_contact_tickets', JSON.stringify(updated));
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              t.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t.status === 'resolved' ? (language === 'fr' ? 'Traité / Résolu' : 'تمت المعالجة') : (language === 'fr' ? 'Marquer comme traité' : 'تحديد كـ تم الرد')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Admin Footer */}
        <div className="p-4 bg-[#0A0F1D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Mawada Guard & Moderation Engine v3.0</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            {language === 'fr' ? 'Fermer' : 'إغلاق اللوحة'}
          </button>
        </div>

      </div>
    </div>
  );
};
