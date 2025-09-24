import React, { useState } from 'react';
import { MovieQuiz, type QuizAnswers } from '@/components/ui/movie-quiz';
import { RecommendationLoader } from '@/components/ui/recommendation-loader';
import { RecommendationResults } from '@/components/ui/recommendation-results';
import { useMovieRecommendations } from '@/hooks/useMovieRecommendations';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { TMDbMovie } from '@/lib/tmdb';

type Step = 'quiz' | 'loading' | 'results';

interface RecommendationResult {
  movies: TMDbMovie[];
  explanation: string;
  hasIncompleteAnswers: boolean;
}

interface MovieRecommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovieRecommendationDialog: React.FC<MovieRecommendationDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('quiz');
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<QuizAnswers | null>(null);
  const { getRecommendations, isLoading, error } = useMovieRecommendations();
  const navigate = useNavigate();

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setCurrentStep('loading');
    setSavedAnswers(answers);
    
    try {
      const result = await getRecommendations(answers);
      setRecommendationResult(result);
      setCurrentStep('results');
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setCurrentStep('quiz');
    }
  };

  const handleTryAgain = async () => {
    if (!savedAnswers) {
      setCurrentStep('quiz');
      return;
    }

    setCurrentStep('loading');
    
    try {
      const result = await getRecommendations(savedAnswers);
      setRecommendationResult(result);
      setCurrentStep('results');
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setCurrentStep('quiz');
    }
  };

  const handleMovieClick = (movie: TMDbMovie) => {
    navigate(`/movie/${movie.id}`);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('quiz');
    setRecommendationResult(null);
    setSavedAnswers(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {currentStep === 'quiz' && (
          <MovieQuiz onComplete={handleQuizComplete} onCancel={handleCancel} />
        )}

        {currentStep === 'loading' && (
          <RecommendationLoader />
        )}

        {currentStep === 'results' && recommendationResult && (
          <RecommendationResults
            movies={recommendationResult.movies}
            explanation={recommendationResult.explanation}
            hasIncompleteAnswers={recommendationResult.hasIncompleteAnswers}
            onTryAgain={handleTryAgain}
            onMovieClick={handleMovieClick}
          />
        )}

        {error && currentStep === 'quiz' && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-4">
            Произошла ошибка: {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};