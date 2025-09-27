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

      // Call AI for recommendations with proper system prompt
      const systemPrompt = `Ты помощник по подбору фильмов. На основе предпочтений пользователя создай JSON ответ с параметрами для поиска фильмов в TMDb API. 

Верни ТОЛЬКО JSON в таком формате:
{
  "genres": [числовые ID жанров из TMDb],
  "release_date_gte": "YYYY-MM-DD",
  "release_date_lte": "YYYY-MM-DD", 
  "with_runtime_gte": число_минут,
  "with_runtime_lte": число_минут,
  "sort_by": "popularity.desc",
  "explanation": "объяснение рекомендаций на русском"
}

TMDb жанры: Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, Sci-Fi=878, Thriller=53, War=10752, Western=37

Предпочтения пользователя: ${formattedAnswers}`;

      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai', {
        body: { 
          message: systemPrompt
        }
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

      // Use TMDb proxy with GET request and URL parameters
      const searchParams = new URLSearchParams({
        endpoint: '/discover/movie',
        ...filters
      });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-proxy?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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