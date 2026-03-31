import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieSkeleton } from '@/components/ui/movie-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Search as SearchIcon, X } from 'lucide-react';
import { TMDbMovie, TMDbTVShow, TMDbGenre } from '@/lib/tmdb';
import { useSearchMulti, useMovieGenres, useTVGenres, useDiscoverMovies, useDiscoverTVShows } from '@/hooks/useTMDbApi';
import { SearchTabs } from '@/components/ui/search-tabs';
import { SEOHead } from '@/components/seo/SEOHead';
import { AdSlot } from '@/components/ui/ad-slot';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Фильтры
  const [mediaType, setMediaType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState('');
  const [year, setYear] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Получаем жанры из API
  const { data: movieGenresData } = useMovieGenres();
  const { data: tvGenresData } = useTVGenres();
  
  // Объединяем жанры фильмов и сериалов
  const allGenres = [
    ...(movieGenresData?.genres || []),
    ...(tvGenresData?.genres || [])
  ].filter((genre, index, array) => 
    array.findIndex(g => g.id === genre.id) === index
  );

  // API запросы для поиска
  const searchQuery = searchValue.trim();
  const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchMulti(
    searchQuery, 
    currentPage
  );

  // Prepare filters for discover endpoints
  const discoverFilters = {
    page: currentPage,
    with_genres: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
    vote_average_gte: minRating ? parseFloat(minRating) : undefined,
    sort_by: sortBy,
    ...(mediaType === 'movie' ? {
      primary_release_year: year ? parseInt(year) : undefined
    } : {
      first_air_date_year: year ? parseInt(year) : undefined
    })
  };

  const { data: discoverMoviesData, isLoading: discoverMoviesLoading } = useDiscoverMovies(
    mediaType === 'movie' && !searchQuery ? discoverFilters : {}
  );
  
  const { data: discoverTVData, isLoading: discoverTVLoading } = useDiscoverTVShows(
    mediaType === 'tv' && !searchQuery ? discoverFilters : {}
  );

  const isLoading = searchLoading || discoverMoviesLoading || discoverTVLoading;
  
  // Определяем результаты для отображения
  let results: (TMDbMovie | TMDbTVShow)[] = [];
  let totalPages = 1;
  
  if (searchQuery) {
    // Показываем результаты поиска, фильтруем только фильмы и сериалы
    results = (searchData?.results || []).filter((item): item is TMDbMovie | TMDbTVShow => 
      'title' in item || 'name' in item
    );
    totalPages = searchData?.total_pages || 1;
  } else {
    // Показываем результаты discovery
    if (mediaType === 'movie' && discoverMoviesData) {
      results = discoverMoviesData.results;
      totalPages = discoverMoviesData.total_pages;
    } else if (mediaType === 'tv' && discoverTVData) {
      results = discoverTVData.results;
      totalPages = discoverTVData.total_pages;
    }
  }

  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    
    if (query) {
      setSearchValue(query);
    }
    
    if (type) {
      setMediaType(type);
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams);
    
    if (mediaType !== 'all') {
      params.set('type', mediaType);
    } else {
      params.delete('type');
    }
    
    if (selectedGenres.length > 0) {
      params.set('genres', selectedGenres.join(','));
    } else {
      params.delete('genres');
    }
    
    if (year) {
      params.set('year', year);
    } else {
      params.delete('year');
    }
    
    if (minRating) {
      params.set('rating', minRating);
    } else {
      params.delete('rating');
    }
    
    params.set('sort', sortBy);
    
    setSearchParams(params);
    
    // Сбрасываем страницу при изменении фильтров
    setCurrentPage(1);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setMediaType('all');
    setSortBy('popularity.desc');
    setMinRating('');
    setYear('');
    setSelectedGenres([]);
    
    const params = new URLSearchParams();
    if (searchValue) {
      params.set('q', searchValue);
    }
    setSearchParams(params);
  };

  const getItemType = (item: TMDbMovie | TMDbTVShow): 'movie' | 'tv' => {
    return 'title' in item ? 'movie' : 'tv';
  };

  const handleItemClick = (item: TMDbMovie | TMDbTVShow) => {
    const type = getItemType(item);
    navigate(`/${type}/${item.id}`);
  };

  // SEO данные для страницы поиска
  const searchStructuredData = searchValue ? {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": `https://vion.app/search?q=${encodeURIComponent(searchValue)}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": results.length,
      "itemListElement": results.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": getItemType(item) === 'movie' ? "Movie" : "TVSeries",
          "name": 'title' in item ? item.title : item.name,
          "description": item.overview,
          "image": `https://image.tmdb.org/t/p/w500${item.poster_path}`
        }
      }))
    }
  } : undefined;

  const seoTitle = searchValue 
    ? `Поиск "${searchValue}" - Результаты поиска фильмов и сериалов`
    : 'Поиск фильмов и сериалов - Каталог кино';
  
  const seoDescription = searchValue 
    ? `Результаты поиска по запросу "${searchValue}". Найдено ${results.length} фильмов и сериалов. Смотрите онлайн в HD качестве.`
    : 'Поиск и каталог фильмов и сериалов. Найдите любой фильм или сериал с помощью удобных фильтров по жанрам, году, рейтингу.';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`поиск фильмов, поиск сериалов, каталог кино, ${searchValue ? `${searchValue}, ` : ''}фильмы онлайн`}
        canonicalUrl={`https://vion.app/search${searchValue ? `?q=${encodeURIComponent(searchValue)}` : ''}`}
        structuredData={searchStructuredData}
        noIndex={!searchValue} // Не индексируем пустую страницу поиска
      />
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main className="container px-4 py-8">
        <div className="mb-6">
          <AdSlot placement="search" format="banner" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фильтры */}
          <aside className="lg:w-80">
            <Card className="sticky top-24 bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Фильтры
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? 'Скрыть' : 'Показать'}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Тип контента */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Тип контента</Label>
                  <Select value={mediaType} onValueChange={setMediaType}>
                    <SelectTrigger className="mt-2 bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всё</SelectItem>
                      <SelectItem value="movie">Фильмы</SelectItem>
                      <SelectItem value="tv">Сериалы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Сортировка */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Сортировка</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-2 bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity.desc">По популярности (убыв.)</SelectItem>
                      <SelectItem value="popularity.asc">По популярности (возр.)</SelectItem>
                      <SelectItem value="vote_average.desc">По рейтингу (убыв.)</SelectItem>
                      <SelectItem value="vote_average.asc">По рейтингу (возр.)</SelectItem>
                      <SelectItem value="release_date.desc">По дате (новые)</SelectItem>
                      <SelectItem value="release_date.asc">По дате (старые)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Минимальный рейтинг */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Минимальный рейтинг</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    placeholder="Например: 7.0"
                    className="mt-2 bg-background border-border/50"
                  />
                </div>

                {/* Год */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Год</Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Например: 2024"
                    className="mt-2 bg-background border-border/50"
                  />
                </div>

                {/* Жанры */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Жанры</Label>
                  <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {allGenres.map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={selectedGenres.includes(String(genre.id)) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors text-xs ${
                          selectedGenres.includes(String(genre.id))
                            ? "bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border-border/50 hover:border-primary hover:text-primary"
                        }`}
                        onClick={() => toggleGenre(String(genre.id))}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleFilterChange}
                    className="flex-1 hover-neon-primary"
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Применить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Результаты поиска */}
          <div className="flex-1">
            {/* Заголовок результатов */}
            <div className="mb-6">
              {searchValue ? (
                <h1 className="text-2xl font-bold text-foreground">
                  Результаты поиска: "{searchValue}"
                </h1>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  Поиск фильмов и сериалов
                </h1>
              )}
            </div>

            {/* Search Tabs with World and Russian content */}
            <SearchTabs 
              searchQuery={searchValue}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            {!isLoading && results.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {results.map((item) => (
                    <MovieCard
                      key={item.id}
                      item={item}
                      type={getItemType(item)}
                    />
                  ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Назад
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={page === currentPage ? "hover-neon-primary" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Далее
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Пустые результаты */}
            {!isLoading && searchValue && results.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить запрос или настройки фильтров
                </p>
              </div>
            )}

            {/* Приглашение к поиску */}
            {!isLoading && !searchValue && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Начните поиск
                </h3>
                <p className="text-muted-foreground">
                  Введите название фильма или сериала в поисковую строку
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;