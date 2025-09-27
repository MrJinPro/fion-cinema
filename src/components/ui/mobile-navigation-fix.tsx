import React from 'react';
import { Button } from './button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavigationFixProps {
  className?: string;
}

export function MobileNavigationFix({ className }: MobileNavigationFixProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on main pages that already have proper navigation
  const hideOnPaths = ['/', '/search', '/about', '/auth'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 z-50 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-background/80 backdrop-blur-sm border hover:bg-background"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-background/80 backdrop-blur-sm border hover:bg-background"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/search')}
          className="bg-background/80 backdrop-blur-sm border hover:bg-background"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}