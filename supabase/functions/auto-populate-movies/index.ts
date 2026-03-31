import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function getSupabaseClient() {
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = (await req.text()).trim();
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    }
    return await req.json();
  } catch {
    return {};
  }
}

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not configured');

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'ru-RU');
  url.searchParams.set('region', 'RU');

  // Не логируем секреты
  const safeUrl = new URL(url.toString());
  safeUrl.searchParams.delete('api_key');
  console.log(`Fetching from TMDb: ${safeUrl.pathname}${safeUrl.search}`);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function cacheMovieInDB(supabase: ReturnType<typeof createClient>, movie: TMDbMovieDetails) {
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

async function populateMovies(options: {
  pages: number;
  maxMovies: number;
  timeBudgetMs: number;
  sleepMs: number;
}) {
  const supabase = getSupabaseClient();

  const { pages, maxMovies, timeBudgetMs, sleepMs } = options;
  let totalProcessed = 0;
  let totalCached = 0;

  const startedAt = Date.now();
  const shouldStop = () => (Date.now() - startedAt) >= timeBudgetMs || totalProcessed >= maxMovies;

  console.log(`🚀 Starting enhanced movie population (pages=${pages}, maxMovies=${maxMovies}, timeBudgetMs=${timeBudgetMs})`);

  try {
    // Популярные фильмы
    console.log(`📈 Fetching popular movies...`);
    popularLoop:
    for (let page = 1; page <= pages; page++) {
      console.log(`📄 Fetching popular movies page ${page}/${pages}`);
      const popularData = await fetchFromTMDB(`/movie/popular?page=${page}`);
      
      for (const movie of popularData.results) {
        if (shouldStop()) break popularLoop;

        // Проверяем, есть ли уже в кэше
        const { data: existing } = await supabase
          .from('movies_tmdb')
          .select('id, expires_at')
          .eq('id', movie.id)
          .maybeSingle();

        if (existing && new Date(existing.expires_at) > new Date()) {
          console.log(`✅ Movie ${movie.id} already cached and fresh`);
          continue;
        }

        // Получаем детали фильма
        try {
          const movieDetails = await fetchFromTMDB(`/movie/${movie.id}`);
          const success = await cacheMovieInDB(supabase, movieDetails);
          if (success) {
            totalCached++;
            console.log(`💾 Cached movie: ${movieDetails.title} (${movie.id})`);
          }
          totalProcessed++;
          
          // Пауза между запросами для соблюдения лимитов API
          if (sleepMs > 0) await sleep(sleepMs);
        } catch (error) {
          console.error(`❌ Failed to cache movie ${movie.id}:`, error);
        }
      }
      
      // Пауза между страницами
      if (shouldStop()) break popularLoop;
      if (sleepMs > 0) await sleep(Math.min(250, sleepMs * 2));
    }

    // Топ рейтинговые фильмы
    console.log(`🏆 Fetching top rated movies...`);
    topRatedLoop:
    for (let page = 1; page <= Math.min(pages, 3); page++) {
      console.log(`📄 Fetching top rated movies page ${page}/${Math.min(pages, 3)}`);
      const topRatedData = await fetchFromTMDB(`/movie/top_rated?page=${page}`);
      
      for (const movie of topRatedData.results) {
        if (shouldStop()) break topRatedLoop;

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
          const success = await cacheMovieInDB(supabase, movieDetails);
          if (success) {
            totalCached++;
            console.log(`💾 Cached top rated movie: ${movieDetails.title} (${movie.id})`);
          }
          totalProcessed++;
          
          if (sleepMs > 0) await sleep(sleepMs);
        } catch (error) {
          console.error(`❌ Failed to cache top rated movie ${movie.id}:`, error);
        }
      }
      
      if (shouldStop()) break topRatedLoop;
      if (sleepMs > 0) await sleep(Math.min(250, sleepMs * 2));
    }

    // Новые фильмы (2024-2025)
    console.log(`🆕 Fetching recent movies (2024-2025)...`);
    const currentYear = new Date().getFullYear();
    recentLoop:
    for (const year of [currentYear, currentYear - 1]) {
      for (let page = 1; page <= 3; page++) {
        if (shouldStop()) break recentLoop;

        console.log(`📄 Fetching ${year} movies page ${page}/3`);
        const yearMovies = await fetchFromTMDB(`/discover/movie?primary_release_year=${year}&sort_by=popularity.desc&page=${page}`);
        
        for (const movie of yearMovies.results) {
          if (shouldStop()) break recentLoop;

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
            const success = await cacheMovieInDB(supabase, movieDetails);
            if (success) {
              totalCached++;
              console.log(`💾 Cached ${year} movie: ${movieDetails.title} (${movie.id})`);
            }
            totalProcessed++;
            
            if (sleepMs > 0) await sleep(sleepMs);
          } catch (error) {
            console.error(`❌ Failed to cache ${year} movie ${movie.id}:`, error);
          }
        }
        
        if (shouldStop()) break recentLoop;
        if (sleepMs > 0) await sleep(Math.min(250, sleepMs * 2));
      }
    }

    console.log(`🎉 Population complete: ${totalCached} movies cached out of ${totalProcessed} processed`);
    
    // Получаем финальную статистику
    const { count: finalCount } = await supabase
      .from('movies_tmdb')
      .select('*', { count: 'exact', head: true });

    return {
      success: true,
      totalProcessed,
      totalCached,
      finalDatabaseCount: finalCount || 0,
      message: `Successfully processed ${totalProcessed} movies, cached ${totalCached} new/updated movies. Database now has ${finalCount || 0} total movies.`
    };

  } catch (error) {
    console.error('❌ Error in populateMovies:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log('🎬 Auto-populate movies function called');
    
    if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not configured');
    // Валидируем Supabase env на старте вызова (чтобы ошибки были понятными)
    getSupabaseClient();

    const url = new URL(req.url);
    const requestBody = await safeReadJson(req);

    const pages = clampInt(
      (requestBody as any).pages ?? url.searchParams.get('pages'),
      2,
      1,
      25,
    );
    const maxMovies = clampInt(
      (requestBody as any).maxMovies ?? url.searchParams.get('maxMovies'),
      80,
      10,
      300,
    );
    const timeBudgetMs = clampInt(
      (requestBody as any).timeBudgetMs ?? url.searchParams.get('timeBudgetMs'),
      25_000,
      5_000,
      55_000,
    );
    const sleepMs = clampInt(
      (requestBody as any).sleepMs ?? url.searchParams.get('sleepMs'),
      100,
      0,
      1000,
    );
    const trigger = (requestBody as any).trigger || url.searchParams.get('trigger') || 'manual';
    
    console.log(`📊 Starting population with ${pages} pages (trigger: ${trigger})`);

    // Проверяем текущее состояние базы
    const supabase = getSupabaseClient();
    const { count: currentCount } = await supabase
      .from('movies_tmdb')
      .select('*', { count: 'exact', head: true });

    console.log(`📈 Current database has ${currentCount || 0} movies`);

    const result = await populateMovies({ pages, maxMovies, timeBudgetMs, sleepMs });
    
    return new Response(
      JSON.stringify({
        ...result,
        trigger,
        pages,
        maxMovies,
        timeBudgetMs,
        sleepMs,
        previousCount: currentCount || 0
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in auto-populate-movies:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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