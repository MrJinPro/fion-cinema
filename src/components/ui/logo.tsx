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
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8500"/>
          <stop offset="100%" stopColor="#FF6B00"/>
        </linearGradient>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E054"/>
          <stop offset="100%" stopColor="#00D444"/>
        </linearGradient>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00B4D8"/>
          <stop offset="100%" stopColor="#0096C7"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* F */}
      <path 
        d="M20 15 L20 45 M20 15 L40 15 M20 30 L35 30" 
        stroke="url(#orangeGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      
      {/* i */}
      <rect 
        x="55" 
        y="15" 
        width="4" 
        height="30" 
        fill="url(#orangeGradient)" 
        filter="url(#glow)"
      />
      <circle 
        cx="57" 
        cy="10" 
        r="2" 
        fill="url(#orangeGradient)" 
        filter="url(#glow)"
      />
      
      {/* O with play button */}
      <circle 
        cx="87" 
        cy="30" 
        r="15" 
        stroke="url(#greenGradient)" 
        strokeWidth="4" 
        fill="none" 
        filter="url(#glow)"
      />
      <path 
        d="M82 25 L82 35 L92 30 Z" 
        fill="url(#greenGradient)" 
        filter="url(#glow)"
      />
      
      {/* N */}
      <path 
        d="M120 45 L120 15 L140 45 L140 15" 
        stroke="url(#blueGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
    </svg>
  );
};