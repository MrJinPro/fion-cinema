import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTMDbClient } from '@/lib/tmdb';

export interface MovieFilter {
  year?: number;
  genre?: number;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
  minRating?: number;
  page?: number;
}

export interface CategoryData {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  overview?: string;
  genre_ids?: number[];
}

export const useCategoryFilters = () => {
  const tmdbClient = getTMDbClient();

  // Получение фильмов по годам с умным кэшированием
  const getMoviesByYear = (year: number, page = 1) => {
    return useQuery({
      queryKey: ['movies', 'by-year', year, page],
      queryFn: async () => {
        console.log(`🎬 Searching movies for year ${year}, page ${page}`);
        
        // Сначала проверяем сколько всего у нас фильмов за этот год
        const { count } = await supabase
          .from('movies_tmdb')
          .select('*', { count: 'exact', head: true })
          .gte('release_date', `${year}-01-01`)
          .lt('release_date', `${year + 1}-01-01`);

        console.log(`📊 Found ${count || 0} cached movies for year ${year}`);

        // Если у нас достаточно фильмов за год (больше 20), используем кэш
        if (count && count >= 20) {
          const { data: cachedMovies } = await supabase
            .from('movies_tmdb')
            .select('*')
            .gte('release_date', `${year}-01-01`)
            .lt('release_date', `${year + 1}-01-01`)
            .order('popularity', { ascending: false })
            .range((page - 1) * 20, page * 20 - 1);

          console.log(`✅ Using cached data: ${cachedMovies?.length || 0} movies`);
          return {
            results: cachedMovies || [],
            total_pages: Math.ceil(count / 20),
            total_results: count,
            page,
            fromCache: true
          };
        }

        // Если недостаточно в кэше - обращаемся к TMDB
        console.log(`🌐 Insufficient cached data. Fetching from TMDB...`);
        const tmdbResult = await tmdbClient.discoverMovies({
          primary_release_year: year,
          sort_by: 'popularity.desc',
          page
        });

        // Кэшируем результаты
        if (tmdbResult.results && tmdbResult.results.length > 0) {
          cacheMoviesToDB(tmdbResult.results);
        }

        return {
          ...tmdbResult,
          fromCache: false
        };
      },
      staleTime: 60 * 60 * 1000, // 1 час
    });
  };

  // Получение фильмов по жанрам с умным кэшированием
  const getMoviesByGenre = (genreId: number, page = 1) => {
    return useQuery({
      queryKey: ['movies', 'by-genre', genreId, page],
      queryFn: async () => {
        console.log(`🎬 Searching movies for genre ${genreId}, page ${page}`);
        
        // Проверяем сколько всего фильмов с этим жанром у нас в кэше
        const { count } = await supabase
          .from('movies_tmdb')
          .select('*', { count: 'exact', head: true })
          .contains('genres', [{ id: genreId }]);

        console.log(`📊 Found ${count || 0} cached movies for genre ${genreId}`);

        // Если у нас достаточно фильмов жанра (больше 20), используем кэш
        if (count && count >= 20) {
          const { data: cachedMovies } = await supabase
            .from('movies_tmdb')
            .select('*')
            .contains('genres', [{ id: genreId }])
            .order('popularity', { ascending: false })
            .range((page - 1) * 20, page * 20 - 1);

          console.log(`✅ Using cached data: ${cachedMovies?.length || 0} movies`);
          return {
            results: cachedMovies || [],
            total_pages: Math.ceil(count / 20),
            total_results: count,
            page,
            fromCache: true
          };
        }

        // Если недостаточно в кэше - обращаемся к TMDB
        console.log(`🌐 Insufficient cached data. Fetching from TMDB...`);
        const tmdbResult = await tmdbClient.discoverMovies({
          with_genres: genreId.toString(),
          sort_by: 'popularity.desc',
          page
        });

        // Кэшируем результаты
        if (tmdbResult.results && tmdbResult.results.length > 0) {
          cacheMoviesToDB(tmdbResult.results);
        }

        return {
          ...tmdbResult,
          fromCache: false
        };
      },
      staleTime: 60 * 60 * 1000, // 1 час
    });
  };

  // Функция для кэширования фильмов из TMDB в базу
  const cacheMoviesToDB = async (movies: any[]) => {
    if (!movies.length) return;
    
    console.log(`Caching ${movies.length} movies to database`);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    const moviesToCache = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      adult: movie.adult,
      video: movie.video,
      genres: movie.genre_ids ? movie.genre_ids.map((id: number) => ({ id })) : [],
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('movies_tmdb')
        .upsert(moviesToCache);

      if (error) {
        console.error('Error caching movies:', error);
      } else {
        console.log(`Successfully cached ${moviesToCache.length} movies`);
      }
    } catch (error) {
      console.error('Error in cacheMoviesToDB:', error);
    }
  };

  // Универсальный фильтр фильмов с умным кэшированием
  const getFilteredMovies = (filters: MovieFilter) => {
    return useQuery({
      queryKey: ['movies', 'filtered', filters],
      queryFn: async () => {
        console.log('🎬 Starting filtered movies search with filters:', filters);
        
        // Сначала проверяем кэш в базе данных
        let query = supabase
          .from('movies_tmdb')
          .select('*');

        // Применяем фильтры
        if (filters.year) {
          query = query
            .gte('release_date', `${filters.year}-01-01`)
            .lt('release_date', `${filters.year + 1}-01-01`);
        }

        if (filters.minRating) {
          query = query.gte('vote_average', filters.minRating);
        }

        if (filters.genre) {
          query = query.contains('genres', [{ id: filters.genre }]);
        }

        // Сортировка
        const sortBy = filters.sortBy || 'popularity.desc';
        const [field, direction] = sortBy.split('.');
        const ascending = direction === 'asc';
        
        let orderField = field;
        if (field === 'popularity') orderField = 'popularity';
        else if (field === 'vote_average') orderField = 'vote_average';
        else if (field === 'release_date') orderField = 'release_date';
        else if (field === 'title') orderField = 'title';

        query = query.order(orderField, { ascending });

        // Получаем данные без пагинации для подсчета
        const { data: allCachedMovies, error } = await query;

        if (error) {
          console.error('Error fetching filtered movies:', error);
        }

        const cachedCount = allCachedMovies?.length || 0;
        console.log(`📊 Found ${cachedCount} cached movies matching filters`);

        // Если у нас достаточно фильмов в кэше (больше 20), используем их
        if (cachedCount >= 20) {
          const page = filters.page || 1;
          const paginatedMovies = allCachedMovies!.slice((page - 1) * 20, page * 20);
          
          console.log(`✅ Using cached data: ${paginatedMovies.length} movies for page ${page}`);
          return {
            results: paginatedMovies,
            total_pages: Math.ceil(cachedCount / 20),
            total_results: cachedCount,
            page,
            fromCache: true
          };
        }

        // Если недостаточно в кэше - обращаемся к TMDB API
        console.log(`🌐 Insufficient cached data (${cachedCount} < 20). Fetching from TMDB...`);
        
        const discoverParams: any = {
          page: filters.page || 1,
          sort_by: filters.sortBy || 'popularity.desc'
        };

        if (filters.year) {
          discoverParams.primary_release_year = filters.year;
        }

        if (filters.genre) {
          discoverParams.with_genres = filters.genre.toString();
        }

        if (filters.minRating) {
          discoverParams['vote_average.gte'] = filters.minRating;
        }

        const tmdbResult = await tmdbClient.discoverMovies(discoverParams);
        
        // Кэшируем новые результаты в фоновом режиме
        if (tmdbResult.results && tmdbResult.results.length > 0) {
          cacheMoviesToDB(tmdbResult.results);
        }

        console.log(`🎯 TMDB returned ${tmdbResult.results?.length || 0} movies`);
        
        return {
          ...tmdbResult,
          fromCache: false
        };
      },
      staleTime: 30 * 60 * 1000, // 30 минут
    });
  };

  // Получение доступных годов
  const getAvailableYears = () => {
    return useQuery({
      queryKey: ['movies', 'available-years'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('movies_tmdb')
          .select('release_date')
          .not('release_date', 'is', null)
          .order('release_date', { ascending: false });

        if (error) {
          console.error('Error fetching available years:', error);
          // Возвращаем стандартный список годов
          const currentYear = new Date().getFullYear();
          return Array.from({ length: 30 }, (_, i) => currentYear - i);
        }

        // Извлекаем уникальные годы
        const years = [...new Set(
          data.map(movie => new Date(movie.release_date).getFullYear())
            .filter(year => !isNaN(year) && year >= 1950)
        )].sort((a, b) => b - a);

        return years.slice(0, 50); // Ограничиваем 50 годами
      },
      staleTime: 24 * 60 * 60 * 1000, // 24 часа
    });
  };

  // Получение статистики по категориям
  const getCategoryStats = () => {
    return useQuery({
      queryKey: ['movies', 'category-stats'],
      queryFn: async () => {
        // Статистика по годам
        const { data: yearStats } = await supabase
          .from('movies_tmdb')
          .select('release_date')
          .not('release_date', 'is', null);

        const yearCounts: Record<number, number> = {};
        yearStats?.forEach(movie => {
          const year = new Date(movie.release_date).getFullYear();
          if (!isNaN(year) && year >= 1950) {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          }
        });

        // Общая статистика
        const { count: totalMovies } = await supabase
          .from('movies_tmdb')
          .select('*', { count: 'exact', head: true });

        const { count: recentMovies } = await supabase
          .from('movies_tmdb')
          .select('*', { count: 'exact', head: true })
          .gte('release_date', '2020-01-01');

        return {
          totalMovies: totalMovies || 0,
          recentMovies: recentMovies || 0,
          yearCounts,
          availableYears: Object.keys(yearCounts).map(Number).sort((a, b) => b - a)
        };
      },
      staleTime: 60 * 60 * 1000, // 1 час
    });
  };

  return {
    getMoviesByYear,
    getMoviesByGenre,
    getFilteredMovies,
    getAvailableYears,
    getCategoryStats
  };
};