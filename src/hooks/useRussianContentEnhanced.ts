import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RussianContent {
  movies: any[];
  tvShows: any[];
  documentaries: any[];
  total: number;
}

async function fetchRussianContent(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  console.log('Fetching Russian content:', { endpoint, params });
  
  try {
    const { data, error } = await supabase.functions.invoke('kinopoisk-proxy', {
      body: { 
        endpoint,
        params 
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error('Kinopoisk proxy error:', error);
      // Return empty result instead of throwing error
      return { docs: [], total: 0 };
    }

    return data || { docs: [], total: 0 };
  } catch (err) {
    console.error('Fetch error:', err);
    // Return empty result for any network/parsing errors
    return { docs: [], total: 0 };
  }
}

// Современные российские фильмы (2020-2025)
export function useRussianMoviesModern() {
  return useQuery({
    queryKey: ['russian-movies-modern'],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2020-2025',
      'countries.name': 'Россия',
      'rating.kp': '6-10',
      'sortField': 'year',
      'sortType': '-1',
      'limit': '50',
      'type': 'movie'
    }),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 3,
    retryDelay: 1000
  });
}

// Российские сериалы
export function useRussianTVShows() {
  return useQuery({
    queryKey: ['russian-tv-shows'],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2020-2025',
      'countries.name': 'Россия',
      'rating.kp': '6-10',
      'sortField': 'year',
      'sortType': '-1',
      'limit': '30',
      'type': 'tv-series'
    }),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

// Мини-сериалы российские
export function useRussianMiniSeries() {
  return useQuery({
    queryKey: ['russian-mini-series'],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2020-2025',
      'countries.name': 'Россия',
      'rating.kp': '7-10',
      'sortField': 'rating.kp',
      'sortType': '-1',
      'limit': '20',
      'type': 'mini-series'
    }),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

// Документальные фильмы российские
export function useRussianDocumentaries() {
  return useQuery({
    queryKey: ['russian-documentaries'],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2015-2025',
      'countries.name': 'Россия',
      'genres.name': 'документальный',
      'rating.kp': '6-10',
      'sortField': 'year',
      'sortType': '-1',
      'limit': '20'
    }),
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });
}

// Топ российских фильмов по рейтингу
export function useRussianTopRated() {
  return useQuery({
    queryKey: ['russian-top-rated'],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2010-2025',
      'countries.name': 'Россия',
      'rating.kp': '8-10',
      'sortField': 'rating.kp',
      'sortType': '-1',
      'limit': '30',
      'type': 'movie'
    }),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
}

// Последние новинки (за последние 6 месяцев)
export function useRussianLatestReleases() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const startMonth = currentMonth > 6 ? currentMonth - 6 : currentMonth + 6;
  const startYear = currentMonth > 6 ? currentYear : currentYear - 1;
  
  return useQuery({
    queryKey: ['russian-latest-releases', currentYear, currentMonth],
    queryFn: () => fetchRussianContent('/movie', {
      'premiere.russia': `01.${startMonth < 10 ? '0' + startMonth : startMonth}.${startYear}-31.12.${currentYear}`,
      'countries.name': 'Россия',
      'rating.kp': '5-10',
      'sortField': 'premiere.russia',
      'sortType': '-1',
      'limit': '40'
    }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Российские фильмы по жанрам
export function useRussianByGenre(genre: string) {
  return useQuery({
    queryKey: ['russian-by-genre', genre],
    queryFn: () => fetchRussianContent('/movie', {
      'year': '2015-2025',
      'countries.name': 'Россия',
      'genres.name': genre,
      'rating.kp': '6-10',
      'sortField': 'rating.kp',
      'sortType': '-1',
      'limit': '30'
    }),
    enabled: !!genre,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
  });
}

// Российские фильмы с российскими продюсерскими компаниями
export function useRussianByProduction() {
  return useQuery({
    queryKey: ['russian-by-production'],
    queryFn: async () => {
      const [centralPartnership, srp, enjoy, art] = await Promise.all([
        fetchRussianContent('/movie', {
          'year': '2020-2025',
          'productionCompanies.name': 'Централ Партнершип',
          'rating.kp': '6-10',
          'sortField': 'year',
          'sortType': '-1',
          'limit': '20'
        }),
        fetchRussianContent('/movie', {
          'year': '2020-2025',
          'productionCompanies.name': 'СТВ',
          'rating.kp': '6-10',
          'sortField': 'year',
          'sortType': '-1',
          'limit': '20'
        }),
        fetchRussianContent('/movie', {
          'year': '2020-2025',
          'productionCompanies.name': 'Enjoy Movies',
          'rating.kp': '6-10',
          'sortField': 'year',
          'sortType': '-1',
          'limit': '20'
        }),
        fetchRussianContent('/movie', {
          'year': '2020-2025',
          'productionCompanies.name': 'Арт Пикчерс',
          'rating.kp': '6-10',
          'sortField': 'year',
          'sortType': '-1',
          'limit': '20'
        })
      ]);

      return {
        centralPartnership: centralPartnership.docs || [],
        srp: srp.docs || [],
        enjoy: enjoy.docs || [],
        art: art.docs || []
      };
    },
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });
}