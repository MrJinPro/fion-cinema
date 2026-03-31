/**
 * TMDb API SDK с кэшированием, rate limiting и типизацией
 * Требует TMDB_API_KEY в переменных окружения
 */

// Базовые типы TMDb
export interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  original_language: string;
}

export interface TMDbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for_department: string;
  gender: number;
  adult: boolean;
  known_for: (TMDbMovie | TMDbTVShow)[];
}

export interface TMDbPersonDetails extends TMDbPerson {
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  homepage: string | null;
  imdb_id: string | null;
}

export interface TMDbPersonMovieCredits {
  cast: Array<TMDbMovie & { character: string; order: number }>;
  crew: Array<TMDbMovie & { job: string; department: string }>;
}

export interface TMDbPersonTVCredits {
  cast: Array<TMDbTVShow & { character: string; episode_count: number }>;
  crew: Array<TMDbTVShow & { job: string; department: string; episode_count: number }>;
}

export interface TMDbPersonImages {
  profiles: TMDbImage[];
}

export interface TMDbPersonExternalIds {
  imdb_id: string | null;
  facebook_id: string | null;
  freebase_mid: string | null;
  freebase_id: string | null;
  tvrage_id: number | null;
  twitter_id: string | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  youtube_id: string | null;
  wikidata_id: string | null;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbSearchResponse<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export interface TMDbMovieDetails extends TMDbMovie {
  runtime: number;
  genres: TMDbGenre[];
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  imdb_id: string | null;
}

// New types for enhanced details
export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface TMDbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDbCredits {
  cast: TMDbCastMember[];
  crew: TMDbCrewMember[];
}

export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
  size: number;
}

export interface TMDbVideoResponse {
  results: TMDbVideo[];
}

export interface TMDbImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDbImages {
  backdrops: TMDbImage[];
  posters: TMDbImage[];
  logos: TMDbImage[];
}

export interface TMDbReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TMDbReviewResponse {
  results: TMDbReview[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDbTVDetails extends TMDbTVShow {
  created_by: Array<{
    id: number;
    name: string;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  genres: TMDbGenre[];
  in_production: boolean;
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    air_date: string;
    episode_number: number;
    season_number: number;
  } | null;
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  seasons: Array<{
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    air_date: string;
    episode_count: number;
  }>;
  status: string;
  tagline: string;
  type: string;
}

// LRU Cache для клиентского кэширования
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number; // время жизни в мс

  constructor(maxSize = 100, ttl = 24 * 60 * 60 * 1000) { // 24 часа по умолчанию
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Проверяем не истёк ли TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Перемещаем в конец для LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T): void {
    // Удаляем старые записи если превышен размер
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Rate Limiter
class RateLimiter {
  private lastRequestTime = 0;
  private minInterval: number;

  constructor(minInterval = 250) { // минимум 250ms между запросами
    this.minInterval = minInterval;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// TMDb API Client
import { getSupabaseUrl } from './public-env';

export class TMDbClient {
  private baseURL: string;
  private imageBaseURL = 'https://image.tmdb.org/t/p';
  private cache = new LRUCache<any>();
  private rateLimiter = new RateLimiter();

  constructor() {
    // Use Supabase Edge Function for API requests instead of direct TMDb API calls
    // Read via helper to support runtime config on static hosting.
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is not configured. TMDb Edge Function calls will fail.');
      this.baseURL = '';
      return;
    }

    this.baseURL = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/tmdb-proxy`;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    console.log('Making TMDb request to:', endpoint, 'with params:', params);

    if (!this.baseURL) {
      throw new Error('VITE_SUPABASE_URL is not configured. Cannot call tmdb-proxy Edge Function.');
    }

    await this.rateLimiter.wait();

    // Construct URL for Edge Function
    const url = new URL(this.baseURL);
    
    // Add endpoint as a parameter for the Edge Function
    url.searchParams.set('endpoint', endpoint);
    
    // Add base parameters
    const searchParams = {
      language: 'ru-RU',
      region: 'RU',
      ...params,
    };

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached result for:', endpoint);
      return cached;
    }

    try {
      console.log('Fetching from TMDb:', url.toString());
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error('TMDb API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('TMDb API error body:', errorText);
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      const data: T = await response.json();
      console.log('TMDb API response:', data);
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('TMDb request failed:', error);
      throw error;
    }
  }

  // Поиск
  async searchMulti(query: string, page = 1): Promise<TMDbSearchResponse<TMDbMovie | TMDbTVShow | TMDbPerson>> {
    return this.makeRequest('/search/multi', { query, page });
  }

  async searchMovies(query: string, page = 1): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest('/search/movie', { query, page });
  }

  async searchTVShows(query: string, page = 1): Promise<TMDbSearchResponse<TMDbTVShow>> {
    return this.makeRequest('/search/tv', { query, page });
  }

  async searchPeople(query: string, page = 1): Promise<TMDbSearchResponse<TMDbPerson>> {
    return this.makeRequest('/search/person', { query, page });
  }

  // Получение деталей
  async getMovieDetails(id: number): Promise<TMDbMovieDetails> {
    return this.makeRequest(`/movie/${id}`);
  }

  async getTVDetails(id: number): Promise<TMDbTVDetails> {
    return this.makeRequest(`/tv/${id}`);
  }

  async getPersonDetails(id: number): Promise<TMDbPersonDetails> {
    return this.makeRequest(`/person/${id}`);
  }

  async getPersonMovieCredits(id: number): Promise<TMDbPersonMovieCredits> {
    return this.makeRequest(`/person/${id}/movie_credits`);
  }

  async getPersonTVCredits(id: number): Promise<TMDbPersonTVCredits> {
    return this.makeRequest(`/person/${id}/tv_credits`);
  }

  async getPersonImages(id: number): Promise<TMDbPersonImages> {
    return this.makeRequest(`/person/${id}/images`);
  }

  async getPersonExternalIds(id: number): Promise<TMDbPersonExternalIds> {
    return this.makeRequest(`/person/${id}/external_ids`);
  }

  // Популярное и трендовое
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDbSearchResponse<TMDbMovie | TMDbTVShow>> {
    return this.makeRequest(`/trending/${mediaType}/${timeWindow}`);
  }

  async getPopularMovies(page = 1): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest('/movie/popular', { page });
  }

  async getPopularTVShows(page = 1): Promise<TMDbSearchResponse<TMDbTVShow>> {
    return this.makeRequest('/tv/popular', { page });
  }

  async getNowPlayingMovies(page = 1): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest('/movie/now_playing', { page });
  }

  // Discover с фильтрами
  async discoverMovies(filters: {
    page?: number;
    with_genres?: string;
    primary_release_year?: number;
    vote_average_gte?: number;
    sort_by?: string;
  } = {}): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest('/discover/movie', filters);
  }

  async discoverTVShows(filters: {
    page?: number;
    with_genres?: string;
    first_air_date_year?: number;
    vote_average_gte?: number;
    sort_by?: string;
  } = {}): Promise<TMDbSearchResponse<TMDbTVShow>> {
    return this.makeRequest('/discover/tv', filters);
  }

  // Жанры
  async getMovieGenres(): Promise<{ genres: TMDbGenre[] }> {
    return this.makeRequest('/genre/movie/list');
  }

  async getTVGenres(): Promise<{ genres: TMDbGenre[] }> {
    return this.makeRequest('/genre/tv/list');
  }

  // Credits (Cast & Crew)
  async getMovieCredits(id: number): Promise<TMDbCredits> {
    return this.makeRequest(`/movie/${id}/credits`);
  }

  async getTVCredits(id: number): Promise<TMDbCredits> {
    return this.makeRequest(`/tv/${id}/credits`);
  }

  // Videos (Trailers, Teasers)
  async getMovieVideos(id: number): Promise<TMDbVideoResponse> {
    return this.makeRequest(`/movie/${id}/videos`);
  }

  async getTVVideos(id: number): Promise<TMDbVideoResponse> {
    return this.makeRequest(`/tv/${id}/videos`);
  }

  // Images
  async getMovieImages(id: number): Promise<TMDbImages> {
    return this.makeRequest(`/movie/${id}/images`);
  }

  async getTVImages(id: number): Promise<TMDbImages> {
    return this.makeRequest(`/tv/${id}/images`);
  }

  // Similar Content
  async getSimilarMovies(id: number, page = 1): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest(`/movie/${id}/similar`, { page });
  }

  async getSimilarTVShows(id: number, page = 1): Promise<TMDbSearchResponse<TMDbTVShow>> {
    return this.makeRequest(`/tv/${id}/similar`, { page });
  }

  // Recommendations
  async getMovieRecommendations(id: number, page = 1): Promise<TMDbSearchResponse<TMDbMovie>> {
    return this.makeRequest(`/movie/${id}/recommendations`, { page });
  }

  async getTVRecommendations(id: number, page = 1): Promise<TMDbSearchResponse<TMDbTVShow>> {
    return this.makeRequest(`/tv/${id}/recommendations`, { page });
  }

  // Reviews
  async getMovieReviews(id: number, page = 1): Promise<TMDbReviewResponse> {
    return this.makeRequest(`/movie/${id}/reviews`, { page });
  }

  async getTVReviews(id: number, page = 1): Promise<TMDbReviewResponse> {
    return this.makeRequest(`/tv/${id}/reviews`, { page });
  }

  // Watch Providers
  async getMovieWatchProviders(id: number): Promise<any> {
    return this.makeRequest(`/movie/${id}/watch/providers`);
  }

  async getTVWatchProviders(id: number): Promise<any> {
    return this.makeRequest(`/tv/${id}/watch/providers`);
  }

  // Утилиты для изображений
  getImageURL(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getPosterURL(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    return this.getImageURL(path, size);
  }

  getBackdropURL(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getProfileURL(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string | null {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }
}

// Singleton instance
let tmdbClient: TMDbClient | null = null;

export function getTMDbClient(): TMDbClient {
  if (!tmdbClient) {
    console.log('Initializing TMDb client with Edge Function proxy');
    tmdbClient = new TMDbClient();
  }
  return tmdbClient;
}

export default TMDbClient;