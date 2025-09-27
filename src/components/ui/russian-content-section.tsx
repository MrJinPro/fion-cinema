import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { SovietMovieCard } from './soviet-movie-card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';
import { useSovietClassics } from '@/hooks/useSovietClassics';
import { useModernRussianFilms } from '@/hooks/useModernRussianFilms';
import { MovieSkeleton } from './movie-skeleton';
import { Alert, AlertDescription } from './alert';
import { Info, Film, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddToCollectionDialog } from './add-to-collection-dialog';
import { Button } from './button';
export function RussianContentSection() {
  const navigate = useNavigate();
  const [selectedKinopoiskMovie, setSelectedKinopoiskMovie] = useState<any>(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  
  const {
    data: sovietClassics,
    isLoading: sovietLoading
  } = useSovietClassics();
  const {
    data: modernFilms,
    isLoading: modernLoading
  } = useModernRussianFilms();
  const handleMovieClick = (id: number) => {
    navigate(`/movie/${id}`);
  };
  
  const handleKinopoiskClick = (id: number) => {
    navigate(`/search?q=${id}`);
  };

  const handleAddToCollection = (movie: any) => {
    setSelectedKinopoiskMovie(movie);
    setShowCollectionDialog(true);
  };

  // Конвертируем Kinopoisk фильм в TMDb формат
  const convertKinopoiskToTMDb = (movie: any) => {
    if (!movie) {
      return {
        id: 0,
        title: 'Неизвестный фильм',
        original_title: '',
        poster_path: '',
        backdrop_path: '',
        genre_ids: [],
        overview: '',
        release_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        adult: false,
        original_language: 'ru',
        video: false
      };
    }
    
    return {
      id: movie.id || 0,
      title: movie.name || movie.title || 'Неизвестный фильм',
      original_title: movie.alternativeName || movie.name || movie.title || '',
      poster_path: movie.poster?.url || '',
      backdrop_path: '',
      genre_ids: [],
      overview: movie.description || '',
      release_date: movie.year ? `${movie.year}-01-01` : '',
      vote_average: movie.rating?.kp || 0,
      vote_count: 1000,
      popularity: 100,
      adult: false,
      original_language: 'ru',
      video: false
    };
  };
  if (sovietLoading && modernLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-12">
      {/* Легенды советского кино */}
      {sovietClassics && sovietClassics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Легенды советского кино
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sovietClassics.map(movie => (
                <SovietMovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Популярные российские фильмы 2023-2025 */}
      {modernFilms && modernFilms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Популярные российские фильмы 2023-2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {modernFilms.map(movie => (
                <div key={movie.id} className="relative group">
                  <div 
                    onClick={() => handleKinopoiskClick(movie.id)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <KinopoiskMovieCard movie={movie} />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCollection(movie);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сообщение об отсутствии контента */}
      {(!sovietClassics || sovietClassics.length === 0) && 
       (!modernFilms || modernFilms.length === 0) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Фильмы в данной категории временно недоступны. Попробуйте позже.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog для добавления Kinopoisk фильмов в коллекцию */}
      {selectedKinopoiskMovie && (
        <AddToCollectionDialog
          isOpen={showCollectionDialog}
          onClose={() => setShowCollectionDialog(false)}
          item={convertKinopoiskToTMDb(selectedKinopoiskMovie)}
          mediaType="movie"
        />
      )}
    </div>
  );
}