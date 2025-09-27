import React from 'react';
import { cn } from '@/lib/utils';
import vionLogo from '@/assets/vion-logo.png';

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
      src={vionLogo}
      alt="VION CINEMA"
      className={cn(sizeClasses[size], className)}
    />
  );
};