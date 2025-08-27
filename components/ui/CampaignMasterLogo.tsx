import React from 'react';

interface CampaignMasterLogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export function CampaignMasterLogo({ 
  size = 128, 
  className = '',
  variant = 'full' 
}: CampaignMasterLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Translucent light blue background circle */}
      <circle cx="64" cy="64" r="60" fill="rgba(173, 216, 230, 0.3)" stroke="rgba(173, 216, 230, 0.5)" strokeWidth="1"/>
      
      {/* Main white icon - Envelope + Human Head combined */}
      <g transform="translate(32, 24)">
        {/* Envelope base (bottom part) */}
        <rect x="8" y="32" width="48" height="32" fill="white" stroke="white" strokeWidth="1"/>
        
        {/* Envelope flap */}
        <path
          d="M8 32 L32 16 L56 32"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
        
        {/* Human head silhouette (top part) */}
        <path
          d="M20 16 C20 8 26 2 32 2 C38 2 44 8 44 16 C44 24 38 30 32 30 C26 30 20 24 20 16 Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
        
        {/* Neural network inside head */}
        <g stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" fill="none">
          {/* Nodes */}
          <circle cx="26" cy="10" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="32" cy="6" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="38" cy="10" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="24" cy="16" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="30" cy="20" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="36" cy="16" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="28" cy="24" r="1" fill="rgba(0,0,0,0.3)"/>
          <circle cx="32" cy="26" r="1" fill="rgba(0,0,0,0.3)"/>
          
          {/* Connections */}
          <path d="M26 10 L32 6 L38 10"/>
          <path d="M24 16 L30 20 L36 16"/>
          <path d="M26 10 L24 16"/>
          <path d="M32 6 L30 20"/>
          <path d="M38 10 L36 16"/>
          <path d="M24 16 L28 24"/>
          <path d="M30 20 L32 26"/>
          <path d="M36 16 L32 26"/>
        </g>
      </g>

      {/* Scattered white icons inside the circle */}
      <g fill="white" stroke="white" strokeWidth="0.5">
        {/* Email icon 1 - top left */}
        <g transform="translate(25, 25)">
          <rect x="0" y="0" width="6" height="4" fill="white"/>
          <path d="M0 0 L3 2 L6 0" fill="none" stroke="white" strokeWidth="0.5"/>
        </g>
        
        {/* Email icon 2 - top right */}
        <g transform="translate(85, 25)">
          <rect x="0" y="0" width="6" height="4" fill="white"/>
          <path d="M0 0 L3 2 L6 0" fill="none" stroke="white" strokeWidth="0.5"/>
        </g>
        
        {/* Image/picture icon - bottom left */}
        <g transform="translate(25, 85)">
          <rect x="0" y="0" width="6" height="6" fill="white"/>
          <circle cx="3" cy="2" r="1" fill="rgba(0,0,0,0.2)"/>
          <path d="M1 4 L5 4" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
        </g>
        
        {/* User profile icon - below image icon */}
        <g transform="translate(25, 95)">
          <rect x="0" y="0" width="6" height="6" fill="white"/>
          <circle cx="3" cy="2" r="1" fill="rgba(0,0,0,0.2)"/>
          <path d="M1 4 L5 4" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
        </g>
      </g>

      {/* Scattered white dots inside the circle */}
      <g fill="white">
        <circle cx="35" cy="35" r="1"/>
        <circle cx="95" cy="40" r="1"/>
        <circle cx="45" cy="90" r="1"/>
        <circle cx="85" cy="85" r="1"/>
        <circle cx="30" cy="70" r="0.8"/>
        <circle cx="90" cy="60" r="0.8"/>
        <circle cx="70" cy="30" r="0.8"/>
        <circle cx="50" cy="95" r="0.8"/>
      </g>

      {/* Scattered icons outside the circle */}
      <g fill="white" stroke="white" strokeWidth="0.5">
        {/* Email icon - top right outside */}
        <g transform="translate(105, 15)">
          <rect x="0" y="0" width="5" height="3" fill="white"/>
          <path d="M0 0 L2.5 1.5 L5 0" fill="none" stroke="white" strokeWidth="0.5"/>
        </g>
        
        {/* Email icon - bottom right outside */}
        <g transform="translate(105, 105)">
          <rect x="0" y="0" width="5" height="3" fill="white"/>
          <path d="M0 0 L2.5 1.5 L5 0" fill="none" stroke="white" strokeWidth="0.5"/>
        </g>
      </g>

      {/* Scattered dots outside the circle */}
      <g fill="white">
        <circle cx="15" cy="110" r="0.8"/>
        <circle cx="110" cy="25" r="0.8"/>
        <circle cx="20" cy="15" r="0.6"/>
        <circle cx="115" cy="115" r="0.6"/>
      </g>
    </svg>
  );
}

// Icon-only variant (just the main combined icon)
export function CampaignMasterIcon({ 
  size = 32, 
  className = '' 
}: Omit<CampaignMasterLogoProps, 'variant'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main white icon - Envelope + Human Head combined */}
      <g transform="translate(4, 2)">
        {/* Envelope base (bottom part) */}
        <rect x="2" y="16" width="20" height="12" fill="white" stroke="white" strokeWidth="0.5"/>
        
        {/* Envelope flap */}
        <path
          d="M2 16 L12 8 L22 16"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
        />
        
        {/* Human head silhouette (top part) */}
        <path
          d="M8 8 C8 4 10 1 12 1 C14 1 16 4 16 8 C16 12 14 15 12 15 C10 15 8 12 8 8 Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
        />
        
        {/* Neural network inside head */}
        <g stroke="rgba(0,0,0,0.3)" strokeWidth="0.3" fill="none">
          {/* Nodes */}
          <circle cx="10" cy="5" r="0.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="12" cy="3" r="0.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="14" cy="5" r="0.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="9" cy="8" r="0.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="12" cy="10" r="0.5" fill="rgba(0,0,0,0.3)"/>
          <circle cx="15" cy="8" r="0.5" fill="rgba(0,0,0,0.3)"/>
          
          {/* Connections */}
          <path d="M10 5 L12 3 L14 5"/>
          <path d="M9 8 L12 10 L15 8"/>
          <path d="M10 5 L9 8"/>
          <path d="M12 3 L12 10"/>
          <path d="M14 5 L15 8"/>
        </g>
      </g>
    </svg>
  );
} 