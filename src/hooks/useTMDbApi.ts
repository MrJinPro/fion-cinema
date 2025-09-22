import { useQuery } from '@tanstack/react-query';
import { getTMDbClient } from '@/lib/tmdb';
import type { TMDbMovie, TMDbTVShow, TMDbPerson, TMDbSearchResponse, TMDbGenre } from '@/lib/tmdb';

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
    staleTime: 30 * 60 * 1000, // 30 минут
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
    staleTime: 30 * 60 * 1000, // 30 минут
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
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => tmdbClient.getMovieDetails(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};

// Hook для получения деталей сериала
export const useTVDetails = (id: number) => {
  return useQuery({
    queryKey: ['tv', id],
    queryFn: () => tmdbClient.getTVDetails(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
  });
};