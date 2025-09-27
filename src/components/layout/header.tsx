import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/logo';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { MovieRecommendationDialog } from '@/components/ui/movie-recommendation-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, List, Menu, User, LogOut, LogIn, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Ошибка при выходе');
    } else {
      toast.success('Вы вышли из аккаунта');
      navigate('/');
    }
  };

  const handleRecommendationClick = () => {
    if (!user) {
      toast.error('Для подбора фильмов необходимо войти в аккаунт');
      navigate('/auth');
      return;
    }
    setIsRecommendationDialogOpen(true);
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/search', label: t('nav.search') },
    { href: '/russian-cinema', label: 'Российское кино' },
    ...(user ? [
      { href: '/favorites', label: t('nav.favorites'), icon: Heart },
      { href: '/lists', label: t('nav.lists'), icon: List },
    ] : [])
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
          <button
            onClick={handleRecommendationClick}
            className="text-sm font-medium transition-colors hover:text-primary neon-underline text-muted-foreground flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t('sections.recommendations')}
          </button>
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

        {/* Аутентификация */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Профиль</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Избранное
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/lists" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Мои коллекции
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Админ-панель
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Войти</span>
              </Link>
            </Button>
          )}

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
      
      <MovieRecommendationDialog
        isOpen={isRecommendationDialogOpen}
        onClose={() => setIsRecommendationDialogOpen(false)}
      />
    </header>
  );
};