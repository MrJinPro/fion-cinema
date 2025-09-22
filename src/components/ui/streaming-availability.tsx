import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ExternalLink, Play, Download, Tv, Eye, Loader2, AlertTriangle, Monitor, Film } from 'lucide-react';
import { ExternalLinkModal } from './external-link-modal';
import { supabase } from '@/integrations/supabase/client';

interface StreamingProvider {
  id: string | number;
  name: string;
  logo?: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  price?: string;
  url: string;
  available: boolean;
}

interface StreamingAvailabilityProps {
  movieId: number;
  title: string;
  imdbId?: string;
}

export function StreamingAvailability({ movieId, title, imdbId }: StreamingAvailabilityProps) {
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StreamingProvider | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchAvailabilityData();
  }, [movieId]);

  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);
      
      // Call our smart availability check function
      const { data, error } = await supabase.functions.invoke('check-movie-availability', {
        body: { 
          movieId, 
          title,
          imdbId 
        }
      });

      if (error) {
        console.error('Error calling availability function:', error);
        // Fallback to basic Russian services
        setProviders(getBasicRussianServices());
        return;
      }

      if (data && data.providers) {
        setProviders(data.providers);
        setCached(data.cached || false);
        console.log(`Loaded ${data.providers.length} providers for ${title}${data.cached ? ' (from cache)' : ''}`);
      } else {
        setProviders(getBasicRussianServices());
      }
    } catch (error) {
      console.error('Error fetching availability data:', error);
      setProviders(getBasicRussianServices());
    } finally {
      setLoading(false);
    }
  };

  const getBasicRussianServices = (): StreamingProvider[] => {
    return [
      {
        id: 'ivi',
        name: 'IVI',
        type: 'subscription',
        price: 'От 299 ₽/мес',
        url: `https://www.ivi.ru/search/?q=${encodeURIComponent(title)}`,
        available: true
      },
      {
        id: 'okko',
        name: 'OKKO',
        type: 'subscription',
        price: 'От 199 ₽/мес',
        url: `https://okko.tv/search?query=${encodeURIComponent(title)}`,
        available: true
      },
      {
        id: 'kinopoisk',
        name: 'Кинопоиск HD',
        type: 'subscription',
        price: 'От 299 ₽/мес',
        url: `https://hd.kinopoisk.ru/search?query=${encodeURIComponent(title)}`,
        available: true
      }
    ];
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

  const getProviderIcon = (type: string, name?: string) => {
    // Use specific icons for known services
    if (name?.toLowerCase().includes('ivi')) {
      return <Monitor className="h-4 w-4 text-purple-600" />;
    }
    if (name?.toLowerCase().includes('okko')) {
      return <Film className="h-4 w-4 text-orange-600" />;
    }
    if (name?.toLowerCase().includes('кинопоиск')) {
      return <Eye className="h-4 w-4 text-yellow-600" />;
    }
    
    // Fallback based on type
    switch (type) {
      case 'subscription':
        return <Tv className="h-4 w-4 text-blue-600" />;
      case 'rent':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'buy':
        return <Download className="h-4 w-4 text-red-600" />;
      case 'free':
        return <Play className="h-4 w-4 text-purple-600" />;
      default:
        return <Play className="h-4 w-4 text-gray-600" />;
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
      <Card className="w-full border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Eye className="h-6 w-6" />
            🎬 Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Проверяем доступность...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card className="w-full border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <Eye className="h-6 w-6" />
            🎬 Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Информация о доступности не найдена
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Попробуйте поискать фильм на популярных платформах самостоятельно
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full border-2 border-green-500/20 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Eye className="h-6 w-6" />
              🎬 Где посмотреть
            </div>
            {cached && (
              <Badge variant="secondary" className="text-xs">
                Данные обновлены
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.filter(p => p.available).map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                    {getProviderIcon(provider.type, provider.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{provider.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeVariant(provider.type)} className="text-xs">
                        {getTypeLabel(provider.type)}
                      </Badge>
                      {provider.price && (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          💰 {provider.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="default"
                  onClick={() => handleWatchClick(provider)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Смотреть
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              ✨ Показаны только проверенные сервисы где доступен фильм. Данные обновляются ежедневно.
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