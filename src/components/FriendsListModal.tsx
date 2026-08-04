import React, { useState } from 'react';
import { Users, X, Search, MessageSquare, UserCheck, UserMinus, ShieldCheck, Heart, Eye } from 'lucide-react';
import { Profile, Language, FriendshipStatus } from '../types';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  profiles: Profile[];
  friendshipStatuses: Record<string, FriendshipStatus>;
  onUpdateFriendship: (profileId: string, status: FriendshipStatus) => void;
  onSelectChatPartner: (profileId: string) => void;
  onSelectProfile?: (profile: Profile) => void;
}

export const FriendsListModal: React.FC<FriendsListModalProps> = ({
  isOpen,
  onClose,
  language,
  profiles,
  friendshipStatuses,
  onUpdateFriendship,
  onSelectChatPartner,
  onSelectProfile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'visitors'>('friends');

  if (!isOpen) return null;

  // Accepted friends
  const friendsList = profiles.filter(
    (p) => friendshipStatuses[p.id] === 'accepted'
  );

  // Pending incoming requests
  const pendingRequestsList = profiles.filter(
    (p) => friendshipStatuses[p.id] === 'pending_received'
  );

  // Profile Visitors (People who viewed your account)
  const visitorProfiles = profiles.map((p, idx) => ({
    ...p,
    visitedAt: idx === 0 ? 'Il y a 10 min' : idx === 1 ? 'Il y a 45 min' : idx === 2 ? 'Il y a 2h' : idx === 3 ? 'Hier à 18:30' : 'Il y a 2 jours'
  })).slice(0, 6);

  const filteredFriends = friendsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#0F172A] border border-amber-500/40 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0A0F1D] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{language === 'fr' ? 'Qaima Al-Asdiqa (قائمة الأصدقاء)' : 'قائمة الأصدقاء والمعارف'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  {friendsList.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'fr'
                  ? 'Vos connexions acceptées avec statut en ligne en temps réel.'
                  : 'الأصدقاء المعتمدون مع حالة الاتصال المباشرة وآخر تواجد.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#0A0F1D]/60 border-b border-slate-800 px-4 pt-3 flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'friends'
                ? 'bg-[#0F172A] text-amber-400 border-t border-x border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'fr' ? 'Mes Amis' : 'الأصدقاء الحاليون'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {friendsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'pending'
                ? 'bg-[#0F172A] text-amber-400 border-t border-x border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>{language === 'fr' ? 'Demandes en attente' : 'طلبات صداقة جديدة'}</span>
            {pendingRequestsList.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-extrabold animate-bounce">
                {pendingRequestsList.length}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'visitors'
                ? 'bg-[#0F172A] text-amber-400 border-t border-x border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{language === 'fr' ? 'Visites du profil' : 'من زار بروفايلي'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
              {visitorProfiles.length}
            </span>
          </button>
        </div>

        {/* Search Input for Friends */}
        {activeTab === 'friends' && friendsList.length > 0 && (
          <div className="p-3 bg-[#0A0F1D]/40 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher un ami par nom ou ville...' : 'البحث في قائمة الأصدقاء باسم الشخص أو الولاية...'}
                className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'friends' ? (
            filteredFriends.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Users className="w-7 h-7" />
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {language === 'fr'
                    ? 'Aucun ami trouvé. Vous pouvez envoyer des demandes d’amitié depuis les profils de la découverte.'
                    : 'لا يوجد أصدقاء حالياً في القائمة. يمكنك إرسال وطلب الصداقة من الملفات الشخصية.'}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                >
                  <div
                    onClick={() => onSelectProfile?.(friend)}
                    className="flex items-center space-x-3 rtl:space-x-reverse min-w-0 cursor-pointer group"
                    title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={friend.photos[0]}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover border border-amber-500/40 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 right-0 rtl:left-0 rtl:right-auto">
                        <OnlineStatusIndicator
                          isOnline={friend.isOnline}
                          lastSeen={friend.lastSeen}
                          language={language}
                          showText={false}
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                          {friend.name}, {friend.age}
                        </h4>
                        {friend.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-400 truncate">
                        {friend.city} • {friend.profession}
                      </p>

                      <div className="pt-0.5">
                        <OnlineStatusIndicator
                          isOnline={friend.isOnline}
                          lastSeen={friend.lastSeen}
                          language={language}
                          showText={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                    <button
                      onClick={() => onSelectProfile?.(friend)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                      title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectChatPartner(friend.id);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Discuter' : 'مراسلة'}</span>
                    </button>

                    <button
                      onClick={() => onUpdateFriendship(friend.id, 'none')}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={language === 'fr' ? 'Retirer des amis' : 'إزالة من قائمة الأصدقاء'}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeTab === 'pending' ? (
            pendingRequestsList.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Heart className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {language === 'fr'
                    ? 'Aucune demande d’amitié en attente pour le moment.'
                    : 'لا توجد طلبات صداقة معلقة حالياً.'}
                </p>
              </div>
            ) : (
              pendingRequestsList.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-amber-500/30 flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => onSelectProfile?.(req)}
                    className="flex items-center space-x-3 rtl:space-x-reverse min-w-0 cursor-pointer group"
                    title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                  >
                    <img
                      src={req.photos[0]}
                      alt={req.name}
                      className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                        {req.name}, {req.age}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {req.city} • {req.profession}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                    <button
                      onClick={() => onSelectProfile?.(req)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                      title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onUpdateFriendship(req.id, 'accepted')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Accepter' : 'قبول الصداقة'}</span>
                    </button>

                    <button
                      onClick={() => onUpdateFriendship(req.id, 'declined')}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                    >
                      {language === 'fr' ? 'Refuser' : 'رفض'}
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Visitors Tab */
            visitorProfiles.map((visitor) => (
              <div
                key={visitor.id}
                className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-all"
              >
                <div
                  onClick={() => onSelectProfile?.(visitor)}
                  className="flex items-center space-x-3 rtl:space-x-reverse min-w-0 cursor-pointer group"
                  title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                >
                  <div className="relative shrink-0">
                    <img
                      src={visitor.photos[0]}
                      alt={visitor.name}
                      className="w-12 h-12 rounded-full object-cover border border-cyan-500/40 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 right-0 rtl:left-0 rtl:right-auto">
                      <OnlineStatusIndicator
                        isOnline={visitor.isOnline}
                        lastSeen={visitor.lastSeen}
                        language={language}
                        showText={false}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                        {visitor.name}, {visitor.age}
                      </h4>
                      {visitor.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-400 font-medium truncate flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400 inline shrink-0" />
                      <span>{language === 'fr' ? `A consulté votre profil ${visitor.visitedAt}` : `زار ملفك الشخصي ${visitor.visitedAt}`}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                  <button
                    onClick={() => onSelectProfile?.(visitor)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                    title={language === 'fr' ? 'Voir le profil' : 'عرض الملف الشخصي'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectChatPartner(visitor.id);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Discuter' : 'مراسلة'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
