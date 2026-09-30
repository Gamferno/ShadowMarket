import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }[size];

  const textDimensions = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dual Crescent Eclipse Mark */}
      <div className={`${iconDimensions} relative shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.15)]"
        >
          {/* Base Obsidian Ring */}
          <circle cx="24" cy="24" r="22" fill="#13151A" stroke="#2D313E" strokeWidth="1.5" />
          
          {/* Outer Luminous Crescent */}
          <path
            d="M31 9C21 9 13 17 13 27s8 18 18 18c3 0 5.8-.7 8.2-2-2.4 1-5.1 1.7-8.2 1.7-8.5 0-15.5-7-15.5-15.5S22.5 13.7 31 13.7c3.1 0 5.8.7 8.2 1.7C36.8 14.1 34 9 31 9z"
            fill="#F8FAFC"
            fillOpacity="0.9"
          />
          
          {/* Inner Amber Arc */}
          <path
            d="M24 14c-5.8 0-10.5 4.7-10.5 10.5S18.2 35 24 35c1.8 0 3.5-.5 5-1.3-1.5.8-3.2 1.3-5 1.3-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5c1.8 0 3.5.5 5 1.3C27.5 14.5 25.8 14 24 14z"
            fill="#F59E0B"
          />
          
          {/* Radiant Amber Core */}
          <circle cx="28" cy="24.5" r="3.5" fill="#F59E0B" />
          <circle cx="28" cy="24.5" r="6" stroke="#F59E0B" strokeOpacity="0.35" strokeWidth="1" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
      </div>

      {/* Styled Wordmark */}
      {showWordmark && (
        <div className={`font-display font-extrabold tracking-tight text-white flex items-center leading-none ${textDimensions}`}>
          <span className="tracking-tight text-white">SHADOW</span>
          <span className="tracking-tight text-[#F59E0B] ml-0.5 font-bold">MARKET</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
