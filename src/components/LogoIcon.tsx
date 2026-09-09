import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 24, style, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...props}
    >
      {/* Top-left light area */}
      <path
        d="M 24 10 
           L 70 10 
           L 90 30 
           L 90 35 
           L 18 107 
           L 10 99
           L 10 24 
           Q 10 10 24 10 Z"
        fill="#EEF2FF"
      />

      {/* Bottom-right indigo/blue filled diagonal area */}
      <path
        d="M 18 107 
           L 90 35 
           L 90 94 
           L 76 108 
           L 24 108 
           Q 10 108 18 107 Z"
        fill="#4F46E5"
      />

      {/* Top-right page fold flap */}
      <path
        d="M 70 10 
           L 70 30 
           L 90 30 Z"
        fill="#818CF8"
        stroke="#1E1B4B"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Bottom-right corner fold flap */}
      <path
        d="M 90 94 
           L 76 94 
           L 76 108 Z"
        fill="#C7D2FE"
        stroke="#1E1B4B"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Diagonal dividing line stroke */}
      <line
        x1="18"
        y1="107"
        x2="90"
        y2="35"
        stroke="#1E1B4B"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Main outer document boundary stroke */}
      <path
        d="M 24 10 
           L 70 10 
           L 90 30 
           L 90 94 
           L 76 108 
           L 24 108 
           Q 10 108 10 94 
           L 10 24 
           Q 10 10 24 10 Z"
        stroke="#1E1B4B"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LogoIcon;
