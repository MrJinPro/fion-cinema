import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTMDbClient } from '@/lib/tmdb';
import { useMovieCache } from './useMovieCache';
import type { TMDbMovieDetails, TMDbTVDetails } from '@/lib/tmdb';

interface CachedMovieData {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: any[];
  cached_at: string;
  expires_at: string;
}

export const useSmartCache = () => {
  const queryClient = useQueryClient();
  const { cacheMovie, cacheTVShow } = useMovieCache();
  
  const checkCacheFirst = useCallback(async (contentId: number, contentType: 'movie' | 'tv') => {
    try {
      const table = contentType === 'movie' ? 'movies_tmdb' : 'tv_shows_tmdb';
      
      // Проверяем кэш в базе данных
      const { data: cachedData, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', contentId)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Cache check error:', error);
        return null;
      }

      if (cachedData) {
        console.log(`Cache HIT for ${contentType} ${contentId}`);
        return cachedData;
      }

      console.log(`Cache MISS for ${contentType} ${contentId}`);
      return null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }, []);

  const smartFetchMovie = useCallback(async (movieId: number): Promise<TMDbMovieDetails | null> => {
    try {
      // Сначала проверяем кэш
      const cachedMovie = await checkCacheFirst(movieId, 'movie');
      if (cachedMovie) {
        return cachedMovie as TMDbMovieDetails;
      }

      // Если нет в кэше, запрашиваем у TMDB
      console.log(`Fetching movie ${movieId} from TMDB API`);
      const tmdbClient = getTMDbClient();
      const movieData = await tmdbClient.getMovieDetails(movieId);
      
      if (movieData) {
        // Сохраняем в кэш асинхронно
        cacheMovie(movieData).catch(error => 
          console.error('Failed to cache movie:', error)
        );
      }

      return movieData;
    } catch (error) {
      console.error('Error in smartFetchMovie:', error);
      return null;
    }
  }, [checkCacheFirst, cacheMovie]);

  const smartFetchTVShow = useCallback(async (tvId: number): Promise<TMDbTVDetails | null> => {
    try {
      // Сначала проверяем кэш
      const cachedTVShow = await checkCacheFirst(tvId, 'tv');
      if (cachedTVShow) {
        return cachedTVShow as TMDbTVDetails;
      }

      // Если нет в кэше, запрашиваем у TMDB
      console.log(`Fetching TV show ${tvId} from TMDB API`);
      const tmdbClient = getTMDbClient();
      const tvData = await tmdbClient.getTVDetails(tvId);
      
      if (tvData) {
        // Сохраняем в кэш асинхронно
        cacheTVShow(tvData).catch(error => 
          console.error('Failed to cache TV show:', error)
        );
      }

      return tvData;
    } catch (error) {
      console.error('Error in smartFetchTVShow:', error);
      return null;
    }
  }, [checkCacheFirst, cacheTVShow]);

  const batchCacheContent = useCallback(async (contentList: Array<{id: number, type: 'movie' | 'tv'}>) => {
    const tmdbClient = getTMDbClient();
    const batchSize = 5; // Не превышаем лимиты API
    
    for (let i = 0; i < contentList.length; i += batchSize) {
      const batch = contentList.slice(i, i + batchSize);
      
      const promises = batch.map(async (content) => {
        try {
          const cached = await checkCacheFirst(content.id, content.type);
          if (cached) return null; // Уже в кэше
          
          if (content.type === 'movie') {
            const data = await tmdbClient.getMovieDetails(content.id);
            if (data) await cacheMovie(data);
            return data;
          } else {
            const data = await tmdbClient.getTVDetails(content.id);
            if (data) await cacheTVShow(data);
            return data;
          }
        } catch (error) {
          console.error(`Failed to cache ${content.type} ${content.id}:`, error);
          return null;
        }
      });

      await Promise.allSettled(promises);
      
      // Пауза между батчами для соблюдения лимитов API
      if (i + batchSize < contentList.length) {
        await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 секунды между батчами
      }
    }
  }, [checkCacheFirst, cacheMovie, cacheTVShow]);

  return {
    smartFetchMovie,
    smartFetchTVShow,
    batchCacheContent,
    checkCacheFirst
  };
};