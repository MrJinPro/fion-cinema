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
export class TMDbClient {
  private baseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';
  private cache = new LRUCache<any>();
  private rateLimiter = new RateLimiter();
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      console.error('TMDb API key is not configured. Please set VITE_TMDB_API_KEY environment variable.');
      throw new Error('TMDb API key is required');
    }

    console.log('Making TMDb request to:', endpoint, 'with params:', params);

    await this.rateLimiter.wait();

    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Добавляем базовые параметры
    const searchParams = {
      api_key: this.apiKey,
      language: 'ru-RU',
      region: 'RU',
      ...params,
    };

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
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

  async getPersonDetails(id: number): Promise<TMDbPerson> {
    return this.makeRequest(`/person/${id}`);
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
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    console.log('Initializing TMDb client with API key:', apiKey ? 'API key present' : 'API key missing');
    tmdbClient = new TMDbClient(apiKey);
  }
  return tmdbClient;
}

export default TMDbClient;