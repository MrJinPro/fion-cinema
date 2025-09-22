import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ExternalLink, Play, Download, Tv } from 'lucide-react';

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

  useEffect(() => {
    // Mock data for demonstration - in real implementation, this would be an API call
    const mockProviders: StreamingProvider[] = [
      {
        id: 'netflix',
        name: 'Netflix',
        logo: '/netflix-logo.png',
        type: 'subscription',
        url: 'https://netflix.com'
      },
      {
        id: 'apple-tv',
        name: 'Apple TV',
        logo: '/apple-tv-logo.png',
        type: 'rent',
        price: '299 ₽',
        url: 'https://tv.apple.com'
      },
      {
        id: 'google-play',
        name: 'Google Play',
        logo: '/google-play-logo.png',
        type: 'buy',
        price: '599 ₽',
        url: 'https://play.google.com'
      },
      {
        id: 'kinopoisk',
        name: 'Кинопоиск HD',
        logo: '/kinopoisk-logo.png',
        type: 'subscription',
        url: 'https://hd.kinopoisk.ru'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setProviders(mockProviders);
      setLoading(false);
    }, 1000);
  }, [movieId]);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Где посмотреть
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Информация о доступности не найдена
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Где посмотреть
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  {getProviderIcon(provider.type)}
                </div>
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={getTypeVariant(provider.type)} className="text-xs">
                      {getTypeLabel(provider.type)}
                    </Badge>
                    {provider.price && (
                      <span className="text-sm font-medium text-primary">
                        {provider.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="flex items-center gap-2"
              >
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Смотреть
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Данные о доступности предоставлены партнёрами. Цены и доступность могут изменяться.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}