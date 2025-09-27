import { useQuery } from "@tanstack/react-query";
import { getTMDbClient } from "@/lib/tmdb";

export interface SovietMovie {
  id: number;
  title: string;
  original_title?: string;
  year: number;
  poster_path?: string;
  vote_average?: number;
  overview?: string;
  release_date?: string;
}

// Легендарные советские фильмы с TMDB ID
const SOVIET_CLASSICS = [
  { tmdbId: 47978, title: "Операция Ы и другие приключения Шурика", year: 1965 },
  { tmdbId: 104782, title: "Любовь и голуби", year: 1984 },
  { tmdbId: 55931, title: "Кавказская пленница", year: 1966 },
  { tmdbId: 45317, title: "Иван Васильевич меняет профессию", year: 1973 },
  { tmdbId: 38455, title: "Москва слезам не верит", year: 1979 },
  { tmdbId: 44816, title: "Белое солнце пустыни", year: 1969 },
  { tmdbId: 46251, title: "Девчата", year: 1961 },
  { tmdbId: 121698, title: "Калина красная", year: 1973 },
  { tmdbId: 53604, title: "Семнадцать мгновений весны", year: 1973 },
  { tmdbId: 46250, title: "Место встречи изменить нельзя", year: 1979 },
  { tmdbId: 60670, title: "Бриллиантовая рука", year: 1968 },
  { tmdbId: 94502, title: "Служебный роман", year: 1977 }
];

export function useSovietClassics() {
  const tmdbClient = getTMDbClient();
  
  return useQuery({
    queryKey: ['soviet-classics'],
    queryFn: async (): Promise<SovietMovie[]> => {
      const movies: SovietMovie[] = [];
      
      // Пытаемся получить фильмы через TMDB API
      for (const classic of SOVIET_CLASSICS) {
        try {
          const movie = await tmdbClient.getMovieDetails(classic.tmdbId);
          if (movie && movie.id) {
            movies.push({
              id: movie.id,
              title: classic.title,
              original_title: movie.original_title || classic.title,
              year: classic.year,
              poster_path: movie.poster_path || null,
              vote_average: movie.vote_average || 8.0,
              overview: movie.overview || `Легендарный советский фильм ${classic.year} года.`,
              release_date: movie.release_date || `${classic.year}-01-01`
            });
          } else {
            // Fallback данные если TMDB не работает
            movies.push({
              id: classic.tmdbId,
              title: classic.title,
              original_title: classic.title,
              year: classic.year,
              poster_path: null,
              vote_average: 8.0,
              overview: `Легендарный советский фильм ${classic.year} года.`,
              release_date: `${classic.year}-01-01`
            });
          }
        } catch (error) {
          console.warn(`Failed to load movie ${classic.title}:`, error);
          // Fallback данные если TMDB не работает
          movies.push({
            id: classic.tmdbId,
            title: classic.title,
            original_title: classic.title,
            year: classic.year,
            poster_path: null,
            vote_average: 8.0,
            overview: `Легендарный советский фильм ${classic.year} года.`,
            release_date: `${classic.year}-01-01`
          });
        }
      }
      
      return movies;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 часа кэш для советских фильмов
  });
}