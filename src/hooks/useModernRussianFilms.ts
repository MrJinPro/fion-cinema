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
  const now = new Date();
  const from = new Date(now.getTime() - 60*24*3600*1000).toISOString().slice(0,10); // последние 60 дней
  
  try {
    console.log('🎬 Fetching modern Russian films with updated parameters...');
    
    // Используем улучшенные параметры для получения свежих фильмов
    const { data, error } = await supabase.functions.invoke('kinopoisk-proxy', {
      body: { 
        endpoint: '/movie',
        params: {
          'countries.name': 'Россия',
          'premiere.russia': `>=${from}`, // фильмы с премьерой за последние 60 дней
          'rating.kp': '5.0-10', // снизили минимальный рейтинг
          'sortField': 'premiere.russia', // сортировка по дате премьеры
          'sortType': '-1',
          'limit': '20',
          'selectFields': 'id,name,alternativeName,year,poster,rating,genres,premiere' // добавили selectFields
        }
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 API Response received:', { 
      hasData: !!data, 
      hasError: !!error, 
      docsCount: data?.docs?.length || 0 
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
    queryKey: ['modern-russian-films', Math.floor(Date.now() / (10 * 60 * 1000))], // Обновляем каждые 10 минут для отладки
    queryFn: fetchModernRussianFilms,
    staleTime: 1000 * 60 * 10, // 10 минут кэш для отладки
  });
}