import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto', 
    lg: 'h-16 w-auto',
  };

  return (
    <svg 
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
        <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8500"/>
          <stop offset="100%" stopColor="#F97316"/>
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* K */}
      <path 
        d="M20 15 L20 45 M20 30 L35 15 M20 30 L35 45" 
        stroke="url(#purpleGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#neonGlow)"
      />
      
      {/* i */}
      <rect 
        x="50" 
        y="25" 
        width="4" 
        height="20" 
        fill="url(#purpleGradient)" 
        filter="url(#neonGlow)"
      />
      <circle 
        cx="52" 
        cy="18" 
        r="2.5" 
        fill="url(#purpleGradient)" 
        filter="url(#neonGlow)"
      />
      
      {/* n */}
      <path 
        d="M65 45 L65 25 Q65 20 70 20 Q75 20 75 25 L75 45" 
        stroke="url(#cyanGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#neonGlow)"
      />
      
      {/* O with play button */}
      <circle 
        cx="100" 
        cy="30" 
        r="15" 
        stroke="url(#orangeGradient)" 
        strokeWidth="4" 
        fill="none" 
        filter="url(#neonGlow)"
      />
      <path 
        d="M95 23 L95 37 L109 30 Z" 
        fill="url(#orangeGradient)" 
        filter="url(#neonGlow)"
      />
      
      {/* flix text styled */}
      <path 
        d="M125 15 L125 45 M125 20 L135 20 M125 30 L133 30" 
        stroke="url(#cyanGradient)" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#neonGlow)"
      />
      
      <rect 
        x="145" 
        y="25" 
        width="3" 
        height="20" 
        fill="url(#cyanGradient)" 
        filter="url(#neonGlow)"
      />
      <circle 
        cx="146.5" 
        cy="18" 
        r="2" 
        fill="url(#cyanGradient)" 
        filter="url(#neonGlow)"
      />
      
      <path 
        d="M155 25 L155 40 L155 45 L165 35 M155 35 L163 25" 
        stroke="url(#purpleGradient)" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#neonGlow)"
      />
      
      <text 
        x="175" 
        y="39" 
        fill="url(#orangeGradient)" 
        fontSize="18" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="bold"
        filter="url(#neonGlow)"
      >
        .ru
      </text>
    </svg>
  );
};