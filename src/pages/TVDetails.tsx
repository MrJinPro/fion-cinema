import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, Calendar, Tv, Play } from 'lucide-react';
import { useTVDetails } from '@/hooks/useTMDbApi';
import { getTMDbClient } from '@/lib/tmdb';

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tvId = parseInt(id || '0');
  const [searchValue, setSearchValue] = useState('');
  
  const { data: tvShow, isLoading, error } = useTVDetails(tvId);
  const tmdbClient = getTMDbClient();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
        />
        <main className="container px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
        />
        <main className="container px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Сериал не найден</p>
          </div>
        </main>
      </div>
    );
  }

  const posterUrl = tmdbClient.getPosterURL(tvShow.poster_path, 'w500');
  const backdropUrl = tmdbClient.getBackdropURL(tvShow.backdrop_path, 'w1280');
  const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : null;
  const lastAirYear = tvShow.last_air_date ? new Date(tvShow.last_air_date).getFullYear() : null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />
      
      {/* Hero Section with Backdrop */}
      {backdropUrl && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={backdropUrl}
            alt={tvShow.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <main className="container px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {tvShow.name}
              </h1>
              {tvShow.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  {tvShow.tagline}
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {firstAirYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {firstAirYear}{lastAirYear && lastAirYear !== firstAirYear ? ` - ${lastAirYear}` : ''}
                </div>
              )}
              {tvShow.number_of_seasons && (
                <div className="flex items-center gap-1">
                  <Tv className="h-4 w-4" />
                  {tvShow.number_of_seasons} сезон{tvShow.number_of_seasons > 1 ? 'а' : ''}
                </div>
              )}
              {tvShow.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {tvShow.vote_average.toFixed(1)}/10
                </div>
              )}
            </div>

            {/* Status */}
            {tvShow.status && (
              <div>
                <Badge 
                  variant={tvShow.status === 'Ended' ? 'secondary' : 'default'}
                  className="text-sm"
                >
                  {tvShow.status === 'Ended' ? 'Завершён' : 
                   tvShow.status === 'Returning Series' ? 'Продолжается' :
                   tvShow.status === 'In Production' ? 'В производстве' :
                   tvShow.status}
                </Badge>
              </div>
            )}

            {/* Genres */}
            {tvShow.genres && tvShow.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tvShow.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            {tvShow.overview && (
              <Card>
                <CardHeader>
                  <CardTitle>Описание</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {tvShow.overview}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tvShow.number_of_episodes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Эпизоды</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">
                      {tvShow.number_of_episodes} эпизод{tvShow.number_of_episodes > 1 ? 'ов' : ''}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {tvShow.episode_run_time && tvShow.episode_run_time.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Длительность эпизода</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">
                      {tvShow.episode_run_time[0]} мин
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TVDetails;