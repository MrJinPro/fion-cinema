import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

interface MovieCardProps {
  item: TMDbMovie | TMDbTVShow;
  type: 'movie' | 'tv';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPlay?: () => void;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  type,
  isFavorite = false,
  onToggleFavorite,
  onPlay,
  className,
}) => {
  const title = type === 'movie' ? (item as TMDbMovie).title : (item as TMDbTVShow).name;
  const releaseDate = type === 'movie' 
    ? (item as TMDbMovie).release_date 
    : (item as TMDbTVShow).first_air_date;
  
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  return (
    <Card className={cn(
      "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-neon hover-neon-primary",
      className
    )}>
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Градиентный оверлей */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Действия при наведении */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {onPlay && (
            <Button
              size="lg"
              variant="secondary"
              className="bg-primary/90 text-primary-foreground hover:bg-primary hover-neon-primary"
              onClick={onPlay}
            >
              <Play className="mr-2 h-5 w-5" />
              Смотреть
            </Button>
          )}
        </div>

        {/* Кнопка избранного */}
        {onToggleFavorite && (
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-all duration-300 group-hover:opacity-100",
              isFavorite && "opacity-100 bg-primary text-primary-foreground hover-neon-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        )}

        {/* Рейтинг */}
        {item.vote_average > 0 && (
          <Badge 
            variant="secondary"
            className="absolute top-2 left-2 bg-black/80 text-white border-none"
          >
            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
            {title}
          </h3>
          
          {year && (
            <p className="text-xs text-muted-foreground">
              {year}
            </p>
          )}

          {item.genre_ids && item.genre_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.genre_ids.slice(0, 2).map((genreId) => (
                <Badge
                  key={genreId}
                  variant="outline"
                  className="text-xs border-border/50 text-muted-foreground"
                >
                  Genre {genreId}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};