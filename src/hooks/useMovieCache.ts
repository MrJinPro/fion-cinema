import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TMDbMovieDetails, TMDbTVDetails } from '@/lib/tmdb';
import { useToast } from './use-toast';

interface MovieCacheData {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  adult?: boolean;
  video?: boolean;
  budget?: number;
  revenue?: number;
  runtime?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  genres?: any[];
  production_companies?: any[];
  production_countries?: any[];
  spoken_languages?: any[];
}

interface TVCacheData {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  last_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  status?: string;
  tagline?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: any[];
  genres?: any[];
  production_companies?: any[];
}

export const useMovieCache = () => {
  const { toast } = useToast();

  const cacheMovie = useCallback(async (movieData: TMDbMovieDetails): Promise<boolean> => {
    try {
      // Проверяем, есть ли фильм в кэше
      const { data: existingMovie } = await supabase
        .from('movies_tmdb')
        .select('id, cached_at')
        .eq('id', movieData.id)
        .maybeSingle();

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Если фильм есть и кэш свежий (менее 7 дней), не обновляем
      if (existingMovie && new Date(existingMovie.cached_at) > sevenDaysAgo) {
        return true;
      }

      const cacheData: MovieCacheData = {
        id: movieData.id,
        title: movieData.title,
        original_title: movieData.original_title,
        overview: movieData.overview,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        release_date: movieData.release_date,
        vote_average: movieData.vote_average,
        vote_count: movieData.vote_count,
        popularity: movieData.popularity,
        adult: movieData.adult,
        video: movieData.video,
        budget: movieData.budget,
        revenue: movieData.revenue,
        runtime: movieData.runtime,
        status: movieData.status,
        tagline: movieData.tagline,
        imdb_id: movieData.imdb_id,
        genres: movieData.genres,
        production_companies: movieData.production_companies,
        production_countries: movieData.production_countries,
        spoken_languages: movieData.spoken_languages,
      };

      const { error } = await supabase
        .from('movies_tmdb')
        .upsert({
          ...cacheData,
          cached_at: now.toISOString(),
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: existingMovie ? undefined : now.toISOString(),
          updated_at: now.toISOString(),
        });

      if (error) {
        console.error('Error caching movie:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cacheMovie:', error);
      return false;
    }
  }, []);

  const cacheTVShow = useCallback(async (tvData: TMDbTVDetails): Promise<boolean> => {
    try {
      // Проверяем, есть ли сериал в кэше
      const { data: existingTV } = await supabase
        .from('tv_shows_tmdb')
        .select('id, cached_at')
        .eq('id', tvData.id)
        .maybeSingle();

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Если сериал есть и кэш свежий (менее 7 дней), не обновляем
      if (existingTV && new Date(existingTV.cached_at) > sevenDaysAgo) {
        return true;
      }

      const cacheData: TVCacheData = {
        id: tvData.id,
        name: tvData.name,
        original_name: tvData.original_name,
        overview: tvData.overview,
        poster_path: tvData.poster_path,
        backdrop_path: tvData.backdrop_path,
        first_air_date: tvData.first_air_date,
        last_air_date: tvData.last_air_date,
        vote_average: tvData.vote_average,
        vote_count: tvData.vote_count,
        popularity: tvData.popularity,
        status: tvData.status,
        tagline: tvData.tagline,
        number_of_seasons: tvData.number_of_seasons,
        number_of_episodes: tvData.number_of_episodes,
        episode_run_time: tvData.episode_run_time,
        genres: tvData.genres,
        production_companies: tvData.production_companies,
      };

      const { error } = await supabase
        .from('tv_shows_tmdb')
        .upsert({
          ...cacheData,
          cached_at: now.toISOString(),
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: existingTV ? undefined : now.toISOString(),
          updated_at: now.toISOString(),
        });

      if (error) {
        console.error('Error caching TV show:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cacheTVShow:', error);
      return false;
    }
  }, []);

  const ensureMovieExists = useCallback(async (contentId: number, contentType: 'movie' | 'tv'): Promise<boolean> => {
    try {
      if (contentType === 'movie') {
        // Проверяем есть ли фильм в кэше
        const { data: cachedMovie } = await supabase
          .from('movies_tmdb')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();

        if (cachedMovie) {
          return true;
        }

        // Если фильма нет, пытаемся получить его из TMDB и сохранить
        try {
          const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
            body: { endpoint: `movie/${contentId}` }
          });
          if (!error && data) {
            return await cacheMovie(data);
          }
        } catch (error) {
          console.error('Error fetching movie from TMDB:', error);
        }

        // Если не удалось получить из TMDB, создаем минимальную запись
        const { error } = await supabase
          .from('movies_tmdb')
          .insert({
            id: contentId,
            title: `Movie ${contentId}`,
            cached_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error('Error creating minimal movie record:', error);
          return false;
        }

        return true;
      } else {
        // Аналогично для TV шоу
        const { data: cachedTV } = await supabase
          .from('tv_shows_tmdb')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();

        if (cachedTV) {
          return true;
        }

        // Если сериала нет, создаем минимальную запись
        const { error } = await supabase
          .from('tv_shows_tmdb')
          .insert({
            id: contentId,
            name: `TV Show ${contentId}`,
            cached_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error('Error creating minimal TV record:', error);
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error('Error in ensureMovieExists:', error);
      return false;
    }
  }, [cacheMovie]);

  return {
    cacheMovie,
    cacheTVShow,
    ensureMovieExists,
  };
};