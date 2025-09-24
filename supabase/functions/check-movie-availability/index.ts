import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const watchmodeApiKey = Deno.env.get('WATCHMODE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieId, title, imdbId } = await req.json();
    
    if (!movieId || !title) {
      return new Response(JSON.stringify({ error: 'Movie ID and title are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Checking availability for movie: ${title} (TMDb ID: ${movieId})`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Check cache first (data older than 24 hours will be refreshed)
    const { data: cachedData } = await supabase
      .from('movie_availability_cache')
      .select('*')
      .eq('movie_id', movieId)
      .eq('region', 'RU')
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (cachedData) {
      console.log(`Returning cached data for movie ${movieId}`);
      return new Response(JSON.stringify({
        providers: cachedData.availability_data,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search for the movie on Watchmode
    let watchmodeId = null;
    if (watchmodeApiKey) {
      try {
        const searchResponse = await fetch(
          `https://api.watchmode.com/v1/search/?apiKey=${watchmodeApiKey}&search_field=name&search_value=${encodeURIComponent(title)}&types=movie`
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const movie = searchData.title_results?.find((result: any) => 
            result.type === 'movie' && 
            (result.imdb_id === imdbId || result.name.toLowerCase().includes(title.toLowerCase()))
          );
          
          if (movie) {
            watchmodeId = movie.id;
            console.log(`Found Watchmode ID: ${watchmodeId} for ${title}`);
          }
        }
      } catch (error) {
        console.error('Error searching Watchmode:', error);
      }
    }

    // Get availability data from Watchmode
    let availabilityData: any[] = [];
    if (watchmodeId && watchmodeApiKey) {
      try {
        const availabilityResponse = await fetch(
          `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${watchmodeApiKey}&regions=RU`
        );
        
        if (availabilityResponse.ok) {
          const data = await availabilityResponse.json();
          availabilityData = data || [];
          console.log(`Found ${availabilityData.length} sources for ${title}`);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    }

    // Process and format the data
    const providers = [];

    // Add Watchmode data
    for (const source of availabilityData) {
      if (source.region === 'RU') {
        let providerData: any = {
          id: source.source_id,
          name: source.name,
          type: source.type, // subscription, rent, buy, free
          price: source.price,
          url: source.web_url,
          logo: null,
          available: true
        };

        // Map known providers
        switch (source.name?.toLowerCase()) {
          case 'netflix':
            providerData.logo = 'https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png';
            break;
          case 'apple tv':
          case 'apple tv+':
            providerData.logo = 'https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.png';
            break;
          case 'amazon prime video':
            providerData.logo = 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmNPXLah69CR5cb.png';
            break;
        }

        providers.push(providerData);
      }
    }

    // Add Russian streaming services with search-based URLs
    const russianServices = [
      {
        id: 'ivi',
        name: 'IVI',
        type: 'subscription',
        price: 'От 299 ₽/мес',
        url: `https://www.ivi.ru/search/?q=${encodeURIComponent(title)}`,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/IVI_logo.svg/240px-IVI_logo.svg.png',
        available: true
      },
      {
        id: 'okko',
        name: 'OKKO',
        type: 'subscription', 
        price: 'От 199 ₽/мес',
        url: `https://okko.tv/search?query=${encodeURIComponent(title)}`,
        logo: 'https://upload.wikimedia.org/wikipedia/ru/thumb/2/29/Okko_logo.svg/240px-Okko_logo.svg.png',
        available: true
      },
      {
        id: 'kinopoisk',
        name: 'Кинопоиск HD',
        type: 'subscription',
        price: 'От 299 ₽/мес', 
        url: `https://hd.kinopoisk.ru/search?query=${encodeURIComponent(title)}`,
        logo: 'https://avatars.mds.yandex.net/get-bunker/128809/7c05615678c8420ce4cd51e61ea6b789e7b8ba1e/orig',
        available: true
      }
    ];

    providers.push(...russianServices);

    // Cache the results
    const cacheData = {
      movie_id: movieId,
      tmdb_title: title,
      availability_data: providers,
      region: 'RU'
    };

    await supabase
      .from('movie_availability_cache')
      .upsert(cacheData, { 
        onConflict: 'movie_id,region' 
      });

    console.log(`Cached availability data for movie ${movieId}`);

    return new Response(JSON.stringify({
      providers,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-movie-availability function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      providers: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});