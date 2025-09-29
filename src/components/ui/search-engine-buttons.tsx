import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Search, Globe } from 'lucide-react';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

interface SearchEngineButtonsProps {
  title: string;
  year?: number;
  type: 'movie' | 'tv';
  seasons?: number;
}

interface SearchEngine {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (query: string) => string;
}

const searchEngines: SearchEngine[] = [
  {
    name: 'Google',
    icon: <Search className="h-4 w-4" />,
    color: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`
  },
  {
    name: 'Яндекс',
    icon: <Search className="h-4 w-4" />,
    color: 'bg-red-500 hover:bg-red-600',
    getUrl: (query) => `https://yandex.ru/search/?text=${encodeURIComponent(query)}`
  },
  {
    name: 'Bing',
    icon: <Globe className="h-4 w-4" />,
    color: 'bg-cyan-600 hover:bg-cyan-700',
    getUrl: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
  },
  {
    name: 'DuckDuckGo',
    icon: <ExternalLink className="h-4 w-4" />,
    color: 'bg-orange-600 hover:bg-orange-700',
    getUrl: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
  }
];

export const SearchEngineButtons: React.FC<SearchEngineButtonsProps> = ({ 
  title, 
  year, 
  type, 
  seasons 
}) => {
  const { trackAction } = useBehaviorTracking();

  const generateSearchQuery = (engine: string): string => {
    if (type === 'movie') {
      switch (engine) {
        case 'Google':
          return `"Смотреть онлайн ${title} ${year || ''} фильм"`;
        case 'Яндекс':
          return `"Смотреть ${title} ${year || ''} онлайн фильм"`;
        case 'Bing':
          return `"${title} ${year || ''} смотреть онлайн"`;
        case 'DuckDuckGo':
          return `"${title} фильм ${year || ''} онлайн"`;
        default:
          return `Смотреть онлайн ${title} ${year || ''} фильм`;
      }
    } else {
      const seasonsText = seasons ? `${seasons} сезон${seasons > 1 ? 'а' : ''}` : 'все сезоны';
      switch (engine) {
        case 'Google':
          return `"Смотреть онлайн ${title} ${year || ''} сериал все сезоны"`;
        case 'Яндекс':
          return `"${title} сериал смотреть онлайн ${seasonsText}"`;
        case 'Bing':
          return `"${title} сериал ${year || ''} онлайн"`;
        case 'DuckDuckGo':
          return `"${title} сериал онлайн ${seasonsText}"`;
        default:
          return `Смотреть онлайн ${title} ${year || ''} сериал`;
      }
    }
  };

  const handleSearchClick = (engine: SearchEngine) => {
    const query = generateSearchQuery(engine.name);
    const url = engine.getUrl(query);
    
    // Track the search action
    trackAction({
      action_type: 'search_external',
      content_type: type,
      metadata: {
        search_engine: engine.name,
        content_title: title,
        query: query
      }
    });

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Где смотреть
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Найдите {type === 'movie' ? 'фильм' : 'сериал'} в интернете с помощью поисковых систем
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {searchEngines.map((engine) => (
            <Button
              key={engine.name}
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick(engine)}
              className={`flex items-center gap-2 ${engine.color} text-white border-0 transition-all duration-200 hover:scale-105`}
            >
              {engine.icon}
              <span className="text-xs font-medium">{engine.name}</span>
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Поиск откроется в новой вкладке
        </p>
      </CardContent>
    </Card>
  );
};