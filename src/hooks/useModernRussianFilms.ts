import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModernRussianFilm {
  id: number;
  name: string;
  alternativeName?: string;
  year: number;
  poster?: {
    url: string;
  };
  rating?: {
    kp: number;
  };
  genres?: Array<{ name: string }>;
}

async function fetchModernRussianFilms(): Promise<ModernRussianFilm[]> {
  const currentYear = new Date().getFullYear();
  
  try {
    // Используем kinopoisk-proxy для получения современных российских фильмов
    const { data, error } = await supabase.functions.invoke('kinopoisk-proxy', {
      body: { 
        endpoint: '/movie',
        params: {
          'year': `2023-${currentYear}`,
          'countries.name': 'Россия',
          'rating.kp': '6.5-10',
          'sortField': 'rating.kp',
          'sortType': '-1',
          'limit': '20'
        }
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error('Kinopoisk API error:', error);
      return getFallbackModernFilms();
    }

    if (!data || !data.docs || !Array.isArray(data.docs)) {
      console.warn('Invalid data structure from Kinopoisk API');
      return getFallbackModernFilms();
    }

    // Перемешиваем результаты для разнообразия
    const validMovies = data.docs.filter(movie => movie && movie.id && movie.name);
    const shuffled = validMovies.length > 0 ? shuffleArray([...validMovies]) : [];
    return shuffled.slice(0, 12); // Показываем только 12 фильмов
    
  } catch (error) {
    console.error('Error fetching modern Russian films:', error);
    return getFallbackModernFilms();
  }
}

// Функция для перемешивания массива
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fallback данные для современных российских фильмов
function getFallbackModernFilms(): ModernRussianFilm[] {
  const fallbackFilms = [
    {
      id: 4774644,
      name: "Чебурашка",
      year: 2023,
      rating: { kp: 6.8 },
      genres: [{ name: "семейный" }, { name: "комедия" }]
    },
    {
      id: 4542208,
      name: "Призрак",
      year: 2023,
      rating: { kp: 6.9 },
      genres: [{ name: "боевик" }, { name: "криминал" }]
    },
    {
      id: 5027556,
      name: "Майор Гром: Игра",
      year: 2024,
      rating: { kp: 7.1 },
      genres: [{ name: "боевик" }, { name: "приключения" }]
    },
    {
      id: 4716098,
      name: "Огниво",
      year: 2024,
      rating: { kp: 6.7 },
      genres: [{ name: "семейный" }, { name: "фэнтези" }]
    }
  ];
  
  return shuffleArray(fallbackFilms);
}

export function useModernRussianFilms() {
  return useQuery({
    queryKey: ['modern-russian-films', new Date().getHours()], // Обновляем каждый час
    queryFn: fetchModernRussianFilms,
    staleTime: 1000 * 60 * 60, // 1 час кэш
  });
}