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
  page?: number;
  with_genres?: string;
  primary_release_year?: number;
  vote_average_gte?: number;
  sort_by?: string;
} = {}) => {
  return useQuery({
    queryKey: ['discover', 'movies', filters],
    queryFn: () => tmdbClient.discoverMovies(filters),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Hook для обнаружения сериалов
export const useDiscoverTVShows = (filters: {
  page?: number;
  with_genres?: string;
  first_air_date_year?: number;
  vote_average_gte?: number;
  sort_by?: string;
} = {}) => {
  return useQuery({
    queryKey: ['discover', 'tv', filters],
    queryFn: () => tmdbClient.discoverTVShows(filters),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Hook для получения деталей фильма
export const useMovieDetails = (id: number) => {
  const { cacheMovie } = useMovieCache();
  
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      try {
        const movieData = await tmdbClient.getMovieDetails(id);
        // Автоматически кэшируем фильм при получении
        cacheMovie(movieData);
        return movieData;
      } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для получения деталей сериала
export const useTVDetails = (id: number) => {
  const { cacheTVShow } = useMovieCache();
  
  return useQuery({
    queryKey: ['tv', id],
    queryFn: async () => {
      try {
        const tvData = await tmdbClient.getTVDetails(id);
        // Автоматически кэшируем сериал при получении
        cacheTVShow(tvData);
        return tvData;
      } catch (error) {
        console.error('Error fetching TV details:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Credits hooks
export const useMovieCredits = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'credits'],
    queryFn: () => tmdbClient.getMovieCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

export const useTVCredits = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'credits'],
    queryFn: () => tmdbClient.getTVCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Videos hooks
export const useMovieVideos = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'videos'],
    queryFn: () => tmdbClient.getMovieVideos(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

export const useTVVideos = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'videos'],
    queryFn: () => tmdbClient.getTVVideos(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Images hooks
export const useMovieImages = (id: number) => {
  return useQuery({
    queryKey: ['movie', id, 'images'],
    queryFn: () => tmdbClient.getMovieImages(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

export const useTVImages = (id: number) => {
  return useQuery({
    queryKey: ['tv', id, 'images'],
    queryFn: () => tmdbClient.getTVImages(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Similar content hooks
export const useSimilarMovies = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['movie', id, 'similar', page],
    queryFn: () => tmdbClient.getSimilarMovies(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

export const useSimilarTVShows = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['tv', id, 'similar', page],
    queryFn: () => tmdbClient.getSimilarTVShows(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Recommendations hooks
export const useMovieRecommendations = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['movie', id, 'recommendations', page],
    queryFn: () => tmdbClient.getMovieRecommendations(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

export const useTVRecommendations = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['tv', id, 'recommendations', page],
    queryFn: () => tmdbClient.getTVRecommendations(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Reviews hooks
export const useMovieReviews = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['movie', id, 'reviews', page],
    queryFn: () => tmdbClient.getMovieReviews(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

export const useTVReviews = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['tv', id, 'reviews', page],
    queryFn: () => tmdbClient.getTVReviews(id, page),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Watch Providers hooks
export const useMovieWatchProviders = (id: number) => {
  return useQuery({
    queryKey: ['movie-watch-providers', id],
    queryFn: () => tmdbClient.getMovieWatchProviders(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

export const useTVWatchProviders = (id: number) => {
  return useQuery({
    queryKey: ['tv-watch-providers', id],
    queryFn: () => tmdbClient.getTVWatchProviders(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Person hooks
export const usePersonDetails = (id: number) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => tmdbClient.getPersonDetails(id),
    enabled: !!id,
    staleTime: 120 * 60 * 1000, // 2 часа - персональная информация меняется редко
  });
};

export const usePersonMovieCredits = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'movie-credits'],
    queryFn: () => tmdbClient.getPersonMovieCredits(id),
    enabled: !!id,
    staleTime: 120 * 60 * 1000, // 2 часа
  });
};

export const usePersonTVCredits = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'tv-credits'],
    queryFn: () => tmdbClient.getPersonTVCredits(id),
    enabled: !!id,
    staleTime: 120 * 60 * 1000, // 2 часа
  });
};

export const usePersonImages = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'images'],
    queryFn: () => tmdbClient.getPersonImages(id),
    enabled: !!id,
    staleTime: 120 * 60 * 1000, // 2 часа
  });
};

export const usePersonExternalIds = (id: number) => {
  return useQuery({
    queryKey: ['person', id, 'external-ids'],
    queryFn: () => tmdbClient.getPersonExternalIds(id),
    enabled: !!id,
    staleTime: 240 * 60 * 1000, // 4 часа - внешние ссылки меняются очень редко
  });
};