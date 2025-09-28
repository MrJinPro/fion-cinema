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

  // Получение фильмов по годам
  const getMoviesByYear = (year: number, page = 1) => {
    return useQuery({
      queryKey: ['movies', 'by-year', year, page],
      queryFn: async () => {
        // Сначала проверяем кэш в базе данных
        const { data: cachedMovies } = await supabase
          .from('movies_tmdb')
          .select('*')
          .gte('release_date', `${year}-01-01`)
          .lt('release_date', `${year + 1}-01-01`)
          .order('vote_average', { ascending: false })
          .range((page - 1) * 20, page * 20 - 1);

        if (cachedMovies && cachedMovies.length > 0) {
          console.log(`Found ${cachedMovies.length} cached movies for year ${year}`);
          return {
            results: cachedMovies,
            total_pages: Math.ceil(cachedMovies.length / 20),
            total_results: cachedMovies.length,
            page
          };
        }

        // Если нет в кэше, запрашиваем у TMDB
        console.log(`Fetching movies for year ${year} from TMDB, page ${page}`);
        return await tmdbClient.discoverMovies({
          primary_release_year: year,
          sort_by: 'popularity.desc',
          page
        });
      },
      staleTime: 60 * 60 * 1000, // 1 час
    });
  };

  // Получение фильмов по жанрам
  const getMoviesByGenre = (genreId: number, page = 1) => {
    return useQuery({
      queryKey: ['movies', 'by-genre', genreId, page],
      queryFn: async () => {
        // Проверяем кэш в базе данных
        const { data: cachedMovies } = await supabase
          .from('movies_tmdb')
          .select('*')
          .contains('genres', [{ id: genreId }])
          .order('popularity', { ascending: false })
          .range((page - 1) * 20, page * 20 - 1);

        if (cachedMovies && cachedMovies.length > 10) {
          console.log(`Found ${cachedMovies.length} cached movies for genre ${genreId}`);
          return {
            results: cachedMovies,
            total_pages: Math.ceil(cachedMovies.length / 20),
            total_results: cachedMovies.length,
            page
          };
        }

        // Если недостаточно в кэше, запрашиваем у TMDB
        console.log(`Fetching movies for genre ${genreId} from TMDB, page ${page}`);
        return await tmdbClient.discoverMovies({
          with_genres: genreId.toString(),
          sort_by: 'popularity.desc',
          page
        });
      },
      staleTime: 60 * 60 * 1000, // 1 час
    });
  };

  // Универсальный фильтр фильмов
  const getFilteredMovies = (filters: MovieFilter) => {
    return useQuery({
      queryKey: ['movies', 'filtered', filters],
      queryFn: async () => {
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

        // Пагинация
        const page = filters.page || 1;
        query = query.range((page - 1) * 20, page * 20 - 1);

        const { data: cachedMovies, error } = await query;

        if (error) {
          console.error('Error fetching filtered movies:', error);
          throw error;
        }

        if (cachedMovies && cachedMovies.length > 0) {
          console.log(`Found ${cachedMovies.length} cached movies with filters:`, filters);
          return {
            results: cachedMovies,
            total_pages: Math.ceil(cachedMovies.length / 20),
            total_results: cachedMovies.length,
            page
          };
        }

        // Если нет в кэше, используем TMDB discover
        console.log('Fetching filtered movies from TMDB with filters:', filters);
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

        return await tmdbClient.discoverMovies(discoverParams);
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