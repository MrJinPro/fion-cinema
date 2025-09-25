import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { ExternalLink, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface StreamingAvailabilityProps {
  watchProviders?: any;
  movieId: number;
  title: string;
  className?: string;
}

const providerNames: Record<string, { en: string; ru: string }> = {
  'Netflix': { en: 'Netflix', ru: 'Netflix' },
  'Amazon Prime Video': { en: 'Amazon Prime Video', ru: 'Amazon Prime Video' },
  'Disney Plus': { en: 'Disney+', ru: 'Disney+' },
  'HBO Max': { en: 'HBO Max', ru: 'HBO Max' },
  'Hulu': { en: 'Hulu', ru: 'Hulu' },
  'Apple TV': { en: 'Apple TV+', ru: 'Apple TV+' },
  'Paramount Plus': { en: 'Paramount+', ru: 'Paramount+' },
  'Peacock': { en: 'Peacock', ru: 'Peacock' },
  'Showtime': { en: 'Showtime', ru: 'Showtime' },
  'Starz': { en: 'Starz', ru: 'Starz' },
  'Crunchyroll': { en: 'Crunchyroll', ru: 'Crunchyroll' },
  'Funimation': { en: 'Funimation', ru: 'Funimation' }
};

const getProviderUrl = (providerName: string, movieId: number, title: string): string => {
  const encodedTitle = encodeURIComponent(title);
  
  const urls: Record<string, string> = {
    'Netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
    'Amazon Prime Video': `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
    'Disney Plus': `https://www.disneyplus.com/search?q=${encodedTitle}`,
    'HBO Max': `https://www.hbo.com/search?q=${encodedTitle}`,
    'Hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
    'Apple TV': `https://tv.apple.com/search?term=${encodedTitle}`,
    'Paramount Plus': `https://www.paramountplus.com/search?query=${encodedTitle}`,
    'Peacock': `https://www.peacocktv.com/search?q=${encodedTitle}`,
    'Showtime': `https://www.showtime.com/search/${encodedTitle}`,
    'Starz': `https://www.starz.com/search?query=${encodedTitle}`,
    'Crunchyroll': `https://www.crunchyroll.com/search?q=${encodedTitle}`,
    'Funimation': `https://www.funimation.com/search/?q=${encodedTitle}`
  };
  
  return urls[providerName] || `https://www.google.com/search?q=${encodedTitle}+streaming`;
};

export function StreamingAvailability({ watchProviders, movieId, title, className }: StreamingAvailabilityProps) {
  const { t, i18n } = useTranslation();
  
  const providers = watchProviders?.RU || watchProviders?.US;
  
  const hasProviders = providers && (
    (providers.flatrate && providers.flatrate.length > 0) ||
    (providers.rent && providers.rent.length > 0) ||
    (providers.buy && providers.buy.length > 0)
  );

  const renderProviderButton = (provider: StreamingProvider, type: 'flatrate' | 'rent' | 'buy') => {
    const localizedName = providerNames[provider.provider_name]?.[i18n.language as 'en' | 'ru'] || provider.provider_name;
    const url = getProviderUrl(provider.provider_name, movieId, title);
    
    const typeLabels = {
      flatrate: { en: 'Stream', ru: 'Стрим' },
      rent: { en: 'Rent', ru: 'Аренда' },
      buy: { en: 'Buy', ru: 'Купить' }
    };
    
    return (
      <Button
        key={`${provider.provider_id}-${type}`}
        variant="outline"
        size="sm"
        className="justify-between min-w-[140px]"
        onClick={() => window.open(url, '_blank')}
      >
        <div className="flex items-center gap-2">
          {provider.logo_path && (
            <img
              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
              alt={localizedName}
              className="w-4 h-4 rounded"
            />
          )}
          <span className="text-xs">{localizedName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {typeLabels[type][i18n.language as 'en' | 'ru']}
          </span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          {t('streaming.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasProviders ? (
          <div className="space-y-4">
            {providers?.flatrate && providers.flatrate.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">
                  {t('streaming.availableOn')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {providers.flatrate.map((provider: StreamingProvider) => 
                    renderProviderButton(provider, 'flatrate')
                  )}
                </div>
              </div>
            )}
            
            {providers?.rent && providers.rent.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-blue-600">
                  {i18n.language === 'ru' ? 'Аренда' : 'Rent'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {providers.rent.map((provider: StreamingProvider) => 
                    renderProviderButton(provider, 'rent')
                  )}
                </div>
              </div>
            )}
            
            {providers?.buy && providers.buy.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-purple-600">
                  {i18n.language === 'ru' ? 'Покупка' : 'Purchase'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {providers.buy.map((provider: StreamingProvider) => 
                    renderProviderButton(provider, 'buy')
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{t('streaming.notAvailable')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('streaming.notAvailableDesc')}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}