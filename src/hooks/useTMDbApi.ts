import { useQuery } from '@tanstack/react-query';
import { getTMDbClient } from '@/lib/tmdb';
import { useSmartCache } from './useSmartCache';
import type { 
  TMDbMovie, 
  TMDbTVShow, 
  TMDbPerson, 
  TMDbSearchResponse, 
  TMDbGenre,
  TMDbPersonDetails,
  TMDbPersonMovieCredits,
  TMDbPersonTVCredits,
  TMDbPersonImages,
  TMDbPersonExternalIds
} from '@/lib/tmdb';

console.log('Loading TMDb API hooks...');
const tmdbClient = getTMDbClient();

// Hook для поиска
export const useSearchMulti = (query: string, page = 1) => {
  return useQuery({
    queryKey: ['search', 'multi', query, page],
    queryFn: async () => {
      console.log('Searching for:', query, 'page:', page);
      return tmdbClient.searchMulti(query, page);
    },
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Hook для трендов
export const useTrending = (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  return useQuery({
    queryKey: ['trending', mediaType, timeWindow],
    queryFn: async () => {
      console.log('Fetching trending:', mediaType, timeWindow);
      return tmdbClient.getTrending(mediaType, timeWindow);
    },
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Hook для популярных фильмов
export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: async () => {
      console.log('Fetching popular movies, page:', page);
      return tmdbClient.getPopularMovies(page);
    },
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для популярных сериалов
export const usePopularTVShows = (page = 1) => {
  return useQuery({
    queryKey: ['tv', 'popular', page],
    queryFn: async () => {
      console.log('Fetching popular TV shows, page:', page);
      return tmdbClient.getPopularTVShows(page);
    },
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для фильмов в кинотеатрах
export const useNowPlayingMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'now_playing', page],
    queryFn: async () => {
      console.log('Fetching now playing movies, page:', page);
      return tmdbClient.getNowPlayingMovies(page);
    },
    staleTime: 120 * 60 * 1000, // 2 часа
  });
};

// Hook для жанров фильмов
export const useMovieGenres = () => {
  return useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: () => tmdbClient.getMovieGenres(),
    staleTime: 24 * 60 * 60 * 1000, // 24 часа
  });
};

// Hook для жанров сериалов
export const useTVGenres = () => {
  return useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: () => tmdbClient.getTVGenres(),
    staleTime: 24 * 60 * 60 * 1000, // 24 часа
  });
};

// Hook для обнаружения фильмов
export const useDiscoverMovies = (filters: {
  with_genres?: string;
  sort_by?: string;
  primary_release_year?: number;
  'vote_average.gte'?: number;
  page?: number;
  region?: string;
} = {}) => {
  return useQuery({
    queryKey: ['discover', 'movies', filters],
    queryFn: () => tmdbClient.discoverMovies(filters),
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Hook для обнаружения сериалов
export const useDiscoverTVShows = (filters: {
  with_genres?: string;
  sort_by?: string;
  first_air_date_year?: number;
  'vote_average.gte'?: number;
  page?: number;
  region?: string;
} = {}) => {
  return useQuery({
    queryKey: ['discover', 'tv', filters],
    queryFn: () => tmdbClient.discoverTVShows(filters),
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Hook для детальной информации о фильме с умным кэшированием
export const useMovieDetails = (id: number) => {
  const { smartFetchMovie } = useSmartCache();
  
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => smartFetchMovie(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для детальной информации о сериале с умным кэшированием  
export const useTVDetails = (id: number) => {
  const { smartFetchTVShow } = useSmartCache();
  
  return useQuery({
    queryKey: ['tv', id],
    queryFn: () => smartFetchTVShow(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для актерского состава фильма
export const useMovieCredits = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'credits'],
    queryFn: () => tmdbClient.getMovieCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для актерского состава сериала
export const useTVCredits = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'credits'],
    queryFn: () => tmdbClient.getTVCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для видео фильма
export const useMovieVideos = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'videos'],
    queryFn: () => tmdbClient.getMovieVideos(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для видео сериала
export const useTVVideos = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'videos'],
    queryFn: () => tmdbClient.getTVVideos(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для изображений фильма
export const useMovieImages = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'images'],
    queryFn: () => tmdbClient.getMovieImages(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для изображений сериала
export const useTVImages = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'images'],
    queryFn: () => tmdbClient.getTVImages(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для похожих фильмов
export const useSimilarMovies = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () => tmdbClient.getSimilarMovies(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для похожих сериалов
export const useSimilarTVShows = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'similar'],
    queryFn: () => tmdbClient.getSimilarTVShows(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для рекомендаций фильмов
export const useMovieRecommendations = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'recommendations'],
    queryFn: () => tmdbClient.getMovieRecommendations(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для рекомендаций сериалов
export const useTVRecommendations = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'recommendations'],
    queryFn: () => tmdbClient.getTVRecommendations(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для отзывов о фильме
export const useMovieReviews = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'reviews'],
    queryFn: () => tmdbClient.getMovieReviews(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для отзывов о сериале
export const useTVReviews = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'reviews'],
    queryFn: () => tmdbClient.getTVReviews(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для провайдеров просмотра фильма
export const useMovieWatchProviders = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'watch_providers'],
    queryFn: () => tmdbClient.getMovieWatchProviders(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для провайдеров просмотра сериала
export const useTVWatchProviders = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'watch_providers'],
    queryFn: () => tmdbClient.getTVWatchProviders(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для детальной информации о персоне
export const usePersonDetails = (id: number) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => tmdbClient.getPersonDetails(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для фильмографии персоны (фильмы)
export const usePersonMovieCredits = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'movie_credits'],
    queryFn: () => tmdbClient.getPersonMovieCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для фильмографии персоны (сериалы)
export const usePersonTVCredits = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'tv_credits'],
    queryFn: () => tmdbClient.getPersonTVCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для изображений персоны
export const usePersonImages = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'images'],
    queryFn: () => tmdbClient.getPersonImages(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для внешних ID персоны
export const usePersonExternalIds = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'external_ids'],
    queryFn: () => tmdbClient.getPersonExternalIds(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};