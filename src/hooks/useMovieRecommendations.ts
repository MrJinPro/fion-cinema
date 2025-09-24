import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDiscoverMovies } from '@/hooks/useTMDbApi';
import type { QuizAnswers } from '@/components/ui/movie-quiz';
import type { TMDbMovie } from '@/lib/tmdb';

interface RecommendationResult {
  movies: TMDbMovie[];
  explanation: string;
  hasIncompleteAnswers: boolean;
}

interface AIRecommendation {
  genres: number[];
  release_date_gte: string;
  release_date_lte: string;
  with_runtime_gte: number;
  with_runtime_lte: number;
  sort_by: string;
  explanation: string;
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

export const useMovieRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatAnswersForAI = (answers: QuizAnswers): string => {
    const parts: string[] = [];
    
    if (answers.mood) {
      parts.push(`Настроение: ${answers.mood}`);
    }
    
    if (answers.company) {
      parts.push(`Буду смотреть: ${answers.company}`);
    }
    
    if (answers.genres && answers.genres.length > 0) {
      parts.push(`Жанры: ${answers.genres.join(', ')}`);
    }
    
    if (answers.duration) {
      parts.push(`Длительность: ${answers.duration}`);
    }
    
    if (answers.movieAge) {
      parts.push(`Возраст фильмов: ${answers.movieAge}`);
    }

    return parts.join('. ');
  };

  const getRecommendations = async (answers: QuizAnswers): Promise<RecommendationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Format answers for AI
      const formattedAnswers = formatAnswersForAI(answers);
      
      // Check if answers are incomplete
      const totalQuestions = 5;
      const answeredQuestions = Object.keys(answers).filter(key => {
        const value = answers[key as keyof QuizAnswers];
        return value && (Array.isArray(value) ? value.length > 0 : true);
      }).length;
      
      const hasIncompleteAnswers = answeredQuestions < totalQuestions;

      // Call AI for recommendations
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: formattedAnswers }
      });

      if (aiError) {
        throw new Error(aiError.message || 'Failed to get AI recommendations');
      }

      let aiRecommendation: AIRecommendation;
      try {
        // Try to parse JSON response
        const responseText = aiData?.response || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }
        aiRecommendation = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to default recommendation criteria
        aiRecommendation = {
          genres: answers.genres?.map(g => GENRE_MAP[g]).filter(Boolean) || [35, 18], // Comedy, Drama
          release_date_gte: '2020-01-01',
          release_date_lte: new Date().toISOString().split('T')[0],
          with_runtime_gte: 80,
          with_runtime_lte: 180,
          sort_by: 'popularity.desc',
          explanation: 'Подобрали популярные фильмы на основе ваших предпочтений.'
        };
      }

      // Use TMDb discover API to get movies
      const filters = {
        with_genres: aiRecommendation.genres.join(','),
        'release_date.gte': aiRecommendation.release_date_gte,
        'release_date.lte': aiRecommendation.release_date_lte,
        with_runtime_gte: aiRecommendation.with_runtime_gte.toString(),
        with_runtime_lte: aiRecommendation.with_runtime_lte.toString(),
        sort_by: aiRecommendation.sort_by,
        page: '1',
        language: 'ru-RU',
      };

      console.log('Fetching movies with filters:', filters);

      // Use Supabase function to get movies
      const { data: tmdbData, error: tmdbError } = await supabase.functions.invoke('tmdb-proxy', {
        body: { 
          endpoint: '/discover/movie',
          params: filters
        }
      });

      if (tmdbError) {
        console.error('TMDb API error:', tmdbError);
        throw new Error(tmdbError.message || 'Failed to fetch movies');
      }

      const movies = tmdbData?.results?.slice(0, 5) || [];
      console.log('Found movies:', movies.length);

      return {
        movies,
        explanation: aiRecommendation.explanation,
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