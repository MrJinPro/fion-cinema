import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';
import { MovieSkeleton } from './movie-skeleton';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Info, Filter, Star, Calendar, Play, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useRussianMoviesModern,
  useRussianTVShows,
  useRussianMiniSeries,
  useRussianDocumentaries,
  useRussianTopRated,
  useRussianLatestReleases,
  useRussianByGenre,
  useRussianByProduction
} from '@/hooks/useRussianContentEnhanced';

const POPULAR_GENRES = [
  'драма', 'комедия', 'боевик', 'триллер', 'мелодрама', 
  'детектив', 'криминал', 'фантастика', 'ужасы', 'семейный'
];

export function RussianContentEnhanced() {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  
  const { data: modernMovies, isLoading: modernLoading } = useRussianMoviesModern();
  const { data: tvShows, isLoading: tvLoading } = useRussianTVShows();
  const { data: miniSeries, isLoading: miniLoading } = useRussianMiniSeries();
  const { data: documentaries, isLoading: docLoading } = useRussianDocumentaries();
  const { data: topRated, isLoading: topLoading } = useRussianTopRated();
  const { data: latestReleases, isLoading: latestLoading } = useRussianLatestReleases();
  const { data: genreMovies, isLoading: genreLoading } = useRussianByGenre(selectedGenre);
  const { data: productionMovies, isLoading: prodLoading } = useRussianByProduction();

  const handleKinopoiskClick = (id: number) => {
    navigate(`/search?q=${id}`);
  };

  const isAnyLoading = modernLoading || tvLoading || miniLoading || docLoading || topLoading || latestLoading;

  if (isAnyLoading) {
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
          Обновлённый каталог российского контента с улучшенными фильтрами и категориями. 
          Данные получены из базы Кинопоиск.dev для максимальной точности.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Новинки
          </TabsTrigger>
          <TabsTrigger value="movies" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Фильмы
          </TabsTrigger>
          <TabsTrigger value="series" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Сериалы
          </TabsTrigger>
          <TabsTrigger value="top" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Топ
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Документальные
          </TabsTrigger>
          <TabsTrigger value="genres" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Жанры
          </TabsTrigger>
        </TabsList>

        {/* Последние новинки */}
        <TabsContent value="new">
          {latestReleases?.docs && latestReleases.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Последние новинки российского кино
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Фильмы и сериалы, вышедшие за последние 6 месяцев
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {latestReleases.docs.slice(0, 18).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Современные фильмы */}
        <TabsContent value="movies">
          {modernMovies?.docs && modernMovies.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-blue flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Современные российские фильмы (2020-2025)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Лучшие российские фильмы последних лет
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {modernMovies.docs.slice(0, 24).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Сериалы */}
        <TabsContent value="series" className="space-y-6">
          {tvShows?.docs && tvShows.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-orange flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Российские сериалы
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Популярные российские сериалы 2020-2025
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {tvShows.docs.slice(0, 18).map((show) => (
                    <KinopoiskMovieCard
                      key={show.id}
                      movie={show}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {miniSeries?.docs && miniSeries.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-blue flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Российские мини-сериалы
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Качественные мини-сериалы с высоким рейтингом
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {miniSeries.docs.slice(0, 12).map((show) => (
                    <KinopoiskMovieCard
                      key={show.id}
                      movie={show}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Топ-рейтинг */}
        <TabsContent value="top">
          {topRated?.docs && topRated.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-primary flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Топ российских фильмов по рейтингу
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Фильмы с рейтингом 8+ на Кинопоиске
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {topRated.docs.slice(0, 18).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Документальные */}
        <TabsContent value="docs">
          {documentaries?.docs && documentaries.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-orange flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Российские документальные фильмы
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Лучшие документальные фильмы российских режиссёров
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {documentaries.docs.slice(0, 12).map((doc) => (
                    <KinopoiskMovieCard
                      key={doc.id}
                      movie={doc}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Жанры */}
        <TabsContent value="genres" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {POPULAR_GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                  className="capitalize"
                >
                  {genre}
                </Button>
              ))}
            </div>
            
            {selectedGenre && (
              <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                <Filter className="h-3 w-3" />
                Выбран жанр: {selectedGenre}
              </Badge>
            )}
          </div>

          {selectedGenre && genreMovies?.docs && genreMovies.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gradient-blue flex items-center gap-2 capitalize">
                  <Filter className="h-5 w-5" />
                  Российские фильмы жанра "{selectedGenre}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {genreMovies.docs.slice(0, 18).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedGenre && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Выберите жанр для просмотра российских фильмов
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Фильмы по продюсерским компаниям */}
      {productionMovies && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gradient-primary">Фильмы российских продюсерских компаний</h3>
          
          {productionMovies.centralPartnership?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Централ Партнершип</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {productionMovies.centralPartnership.slice(0, 12).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {productionMovies.enjoy?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enjoy Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {productionMovies.enjoy.slice(0, 12).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {productionMovies.art?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Арт Пикчерс</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {productionMovies.art.slice(0, 12).map((movie) => (
                    <KinopoiskMovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}