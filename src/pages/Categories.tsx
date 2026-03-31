import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { MovieCard } from '@/components/ui/movie-card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar, 
  Film, 
  Star, 
  TrendingUp,
  Filter,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useCategoryFilters, type MovieFilter } from '@/hooks/useCategoryFilters';
import { useMovieGenres } from '@/hooks/useTMDbApi';
import { getTMDbClient } from '@/lib/tmdb';
import { useMoviePopulation } from '@/hooks/useMoviePopulation';
import { AdSlot } from '@/components/ui/ad-slot';

export const Categories = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedMovies, setAccumulatedMovies] = useState<any[]>([]);

  const { 
    getMoviesByYear, 
    getMoviesByGenre, 
    getFilteredMovies, 
    getAvailableYears,
    getCategoryStats 
  } = useCategoryFilters();

  const { data: genres } = useMovieGenres();
  const { data: availableYears } = getAvailableYears();
  const { data: categoryStats } = getCategoryStats();
  const { triggerAutoPopulation, checkDatabaseStatus } = useMoviePopulation();

  // Создаем фильтр на основе выбранных параметров
  console.log('Categories Debug:', { availableYears, genres: genres?.genres, selectedYear, selectedGenre });
  const filters: MovieFilter = {
    year: selectedYear,
    genre: selectedGenre,
    sortBy: sortBy as any,
    page: currentPage
  };

  const { data: filteredMovies, isLoading, error } = getFilteredMovies(filters);

  // Накапливаем результаты при пагинации ("Загрузить ещё"), чтобы не показывать всегда только 20 карточек
  React.useEffect(() => {
    if (!filteredMovies?.results) return;

    setAccumulatedMovies((prev) => {
      const nextBatch = filteredMovies.results;

      if ((filteredMovies.page || 1) <= 1) {
        return nextBatch;
      }

      const seen = new Set(prev.map((m) => m?.id));
      const deduped = nextBatch.filter((m: any) => !seen.has(m?.id));
      return [...prev, ...deduped];
    });
  }, [filteredMovies?.results, filteredMovies?.page]);

  // При смене фильтров сбрасываем накопленный список
  React.useEffect(() => {
    setAccumulatedMovies([]);
  }, [selectedYear, selectedGenre, sortBy]);

  // Автоматически проверяем состояние базы и запускаем пополнение при необходимости
  React.useEffect(() => {
    const autoPopulateIfNeeded = async () => {
      const status = await checkDatabaseStatus();
      if (status.needsPopulation) {
        console.log('🔄 Database needs population, triggering auto-population...');
        await triggerAutoPopulation();
      }
    };

    autoPopulateIfNeeded();
  }, [checkDatabaseStatus, triggerAutoPopulation]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  const clearFilters = () => {
    setSelectedYear(undefined);
    setSelectedGenre(undefined);
    setSortBy('popularity.desc');
    setCurrentPage(1);
  };

  const loadMoreMovies = () => {
    setCurrentPage(prev => prev + 1);
  };

  const tmdbClient = getTMDbClient();

  // Быстрые категории
  const quickCategories = [
    {
      title: 'Популярные 2025',
      description: 'Самые популярные фильмы этого года',
      icon: TrendingUp,
      onClick: () => {
        setSelectedYear(2025);
        setSortBy('popularity.desc');
        setCurrentPage(1);
      }
    },
    {
      title: 'Высокорейтинговые',
      description: 'Фильмы с рейтингом 8+',
      icon: Star,
      onClick: () => {
        setSortBy('vote_average.desc');
        setCurrentPage(1);
      }
    },
    {
      title: 'Новинки 2024',
      description: 'Последние релизы прошлого года',
      icon: Clock,
      onClick: () => {
        setSelectedYear(2024);
        setSortBy('release_date.desc');
        setCurrentPage(1);
      }
    }
  ];

  return (
    <>
      <SEOHead 
        title="Категории фильмов - Каталог по годам и жанрам | Fion Cinema"
        description="Исследуйте фильмы по категориям: по годам, жанрам, рейтингу. Найдите идеальное кино для просмотра среди тысяч фильмов."
      />
      <Header onSearch={handleSearch} searchValue={searchInput} onSearchChange={setSearchInput} />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="container mx-auto px-4 py-8">
          <div className="cinema-surface rounded-lg p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">Каталог</h1>
                <p className="text-sm text-muted-foreground">Подберите фильм по году, жанру и популярности — как в афише кинотеатра</p>
              </div>
              <div className="max-w-md w-full">
                <AdSlot placement="categories" format="banner" />
              </div>
            </div>
          </div>

          {/* Заголовок и статистика */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Каталог фильмов</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Исследуйте коллекцию фильмов по категориям
            </p>
            {categoryStats && (
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <Badge variant="outline" className="text-sm">
                  <Film className="h-4 w-4 mr-1" />
                  {categoryStats.totalMovies.toLocaleString()} фильмов
                  {categoryStats.totalMovies < 1000 && (
                    <span className="ml-1 text-amber-600">• пополняется</span>
                  )}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {categoryStats.availableYears.length} лет
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  {categoryStats.recentMovies} новинок
                </Badge>
              </div>
            )}
          </div>

          {/* Быстрые категории */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={category.onClick}
                >
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Фильтры */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Год */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Год</label>
                  <Select 
                    value={selectedYear?.toString() || 'all'} 
                    onValueChange={(value) => {
                      setSelectedYear(value && value !== 'all' ? parseInt(value) : undefined);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все года" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все года</SelectItem>
                      {availableYears?.slice(0, 20)
                        .filter(year => year && typeof year === 'number' && year > 1800)
                        .map(year => {
                          const yearStr = year.toString();
                          console.log('Year SelectItem:', { year, yearStr });
                          return (
                            <SelectItem key={year} value={yearStr}>
                              {year}
                              {categoryStats?.yearCounts[year] && (
                                <span className="ml-2 text-muted-foreground">
                                  ({categoryStats.yearCounts[year]})
                                </span>
                              )}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Жанр */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Жанр</label>
                  <Select 
                    value={selectedGenre?.toString() || 'all'} 
                    onValueChange={(value) => {
                      setSelectedGenre(value && value !== 'all' ? parseInt(value) : undefined);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все жанры" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все жанры</SelectItem>
                      {genres?.genres
                        .filter(genre => genre.id && genre.id > 0 && genre.name && genre.name.trim() !== '')
                        .map(genre => {
                          const genreIdStr = genre.id.toString();
                          console.log('Genre SelectItem:', { genreId: genre.id, genreIdStr, genreName: genre.name });
                          return (
                            <SelectItem key={genre.id} value={genreIdStr}>
                              {genre.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Сортировка */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Сортировка</label>
                  <Select 
                    value={sortBy} 
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity.desc">По популярности</SelectItem>
                      <SelectItem value="vote_average.desc">По рейтингу</SelectItem>
                      <SelectItem value="release_date.desc">По дате выхода</SelectItem>
                      <SelectItem value="title.asc">По названию (А-Я)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Действия */}
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Результаты */}
          <div className="space-y-6">
            {/* Заголовок результатов */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {selectedYear || selectedGenre || sortBy !== 'popularity.desc' 
                  ? 'Результаты фильтрации'
                  : 'Все фильмы'
                }
              </h2>
              {filteredMovies && (
                <Badge variant="outline">
                  {filteredMovies.total_results?.toLocaleString() || filteredMovies.results.length} результатов
                </Badge>
              )}
            </div>

            {/* Сетка фильмов */}
            {isLoading ? (
              <div>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    {(categoryStats?.totalMovies || 0) < 100 
                      ? "Ищем фильмы в TMDB и сохраняем в базу..." 
                      : "Загружаем фильмы..."}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Ошибка загрузки фильмов
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Попробовать снова
                </Button>
              </div>
            ) : filteredMovies && accumulatedMovies.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {accumulatedMovies.map((movie) => (
                    <div key={movie.id} onClick={() => handleMovieClick(movie.id)}>
                      <MovieCard
                        item={movie}
                        type="movie"
                      />
                    </div>
                  ))}
                </div>

                {/* Кнопка "Загрузить еще" */}
                {filteredMovies.page < (filteredMovies.total_pages || 1) && (
                  <div className="text-center">
                    <Button 
                      onClick={loadMoreMovies}
                      disabled={isLoading}
                    >
                      Загрузить еще
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Фильмы не найдены
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};