import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Star, Play } from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

interface SimilarSectionProps {
  items: (TMDbMovie | TMDbTVShow)[];
  title: string;
  type: 'movie' | 'tv';
}

function SimilarMovieCard({ item, type }: { item: TMDbMovie | TMDbTVShow; type: 'movie' | 'tv' }) {
  const navigate = useNavigate();
  const tmdbClient = getTMDbClient();
  
  const posterUrl = tmdbClient.getPosterURL(item.poster_path, 'w342');
  const title = type === 'movie' ? (item as TMDbMovie).title : (item as TMDbTVShow).name;
  const releaseDate = type === 'movie' ? (item as TMDbMovie).release_date : (item as TMDbTVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClick}>
      <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {year && <span>{year}</span>}
          {item.vote_average > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SimilarSection({ items, title, type }: SimilarSectionProps) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {items.slice(0, 20).map((item) => (
              <div key={item.id} className="flex-shrink-0 w-48">
                <SimilarMovieCard item={item} type={type} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}