import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useMovieDetails, 
  useMovieCredits, 
  useMovieVideos, 
  useMovieImages, 
  useMovieReviews, 
  useSimilarMovies, 
  useMovieRecommendations,
  useMovieWatchProviders 
} from '@/hooks/useTMDbApi';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { SearchEngineButtons } from '@/components/ui/search-engine-buttons';
import { RatingStars } from '@/components/ui/rating-stars';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  DollarSign,
  TrendingUp,
  Heart,
  Plus,
  Play,
  Users,
  Camera,
  MessageSquare,
  Film
} from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';
import { CastSection } from '@/components/ui/cast-section';
import { VideoSection } from '@/components/ui/video-section';
import { ImagesSection } from '@/components/ui/images-section';
import { ReviewsSection } from '@/components/ui/reviews-section';
import { SimilarSection } from '@/components/ui/similar-section';
import EmbeddedPlayer from '@/components/ui/embedded-player';
import { AddToCollectionDialog } from '@/components/ui/add-to-collection-dialog';
import { StreamingAvailability } from '@/components/ui/streaming-availability';
import { useAuth } from '@/hooks/useAuth';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useUserRatings } from '@/hooks/useUserRatings';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';
import { AdSlot } from '@/components/ui/ad-slot';

export const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchInput, setSearchInput] = useState('');
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const movieId = parseInt(id || '0');

  // Fetch movie data
  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const movieLoaded = !!movie && !error;
  const { data: credits } = useMovieCredits(movieLoaded ? movieId : 0);
  const { data: videos } = useMovieVideos(movieLoaded ? movieId : 0);
  const { data: images } = useMovieImages(movieLoaded ? movieId : 0);
  const { data: reviews } = useMovieReviews(movieLoaded ? movieId : 0);
  const { data: similarMovies } = useSimilarMovies(movieLoaded ? movieId : 0);
  const { data: recommendations } = useMovieRecommendations(movieLoaded ? movieId : 0);
  const { data: watchProviders } = useMovieWatchProviders(movieLoaded ? movieId : 0);

  // Behavior tracking and ratings
  const { trackMovieView, trackTrailerWatch, trackPageExit } = useBehaviorTracking();
  const { userRating, averageRating, ratingCount, submitRating } = useUserRatings(movieId, 'movie');
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Track movie view on mount
  useEffect(() => {
    if (movieId) {
      trackMovieView(movieId);
    }
  }, [movieId]);

  // Track page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (movie) {
        const hasTrailer = videos?.results?.some(v => v.type === 'Trailer') || false;
        trackPageExit(movieId, movie.title, hasTrailer);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [movie, videos, movieId]);

  // Handle trailer watch tracking
  const handleTrailerPlay = () => {
    trackTrailerWatch(movieId);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) return;
    
    if (isFavorite(movieId, 'movie')) {
      await removeFromFavorites({ tmdbId: movieId, mediaType: 'movie' });
    } else {
      await addToFavorites({
        item: {
          id: movieId,
          title: movie?.title || '',
          poster_path: movie?.poster_path || null,
          vote_average: movie?.vote_average || null,
          release_date: movie?.release_date || null,
        } as any,
        mediaType: 'movie'
      });
    }
  };

  if (isLoading) {
    return (
      <>
      <Header onSearch={handleSearch} searchValue={searchInput} onSearchChange={setSearchInput} />
        <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
              <div className={isMobile ? '' : 'lg:col-span-1'}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              </div>
              <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-4`}>
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Header onSearch={handleSearch} searchValue={searchInput} onSearchChange={setSearchInput} />
        <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Фильм не найден</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tmdbClient = getTMDbClient();
  const posterUrl = movie.poster_path ? tmdbClient.getPosterURL(movie.poster_path, 'w500') : null;
  const backdropUrl = movie.backdrop_path ? tmdbClient.getBackdropURL(movie.backdrop_path, 'w1280') : null;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const runtime = movie.runtime;
  const featuredTrailer = videos?.results?.find(v => v.type === 'Trailer') || videos?.results?.[0];

  // Generate structured data for SEO
  const tvStructuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "datePublished": movie.release_date,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "genre": movie.genres?.map(g => g.name),
    "aggregateRating": movie.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average,
      "bestRating": 10,
      "worstRating": 0,
      "ratingCount": movie.vote_count
    } : undefined,
    "image": posterUrl,
    "director": credits?.crew?.find(person => person.job === 'Director')?.name,
    "actor": credits?.cast?.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    }))
  };

  const seoTitle = `${movie.title}${releaseYear ? ` (${releaseYear})` : ''} - Детали фильма | Fion Cinema`;
  const seoDescription = movie.overview 
    ? `${movie.overview.slice(0, 150)}... Узнайте больше о фильме ${movie.title}, посмотрите трейлеры и фото.`
    : `Подробная информация о фильме ${movie.title}. Актёры, рецензии, трейлеры и многое другое.`;

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        structuredData={tvStructuredData}
      />
      <Header onSearch={handleSearch} searchValue={searchInput} onSearchChange={setSearchInput} />
      <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Hero Section with backdrop */}
        {backdropUrl && (
          <div className="relative h-[50vh] min-h-80 bg-cover bg-center bg-no-repeat cinema-screen" style={{ backgroundImage: `url(${backdropUrl})` }}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-background" />
            <div className="absolute bottom-4 left-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-black/20 border-white/20 text-white hover:bg-black/40"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {!backdropUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          )}

          <div className="cinema-surface rounded-lg p-4 sm:p-6">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
            {/* Poster */}
            <div className={isMobile ? '' : 'lg:col-span-1'}>
              <div className={isMobile ? 'mb-6' : 'sticky top-4'}>
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className={`${isMobile ? 'w-48 mx-auto' : 'w-full'} rounded-lg shadow-lg`}
                  />
                ) : (
                  <div className={`aspect-[2/3] bg-muted rounded-lg flex items-center justify-center ${isMobile ? 'w-48 mx-auto' : 'w-full'}`}>
                    <span className="text-muted-foreground">Нет постера</span>
                  </div>
                )}

                <div className={isMobile ? 'mt-4 max-w-xl mx-auto' : 'mt-4'}>
                  <AdSlot placement="movie_details" format="rectangle" />
                </div>
              </div>
            </div>

            {/* Movie Details */}
            <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-6`}>
              {/* Title and meta info */}
              <div className="space-y-4">
                <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-center lg:text-left`}>
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-muted-foreground italic text-center lg:text-left`}>
                    "{movie.tagline}"
                  </p>
                )}
                
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap'} items-center gap-4 text-sm text-muted-foreground ${isMobile ? 'text-center' : ''}`}>
                  {releaseYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {releaseYear}
                    </div>
                  )}
                  {runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {runtime} мин
                    </div>
                  )}
                  {movie.vote_average && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {movie.vote_average.toFixed(1)} TMDB
                    </div>
                  )}
                </div>

                {/* User Rating Section */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Ваша оценка</h3>
                      {averageRating && (
                        <div className="text-sm text-muted-foreground">
                          Средняя: {averageRating.toFixed(1)}/10 ({ratingCount} оценок)
                        </div>
                      )}
                    </div>
                    <RatingStars
                      rating={userRating || 0}
                      onRatingChange={submitRating}
                      readonly={!user}
                      size={isMobile ? "sm" : "md"}
                    />
                    {!user && (
                      <p className="text-xs text-muted-foreground">
                        Войдите в аккаунт, чтобы оценить фильм
                      </p>
                    )}
                  </div>
                </Card>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
                    {movie.genres.map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-3`}>
                <EmbeddedPlayer
                  movieId={movieId}
                  title={movie.title}
                  year={releaseYear || undefined}
                  watchProviders={watchProviders?.results?.RU || watchProviders?.results?.US}
                  className={isMobile ? '' : 'flex-1'}
                />
                {featuredTrailer && (
                  <Button 
                    onClick={handleTrailerPlay}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Play className="h-4 w-4" />
                    Смотреть трейлер
                  </Button>
                )}
                {user && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleFavoriteToggle}
                      className={`flex items-center gap-2 ${isMobile ? '' : 'flex-1'}`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(movieId, 'movie') ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite(movieId, 'movie') ? 'В избранном' : 'В избранное'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCollectionDialog(true)}
                      className={`flex items-center gap-2 ${isMobile ? '' : 'flex-1'}`}
                    >
                      <Plus className="h-4 w-4" />
                      Добавить в коллекцию
                    </Button>
                  </>
                )}
              </div>

              {/* Search Engine Buttons */}
              <SearchEngineButtons 
                title={movie.title}
                year={releaseYear}
                type="movie"
              />

              {/* Featured Trailer Section */}
              {featuredTrailer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Трейлер
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${featuredTrailer.key}?enablejsapi=1`}
                        title={featuredTrailer.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                        onLoad={handleTrailerPlay}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Streaming Availability */}
              <StreamingAvailability 
                watchProviders={watchProviders?.results?.RU || watchProviders?.results?.US}
                movieId={movieId}
                title={movie.title}
              />

              {/* Overview */}
              {movie.overview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Описание</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {movie.overview}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {movie.budget && movie.budget > 0 && (
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Бюджет</p>
                        <p className="font-semibold">${movie.budget.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {movie.revenue && movie.revenue > 0 && (
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Сборы</p>
                        <p className="font-semibold">${movie.revenue.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Sections instead of tabs - better for mobile */}
          <div className="mt-12 space-y-12">
            {/* Cast Section */}
            <section id="cast">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Актёры и съёмочная группа</h2>
              </div>
              <CastSection credits={credits || { cast: [], crew: [] }} />
            </section>

            {/* Videos Section */}
            {videos?.results && videos.results.length > 0 && (
              <section id="videos">
                <div className="flex items-center gap-3 mb-6">
                  <Play className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Видео</h2>
                </div>
                <VideoSection videos={videos.results} />
              </section>
            )}

            {/* Images Section */}
            {images && (images.backdrops?.length > 0 || images.posters?.length > 0) && (
              <section id="images">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Фотографии</h2>
                </div>
                <ImagesSection images={images} />
              </section>
            )}

            {/* Reviews Section */}
            {reviews?.results && reviews.results.length > 0 && (
              <section id="reviews">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Отзывы</h2>
                </div>
                <ReviewsSection reviews={reviews.results} />
              </section>
            )}

            {/* Similar Movies Section */}
            {((similarMovies?.results && similarMovies.results.length > 0) || 
              (recommendations?.results && recommendations.results.length > 0)) && (
              <section id="similar">
                <div className="flex items-center gap-3 mb-6">
                  <Film className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Похожие фильмы</h2>
                </div>
                <div className="space-y-8">
                  {similarMovies?.results && similarMovies.results.length > 0 && (
                    <SimilarSection 
                      title="Похожие фильмы" 
                      items={similarMovies.results} 
                      type="movie"
                    />
                  )}
                  {recommendations?.results && recommendations.results.length > 0 && (
                    <SimilarSection 
                      title="Рекомендации" 
                      items={recommendations.results} 
                      type="movie"
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {showCollectionDialog && (
        <AddToCollectionDialog
          isOpen={showCollectionDialog}
          item={movie}
          mediaType="movie"
          onClose={() => setShowCollectionDialog(false)}
        />
      )}
    </>
  );
};