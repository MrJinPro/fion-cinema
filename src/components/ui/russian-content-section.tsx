import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { MovieCard } from './movie-card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';
import { AutoCarousel } from './auto-carousel';
import { useRussianMovies } from '@/hooks/useRussianMovies';
import { useKinopoiskPremieres, useKinopoiskNewReleases } from '@/hooks/useKinopoisk';
import { MovieSkeleton } from './movie-skeleton';
import { Alert, AlertDescription } from './alert';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function RussianContentSection() {
  const navigate = useNavigate();
  const {
    data: russianMovies,
    isLoading: tmdbLoading
  } = useRussianMovies();
  const {
    data: kinopoiskPremieres,
    isLoading: premieresLoading
  } = useKinopoiskPremieres();
  const {
    data: kinopoiskNew,
    isLoading: newLoading
  } = useKinopoiskNewReleases();
  const handleMovieClick = (id: number) => {
    navigate(`/movie/${id}`);
  };
  const handleKinopoiskClick = (id: number) => {
    // For now, we can try to search for this movie in TMDB
    // In future, we could create a dedicated Kinopoisk detail page
    navigate(`/search?q=${id}`);
  };
  if (tmdbLoading && premieresLoading && newLoading) {
    return <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({
          length: 12
        }).map((_, i) => <MovieSkeleton key={i} />)}
        </div>
      </div>;
  }
  return;
}