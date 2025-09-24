import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Kinogo mirrors to try
const KINOGO_MIRRORS = [
  'https://kinogo.org',
  'https://kinogo.media', 
  'https://kinogo.pro',
  'https://kinogo-film.my'
];

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

interface ParsedLink {
  url: string;
  quality: string;
  source: string;
  type: string;
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function searchMovieOnKinogo(title: string, year?: number, imdbId?: string): Promise<string | null> {
  console.log(`Searching for movie: ${title} (${year}) on Kinogo mirrors`);
  
  for (const mirror of KINOGO_MIRRORS) {
    try {
      console.log(`Trying mirror: ${mirror}`);
      
      // Try different search patterns
      const searchQueries = [
        `${title} ${year}`,
        title,
        imdbId ? `tt${imdbId}` : null
      ].filter(Boolean);
      
      for (const query of searchQueries) {
        const searchUrl = `${mirror}/search/?q=${encodeURIComponent(query!)}`;
        console.log(`Searching: ${searchUrl}`);
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });

        if (!response.ok) {
          console.log(`Mirror ${mirror} returned ${response.status}`);
          continue;
        }

        const html = await response.text();
        
        // Parse search results for movie links
        const movieLinkMatch = html.match(/<a[^>]+href="([^"]*(?:film|movie)[^"]*)"[^>]*>[\s\S]*?(?:${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${year})/i);
        
        if (movieLinkMatch) {
          let movieUrl = movieLinkMatch[1];
          if (movieUrl.startsWith('/')) {
            movieUrl = mirror + movieUrl;
          }
          console.log(`Found movie URL: ${movieUrl}`);
          return movieUrl;
        }
      }
    } catch (error) {
      console.error(`Error with mirror ${mirror}:`, error);
      continue;
    }
  }
  
  return null;
}

async function parseMoviePage(movieUrl: string): Promise<ParsedLink[]> {
  console.log(`Parsing movie page: ${movieUrl}`);
  
  try {
    const response = await fetch(movieUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Referer': movieUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const links: ParsedLink[] = [];

    // Extract iframe sources
    const iframeMatches = html.matchAll(/<iframe[^>]+src="([^"]+)"[^>]*>/gi);
    for (const match of iframeMatches) {
      const src = match[1];
      if (src && (src.includes('player') || src.includes('embed') || src.includes('video'))) {
        links.push({
          url: src.startsWith('//') ? 'https:' + src : src,
          quality: 'HD',
          source: 'iframe',
          type: 'embed'
        });
      }
    }

    // Extract video sources
    const videoMatches = html.matchAll(/<source[^>]+src="([^"]+)"[^>]*>/gi);
    for (const match of videoMatches) {
      const src = match[1];
      if (src && (src.includes('.mp4') || src.includes('.m3u8'))) {
        links.push({
          url: src,
          quality: src.includes('720') ? '720p' : src.includes('1080') ? '1080p' : 'SD',
          source: 'direct',
          type: src.includes('.m3u8') ? 'hls' : 'mp4'
        });
      }
    }

    // Extract player URLs from JavaScript
    const jsPlayerMatches = html.matchAll(/(?:player|video)(?:Url|Src|Link)["']?\s*[:=]\s*["']([^"']+)/gi);
    for (const match of jsPlayerMatches) {
      const url = match[1];
      if (url && url.length > 10) {
        links.push({
          url: url.startsWith('//') ? 'https:' + url : url,
          quality: 'HD',
          source: 'player',
          type: 'embed'
        });
      }
    }

    console.log(`Extracted ${links.length} video links`);
    return links.slice(0, 10); // Limit to 10 links
    
  } catch (error) {
    console.error(`Error parsing movie page ${movieUrl}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { movieId, title, year, imdbId } = await req.json();

    if (!movieId || !title) {
      return new Response(
        JSON.stringify({ error: 'Movie ID and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for movie: ${title} (ID: ${movieId})`);

    // Check cache first
    const { data: cached } = await supabaseClient
      .from('parsed_links')
      .select('*')
      .eq('movie_id', movieId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (cached && cached.length > 0) {
      console.log(`Found cached links for movie ${movieId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          cached: true,
          links: cached[0].video_links,
          source: cached[0].source_site
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for movie on Kinogo
    const movieUrl = await searchMovieOnKinogo(title, year, imdbId);
    
    if (!movieUrl) {
      console.log(`Movie not found on any Kinogo mirror: ${title}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Movie not found on Kinogo mirrors',
          message: 'Фильм не найден на серверах Kinogo'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse movie page for video links
    const parsedLinks = await parseMoviePage(movieUrl);
    
    if (parsedLinks.length === 0) {
      console.log(`No video links found for movie: ${title}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No video links found',
          message: 'Видео ссылки не найдены'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the results
    const sourceSite = new URL(movieUrl).hostname;
    await supabaseClient
      .from('parsed_links')
      .insert({
        movie_id: movieId,
        imdb_id: imdbId,
        title: title,
        source_site: sourceSite,
        video_links: parsedLinks
      });

    console.log(`Successfully parsed ${parsedLinks.length} links for movie: ${title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: false,
        links: parsedLinks,
        source: sourceSite
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in kinogo-parser:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});