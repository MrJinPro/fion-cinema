import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { APP_VERSION } from '@/lib/version';
export const Footer: React.FC = () => {
  const {
    t
  } = useTranslation();
  return <footer className="border-t border-border/50 bg-card/20 backdrop-blur-xl">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {t('footer.appDescription')}
            </p>
            
            {/* TMDb Attribution */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDb" className="h-4" />
              <span>
                {t('footer.tmdbAttribution')}
              </span>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">{t('footer.navigation')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-primary transition-colors">
                  {t('nav.favorites')}
                </Link>
              </li>
              <li>
                <Link to="/lists" className="hover:text-primary transition-colors">
                  {t('nav.lists')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">{t('footer.information')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  {t('footer.aboutProject')}
                </Link>
              </li>
              <li>
                
              </li>
              <li>
                <a href="https://www.themoviedb.org/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {t('footer.tmdbTerms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>
            {t('footer.copyright')} • {APP_VERSION}
          </p>
          <p className="sm:mt-0">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>;
};