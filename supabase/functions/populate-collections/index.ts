import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined
    );

    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    console.log('Starting collection population...');

    // Fetch popular movies from TMDB
    const popularResponse = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
    );
    const popularData = await popularResponse.json();

    // Fetch top rated movies
    const topRatedResponse = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
    );
    const topRatedData = await topRatedResponse.json();

    // Fetch trending movies
    const trendingResponse = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=ru-RU`
    );
    const trendingData = await trendingResponse.json();

    // Get collection IDs
    const { data: collections } = await supabaseClient
      .from('curated_collections')
      .select('id, slug')
      .eq('is_active', true);

    if (!collections) {
      throw new Error('No collections found');
    }

    const weeklyCollection = collections.find((c) => c.slug === 'weekly-top-50');
    const monthlyCollection = collections.find((c) => c.slug === 'monthly-top-250');
    const russianCollection = collections.find((c) => c.slug === 'russian-masterpieces');

    // Populate weekly top 50 with trending movies
    if (weeklyCollection && trendingData.results) {
      console.log('Populating weekly top 50...');

      // Add new items
      const weeklyItems = trendingData.results.slice(0, 50).map((movie: any, index: number) => ({
        tmdb_id: movie.id,
        media_type: 'movie',
        position: index + 1,
        curator_note: index < 10 ? `Один из самых популярных фильмов этой недели!` : undefined,
      }));

      const { error: weeklyRpcError } = await supabaseClient.rpc('replace_collection_items_by_slug', {
        collection_slug: weeklyCollection.slug,
        items: weeklyItems,
      });
      if (weeklyRpcError) throw weeklyRpcError;
    }

    // Populate monthly top 250 with mix of popular and top rated
    if (monthlyCollection && popularData.results && topRatedData.results) {
      console.log('Populating monthly top 250...');

      // Mix popular and top rated movies
      const allMovies = [
        ...popularData.results.slice(0, 125),
        ...topRatedData.results.slice(0, 125)
      ];

      // Remove duplicates and limit to 250
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      ).slice(0, 250);

      const monthlyItems = uniqueMovies.map((movie: any, index: number) => ({
        tmdb_id: movie.id,
        media_type: 'movie',
        position: index + 1,
        curator_note: index < 20 ? `Топ ${index + 1} по версии FiOn Cinema!` : undefined,
      }));

      const { error: monthlyRpcError } = await supabaseClient.rpc('replace_collection_items_by_slug', {
        collection_slug: monthlyCollection.slug,
        items: monthlyItems,
      });
      if (monthlyRpcError) throw monthlyRpcError;
    }

    // Populate genre collections
    const genreCollections = collections.filter((c) => c.slug.includes('drama') || c.slug.includes('scifi'));
    
    for (const collection of genreCollections) {
      let genreId = 18; // Drama by default
      let page = 1;
      
      if (collection.slug.includes('scifi')) {
        genreId = 878; // Science Fiction
      }

      console.log(`Populating ${collection.slug}...`);

      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=ru-RU&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=${genreId}&page=${page}`
      );
      const genreData = await genreResponse.json();

      if (genreData.results) {
        const genreItems = genreData.results.slice(0, 50).map((movie: any, index: number) => ({
          tmdb_id: movie.id,
          media_type: 'movie',
          position: index + 1,
          curator_note: index < 5 ? `Шедевр жанра!` : undefined,
        }));

        const { error: genreRpcError } = await supabaseClient.rpc('replace_collection_items_by_slug', {
          collection_slug: collection.slug,
          items: genreItems,
        });
        if (genreRpcError) throw genreRpcError;
      }
    }

    // Populate Russian masterpieces (previously never filled)
    if (russianCollection) {
      console.log('Populating russian-masterpieces...');

      const russianResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=ru-RU&sort_by=vote_average.desc&vote_count.gte=500&with_original_language=ru&page=1`
      );
      const russianData = await russianResponse.json();

      if (russianData.results) {
        const russianItems = russianData.results.slice(0, 50).map((movie: any, index: number) => ({
          tmdb_id: movie.id,
          media_type: 'movie',
          position: index + 1,
          curator_note: index < 5 ? `Классика российского кино!` : undefined,
        }));

        const { error: russianRpcError } = await supabaseClient.rpc('replace_collection_items_by_slug', {
          collection_slug: russianCollection.slug,
          items: russianItems,
        });
        if (russianRpcError) throw russianRpcError;
      }
    }

    console.log('Collection population completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Collections populated successfully',
        populated: collections.length
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error populating collections:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});