import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Film, Search, Sparkles, Clock } from 'lucide-react';

const LOADING_MESSAGES = [
  { icon: Search, text: "🎬 Копаюсь в архивах..." },
  { icon: Sparkles, text: "🤔 Анализирую ваши предпочтения..." },
  { icon: Film, text: "🔍 Подбираю что-то свежее..." },
  { icon: Clock, text: "⭐ Почти готово, осталось найти идеальное..." },
];

export const RecommendationLoader: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Icon className="h-8 w-8 text-primary animate-bounce" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Подбираем фильмы для вас
          </h2>
        </div>
        
        <div className="animate-fade-in">
          <p className="text-lg text-muted-foreground">{currentMessage.text}</p>
        </div>
        
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="overflow-hidden bg-card/50 border-border/50">
            <div className="relative aspect-[2/3]">
              <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};