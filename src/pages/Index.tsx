import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieSkeleton } from '@/components/ui/movie-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp, Star, Calendar } from 'lucide-react';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import { useTrending, usePopularMovies, usePopularTVShows } from '@/hooks/useTMDbApi';

const Index = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Получаем реальные данные из TMDb API
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useTrending('all', 'week');
  const { data: popularMoviesData, isLoading: popularMoviesLoading } = usePopularMovies();
  const { data: popularTVData, isLoading: popularTVLoading } = usePopularTVShows();

  const isLoading = trendingLoading || popularMoviesLoading || popularTVLoading;

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleMovieClick = (id: number, type: 'movie' | 'tv') => {
    navigate(`/${type}/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main className="container px-4 py-8">
        {/* Герой секция */}
        <section className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-primary p-8 text-center">
          <div className="relative z-10">
            <h1 className="mb-4 text-4xl font-bold md:text-6xl text-white">
              Добро пожаловать в{' '}
              <span className="text-gradient-orange">ViOn</span>
            </h1>
            <p className="mb-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Откройте мир кинематографа. Находите фильмы и сериалы, создавайте списки и 
              делитесь впечатлениями с друзьями.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 hover-neon-primary"
              onClick={() => navigate('/search')}
            >
              <Play className="mr-2 h-5 w-5" />
              Начать поиск
            </Button>
          </div>
          
          {/* Неоновые эффекты */}
          <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-info/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-40 w-40 bg-accent/20 rounded-full blur-3xl" />
        </section>

        {/* В тренде */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              В тренде сегодня
            </h2>
            <Button variant="outline" onClick={() => navigate('/search')}>
              Смотреть всё
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={i} />
              ))
            ) : trendingError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Ошибка загрузки трендовых фильмов</p>
              </div>
            ) : (
              trendingData?.results.slice(0, 6).map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  type={'title' in item ? 'movie' : 'tv'}
                />
              ))
            )}
          </div>
        </section>

        {/* Популярные фильмы */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-6 w-6 text-orange" />
              Популярные фильмы
            </h2>
            <Button variant="outline" onClick={() => navigate('/search?type=movie')}>
              Все фильмы
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularMoviesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={i} />
              ))
            ) : (
              popularMoviesData?.results.slice(0, 6).map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                />
              ))
            )}
          </div>
        </section>

        {/* Популярные сериалы */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-accent" />
              Популярные сериалы
            </h2>
            <Button variant="outline" onClick={() => navigate('/search?type=tv')}>
              Все сериалы
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularTVLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={i} />
              ))
            ) : (
              popularTVData?.results.slice(0, 6).map((show) => (
                <MovieCard
                  key={show.id}
                  item={show}
                  type="tv"
                />
              ))
            )}
          </div>
        </section>

        {/* Статистика */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50 hover-neon-primary transition-neon">
              <CardHeader>
                <CardTitle className="text-primary">Фильмы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">500K+</div>
                <p className="text-muted-foreground">Фильмов в базе</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover-neon-accent transition-neon">
              <CardHeader>
                <CardTitle className="text-accent">Сериалы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">100K+</div>
                <p className="text-muted-foreground">Сериалов в каталоге</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover-neon-info transition-neon">
              <CardHeader>
                <CardTitle className="text-info">Актёры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">2M+</div>
                <p className="text-muted-foreground">Актёров и режиссёров</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
