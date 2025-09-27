import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScrapedMovie {
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

export interface MovieCategory {
  id: string;
  name: string;
  slug: string;
  kinopoiskUrl?: string;
  description?: string;
  movieCount: number;
}

async function callWebScraper(url: string, type: string, query?: string): Promise<any> {
  console.log(`Calling web scraper: ${type}, URL: ${url}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('web-scraper', {
      body: {
        url,
        type,
        query,
        useCache: true
      }
    });

    if (error) {
      console.error('Web scraper error:', error);
      throw new Error(`Web scraper failed: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Web scraper returned unsuccessful response');
    }

    return data.data;
  } catch (error) {
    console.error('Error calling web scraper:', error);
    throw error;
  }
}

export function useKinopoiskCategories() {
  return useQuery({
    queryKey: ['kinopoisk-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movie_categories')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        kinopoiskUrl: cat.kinopoisk_url,
        description: cat.description || '',
        movieCount: cat.movie_count
      })) as MovieCategory[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCategoryMovies(categorySlug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['category-movies', categorySlug],
    queryFn: async () => {
      // Get category details
      const { data: category, error: categoryError } = await supabase
        .from('movie_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) {
        throw new Error(`Failed to fetch category: ${categoryError.message}`);
      }

      if (!category?.kinopoisk_url) {
        return [];
      }

      // Check if we have cached movies for this category
      const { data: existingMovies } = await supabase
        .from('movie_category_items')
        .select(`
          movie_id,
          movies_kp (
            id,
            kinopoisk_id,
            title,
            original_title,
            year,
            rating,
            poster,
            description,
            genres,
            country,
            director,
            actors,
            streaming_services,
            trailer_url,
            kinopoisk_url,
            last_scraped
          )
        `)
        .eq('category_id', category.id)
        .order('position');

      // If we have recent data (less than 24 hours old), return it
      if (existingMovies && existingMovies.length > 0) {
        const lastScraped = existingMovies[0]?.movies_kp?.last_scraped;
        if (lastScraped) {
          const scrapedDate = new Date(lastScraped);
          const now = new Date();
          const hoursDiff = (now.getTime() - scrapedDate.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            console.log(`Using cached category movies for ${categorySlug}`);
            return existingMovies
              .map(item => item.movies_kp)
              .filter(Boolean)
              .map(movie => ({
                id: movie.kinopoisk_id || movie.id.toString(),
                title: movie.title,
                originalTitle: movie.original_title,
                year: movie.year,
                rating: movie.rating,
                poster: movie.poster,
                description: movie.description,
                genres: movie.genres,
                country: movie.country,
                director: movie.director,
                actors: movie.actors,
                streamingServices: movie.streaming_services,
                trailerUrl: movie.trailer_url,
                kinopoiskUrl: movie.kinopoisk_url
              }));
          }
        }
      }

      // Scrape fresh data
      console.log(`Scraping fresh data for category: ${categorySlug}`);
      const scrapedMovies = await callWebScraper(category.kinopoisk_url, 'category');

      // Update category with new movies
      if (scrapedMovies && scrapedMovies.length > 0) {
        // Clear existing category items
        await supabase
          .from('movie_category_items')
          .delete()
          .eq('category_id', category.id);

        // Add new category items
        const categoryItems = scrapedMovies.map((movie: ScrapedMovie, index: number) => ({
          category_id: category.id,
          movie_id: parseInt(movie.id),
          position: index
        }));

        await supabase
          .from('movie_category_items')
          .insert(categoryItems);

        // Update movie count
        await supabase
          .from('movie_categories')
          .update({ movie_count: scrapedMovies.length })
          .eq('id', category.id);
      }

      return scrapedMovies || [];
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
}

export function useKinopoiskSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['kinopoisk-search', query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      return await callWebScraper('', 'search', query.trim());
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useMovieDetails(kinopoiskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['movie-details', kinopoiskId],
    queryFn: async () => {
      // Check if we have this movie in our database first
      const { data: existingMovie } = await supabase
        .from('movies_kp')
        .select('*')
        .eq('kinopoisk_id', kinopoiskId)
        .single();

      if (existingMovie) {
        const lastScraped = existingMovie.last_scraped;
        if (lastScraped) {
          const scrapedDate = new Date(lastScraped);
          const now = new Date();
          const hoursDiff = (now.getTime() - scrapedDate.getTime()) / (1000 * 60 * 60);
          
          // If data is less than 7 days old, use cached version
          if (hoursDiff < 24 * 7) {
            return {
              id: existingMovie.kinopoisk_id || existingMovie.id.toString(),
              title: existingMovie.title,
              originalTitle: existingMovie.original_title,
              year: existingMovie.year,
              rating: existingMovie.rating,
              poster: existingMovie.poster,
              description: existingMovie.description,
              genres: existingMovie.genres,
              country: existingMovie.country,
              director: existingMovie.director,
              actors: existingMovie.actors,
              streamingServices: existingMovie.streaming_services,
              trailerUrl: existingMovie.trailer_url,
              kinopoiskUrl: existingMovie.kinopoisk_url
            };
          }
        }
      }

      // Scrape fresh movie details
      const movieUrl = `https://www.kinopoisk.ru/film/${kinopoiskId}/`;
      return await callWebScraper(movieUrl, 'movie-details');
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

// Get popular Russian movies from database
export function useRussianMoviesFromDB() {
  return useQuery({
    queryKey: ['russian-movies-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies_kp')
        .select('*')
        .or('country.ilike.%россия%,country.ilike.%russia%')
        .order('rating', { ascending: false })
        .order('year', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching Russian movies from DB:', error);
        return [];
      }

      return data.map(movie => ({
        id: movie.kinopoisk_id || movie.id.toString(),
        title: movie.title,
        originalTitle: movie.original_title,
        year: movie.year,
        rating: movie.rating,
        poster: movie.poster,
        description: movie.description,
        genres: movie.genres,
        country: movie.country,
        director: movie.director,
        actors: movie.actors,
        streamingServices: movie.streaming_services,
        trailerUrl: movie.trailer_url,
        kinopoiskUrl: movie.kinopoisk_url
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}