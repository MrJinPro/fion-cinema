import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Heart, List, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchValue,
  onSearchChange,
  onSearch,
  onMenuToggle,
}) => {
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/search', label: 'Поиск' },
    { href: '/favorites', label: 'Избранное', icon: Heart },
    { href: '/lists', label: 'Списки', icon: List },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Логотип */}
        <Link to="/" className="flex items-center space-x-2 hover-neon-primary transition-neon">
          <Logo size="md" />
        </Link>

        {/* Навигация для десктопа */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary neon-underline",
                location.pathname === href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Поиск */}
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            onSearch={onSearch}
            placeholder="Найти фильм или сериал..."
          />
        </div>

        {/* Мобильное меню */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Мобильный поиск */}
      <div className="border-t border-border/40 p-4 sm:hidden">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Найти фильм или сериал..."
        />
      </div>
    </header>
  );
};