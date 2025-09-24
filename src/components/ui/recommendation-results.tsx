import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MovieCard } from '@/components/ui/movie-card';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import type { TMDbMovie } from '@/lib/tmdb';

interface RecommendationResultsProps {
  movies: TMDbMovie[];
  explanation: string;
  hasIncompleteAnswers: boolean;
  onTryAgain: () => void;
  onMovieClick: (movie: TMDbMovie) => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  movies,
  explanation,
  hasIncompleteAnswers,
  onTryAgain,
  onMovieClick,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Рекомендации для вас
          </h2>
        </div>
        
        {hasIncompleteAnswers && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <p className="text-sm text-warning">
                Внимание: некоторые вопросы были пропущены. Возможно, рекомендации будут не совсем точными.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Почему мы выбрали эти фильмы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{explanation}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {movies.map((movie, index) => (
          <div key={movie.id} className="relative">
            <Badge 
              className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground"
            >
              #{index + 1}
            </Badge>
            <MovieCard
              item={movie}
              type="movie"
              className="hover-scale cursor-pointer"
            />
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              К сожалению, не удалось найти подходящие фильмы по вашим критериям.
            </p>
            <Button onClick={onTryAgain} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Попробовать еще раз
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button onClick={onTryAgain} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Подобрать другие фильмы
        </Button>
      </div>
    </div>
  );
};