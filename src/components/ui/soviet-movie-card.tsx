import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovietMovie } from '@/hooks/useSovietClassics';
import { AddToCollectionDialog } from '@/components/ui/add-to-collection-dialog';

interface SovietMovieCardProps {
  movie: SovietMovie;
  onClick?: () => void;
  className?: string;
}

export const SovietMovieCard: React.FC<SovietMovieCardProps> = ({
  movie,
  onClick,
  className,
}) => {
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCollectionDialog(true);
  };

  // Конвертируем SovietMovie в формат TMDbMovie для AddToCollectionDialog
  const convertToTMDbFormat = (sovietMovie: SovietMovie) => ({
    id: sovietMovie.id,
    title: sovietMovie.title,
    original_title: sovietMovie.original_title || sovietMovie.title,
    poster_path: sovietMovie.poster_path || '',
    backdrop_path: '',
    genre_ids: [],
    overview: sovietMovie.overview || '',
    release_date: sovietMovie.release_date || `${sovietMovie.year}-01-01`,
    vote_average: sovietMovie.vote_average || 8.0,
    vote_count: 1000,
    popularity: 100,
    adult: false,
    original_language: 'ru',
    video: false
  });

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="relative aspect-[2/3]">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <div className="text-center p-4">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{movie.title}</p>
                </div>
              </div>
            )}
            
            {/* Оверлей с информацией */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {movie.vote_average && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {movie.vote_average.toFixed(1)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-white border-white">
                      {movie.year}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddToCollection}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {movie.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {movie.year} • Советский фильм
            </p>
          </div>
        </CardContent>
      </Card>

      <AddToCollectionDialog
        isOpen={showCollectionDialog}
        onClose={() => setShowCollectionDialog(false)}
        item={convertToTMDbFormat(movie)}
        mediaType="movie"
      />
    </>
  );
};