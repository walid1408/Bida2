import React, { useState } from 'react';
import { X, Heart, MessageSquare, ShieldCheck, MapPin, AlertTriangle, ShieldAlert, ChevronLeft, ChevronRight, UserPlus, UserCheck, Clock, Users, Lock, Navigation, Briefcase } from 'lucide-react';
import { Profile, Language, FriendshipStatus } from '../types';
import { translations } from '../data/translations';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';
import { getCalculatedDistance } from '../utils/geo';

interface ProfileDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
  language: Language;
  isLiked: boolean;
  friendshipStatus?: FriendshipStatus;
  allProfiles?: Profile[];
  onSendFriendRequest?: (profileId: string) => void;
  onAcceptFriendRequest?: (profileId: string) => void;
  onDeclineFriendRequest?: (profileId: string) => void;
  onLike: (profile: Profile) => void;
  onStartChat: (profile: Profile) => void;
  onOpenReportModal: (profile: Profile) => void;
  userInterests: string[];
  userLat?: number;
  userLng?: number;
  userCity?: string;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  onClose,
  language,
  isLiked,
  friendshipStatus = 'none',
  allProfiles = [],
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onLike,
  onStartChat,
  onOpenReportModal,
  userInterests,
  userLat,
  userLng,
  userCity = 'Alger'
}) => {
  if (!profile) return null;

  const t = translations[language];
  const [photoIndex, setPhotoIndex] = useState(0);

  const hasPhotos = profile.photos && profile.photos.length > 0 && !!profile.photos[0];

  const calculatedDistance = getCalculatedDistance(
    userLat,
    userLng,
    userCity,
    profile.lat,
    profile.lng,
    profile.city,
    profile.distanceKm
  );

  const nextPhoto = () => {
    if (hasPhotos) {
      setPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasPhotos) {
      setPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  const genderGradient = profile.gender === 'female' 
    ? 'from-rose-950 via-slate-900 to-amber-950/70' 
    : 'from-slate-900 via-indigo-950 to-slate-950';

  const avatarColor = profile.gender === 'female'
    ? 'bg-gradient-to-tr from-rose-500 to-amber-400 text-slate-950 border-rose-300/40'
    : 'bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 border-amber-300/40';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      
      <div className="relative bg-[#0F172A] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-30 p-2.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-900 transition-all shadow-lg border border-slate-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          
          {/* Top Header / Photo or Initial Banner */}
          <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full bg-slate-950 overflow-hidden">
            {hasPhotos ? (
              <>
                <img
                  src={profile.photos[photoIndex] || profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/30 to-transparent pointer-events-none" />

                {/* Photo Navigation Arrows */}
                {profile.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-all border border-slate-700 z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-all border border-slate-700 z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 rtl:space-x-reverse z-10">
                      {profile.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPhotoIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === photoIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* No photos layout banner */
              <div className={`w-full h-full bg-gradient-to-b ${genderGradient} p-6 flex flex-col items-center justify-center text-center relative`}>
                <div className={`w-24 h-24 rounded-3xl ${avatarColor} flex items-center justify-center shadow-2xl border text-4xl font-black tracking-widest my-auto z-10`}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Geolocation Distance Badge Top-Left (Next to close) */}
            <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto z-20 px-3 py-1.5 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-300 font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{calculatedDistance} {language === 'fr' ? 'km' : 'كم'}</span>
            </div>

            {/* Profile Title & Online Status Overlay */}
            <div className="absolute bottom-4 left-6 rtl:right-6 rtl:left-auto right-6 text-white z-10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-100">
                  {profile.name}
                </h2>
                {profile.isVerified && (
                  <ShieldCheck className="w-6 h-6 text-amber-400" title="Compte Vérifié" />
                )}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-md">
                <OnlineStatusIndicator
                  isOnline={profile.isOnline}
                  lastSeen={profile.lastSeen}
                  language={language}
                  showText={true}
                />
              </div>
            </div>
          </div>

          {/* Detailed Content Body */}
          <div className="p-6 space-y-4 text-slate-100">
            
            {/* Minimalist Summary: Nom, Age, Region, Distance */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{language === 'fr' ? 'Nom' : 'الاسم'}</span>
                <span className="font-bold text-slate-100">{profile.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                <span className="text-slate-400 font-medium">{language === 'fr' ? 'Profession' : 'المهنة'}</span>
                <span className="font-bold text-amber-400">{profile.profession}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                <span className="text-slate-400 font-medium">{language === 'fr' ? 'Âge' : 'العمر'}</span>
                <span className="font-bold text-amber-400">{profile.age} {language === 'fr' ? 'ans' : 'سنة'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                <span className="text-slate-400 font-medium">{language === 'fr' ? 'Région / Ville' : 'المنطقة / المدينة'}</span>
                <span className="font-bold text-slate-100">{profile.city}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'fr' ? 'Distance approximative' : 'المسافة المحسوبة'}
                </span>
                <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {calculatedDistance} {language === 'fr' ? 'km de vous' : 'كم منك'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400">
                  {language === 'fr' ? 'À propos' : 'نبذة الشخصية'}
                </h4>
                <p className="text-xs leading-relaxed text-slate-300 italic">
                  "{profile.bio}"
                </p>
              </div>
            )}

            {/* User Friends List Section */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{language === 'fr' ? `Liste d'amis de ${profile.name}` : `قائمة أصدقاء ${profile.name}`}</span>
                </h4>
              </div>

              {profile.hideFriendsList ? (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                    <Lock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    {language === 'fr' ? 'Liste d\'amis masquée' : 'قائمة الأصدقاء مخفية'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'fr'
                      ? 'Ce membre a choisi de masquer sa liste d’amis des autres utilisateurs.'
                      : 'قام صاحب هذا الحساب بإخفاء قائمة أصدقائه عن باقي الأعضاء.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {allProfiles
                    .filter((p) => p.id !== profile.id)
                    .slice(0, 3)
                    .map((friend) => (
                      <div
                        key={friend.id}
                        className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-400">
                            {friend.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {friend.name}, {friend.age}
                            </p>
                            <p className="text-[10px] text-slate-400">{friend.city}</p>
                          </div>
                        </div>
                        <OnlineStatusIndicator
                          isOnline={friend.isOnline}
                          lastSeen={friend.lastSeen}
                          language={language}
                          showText={true}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Trust & Safety Warning Banner */}
            <div className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-start space-x-3 rtl:space-x-reverse text-xs text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>{t.safetyNotice}</p>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between gap-3">
          
          {/* Report/Block Button */}
          <button
            onClick={() => onOpenReportModal(profile)}
            className="p-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title={t.reportProfile}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-1 justify-end flex-wrap gap-y-2">
            
            <button
              onClick={() => onLike(profile)}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 ${
                isLiked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-amber-400' : ''}`} />
              <span>{isLiked ? t.likedButton : t.likeButton}</span>
            </button>

            {/* Friendship Action Button */}
            {friendshipStatus === 'accepted' ? (
              <span className="px-3 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>{language === 'fr' ? 'Amis' : 'صديق'}</span>
              </span>
            ) : friendshipStatus === 'pending_sent' ? (
              <span className="px-3 py-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{language === 'fr' ? 'Demande envoyée' : 'طلب معلق'}</span>
              </span>
            ) : friendshipStatus === 'pending_received' ? (
              <button
                onClick={() => onAcceptFriendRequest?.(profile.id)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>{language === 'fr' ? 'Accepter demande' : 'قبول الصداقة'}</span>
              </button>
            ) : (
              <button
                onClick={() => onSendFriendRequest?.(profile.id)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'fr' ? "Demande d'amitié" : "طلب صداقة"}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onStartChat(profile);
              }}
              className="flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-2xl font-bold text-xs bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/30 hover:bg-amber-400 transition-all transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.sendMessage}</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
