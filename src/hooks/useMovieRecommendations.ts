import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/public-env';
import type { QuizAnswers } from '@/components/ui/movie-quiz';
import type { TMDbMovie } from '@/lib/tmdb';

interface RecommendationResult {
  movies: TMDbMovie[];
  explanation: string;
  hasIncompleteAnswers: boolean;
}

type SortBy = 'popularity.desc' | 'vote_average.desc' | 'revenue.desc';

interface AIRecommendation {
  genre_keys?: string[];
  sort_by?: string;
  explanation?: string;
  // backward compatibility (older JSON formats)
  genres?: number[];
}

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const MOOD_LABEL: Record<string, string> = {
  happy: 'Весёлое',
  romantic: 'Романтичное',
  tense: 'Хочется напряжения',
  sad: 'Грустное',
  relaxed: 'Расслабленное',
};

const COMPANY_LABEL: Record<string, string> = {
  alone: 'Один/одна',
  couple: 'С парой',
  friends: 'С друзьями',
  family: 'С семьёй',
};

const DURATION_LABEL: Record<string, string> = {
  short: 'До 90 минут',
  medium: '90–150 минут',
  long: 'Больше 150 минут',
};

const MOVIE_AGE_LABEL: Record<string, string> = {
  new: 'Новинки (последние 3 года)',
  recent: 'Недавние (5–10 лет назад)',
  classic: 'Классика',
};

const PRIORITY_LABEL: Record<string, string> = {
  popular: 'Популярность',
  rating: 'Высокий рейтинг',
  blockbuster: 'Блокбастер',
};

const PRIORITY_SORT: Record<string, SortBy> = {
  popular: 'popularity.desc',
  rating: 'vote_average.desc',
  blockbuster: 'revenue.desc',
};

const MOOD_GENRE_BOOST: Record<string, string[]> = {
  happy: ['comedy', 'adventure', 'family'],
  romantic: ['romance', 'drama', 'comedy'],
  tense: ['thriller', 'mystery', 'action'],
  sad: ['drama', 'romance', 'history'],
  relaxed: ['comedy', 'family', 'animation', 'documentary'],
};

const COMPANY_GENRE_BOOST: Record<string, string[]> = {
  alone: ['drama', 'mystery', 'documentary'],
  couple: ['romance', 'comedy', 'drama'],
  friends: ['comedy', 'action', 'adventure', 'thriller'],
  family: ['family', 'animation', 'adventure', 'comedy'],
};

const SORT_BY_ALLOWED: SortBy[] = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];

const toYmd = (date: Date) => date.toISOString().split('T')[0];

const shiftYears = (date: Date, years: number) => {
  const d = new Date(date.getTime());
  d.setFullYear(d.getFullYear() + years);
  return d;
};

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
};

const sanitizeSortBy = (value: unknown): SortBy => {
  if (typeof value !== 'string') return 'popularity.desc';
  return (SORT_BY_ALLOWED as string[]).includes(value) ? (value as SortBy) : 'popularity.desc';
};

const normalizeGenreKeys = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().toLowerCase())
    .filter((v) => !!v && Object.prototype.hasOwnProperty.call(GENRE_MAP, v));
};

const jsonFromText = (text: string): string | null => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
};

const computeRuntimeRange = (duration?: string) => {
  switch (duration) {
    case 'short':
      return { min: 0, max: 90 };
    case 'medium':
      return { min: 90, max: 150 };
    case 'long':
      return { min: 150, max: 240 };
    default:
      return { min: 80, max: 180 };
  }
};

const computeReleaseRange = (movieAge?: string) => {
  const today = new Date();
  if (movieAge === 'new') {
    return { gte: toYmd(shiftYears(today, -3)), lte: toYmd(today) };
  }
  if (movieAge === 'recent') {
    return { gte: toYmd(shiftYears(today, -10)), lte: toYmd(shiftYears(today, -5)) };
  }
  if (movieAge === 'classic') {
    return { gte: '1950-01-01', lte: toYmd(shiftYears(today, -10)) };
  }
  return { gte: '2020-01-01', lte: toYmd(today) };
};

const uniqueNumbers = (values: number[]) => Array.from(new Set(values));

const uniqueStrings = (values: string[]) => Array.from(new Set(values));

const safeYearFromYmd = (date: unknown): number | null => {
  if (typeof date !== 'string') return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
};

const pickDiverseMovies = (movies: TMDbMovie[], limit: number) => {
  const picked: TMDbMovie[] = [];
  const usedGenre = new Set<number>();
  const usedDecade = new Set<number>();

  const tryPick = (movie: TMDbMovie) => {
    if (picked.length >= limit) return;

    const primaryGenre = Array.isArray(movie.genre_ids) ? movie.genre_ids[0] : undefined;
    const year = safeYearFromYmd(movie.release_date);
    const decade = year ? Math.floor(year / 10) : null;

    const genreOk = typeof primaryGenre === 'number' ? !usedGenre.has(primaryGenre) : true;
    const decadeOk = typeof decade === 'number' ? !usedDecade.has(decade) : true;

    if (genreOk && decadeOk) {
      picked.push(movie);
      if (typeof primaryGenre === 'number') usedGenre.add(primaryGenre);
      if (typeof decade === 'number') usedDecade.add(decade);
    }
  };

  // Pass 1: максимально разнообразно
  for (const movie of movies) tryPick(movie);

  // Pass 2: добиваем остаток без строгих ограничений
  if (picked.length < limit) {
    const pickedId = new Set(picked.map((m) => m.id));
    for (const movie of movies) {
      if (picked.length >= limit) break;
      if (pickedId.has(movie.id)) continue;
      picked.push(movie);
      pickedId.add(movie.id);
    }
  }

  return picked.slice(0, limit);
};

export const useMovieRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQueryKeyRef = useRef<string>('');
  const attemptRef = useRef<number>(0);
  const lastResultIdsRef = useRef<string>('');

  const formatAnswersForAI = (answers: QuizAnswers): string => {
    const parts: string[] = [];

    if (answers.mood) {
      parts.push(`Настроение: ${MOOD_LABEL[answers.mood] ?? answers.mood}`);
    }

    if (answers.company) {
      parts.push(`Компания: ${COMPANY_LABEL[answers.company] ?? answers.company}`);
    }

    if (answers.genres && answers.genres.length > 0) {
      parts.push(`Выбранные жанры: ${answers.genres.join(', ')}`);
    }

    if (answers.priority) {
      parts.push(`Приоритет: ${PRIORITY_LABEL[answers.priority] ?? answers.priority}`);
    }

    if (answers.avoidGenres && answers.avoidGenres.length > 0) {
      parts.push(`Исключить жанры: ${answers.avoidGenres.join(', ')}`);
    }

    if (answers.duration) {
      parts.push(`Время: ${DURATION_LABEL[answers.duration] ?? answers.duration}`);
    }

    if (answers.movieAge) {
      parts.push(`Период: ${MOVIE_AGE_LABEL[answers.movieAge] ?? answers.movieAge}`);
    }

    return parts.join('. ');
  };

  const getRecommendations = async (answers: QuizAnswers): Promise<RecommendationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedAnswers = formatAnswersForAI(answers);

      const totalQuestions = 7;
      const answeredQuestions = Object.keys(answers).filter((key) => {
        const value = answers[key as keyof QuizAnswers];
        return value && (Array.isArray(value) ? value.length > 0 : true);
      }).length;
      const hasIncompleteAnswers = answeredQuestions < totalQuestions;

      const runtimeRange = computeRuntimeRange(answers.duration);
      const releaseRange = computeReleaseRange(answers.movieAge);

      const excludedGenreIds = uniqueNumbers(
        (Array.isArray(answers.avoidGenres) ? answers.avoidGenres : [])
          .map((k) => GENRE_MAP[k])
          .filter((v): v is number => typeof v === 'number'),
      );

      const systemPrompt = `Ты — рекомендательный ассистент кино.
Верни ТОЛЬКО валидный JSON (без markdown и без текста до/после JSON).

Формат ответа:
{
  "genre_keys": ["comedy", "drama"],
  "sort_by": "popularity.desc",
  "explanation": "1–2 предложения на русском, без спойлеров"
}

Правила:
- "genre_keys": массив из 1–3 значений, строго из списка: ${Object.keys(GENRE_MAP).join(', ')}.
- Если пользователь явно выбрал жанры, верни ИХ ЖЕ (как ключи).
- "sort_by": одно из: ${SORT_BY_ALLOWED.map((v) => `"${v}"`).join(', ')}.
- Никаких других ключей.

Контекст фильтрации (фиксированный):
- Длительность (мин): ${runtimeRange.min}–${runtimeRange.max}
- Даты релиза: ${releaseRange.gte}..${releaseRange.lte}

Ограничения:
- Если пользователь указал исключаемые жанры, не предлагай их.

Предпочтения пользователя: ${formattedAnswers}`;

      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai', {
        body: {
          message: systemPrompt,
        },
      });

      if (aiError) {
        console.error('AI function error:', aiError);
        throw new Error(`AI service error: ${aiError.message || 'Unknown error'}`);
      }

      if (!aiData?.response) {
        console.error('No response from AI service');
        throw new Error('AI service returned empty response');
      }

      let aiRecommendation: AIRecommendation;
      try {
        const responseText = String(aiData?.response ?? '');
        const jsonText = jsonFromText(responseText);
        if (!jsonText) throw new Error('No JSON found in AI response');
        aiRecommendation = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        aiRecommendation = {
          genre_keys: Array.isArray(answers.genres) ? answers.genres : [],
          sort_by: 'popularity.desc',
          explanation: 'Подобрали популярные фильмы на основе ваших предпочтений.',
        };
      }

      const explicitGenreKeys = Array.isArray(answers.genres) ? answers.genres : [];
      const aiGenreKeys = normalizeGenreKeys(aiRecommendation.genre_keys);

      const moodBoost = answers.mood && MOOD_GENRE_BOOST[answers.mood] ? MOOD_GENRE_BOOST[answers.mood] : [];
      const companyBoost = answers.company && COMPANY_GENRE_BOOST[answers.company] ? COMPANY_GENRE_BOOST[answers.company] : [];
      const boostKeys = uniqueStrings([...moodBoost, ...companyBoost]);

      const excludedGenreKeySet = new Set(Array.isArray(answers.avoidGenres) ? answers.avoidGenres : []);

      const primaryKeys = explicitGenreKeys.length > 0 ? explicitGenreKeys : aiGenreKeys;
      const finalGenreKeys = uniqueStrings([
        ...primaryKeys,
        ...(explicitGenreKeys.length > 0 && explicitGenreKeys.length >= 3 ? [] : boostKeys),
      ])
        .map((k) => String(k).trim().toLowerCase())
        .filter((k) => Object.prototype.hasOwnProperty.call(GENRE_MAP, k))
        .filter((k) => !excludedGenreKeySet.has(k))
        .slice(0, 3);

      const genreIdsFromKeys = finalGenreKeys
        .map((k) => GENRE_MAP[k])
        .filter((v): v is number => typeof v === 'number');

      const filteredGenreIds = genreIdsFromKeys.filter((id) => !excludedGenreIds.includes(id));

      const fallbackGenreIds = [35, 18, 28, 10751, 12, 53, 14, 16]
        .filter((id) => !excludedGenreIds.includes(id))
        .slice(0, 3);

      const finalGenreIds = (filteredGenreIds.length > 0 ? filteredGenreIds : fallbackGenreIds).slice(0, 3);

      const finalRuntimeMin = clampInt(runtimeRange.min, 0, 240, 80);
      const finalRuntimeMax = clampInt(runtimeRange.max, 30, 300, 180);
      const finalSortBy = answers.priority && PRIORITY_SORT[answers.priority]
        ? PRIORITY_SORT[answers.priority]
        : sanitizeSortBy(aiRecommendation.sort_by);
      const finalExplanation =
        typeof aiRecommendation.explanation === 'string' && aiRecommendation.explanation.trim()
          ? aiRecommendation.explanation.trim()
          : 'Подобрали популярные фильмы на основе ваших предпочтений.';

      const queryKey = JSON.stringify({
        with_genres: finalGenreIds.join(','),
        without_genres: excludedGenreIds.join(','),
        release_date_gte: releaseRange.gte,
        release_date_lte: releaseRange.lte,
        with_runtime_gte: finalRuntimeMin,
        with_runtime_lte: finalRuntimeMax,
        sort_by: finalSortBy,
      });

      if (lastQueryKeyRef.current === queryKey) {
        attemptRef.current += 1;
      } else {
        attemptRef.current = 0;
        lastQueryKeyRef.current = queryKey;
      }

      const baseFilters = {
        with_genres: finalGenreIds.join(','),
        ...(excludedGenreIds.length > 0 ? { without_genres: excludedGenreIds.join(',') } : {}),
        'release_date.gte': releaseRange.gte,
        'release_date.lte': releaseRange.lte,
        with_runtime_gte: String(finalRuntimeMin),
        with_runtime_lte: String(finalRuntimeMax),
        sort_by: finalSortBy,
        ...(finalSortBy === 'vote_average.desc' ? { 'vote_count.gte': '200' } : {}),
        language: 'ru-RU',
      };

      const supabaseUrl = getSupabaseUrl();
      const supabaseAnonKey = getSupabaseAnonKey();
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase env is not configured. Cannot call tmdb-proxy.');
      }

      const fetchDiscoverPage = async (page: number) => {
        const filters = {
          ...baseFilters,
          page: String(page),
        };

        console.log('Fetching movies with filters:', filters);

        const searchParams = new URLSearchParams({
          endpoint: '/discover/movie',
          ...filters,
        });

        const response = await fetch(`${supabaseUrl}/functions/v1/tmdb-proxy?${searchParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('TMDb proxy error:', response.status, errorText);
          throw new Error(`TMDb proxy error: ${response.status}`);
        }

        return response.json();
      };

      const startingPage = 1 + (attemptRef.current % 5);
      const pagesToTry = [startingPage, startingPage + 1, startingPage + 2].filter((p) => p >= 1 && p <= 10);

      let movies: TMDbMovie[] = [];
      for (const page of pagesToTry) {
        const tmdbData = await fetchDiscoverPage(page);
        const rawResults = (tmdbData?.results as TMDbMovie[] | undefined) ?? [];

        // Берём пул побольше и формируем подборку «как куратор»
        const pool = rawResults
          .filter((m) => m && typeof m.id === 'number')
          .filter((m) => !m.adult)
          .slice(0, 20);

        const withPoster = pool.filter((m) => !!m.poster_path);
        const poolForPick = withPoster.length >= 8 ? withPoster : pool;

        const candidate = pickDiverseMovies(poolForPick, 5);
        const candidateIds = candidate.map((m) => m.id).join(',');

        // If we're repeating the same query, avoid returning identical results.
        if (attemptRef.current > 0 && candidateIds && candidateIds === lastResultIdsRef.current) {
          continue;
        }

        movies = candidate;
        if (candidateIds) lastResultIdsRef.current = candidateIds;
        break;
      }

      console.log('Found movies:', movies.length);

      return {
        movies,
        explanation: finalExplanation,
        hasIncompleteAnswers,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRecommendations,
    isLoading,
    error,
  };
};