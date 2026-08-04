import React from 'react';
import { Language } from '../types';

interface OnlineStatusIndicatorProps {
  isOnline?: boolean;
  lastSeen?: string;
  language: Language;
  showText?: boolean;
  className?: string;
}

export const formatLastSeenText = (lastSeen: string | undefined, language: Language): string => {
  if (!lastSeen || lastSeen === 'now') {
    return language === 'fr' ? 'En ligne' : 'متصل الآن';
  }

  if (lastSeen.endsWith('m')) {
    const min = lastSeen.replace('m', '');
    return language === 'fr' ? `En ligne il y a ${min} min` : `نشط منذ ${min} دقيقة`;
  }

  if (lastSeen.endsWith('h')) {
    const hours = lastSeen.replace('h', '');
    if (hours === '1') {
      return language === 'fr' ? 'En ligne il y a 1 heure' : 'نشط منذ ساعة واحدة';
    }
    if (hours === '2') {
      return language === 'fr' ? 'En ligne il y a 2h' : 'نشط منذ ساعتين';
    }
    return language === 'fr' ? `En ligne il y a ${hours}h` : `نشط منذ ${hours} ساعات`;
  }

  if (lastSeen.endsWith('d')) {
    const days = parseInt(lastSeen.replace('d', ''), 10);
    // Max cap is 3 days as requested ("حتى 3 ايام كحد اقصى")
    const cappedDays = Math.min(Math.max(days, 1), 3);
    if (cappedDays === 1) {
      return language === 'fr' ? 'En ligne il y a 1 jour' : 'نشط منذ يوم واحد';
    }
    if (cappedDays === 2) {
      return language === 'fr' ? 'En ligne il y a 2 jours' : 'نشط منذ يومين';
    }
    return language === 'fr' ? 'En ligne il y a 3 jours' : 'نشط منذ 3 أيام';
  }

  // Fallback default (max cap 3 days)
  return language === 'fr' ? 'En ligne il y a 3 jours' : 'نشط منذ 3 أيام';
};

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  isOnline,
  lastSeen,
  language,
  showText = true,
  className = ''
}) => {
  const isUserOnline = Boolean(isOnline);
  const text = isUserOnline
    ? (language === 'fr' ? 'En ligne' : 'متصل الآن')
    : formatLastSeenText(lastSeen, language);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Indicator Dot */}
      <div className="relative flex items-center justify-center shrink-0">
        {isUserOnline ? (
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
        ) : (
          <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-500/60 border border-slate-900" />
        )}
      </div>

      {showText && (
        <span className={`text-[11px] font-semibold tracking-wide ${isUserOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
          {text}
        </span>
      )}
    </div>
  );
};
