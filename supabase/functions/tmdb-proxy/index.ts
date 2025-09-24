import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'TMDb API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct TMDb API URL
    const tmdbUrl = new URL(`${TMDB_BASE_URL}${endpoint}`);
    
    // Add API key
    tmdbUrl.searchParams.set('api_key', TMDB_API_KEY);
    
    // Forward all other query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'endpoint') {
        tmdbUrl.searchParams.set(key, value);
      }
    }

    console.log('Proxying request to TMDb:', tmdbUrl.toString());

    // Make request to TMDb API
    const response = await fetch(tmdbUrl.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ViOn/1.0'
      }
    });

    if (!response.ok) {
      console.error('TMDb API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('TMDb API error body:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `TMDb API error: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('TMDb API response successful for endpoint:', endpoint);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tmdb-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});