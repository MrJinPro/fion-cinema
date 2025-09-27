import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Heart, Plus } from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { PosterImage } from '@/components/ui/poster-image';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

interface FeaturedMovieProps {
  item: TMDbMovie | TMDbTVShow;
  onItemClick: (id: number, type: 'movie' | 'tv') => void;
}

export const FeaturedMovie: React.FC<FeaturedMovieProps> = ({ item, onItemClick }) => {
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const tmdbClient = getTMDbClient();
  
  const type = 'title' in item ? 'movie' : 'tv';
  const title = 'title' in item ? item.title : item.name;
  const releaseYear = 'release_date' in item 
    ? new Date(item.release_date).getFullYear()
    : new Date(item.first_air_date).getFullYear();
  
  const isFavorite = favorites.some(fav => fav.tmdb_id === item.id && fav.media_type === type);
  
  const posterUrl = item.poster_path 
    ? tmdbClient.getPosterURL(item.poster_path, 'w500')
    : '';

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    if (isFavorite) {
      await removeFromFavorites({ tmdbId: item.id, mediaType: type });
    } else {
      await addToFavorites({ item, mediaType: type });
    }
  };

  const handleItemClick = () => {
    onItemClick(item.id, type);
  };

  return (
    <div className="bg-card rounded-xl p-6 hover-neon-primary transition-neon animate-scale-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Poster */}
        <div className="flex-shrink-0">
          <div className="relative group w-48 h-72">
            <PosterImage
              src={posterUrl}
              alt={title}
              className="rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-black/60 text-white border-white/20"
                onClick={handleItemClick}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange text-orange-foreground">
                Фильм дня
              </Badge>
              <span className="text-muted-foreground">{releaseYear}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gradient-primary hover:text-gradient-orange transition-all duration-300 cursor-pointer"
                onClick={handleItemClick}>
              {title}
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.vote_count.toLocaleString()} голосов
              </span>
            </div>
          </div>
          
          {item.overview && (
            <p className="text-muted-foreground leading-relaxed line-clamp-4">
              {item.overview}
            </p>
          )}
          
          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleItemClick}
              className="bg-primary hover:bg-primary/90 hover-neon-primary transition-neon"
            >
              <Play className="w-4 h-4 mr-2" />
              Смотреть трейлер
            </Button>
            
            {user && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`hover-neon-accent transition-neon ${
                    isFavorite ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="hover-neon-info transition-neon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <Button 
              variant="outline"
              onClick={handleItemClick}
              className="hover-neon-orange transition-neon"
            >
              Подробнее
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};