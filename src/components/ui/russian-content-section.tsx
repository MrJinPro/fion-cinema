import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { MovieCard } from './movie-card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';

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

  return (
    <div className="space-y-12">
      {/* TMDB Russian Movies */}
      {russianMovies && (
        <>
          {russianMovies.popular && russianMovies.popular.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Популярные российские фильмы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {russianMovies.popular.map((movie) => (
                    <div key={movie.id} onClick={() => handleMovieClick(movie.id)}>
                      <MovieCard
                        item={movie}
                        type="movie"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {russianMovies.classics && russianMovies.classics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Классика российского кино</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {russianMovies.classics.map((movie) => (
                    <div key={movie.id} onClick={() => handleMovieClick(movie.id)}>
                      <MovieCard
                        item={movie}
                        type="movie"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {russianMovies.modern && russianMovies.modern.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Современные российские фильмы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {russianMovies.modern.map((movie) => (
                    <div key={movie.id} onClick={() => handleMovieClick(movie.id)}>
                      <MovieCard
                        item={movie}
                        type="movie"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Kinopoisk Premieres */}
      {kinopoiskPremieres && kinopoiskPremieres.docs && kinopoiskPremieres.docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Премьеры российского кино</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {kinopoiskPremieres.docs.map((movie) => (
                <div key={movie.id} onClick={() => handleKinopoiskClick(movie.id)}>
                  <KinopoiskMovieCard
                    movie={movie}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kinopoisk New Releases */}
      {kinopoiskNew && kinopoiskNew.docs && kinopoiskNew.docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Новинки российского кино</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {kinopoiskNew.docs.map((movie) => (
                <div key={movie.id} onClick={() => handleKinopoiskClick(movie.id)}>
                  <KinopoiskMovieCard
                    movie={movie}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No content message */}
      {(!russianMovies || (
        (!russianMovies.popular || russianMovies.popular.length === 0) &&
        (!russianMovies.classics || russianMovies.classics.length === 0) &&
        (!russianMovies.modern || russianMovies.modern.length === 0)
      )) && 
      (!kinopoiskPremieres || !kinopoiskPremieres.docs || kinopoiskPremieres.docs.length === 0) &&
      (!kinopoiskNew || !kinopoiskNew.docs || kinopoiskNew.docs.length === 0) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Фильмы в данной категории временно недоступны. Попробуйте позже.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}