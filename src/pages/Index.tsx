import React, { useState, useEffect } from 'react';
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

const Index = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Демо данные для демонстрации интерфейса
  const demoMovies: TMDbMovie[] = [
    {
      id: 1,
      title: "Дюна: Часть вторая",
      original_title: "Dune: Part Two",
      overview: "Пол Атрейдес объединяется с Чани и фрименами, чтобы отомстить заговорщикам, уничтожившим его семью.",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      backdrop_path: "/xvzjJYYRAbt6pjJgHAZLpcE2z9B.jpg",
      release_date: "2024-02-28",
      genre_ids: [878, 12, 28],
      vote_average: 8.2,
      vote_count: 2847,
      popularity: 2841.677,
      adult: false,
      video: false,
      original_language: "en"
    },
    {
      id: 2,
      title: "Оппенгеймер",
      original_title: "Oppenheimer",
      overview: "История американского учёного Роберта Оппенгеймера и его роли в разработке атомной бомбы.",
      poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      release_date: "2023-07-19",
      genre_ids: [18, 36],
      vote_average: 8.1,
      vote_count: 6429,
      popularity: 1243.784,
      adult: false,
      video: false,
      original_language: "en"
    },
    // Добавляем больше демо фильмов
    {
      id: 3,
      title: "Барби",
      original_title: "Barbie",
      overview: "Барби и Кен весело проводят время в красочном и казалось бы идеальном мире Барбиленд.",
      poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      backdrop_path: "/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg",
      release_date: "2023-07-19",
      genre_ids: [35, 12, 14],
      vote_average: 7.1,
      vote_count: 5328,
      popularity: 2156.434,
      adult: false,
      video: false,
      original_language: "en"
    },
    {
      id: 4,
      title: "Стражи Галактики. Том 3",
      original_title: "Guardians of the Galaxy Vol. 3",
      overview: "Питер Квилл всё ещё не может оправиться от потери Гаморы.",
      poster_path: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
      backdrop_path: "/5YZbUmjbMa3ClvSW1Wj3Ga9lxyf.jpg",
      release_date: "2023-05-03",
      genre_ids: [878, 12, 28],
      vote_average: 7.9,
      vote_count: 4234,
      popularity: 1876.123,
      adult: false,
      video: false,
      original_language: "en"
    }
  ];

  const demoTVShows: TMDbTVShow[] = [
    {
      id: 5,
      name: "Последние из нас",
      original_name: "The Last of Us",
      overview: "Спустя 20 лет после разрушения современной цивилизации Джоэл должен провести 14-летнюю Элли из карантинной зоны.",
      poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      first_air_date: "2023-01-15",
      genre_ids: [18, 878, 10765],
      vote_average: 8.7,
      vote_count: 6543,
      popularity: 2456.789,
      origin_country: ["US"],
      original_language: "en"
    },
    {
      id: 6,
      name: "Дом Дракона",
      original_name: "House of the Dragon",
      overview: "Приквел к «Игре престолов», рассказывающий историю дома Таргариенов.",
      poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
      backdrop_path: "/etj8E2o0Bud0HkONVQPjyCkIvJu.jpg",
      first_air_date: "2022-08-21",
      genre_ids: [18, 10765, 80],
      vote_average: 8.4,
      vote_count: 4321,
      popularity: 1987.456,
      origin_country: ["US"],
      original_language: "en"
    }
  ];

  useEffect(() => {
    // Имитируем загрузку данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
            ) : (
              demoMovies.slice(0, 6).map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                  onPlay={() => handleMovieClick(movie.id, 'movie')}
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={i} />
              ))
            ) : (
              demoMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                  onPlay={() => handleMovieClick(movie.id, 'movie')}
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={i} />
              ))
            ) : (
              demoTVShows.map((show) => (
                <MovieCard
                  key={show.id}
                  item={show}
                  type="tv"
                  onPlay={() => handleMovieClick(show.id, 'tv')}
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
