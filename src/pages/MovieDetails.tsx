import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useMovieDetails, 
  useMovieCredits, 
  useMovieVideos, 
  useMovieImages, 
  useMovieReviews,
  useSimilarMovies,
  useMovieRecommendations
} from '@/hooks/useTMDbApi';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CastSection } from '@/components/ui/cast-section';
import { VideoSection } from '@/components/ui/video-section';
import { ImagesSection } from '@/components/ui/images-section';
import { ReviewsSection } from '@/components/ui/reviews-section';
import { SimilarSection } from '@/components/ui/similar-section';
import { StreamingAvailability } from '@/components/ui/streaming-availability';
import EmbeddedPlayer from '@/components/ui/embedded-player';
import { ArrowLeft, Star, Calendar, Clock, Play, DollarSign } from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = parseInt(id || '0');
  const [searchValue, setSearchValue] = useState('');
  
  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const { data: credits } = useMovieCredits(movieId);
  const { data: videos } = useMovieVideos(movieId);
  const { data: images } = useMovieImages(movieId);
  const { data: reviews } = useMovieReviews(movieId);
  const { data: similar } = useSimilarMovies(movieId);
  const { data: recommendations } = useMovieRecommendations(movieId);
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

  if (error || !movie) {
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
            <p className="text-lg text-muted-foreground">Фильм не найден</p>
          </div>
        </main>
      </div>
    );
  }

  const posterUrl = tmdbClient.getPosterURL(movie.poster_path, 'w500');
  const backdropUrl = tmdbClient.getBackdropURL(movie.backdrop_path, 'w1280');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}ч ${movie.runtime % 60}мин` : null;

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
            alt={movie.title}
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
                  alt={movie.title}
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
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  {movie.tagline}
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {releaseYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {releaseYear}
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {runtime}
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}/10
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <EmbeddedPlayer
                movieId={movie.id}
                title={movie.title}
                year={releaseYear || undefined}
                imdbId={movie.imdb_id}
                className="mr-4"
              />
            </div>

            {/* Featured Trailer Section */}
            {videos && videos.results && videos.results.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Трейлер</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoSection videos={videos.results.slice(0, 1)} />
                </CardContent>
              </Card>
            )}

            {/* Streaming Availability - Prominent Position */}
            <StreamingAvailability movieId={movie.id} title={movie.title} imdbId={movie.imdb_id} />

            {/* Overview */}
            {movie.overview && (
              <Card>
                <CardHeader>
                  <CardTitle>Описание</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {movie.overview}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.budget && movie.budget > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Бюджет
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${movie.budget.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {movie.revenue && movie.revenue > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Сборы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${movie.revenue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Content Tabs */}
            <Tabs defaultValue="cast" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="cast">Актёры</TabsTrigger>
                <TabsTrigger value="videos">Видео</TabsTrigger>
                <TabsTrigger value="images">Фото</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                <TabsTrigger value="similar">Похожие</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cast" className="mt-6">
                {credits && <CastSection credits={credits} />}
              </TabsContent>
              
              <TabsContent value="videos" className="mt-6">
                {videos && <VideoSection videos={videos.results} />}
              </TabsContent>
              
              <TabsContent value="images" className="mt-6">
                {images && <ImagesSection images={images} />}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                {reviews && <ReviewsSection reviews={reviews.results} />}
              </TabsContent>
              
              <TabsContent value="similar" className="mt-6">
                <div className="space-y-6">
                  {similar && similar.results.length > 0 && (
                    <SimilarSection 
                      items={similar.results} 
                      title="Похожие фильмы" 
                      type="movie"
                    />
                  )}
                  {recommendations && recommendations.results.length > 0 && (
                    <SimilarSection 
                      items={recommendations.results} 
                      title="Рекомендации" 
                      type="movie"
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetails;