import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              FiOn Cinema - онлайн-кинотеатр для просмотра информации о фильмах и сериалах. 
              Находите новые произведения, создавайте списки и делитесь впечатлениями.
            </p>
            
            {/* TMDb Attribution */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDb"
                className="h-4"
              />
              <span>
                Данные о фильмах и сериалах предоставлены{' '}
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-info hover:underline"
                >
                  The Movie Database (TMDb)
                </a>
              </span>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Навигация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary transition-colors">
                  Поиск
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-primary transition-colors">
                  Избранное
                </Link>
              </li>
              <li>
                <Link to="/lists" className="hover:text-primary transition-colors">
                  Мои списки
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Информация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  О проекте
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-primary transition-colors">
                  Правовая информация
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.themoviedb.org/terms-of-use" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Условия TMDb
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2024 FiOn Cinema. Разработано MrJinPro.</p>
          <p className="mt-2 sm:mt-0">
            Некоммерческое использование. Не предназначено для распространения контента.
          </p>
        </div>
      </div>
    </footer>
  );
};