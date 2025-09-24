import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MovieQuiz, type QuizAnswers } from '@/components/ui/movie-quiz';
import { RecommendationLoader } from '@/components/ui/recommendation-loader';
import { RecommendationResults } from '@/components/ui/recommendation-results';
import { useMovieRecommendations } from '@/hooks/useMovieRecommendations';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film } from 'lucide-react';
import type { TMDbMovie } from '@/lib/tmdb';

type Step = 'prompt' | 'quiz' | 'loading' | 'results';

interface RecommendationResult {
  movies: TMDbMovie[];
  explanation: string;
  hasIncompleteAnswers: boolean;
}

export const MovieRecommendationSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('prompt');
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null);
  const { getRecommendations, isLoading, error } = useMovieRecommendations();
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setCurrentStep('loading');
    
    try {
      const result = await getRecommendations(answers);
      setRecommendationResult(result);
      setCurrentStep('results');
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setCurrentStep('prompt');
    }
  };

  const handleTryAgain = () => {
    setRecommendationResult(null);
    setCurrentStep('quiz');
  };

  const handleMovieClick = (movie: TMDbMovie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleCancel = () => {
    setCurrentStep('prompt');
    setRecommendationResult(null);
  };

  if (currentStep === 'quiz') {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <MovieQuiz onComplete={handleQuizComplete} onCancel={handleCancel} />
        </div>
      </section>
    );
  }

  if (currentStep === 'loading') {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <RecommendationLoader />
        </div>
      </section>
    );
  }

  if (currentStep === 'results' && recommendationResult) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <RecommendationResults
            movies={recommendationResult.movies}
            explanation={recommendationResult.explanation}
            hasIncompleteAnswers={recommendationResult.hasIncompleteAnswers}
            onTryAgain={handleTryAgain}
            onMovieClick={handleMovieClick}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
          
          <CardContent className="relative p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-10 w-10 text-primary" />
                <Film className="h-8 w-8 text-secondary" />
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Не знаете что посмотреть?
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Ответьте на несколько вопросов, и наш ИИ подберет идеальные фильмы специально для вас!
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleStartQuiz}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-8 py-6 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Подобрать фильм для меня
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Займет всего 1-2 минуты
              </p>
            </div>
            
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                Произошла ошибка: {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};