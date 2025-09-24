import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiter using token bucket algorithm
class RateLimiter {
  private tokens: number = 200;
  private lastRefill: number = Date.now();
  private readonly maxTokens = 200;
  private readonly refillRate = 200 / (24 * 60 * 60 * 1000); // 200 tokens per day

  canMakeRequest(): boolean {
    this.refillTokens();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

const rateLimiter = new RateLimiter();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to get endpoint and params
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { endpoint, params } = requestData;
    
    if (!endpoint) {
      console.error('Missing endpoint parameter in request body');
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📡 Processing request for endpoint: ${endpoint}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create cache key from endpoint and params
    const cacheKey = `kp:${endpoint}:${JSON.stringify(params || {})}`;
    
    // Check cache first
    const { data: cachedData } = await supabase
      .from('cache_queries')
      .select('response, updated_at')
      .eq('query', cacheKey)
      .single();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Return cached data if it's fresh
    if (cachedData && new Date(cachedData.updated_at) > oneHourAgo) {
      console.log(`Returning cached data for: ${cacheKey}`);
      return new Response(
        JSON.stringify(cachedData.response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limit before making API call
    if (!rateLimiter.canMakeRequest()) {
      console.log('Rate limit exceeded, returning cached data if available');
      if (cachedData) {
        return new Response(
          JSON.stringify(cachedData.response),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded and no cached data available' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make API request to Kinopoisk.dev
    const kpApiKey = Deno.env.get('KP_DEV_KEY');
    if (!kpApiKey) {
      console.error('KP_DEV_KEY not configured');
      throw new Error('KP_DEV_KEY not configured');
    }

    // Build kinopoisk API URL with params
    const kpUrl = new URL(`https://api.kinopoisk.dev/v1.4${endpoint}`);
    
    // Add all parameters from request body
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          kpUrl.searchParams.append(key, String(value));
        }
      });
    }

    console.log(`📡 Making request to Kinopoisk.dev: ${kpUrl.toString()}`);
    console.log(`🔑 Using API key: ${kpApiKey.substring(0, 10)}...`);
    console.log(`📝 Request params:`, JSON.stringify(params, null, 2));
    console.log(`🎯 Full URL with params: ${kpUrl.href}`);

    const response = await fetch(kpUrl.toString(), {
      headers: {
        'X-API-KEY': kpApiKey,
        'accept': 'application/json'
      }
    });

    console.log(`Kinopoisk.dev response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Kinopoisk.dev API error: ${response.status} - ${errorText}`);
      throw new Error(`Kinopoisk.dev API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Kinopoisk.dev response data received, docs count: ${data?.docs?.length || 0}`);
    console.log(`📊 API Response status: ${response.status}`);
    console.log(`📈 Total results: ${data?.total || 0}`);
    console.log(`📄 Current page: ${data?.page || 1} of ${data?.pages || 1}`);

    // Cache the response
    await supabase
      .from('cache_queries')
      .upsert({
        query: cacheKey,
        response: data,
        updated_at: now.toISOString()
      });

    // If it's movies data, also cache individual movies
    if (data.docs && Array.isArray(data.docs)) {
      const movies = data.docs.map((movie: any) => ({
        id: movie.id,
        title: movie.name || movie.alternativeName,
        year: movie.year,
        poster: movie.poster?.url,
        rating: movie.rating?.kp,
        genres: movie.genres?.map((g: any) => g.name) || [],
        premiere_russia: movie.premiere?.russia ? new Date(movie.premiere.russia).toISOString().split('T')[0] : null,
        updated_at: now.toISOString()
      })).filter((movie: any) => movie.id);

      if (movies.length > 0) {
        await supabase
          .from('movies_kp')
          .upsert(movies);
      }
    }

    console.log(`Kinopoisk.dev API response successful for endpoint: ${endpoint}`);
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Kinopoisk.dev proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});