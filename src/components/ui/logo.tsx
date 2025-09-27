import React from 'react';
import { cn } from '@/lib/utils';
import fionLogo from '@/assets/fion-logo.png';

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
    <img 
      src={fionLogo}
      alt="FION FILM ON"
      className={cn(sizeClasses[size], className)}
    />
  );
};