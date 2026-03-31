import { useState } from 'react';
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

export const useMovieRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const totalQuestions = 5;
      const answeredQuestions = Object.keys(answers).filter((key) => {
        const value = answers[key as keyof QuizAnswers];
        return value && (Array.isArray(value) ? value.length > 0 : true);
      }).length;
      const hasIncompleteAnswers = answeredQuestions < totalQuestions;

      const runtimeRange = computeRuntimeRange(answers.duration);
      const releaseRange = computeReleaseRange(answers.movieAge);

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

      const finalGenreKeys = (explicitGenreKeys.length > 0 ? explicitGenreKeys : aiGenreKeys)
        .filter((k) => Object.prototype.hasOwnProperty.call(GENRE_MAP, k))
        .slice(0, 3);

      const finalGenreIds = (finalGenreKeys.length > 0
        ? finalGenreKeys.map((k) => GENRE_MAP[k]).filter(Boolean)
        : [35, 18]
      ).slice(0, 3);

      const finalRuntimeMin = clampInt(runtimeRange.min, 0, 240, 80);
      const finalRuntimeMax = clampInt(runtimeRange.max, 30, 300, 180);
      const finalSortBy = sanitizeSortBy(aiRecommendation.sort_by);
      const finalExplanation =
        typeof aiRecommendation.explanation === 'string' && aiRecommendation.explanation.trim()
          ? aiRecommendation.explanation.trim()
          : 'Подобрали популярные фильмы на основе ваших предпочтений.';

      const filters = {
        with_genres: finalGenreIds.join(','),
        'release_date.gte': releaseRange.gte,
        'release_date.lte': releaseRange.lte,
        with_runtime_gte: String(finalRuntimeMin),
        with_runtime_lte: String(finalRuntimeMax),
        sort_by: finalSortBy,
        page: '1',
        language: 'ru-RU',
      };

      console.log('Fetching movies with filters:', filters);

      const searchParams = new URLSearchParams({
        endpoint: '/discover/movie',
        ...filters,
      });

      const supabaseUrl = getSupabaseUrl();
      const supabaseAnonKey = getSupabaseAnonKey();
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase env is not configured. Cannot call tmdb-proxy.');
      }

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

      const tmdbData = await response.json();
      const movies = tmdbData?.results?.slice(0, 5) || [];
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