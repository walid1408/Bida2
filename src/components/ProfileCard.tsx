import React, { useState } from 'react';
import { Heart, MapPin, ShieldCheck, Briefcase, Navigation, User } from 'lucide-react';
import { Profile, Language } from '../types';
import { translations } from '../data/translations';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';
import { getCalculatedDistance } from '../utils/geo';

interface ProfileCardProps {
  profile: Profile;
  language: Language;
  isLiked: boolean;
  onLike: (profile: Profile) => void;
  onOpenDetails: (profile: Profile) => void;
  userLat?: number;
  userLng?: number;
  userCity?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  language,
  isLiked,
  onLike,
  onOpenDetails,
  userLat,
  userLng,
  userCity = 'Alger'
}) => {
  const t = translations[language];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const hasPhoto = profile.photos && profile.photos.length > 0 && !!profile.photos[0];

  const calculatedDistance = getCalculatedDistance(
    userLat,
    userLng,
    userCity,
    profile.lat,
    profile.lng,
    profile.city,
    profile.distanceKm
  );

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  // Avatar initials background color based on gender & name
  const genderGradient = profile.gender === 'female' 
    ? 'from-rose-950 via-slate-900 to-amber-950/60' 
    : 'from-slate-900 via-indigo-950 to-slate-950';

  const avatarColor = profile.gender === 'female'
    ? 'bg-gradient-to-tr from-rose-500 to-amber-400 text-slate-950 border-rose-300/40'
    : 'bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 border-amber-300/40';

  return (
    <div 
      onClick={() => onOpenDetails(profile)}
      className="group relative bg-[#0F172A] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex flex-col transform hover:-translate-y-1"
    >
      {/* Top Banner / Photo Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950">
        {hasPhoto ? (
          <>
            <img
              src={profile.photos[currentPhotoIndex] || profile.photos[0]}
              alt={profile.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient Overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          /* Styled Initial & Info Card (No photos requested) */
          <div className={`w-full h-full bg-gradient-to-b ${genderGradient} p-5 flex flex-col justify-between relative overflow-hidden`}>
            {/* Decorative background circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top header spacing area */}
            <div className="h-10" />

            {/* Center Avatar & Info */}
            <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-3">
              <div className={`w-20 h-20 rounded-3xl ${avatarColor} flex items-center justify-center shadow-xl border text-3xl font-black tracking-wider transition-transform group-hover:scale-110 duration-300`}>
                {profile.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-2xl font-black text-slate-100 tracking-tight">
                    {profile.name}
                  </h3>
                  {profile.isVerified && (
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" title="Compte Vérifié" />
                  )}
                </div>
                <p className="text-xs font-semibold text-amber-400/90 mt-1 flex items-center justify-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {profile.profession}
                </p>
              </div>

              {profile.bio && (
                <p className="text-[11px] text-slate-300/90 line-clamp-2 px-3 leading-relaxed bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Online Status Badge Top-Left */}
        <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto z-10 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-md">
          <OnlineStatusIndicator
            isOnline={profile.isOnline}
            lastSeen={profile.lastSeen}
            language={language}
            showText={true}
          />
        </div>

        {/* Geolocation Distance Badge Top-Right */}
        <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto z-10 px-2.5 py-1 rounded-full bg-slate-950/85 border border-amber-500/40 text-amber-300 font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1">
          <Navigation className="w-3 h-3 text-amber-400" />
          <span>{calculatedDistance} {language === 'fr' ? 'km' : 'كم'}</span>
        </div>

        {/* Multi-Photo Dots if photos exist */}
        {hasPhoto && profile.photos.length > 1 && (
          <div className="absolute top-12 right-3 rtl:left-3 rtl:right-auto flex space-x-1 rtl:space-x-reverse z-10">
            {profile.photos.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentPhotoIndex ? 'bg-amber-400 w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick Like Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(profile);
          }}
          className={`absolute bottom-3 right-3 rtl:left-3 rtl:right-auto z-20 p-3 rounded-2xl shadow-lg backdrop-blur-md transition-all duration-200 ${
            isLiked
              ? 'bg-rose-500 text-white scale-110 shadow-rose-500/30 ring-2 ring-rose-400/40'
              : 'bg-slate-900/80 text-slate-300 hover:bg-rose-500 hover:text-white border border-slate-700/80'
          }`}
          title={isLiked ? t.likedButton : t.likeButton}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Photo Navigation Overlay */}
        {hasPhoto && profile.photos.length > 1 && (
          <div className="absolute inset-0 flex z-0">
            <div className="w-1/2 h-full cursor-pointer" onClick={prevPhoto} />
            <div className="w-1/2 h-full cursor-pointer" onClick={nextPhoto} />
          </div>
        )}

        {/* Profile Info Overlay over Photo if photos exist */}
        {hasPhoto && (
          <div className="absolute bottom-3 left-3 rtl:right-3 rtl:left-auto right-16 rtl:left-16 text-white z-10">
            <h3 className="text-xl font-bold tracking-tight text-slate-100 drop-shadow-md">
              {profile.name}
            </h3>
          </div>
        )}
      </div>

      {/* Card Body Footer Info */}
      <div className="p-3.5 flex items-center justify-between bg-[#0F172A] border-t border-slate-800/80">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">{profile.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            📍 {calculatedDistance} {language === 'fr' ? 'km' : 'كم'}
          </span>
          <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            {profile.age} {language === 'fr' ? 'ans' : 'سنة'}
          </span>
        </div>
      </div>
    </div>
  );
};
