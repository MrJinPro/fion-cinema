import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/components/ui/hero-banner';
import { FeaturedMovie } from '@/components/ui/featured-movie';
import { AutoCarousel } from '@/components/ui/auto-carousel';
import { PersonalizedSection } from '@/components/ui/personalized-section';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieSkeleton } from '@/components/ui/movie-skeleton';
import { MovieRecommendationSection } from '@/components/ui/movie-recommendation-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp, Star, Calendar } from 'lucide-react';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import { useTrending, usePopularMovies, usePopularTVShows, useNowPlayingMovies } from '@/hooks/useTMDbApi';

const Index = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Данные из API
  const { data: trending, isLoading: trendingLoading } = useTrending('all', 'week');
  const { data: popularMovies, isLoading: moviesLoading } = usePopularMovies();
  const { data: popularTVShows, isLoading: tvLoading } = usePopularTVShows();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlayingMovies();

  const isLoading = trendingLoading || moviesLoading || tvLoading;

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
      
      <main className="space-y-12">
        {/* Hero Banner */}
        {trending?.results && trending.results.length > 0 && (
          <div className="container mx-auto px-4 pt-8">
            <HeroBanner 
              items={trending.results.slice(0, 5)} 
              onItemClick={handleMovieClick}
            />
          </div>
        )}

        <div className="container mx-auto px-4 space-y-12">
          {/* Featured Movie */}
          {trending?.results && trending.results[0] && (
            <FeaturedMovie 
              item={trending.results[0]}
              onItemClick={handleMovieClick}
            />
          )}

          {/* Movie Recommendation Section */}
          <div id="recommendations">
            <MovieRecommendationSection />
          </div>

          {/* Персонализированная секция */}
          <PersonalizedSection 
            onItemClick={handleMovieClick}
            onNavigate={navigate}
          />

          {/* В кинотеатрах сейчас */}
          {nowPlaying?.results && (
            <AutoCarousel
              title="В кинотеатрах сейчас"
              items={nowPlaying.results}
              type="movie"
              isLoading={nowPlayingLoading}
              onItemClick={handleMovieClick}
              autoPlayInterval={4000}
            />
          )}

          {/* В тренде сегодня */}
          <section className="space-y-6 animate-stagger-1">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              В тренде сегодня
            </h2>
            {trendingLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {trending?.results?.slice(0, 10).map((item, index) => (
                  <MovieCard
                    key={item.id}
                    item={item}
                    type={'title' in item ? 'movie' : 'tv'}
                    className="animate-scale-in hover-neon-primary transition-neon"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Популярные фильмы */}
          <section className="space-y-6 animate-stagger-2">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              Популярные фильмы
            </h2>
            {moviesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {popularMovies?.results?.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    item={movie}
                    type="movie"
                    className="animate-scale-in hover-neon-accent transition-neon"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Популярные сериалы */}
          <section className="space-y-6 animate-stagger-3">
            <h2 className="text-3xl font-bold text-gradient-primary neon-underline">
              Популярные сериалы
            </h2>
            {tvLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {popularTVShows?.results?.slice(0, 10).map((show, index) => (
                  <MovieCard
                    key={show.id}
                    item={show}
                    type="tv"
                    className="animate-scale-in hover-neon-info transition-neon"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
