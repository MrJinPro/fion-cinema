import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  url: string;
  type: 'movie' | 'search' | 'category' | 'movie-details';
  query?: string;
  useCache?: boolean;
}

interface KinopoiskMovie {
  id: string;
  title: string;
  originalTitle?: string;
  year?: number;
  rating?: number;
  poster?: string;
  description?: string;
  genres?: string[];
  country?: string;
  director?: string;
  actors?: string[];
  streamingServices?: any[];
  trailerUrl?: string;
  kinopoiskUrl?: string;
}

class KinopoiskScraper {
  private async fetchWithUserAgent(url: string): Promise<string> {
    console.log(`Fetching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  }

  private extractTextContent(html: string, selector: string): string | null {
    // Simple regex-based extraction since we can't use DOM parser in Deno
    const match = html.match(new RegExp(`${selector}[^>]*>([^<]+)<`, 'i'));
    return match ? match[1].trim() : null;
  }

  private extractRating(html: string): number | null {
    // Extract KinoPoisk rating
    const ratingMatch = html.match(/"ratingValue":"([\d.]+)"/);
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    
    // Alternative rating extraction
    const altRatingMatch = html.match(/class="[^"]*rating[^"]*"[^>]*>([\d.]+)/i);
    if (altRatingMatch) {
      return parseFloat(altRatingMatch[1]);
    }
    
    return null;
  }

  private extractPoster(html: string): string | null {
    // Extract poster URL
    const posterMatch = html.match(/"image":"([^"]+)"/);
    if (posterMatch) {
      return posterMatch[1].replace(/\\\//g, '/');
    }
    
    // Alternative poster extraction
    const altPosterMatch = html.match(/class="[^"]*poster[^"]*"[^>]*src="([^"]+)"/i);
    if (altPosterMatch) {
      return altPosterMatch[1];
    }
    
    return null;
  }

  private extractYear(html: string): number | null {
    const yearMatch = html.match(/"datePublished":"(\d{4})"/);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    
    const altYearMatch = html.match(/(\d{4})\s*год/);
    if (altYearMatch) {
      return parseInt(altYearMatch[1]);
    }
    
    return null;
  }

  async scrapeMovieDetails(kinopoiskId: string): Promise<KinopoiskMovie | null> {
    try {
      const url = `https://www.kinopoisk.ru/film/${kinopoiskId}/`;
      const html = await this.fetchWithUserAgent(url);
      
      // Extract movie data using regex patterns
      const titleMatch = html.match(/"name":"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : `Фильм ${kinopoiskId}`;
      
      const originalTitleMatch = html.match(/"alternateName":"([^"]+)"/);
      const originalTitle = originalTitleMatch ? originalTitleMatch[1] : undefined;
      
      const descriptionMatch = html.match(/"description":"([^"]+)"/);
      const description = descriptionMatch ? descriptionMatch[1].replace(/\\n/g, ' ').trim() : undefined;
      
      // Extract genres
      const genresMatch = html.match(/"genre":\[([^\]]+)\]/);
      let genres: string[] = [];
      if (genresMatch) {
        const genreMatches = genresMatch[1].match(/"([^"]+)"/g);
        if (genreMatches) {
          genres = genreMatches.map(g => g.replace(/"/g, ''));
        }
      }
      
      // Extract country
      const countryMatch = html.match(/"countryOfOrigin":\{"name":"([^"]+)"/);
      const country = countryMatch ? countryMatch[1] : undefined;
      
      // Extract director
      const directorMatch = html.match(/"director":\[?\{"name":"([^"]+)"/);
      const director = directorMatch ? directorMatch[1] : undefined;
      
      // Extract actors (first 5)
      const actorsMatch = html.match(/"actor":\[([^\]]+)\]/);
      let actors: string[] = [];
      if (actorsMatch) {
        const actorMatches = actorsMatch[1].match(/"name":"([^"]+)"/g);
        if (actorMatches) {
          actors = actorMatches.slice(0, 5).map(a => a.match(/"name":"([^"]+)"/)?.[1] || '').filter(Boolean);
        }
      }
      
      const movie: KinopoiskMovie = {
        id: kinopoiskId,
        title,
        originalTitle,
        year: this.extractYear(html) || undefined,
        rating: this.extractRating(html) || undefined,
        poster: this.extractPoster(html) || undefined,
        description,
        genres,
        country,
        director,
        actors,
        kinopoiskUrl: url,
        streamingServices: [] // Will be extracted separately
      };
      
      console.log(`Scraped movie: ${title}`);
      return movie;
      
    } catch (error) {
      console.error(`Error scraping movie ${kinopoiskId}:`, error);
      return null;
    }
  }

  async scrapeCategory(categoryUrl: string): Promise<KinopoiskMovie[]> {
    try {
      const html = await this.fetchWithUserAgent(categoryUrl);
      const movies: KinopoiskMovie[] = [];
      
      // Extract movie IDs from category page
      const movieMatches = html.match(/\/film\/(\d+)\//g);
      if (!movieMatches) {
        console.log('No movies found in category');
        return movies;
      }
      
      // Get unique movie IDs
      const movieIds = [...new Set(movieMatches.map(match => match.match(/\/film\/(\d+)\//)?.[1]).filter(Boolean))];
      console.log(`Found ${movieIds.length} movies in category`);
      
      // Scrape first 20 movies to avoid timeout
      const limitedIds = movieIds.slice(0, 20);
      
      for (const movieId of limitedIds) {
        if (!movieId) continue;
        try {
          const movie = await this.scrapeMovieDetails(movieId);
          if (movie) {
            movies.push(movie);
          }
          
          // Add delay to avoid being blocked
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error scraping movie ${movieId}:`, error);
          continue;
        }
      }
      
      console.log(`Successfully scraped ${movies.length} movies from category`);
      return movies;
      
    } catch (error) {
      console.error('Error scraping category:', error);
      return [];
    }
  }

  async searchMovies(query: string): Promise<KinopoiskMovie[]> {
    try {
      const searchUrl = `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(query)}`;
      const html = await this.fetchWithUserAgent(searchUrl);
      
      // Extract movie IDs from search results
      const movieMatches = html.match(/\/film\/(\d+)\//g);
      if (!movieMatches) {
        return [];
      }
      
      const movieIds = [...new Set(movieMatches.map(match => match.match(/\/film\/(\d+)\//)?.[1]).filter(Boolean))];
      const movies: KinopoiskMovie[] = [];
      
      // Scrape first 10 search results
      const limitedIds = movieIds.slice(0, 10);
      
      for (const movieId of limitedIds) {
        if (!movieId) continue;
        try {
          const movie = await this.scrapeMovieDetails(movieId);
          if (movie) {
            movies.push(movie);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error scraping search result ${movieId}:`, error);
          continue;
        }
      }
      
      return movies;
      
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url, type, query, useCache = true }: ScrapingRequest = await req.json();
    
    console.log(`Web scraping request: ${type}, URL: ${url}`);

    // Check cache first
    if (useCache) {
      const { data: cached } = await supabase
        .from('scraping_cache')
        .select('content')
        .eq('url', url)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (cached) {
        console.log('Returning cached result');
        return new Response(
          JSON.stringify({ success: true, data: cached.content }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const scraper = new KinopoiskScraper();
    let result: any = null;

    switch (type) {
      case 'movie-details':
        const movieId = url.match(/\/film\/(\d+)\//)?.[1];
        if (movieId) {
          result = await scraper.scrapeMovieDetails(movieId);
        }
        break;
        
      case 'category':
        result = await scraper.scrapeCategory(url);
        break;
        
      case 'search':
        if (query) {
          result = await scraper.searchMovies(query);
        }
        break;
        
      default:
        throw new Error(`Unknown scraping type: ${type}`);
    }

    // Cache the result
    if (result && useCache) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours
      
      await supabase
        .from('scraping_cache')
        .upsert({
          url,
          content: result,
          expires_at: expiresAt.toISOString()
        });
    }

    // Store movies in database
    if (result && Array.isArray(result)) {
      for (const movie of result) {
        try {
          await supabase
            .from('movies_kp')
            .upsert({
              id: parseInt(movie.id),
              kinopoisk_id: movie.id,
              title: movie.title,
              original_title: movie.originalTitle,
              year: movie.year,
              rating: movie.rating,
              poster: movie.poster,
              description: movie.description,
              genres: movie.genres,
              country: movie.country,
              director: movie.director,
              actors: movie.actors,
              streaming_services: movie.streamingServices || [],
              trailer_url: movie.trailerUrl,
              kinopoisk_url: movie.kinopoiskUrl,
              last_scraped: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
        } catch (error) {
          console.error(`Error storing movie ${movie.id}:`, error);
        }
      }
    } else if (result && !Array.isArray(result)) {
      // Single movie
      try {
        await supabase
          .from('movies_kp')
          .upsert({
            id: parseInt(result.id),
            kinopoisk_id: result.id,
            title: result.title,
            original_title: result.originalTitle,
            year: result.year,
            rating: result.rating,
            poster: result.poster,
            description: result.description,
            genres: result.genres,
            country: result.country,
            director: result.director,
            actors: result.actors,
            streaming_services: result.streamingServices || [],
            trailer_url: result.trailerUrl,
            kinopoisk_url: result.kinopoiskUrl,
            last_scraped: new Date().toISOString()
          }, {
            onConflict: 'id'
          });
      } catch (error) {
        console.error(`Error storing movie ${result.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Web scraper error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});