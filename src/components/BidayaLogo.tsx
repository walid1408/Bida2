import React from 'react';

interface BidayaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showArabic?: boolean;
  textColor?: string;
  layout?: 'horizontal' | 'vertical';
}

export const BidayaLogo: React.FC<BidayaLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showArabic = true,
  textColor = 'text-slate-100',
  layout = 'horizontal'
}) => {
  const sizeDimensions = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', arabic: 'text-xs' },
    sm: { icon: 'w-7 h-7', text: 'text-base', arabic: 'text-sm' },
    md: { icon: 'w-9 h-9', text: 'text-lg', arabic: 'text-base' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', arabic: 'text-xl' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', arabic: 'text-3xl' },
  }[size];

  return (
    <div className={`flex items-center ${layout === 'vertical' ? 'flex-col justify-center text-center' : 'space-x-2.5 rtl:space-x-reverse'} ${className}`}>
      {/* SVG Icon recreating the Bidaya Heart Loop with Rays */}
      <div className={`relative shrink-0 ${sizeDimensions.icon} transition-transform`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="bidayaGradientPink" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF3366" />
              <stop offset="60%" stopColor="#FF6B4A" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
            <linearGradient id="bidayaGradientOrange" x1="20" y1="10" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B00" />
              <stop offset="70%" stopColor="#FFA800" />
              <stop offset="100%" stopColor="#FFC700" />
            </linearGradient>
          </defs>

          {/* Smooth heart outline */}
          <path
            d="M 50 86 C 26 70 12 52 12 34 C 12 18 25 10 39 10 C 47 10 54 14 57 20 C 60 14 67 10 75 10 C 89 10 98 22 93 38 C 88 52 74 65 64 73"
            stroke="url(#bidayaGradientPink)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner loop Ribbon */}
          <path
            d="M 38 48 C 38 34 54 28 64 38 C 72 48 58 64 48 54 C 42 46 52 34 66 26"
            stroke="url(#bidayaGradientOrange)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Right Rays */}
          <line x1="74" y1="16" x2="77" y2="10" stroke="#FFA800" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="20" x2="86" y2="17" stroke="#FFA800" strokeWidth="3" strokeLinecap="round" />
          <line x1="77" y1="26" x2="84" y2="26" stroke="#FFA800" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className={`flex ${layout === 'vertical' ? 'flex-col items-center mt-1.5' : 'flex-col items-start rtl:items-end'}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight font-sans text-slate-100 ${sizeDimensions.text} ${textColor}`}>
              Bidaya
            </span>
            {showArabic && (
              <span className={`font-bold font-serif text-amber-400 ${sizeDimensions.arabic}`}>
                بداية
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
