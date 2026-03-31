import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/components/ui/hero-banner';
import { FeaturedMovie } from '@/components/ui/featured-movie';
import { AutoCarousel } from '@/components/ui/auto-carousel';
import { PersonalizedSection } from '@/components/ui/personalized-section';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieSkeleton } from '@/components/ui/movie-skeleton';
import { Button } from '@/components/ui/button';
import { KinopoiskPremieres, KinopoiskNewReleases } from '@/components/ui/kinopoisk-sections';
import { RussianContentSection } from '@/components/ui/russian-content-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp, Star, Calendar } from 'lucide-react';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import { useTrending, usePopularMovies, usePopularTVShows, useNowPlayingMovies } from '@/hooks/useTMDbApi';
import { useMixedHeroContent } from '@/hooks/useMixedHeroContent';
import { PWAInstallPrompt } from '@/components/ui/pwa-install-prompt';
import { SEOHead } from '@/components/seo/SEOHead';
import { CuratedCollectionsSection } from '@/components/ui/curated-collections-section';
import { AdSlot } from '@/components/ui/ad-slot';
const Index = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Данные из API
  const {
    data: trending,
    isLoading: trendingLoading
  } = useTrending('all', 'week');
  const {
    data: popularMovies,
    isLoading: moviesLoading
  } = usePopularMovies();
  const {
    data: popularTVShows,
    isLoading: tvLoading
  } = usePopularTVShows();
  const {
    data: nowPlaying,
    isLoading: nowPlayingLoading
  } = useNowPlayingMovies();
  const {
    data: mixedHeroContent,
    isLoading: heroLoading
  } = useMixedHeroContent();
  const isLoading = trendingLoading || moviesLoading || tvLoading;
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  const handleMovieClick = (id: number, type: 'movie' | 'tv') => {
    navigate(`/${type}/${id}`);
  };

  // SEO данные для главной страницы
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FiOn - Русский Кино-каталог",
    "description": "Лучший кино-каталог на русском языке. Фильмы, сериалы, трейлеры, рецензии и персональные рекомендации.",
    "url": "https://fion.online",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fion.online/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": ["https://www.tiktok.com/@fion_cinema", "https://t.me/fion_cinema"]
  };
  return <div className="min-h-screen">
      <SEOHead title="FiOn - Русский Кино-каталог | Фильмы и Сериалы Онлайн" description="Откройте мир кино с FiOn! Популярные фильмы, новые сериалы, персональные рекомендации и подробная информация о фильмах на русском языке. Смотрите трейлеры, читайте рецензии." keywords="фильмы онлайн, сериалы, кинопоиск, русские фильмы, трейлеры, рецензии фильмов, новинки кино, популярные фильмы, рейтинг фильмов" canonicalUrl="https://vion.app" structuredData={homeStructuredData} />
      <div className="block sm:hidden px-4 py-2 bg-card/50 backdrop-blur-sm border-b border-accent/20">
        <p className="text-xs text-center text-muted-foreground">
          📱 Установите приложение
        </p>
      </div>
      <Header searchValue={searchValue} onSearchChange={setSearchValue} onSearch={handleSearch} />
      
      <main className="space-y-10 sm:space-y-12">
        <div className="container mx-auto px-2 sm:px-4 pt-4 sm:pt-6 space-y-4">
          <AdSlot placement="home_top" format="banner" />

          {/* Hero Banner (Screen) */}
          {mixedHeroContent && mixedHeroContent.length > 0 && <div className="cinema-screen">
              <HeroBanner items={mixedHeroContent} onItemClick={handleMovieClick} />
            </div>}

          <section className="cinema-surface rounded-lg">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold">
                  FiOn — кино‑каталог, который хочется листать
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Открывай подборки, сохраняй избранное, читай отзывы и находи, что посмотреть сегодня — без лишнего шума.
                  Чем активнее ты пользуешься каталогом, тем быстрее сервис растёт и становится лучше.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base leading-relaxed">
                  Наш следующий большой шаг — встроенный плеер прямо в FiOn.
                  Когда мы стабильно достигнем <span className="font-semibold">1000 активных зрителей в день</span>,
                  добавим просмотр фильмов внутри сервиса.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Пока что — пользуйся каталогом: добавляй в избранное, оценивай и делись находками.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto" onClick={() => navigate('/search')}>
                  Найти фильм
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/categories')}>
                  Открыть каталог
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="container mx-auto px-2 sm:px-4 space-y-8 sm:space-y-12">
          {/* Featured Movie */}
          {trending?.results && trending.results[0] && <div className="cinema-surface rounded-lg">
              <FeaturedMovie item={trending.results[0]} onItemClick={handleMovieClick} />
            </div>}


          {/* Персонализированная секция */}
          <div className="cinema-surface rounded-lg">
            <PersonalizedSection onItemClick={handleMovieClick} onNavigate={navigate} />
          </div>


          {/* Российский контент */}
          <section className="space-y-6 animate-stagger-1">
            <div className="cinema-surface rounded-lg">
              <RussianContentSection />
            </div>
          </section>

          {/* Kinopoisk.dev секции */}
          <div className="cinema-surface rounded-lg">
            <KinopoiskPremieres />
          </div>
          <div className="cinema-surface rounded-lg">
            <KinopoiskNewReleases />
          </div>

          {/* В кинотеатрах сейчас */}
          {nowPlaying?.results && <div className="cinema-surface rounded-lg">
              <AutoCarousel title={t('sections.nowPlaying')} items={nowPlaying.results} type="movie" isLoading={nowPlayingLoading} onItemClick={handleMovieClick} autoPlayInterval={4000} />
            </div>}

          {/* В тренде сегодня */}
          <section className="space-y-6 animate-stagger-1">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              {t('sections.trending')}
            </h2>
            {trendingLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {Array.from({
              length: 10
            }).map((_, index) => <MovieSkeleton key={index} />)}
              </div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {trending?.results?.slice(0, 10).map((item, index) => <MovieCard key={item.id} item={item} type={'title' in item ? 'movie' : 'tv'} className="animate-scale-in hover-neon-primary transition-neon" />)}
              </div>}
          </section>

          {/* Curated Collections */}
          <div className="cinema-surface rounded-lg">
            <CuratedCollectionsSection />
          </div>

          {/* Популярные фильмы */}
          <section className="space-y-6 animate-stagger-2">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              {t('sections.popular')}
            </h2>
            {moviesLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {Array.from({
              length: 10
            }).map((_, index) => <MovieSkeleton key={index} />)}
              </div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {popularMovies?.results?.slice(0, 10).map((movie, index) => <MovieCard key={movie.id} item={movie} type="movie" className="animate-scale-in hover-neon-accent transition-neon" />)}
              </div>}
          </section>

          {/* Популярные сериалы */}
          <section className="space-y-6 animate-stagger-3">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              {t('sections.popularTv')}
            </h2>
            {tvLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {Array.from({
              length: 10
            }).map((_, index) => <MovieSkeleton key={index} />)}
              </div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {popularTVShows?.results?.slice(0, 10).map((show, index) => <MovieCard key={show.id} item={show} type="tv" className="animate-scale-in hover-neon-info transition-neon" />)}
              </div>}
          </section>
        </div>
      </main>

      <Footer />
      <PWAInstallPrompt />
    </div>;
};
export default Index;