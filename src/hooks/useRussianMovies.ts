import { useQuery } from "@tanstack/react-query";
import { getTMDbClient } from "@/lib/tmdb";

export function useRussianMovies() {
  const tmdbClient = getTMDbClient();
  
  return useQuery({
    queryKey: ['russian-movies'],
    queryFn: async () => {
      // Get Russian movies with multiple approaches
      const [popularRussian, sovietClassics, modernRussian] = await Promise.all([
        // Popular Russian movies - use search with region filter
        tmdbClient.searchMovies('русский', 1).then(res => ({
          ...res,
          results: res.results?.filter(movie => 
            movie.original_language === 'ru' || 
            movie.vote_average >= 6.0
          ) || []
        })),
        
        // Soviet/Classic Russian cinema - search for classic titles
        tmdbClient.searchMovies('советский', 1).then(res => ({
          ...res,
          results: res.results?.filter(movie => {
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
            return year >= 1950 && year <= 1991 && movie.vote_average >= 7.0;
          }) || []
        })),
        
        // Modern Russian cinema - search popular terms
        tmdbClient.searchMovies('российский', 1).then(res => ({
          ...res,
          results: res.results?.filter(movie => {
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
            return year >= 2000 && movie.vote_average >= 6.5;
          }) || []
        }))
      ]);

      return {
        popular: popularRussian.results || [],
        classics: sovietClassics.results || [],
        modern: modernRussian.results || []
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useRussianSearch(query: string, enabled: boolean = true) {
  const tmdbClient = getTMDbClient();
  
  return useQuery({
    queryKey: ['russian-search', query],
    queryFn: async () => {
      // Search with page number as second parameter
      const results = await tmdbClient.searchMovies(query, 1);

      // Filter for Russian content
      const russianResults = results.results?.filter(movie => 
        movie.original_language === 'ru' || 
        movie.title?.toLowerCase().includes(query.toLowerCase()) ||
        movie.overview?.toLowerCase().includes('русск') ||
        movie.overview?.toLowerCase().includes('совет')
      ) || [];

      return {
        ...results,
        results: russianResults
      };
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
