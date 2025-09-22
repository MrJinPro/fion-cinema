import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ExternalLink, Play, Download, Tv, Eye } from 'lucide-react';
import { ExternalLinkModal } from './external-link-modal';
import { getTMDbClient } from '@/lib/tmdb';

interface StreamingProvider {
  id: string;
  name: string;
  logo: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  price?: string;
  url: string;
}

interface StreamingAvailabilityProps {
  movieId: number;
  title: string;
}

export function StreamingAvailability({ movieId, title }: StreamingAvailabilityProps) {
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StreamingProvider | null>(null);
  const tmdbClient = getTMDbClient();

  useEffect(() => {
    const fetchWatchProviders = async () => {
      try {
        // Try to get real TMDb watch providers data
        const watchData = await tmdbClient.getMovieWatchProviders(movieId);
        const ruProviders = watchData?.results?.RU;
        
        let providersArray: StreamingProvider[] = [];
        
        // Add real providers if available
        if (ruProviders) {
          // Subscription services
          if (ruProviders.flatrate) {
            ruProviders.flatrate.forEach((provider: any) => {
              providersArray.push({
                id: provider.provider_id.toString(),
                name: provider.provider_name,
                logo: tmdbClient.getImageURL(provider.logo_path, 'w92') || '',
                type: 'subscription',
                url: generateProviderUrl(provider.provider_name, title, movieId)
              });
            });
          }
          
          // Rental services
          if (ruProviders.rent) {
            ruProviders.rent.forEach((provider: any) => {
              providersArray.push({
                id: `${provider.provider_id}-rent`,
                name: provider.provider_name,
                logo: tmdbClient.getImageURL(provider.logo_path, 'w92') || '',
                type: 'rent',
                price: '299-499 ₽',
                url: generateProviderUrl(provider.provider_name, title, movieId)
              });
            });
          }
          
          // Purchase services
          if (ruProviders.buy) {
            ruProviders.buy.forEach((provider: any) => {
              providersArray.push({
                id: `${provider.provider_id}-buy`,
                name: provider.provider_name,
                logo: tmdbClient.getImageURL(provider.logo_path, 'w92') || '',
                type: 'buy',
                price: '599-999 ₽',
                url: generateProviderUrl(provider.provider_name, title, movieId)
              });
            });
          }
        }
        
        // Always add popular Russian services
        const russianServices: StreamingProvider[] = [
          {
            id: 'ivi',
            name: 'IVI',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/69b65a9c6ea146ab806cf9a6d93b6e31fb3da8c5/png',
            type: 'subscription',
            url: `https://www.ivi.ru/search?q=${encodeURIComponent(title)}`
          },
          {
            id: 'okko',
            name: 'OKKO',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/4bb271cd993db66f8fcb18fdb8d46b0f94b36f5b/png',
            type: 'subscription',
            url: `https://okko.tv/search?text=${encodeURIComponent(title)}`
          },
          {
            id: 'kinopoisk',
            name: 'Кинопоиск HD',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/80a4ee47eaef1e3c22c2c73c52eca30b24b1e571/png',
            type: 'subscription',
            url: `https://hd.kinopoisk.ru/film/${movieId}`
          }
        ];
        
        // Remove duplicates and add Russian services
        const existingNames = providersArray.map(p => p.name.toLowerCase());
        russianServices.forEach(service => {
          if (!existingNames.includes(service.name.toLowerCase())) {
            providersArray.push(service);
          }
        });
        
        setProviders(providersArray);
      } catch (error) {
        console.error('Error fetching watch providers:', error);
        // Fallback to Russian services only
        setProviders([
          {
            id: 'ivi',
            name: 'IVI',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/69b65a9c6ea146ab806cf9a6d93b6e31fb3da8c5/png',
            type: 'subscription',
            url: `https://www.ivi.ru/search?q=${encodeURIComponent(title)}`
          },
          {
            id: 'okko',
            name: 'OKKO',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/4bb271cd993db66f8fcb18fdb8d46b0f94b36f5b/png',
            type: 'subscription',
            url: `https://okko.tv/search?text=${encodeURIComponent(title)}`
          },
          {
            id: 'kinopoisk',
            name: 'Кинопоиск HD',
            logo: 'https://avatars.mds.yandex.net/get-bunker/61205/80a4ee47eaef1e3c22c2c73c52eca30b24b1e571/png',
            type: 'subscription',
            url: `https://hd.kinopoisk.ru/film/${movieId}`
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchProviders();
  }, [movieId, title]);

  const generateProviderUrl = (providerName: string, movieTitle: string, movieId: number): string => {
    const encodedTitle = encodeURIComponent(movieTitle);
    
    switch (providerName.toLowerCase()) {
      case 'netflix':
        return `https://www.netflix.com/search?q=${encodedTitle}`;
      case 'apple tv':
      case 'apple tv+':
        return `https://tv.apple.com/search?term=${encodedTitle}`;
      case 'google play movies & tv':
      case 'google play':
        return `https://play.google.com/store/search?q=${encodedTitle}&c=movies`;
      case 'amazon prime video':
      case 'prime video':
        return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodedTitle}`;
      default:
        return `https://www.google.com/search?q="${movieTitle}"+${providerName}+смотреть+онлайн`;
    }
  };

  const handleWatchClick = (provider: StreamingProvider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  const handleConfirmWatch = () => {
    if (selectedProvider) {
      window.open(selectedProvider.url, '_blank', 'noopener,noreferrer');
    }
    setModalOpen(false);
    setSelectedProvider(null);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Tv className="h-4 w-4" />;
      case 'rent':
        return <Play className="h-4 w-4" />;
      case 'buy':
        return <Download className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Подписка';
      case 'rent':
        return 'Аренда';
      case 'buy':
        return 'Покупка';
      case 'free':
        return 'Бесплатно';
      default:
        return type;
    }
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'subscription':
        return 'default';
      case 'rent':
        return 'secondary';
      case 'buy':
        return 'outline';
      case 'free':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Информация о доступности не найдена для вашего региона
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/10 hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-background rounded-lg border shadow-sm">
                    {provider.logo ? (
                      <img 
                        src={provider.logo} 
                        alt={provider.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      getProviderIcon(provider.type)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{provider.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeVariant(provider.type)} className="text-xs">
                        {getTypeLabel(provider.type)}
                      </Badge>
                      {provider.price && (
                        <span className="text-sm font-semibold text-primary">
                          {provider.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleWatchClick(provider)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  Смотреть
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Данные о доступности предоставлены TMDb и партнёрами. Цены и доступность могут изменяться.
            </p>
          </div>
        </CardContent>
      </Card>

      <ExternalLinkModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmWatch}
        serviceName={selectedProvider?.name || ''}
      />
    </>
  );
}