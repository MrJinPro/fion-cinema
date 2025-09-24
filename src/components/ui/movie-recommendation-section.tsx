import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MovieRecommendationDialog } from '@/components/ui/movie-recommendation-dialog';
import { Sparkles, Film } from 'lucide-react';

export const MovieRecommendationSection: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartQuiz = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
            
            <CardContent className="relative p-6 text-center space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <Film className="h-6 w-6 text-secondary" />
                </div>
                
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Не знаете что посмотреть?
                </h2>
                
                <p className="text-base text-muted-foreground">
                  Ответьте на несколько вопросов, и наш ИИ подберет идеальные фильмы!
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleStartQuiz}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-6 py-4"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Подобрать фильм для меня
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Займет всего 1-2 минуты
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <MovieRecommendationDialog 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
      />
    </>
  );
};