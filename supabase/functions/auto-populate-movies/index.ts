import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TMDbMovieDetails {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
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

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchFromTMDB(endpoint: string) {
  const url = `https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}&language=ru-RU&region=RU`;
  console.log(`Fetching from TMDB: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function cacheMovieInDB(movie: TMDbMovieDetails) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 дней
  
  const { error } = await supabase
    .from('movies_tmdb')
    .upsert({
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
      budget: movie.budget,
      revenue: movie.revenue,
      runtime: movie.runtime,
      status: movie.status,
      tagline: movie.tagline,
      homepage: movie.homepage,
      imdb_id: movie.imdb_id,
      genres: movie.genres,
      production_companies: movie.production_companies,
      production_countries: movie.production_countries,
      spoken_languages: movie.spoken_languages,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    });

  if (error) {
    console.error('Error caching movie:', error);
    return false;
  }
  
  return true;
}

async function populateMovies(pages: number = 5) {
  console.log(`Starting to populate movies (${pages} pages)`);
  let totalProcessed = 0;
  let totalCached = 0;

  try {
    // Популярные фильмы
    for (let page = 1; page <= pages; page++) {
      console.log(`Fetching popular movies page ${page}`);
      const popularData = await fetchFromTMDB(`/movie/popular?page=${page}`);
      
      for (const movie of popularData.results) {
        // Проверяем, есть ли уже в кэше
        const { data: existing } = await supabase
          .from('movies_tmdb')
          .select('id, expires_at')
          .eq('id', movie.id)
          .maybeSingle();

        if (existing && new Date(existing.expires_at) > new Date()) {
          console.log(`Movie ${movie.id} already cached and fresh`);
          continue;
        }

        // Получаем детали фильма
        try {
          const movieDetails = await fetchFromTMDB(`/movie/${movie.id}`);
          const success = await cacheMovieInDB(movieDetails);
          if (success) {
            totalCached++;
            console.log(`Cached movie: ${movieDetails.title} (${movie.id})`);
          }
          totalProcessed++;
          
          // Пауза между запросами для соблюдения лимитов API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Failed to cache movie ${movie.id}:`, error);
        }
      }
      
      // Пауза между страницами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Топ рейтинговые фильмы
    for (let page = 1; page <= Math.min(pages, 3); page++) {
      console.log(`Fetching top rated movies page ${page}`);
      const topRatedData = await fetchFromTMDB(`/movie/top_rated?page=${page}`);
      
      for (const movie of topRatedData.results) {
        const { data: existing } = await supabase
          .from('movies_tmdb')
          .select('id, expires_at')
          .eq('id', movie.id)
          .maybeSingle();

        if (existing && new Date(existing.expires_at) > new Date()) {
          continue;
        }

        try {
          const movieDetails = await fetchFromTMDB(`/movie/${movie.id}`);
          const success = await cacheMovieInDB(movieDetails);
          if (success) {
            totalCached++;
            console.log(`Cached top rated movie: ${movieDetails.title} (${movie.id})`);
          }
          totalProcessed++;
          
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Failed to cache top rated movie ${movie.id}:`, error);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Population complete: ${totalCached} movies cached out of ${totalProcessed} processed`);
    
    return {
      success: true,
      totalProcessed,
      totalCached,
      message: `Successfully processed ${totalProcessed} movies, cached ${totalCached} new/updated movies`
    };

  } catch (error) {
    console.error('Error in populateMovies:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auto-populate movies function called');
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const result = await populateMovies(5); // 5 страниц популярных + 3 страницы топ рейтинговых
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in auto-populate-movies:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});