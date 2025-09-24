import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { MovieCard } from './movie-card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';
import { AutoCarousel } from './auto-carousel';
import { useRussianMovies, useRussianTrending } from '@/hooks/useRussianMovies';
import { useKinopoiskPremieres, useKinopoiskNewReleases } from '@/hooks/useKinopoisk';
import { MovieSkeleton } from './movie-skeleton';
import { Alert, AlertDescription } from './alert';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RussianContentSection() {
  const navigate = useNavigate();
  const { data: russianMovies, isLoading: tmdbLoading } = useRussianMovies();
  const { data: russianTrending, isLoading: trendingLoading } = useRussianTrending();
  const { data: kinopoiskPremieres, isLoading: premieresLoading } = useKinopoiskPremieres();
  const { data: kinopoiskNew, isLoading: newLoading } = useKinopoiskNewReleases();

  const handleMovieClick = (id: number) => {
    navigate(`/movie/${id}`);
  };

  const handleKinopoiskClick = (id: number) => {
    // For now, we can try to search for this movie in TMDB
    // In future, we could create a dedicated Kinopoisk detail page
    navigate(`/search?q=${id}`);
  };

  if (tmdbLoading && premieresLoading && trendingLoading && newLoading) {
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
    <div className="space-y-8">
      <Alert className="bg-info/10 border-info/20">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Русский контент собран из нескольких источников: TMDB (международная база) и Кинопоиск.dev (российская база данных)
        </AlertDescription>
      </Alert>

      {/* TMDB Russian Content */}
      {russianTrending?.results && russianTrending.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient-primary">Популярные российские фильмы</CardTitle>
          </CardHeader>
          <CardContent>
            <AutoCarousel
              title=""
              items={russianTrending.results}
              type="movie"
              isLoading={trendingLoading}
              onItemClick={(id) => handleMovieClick(id)}
              autoPlayInterval={5000}
            />
          </CardContent>
        </Card>
      )}

      {/* Kinopoisk Premieres */}
      {kinopoiskPremieres?.docs && kinopoiskPremieres.docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient-orange">Российские премьеры (Кинопоиск)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {kinopoiskPremieres.docs.slice(0, 12).map((movie) => (
                <KinopoiskMovieCard
                  key={movie.id}
                  movie={movie}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Russian Cinema */}
      {russianMovies?.modern && russianMovies.modern.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient-blue">Современное российское кино</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {russianMovies.modern.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kinopoisk New Releases */}
      {kinopoiskNew?.docs && kinopoiskNew.docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient-primary">Новинки российского кино</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {kinopoiskNew.docs.slice(0, 12).map((movie) => (
                <KinopoiskMovieCard
                  key={movie.id}
                  movie={movie}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classic Russian Cinema */}
      {russianMovies?.classics && russianMovies.classics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient-orange">Классика советского кино</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {russianMovies.classics.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show message if no content found */}
      {!tmdbLoading && !premieresLoading && !trendingLoading && !newLoading && 
       (!russianMovies?.modern?.length && !russianMovies?.classics?.length && 
        !kinopoiskPremieres?.docs?.length && !kinopoiskNew?.docs?.length && 
        !russianTrending?.results?.length) && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Не удалось загрузить российский контент. Попробуйте обновить страницу.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}