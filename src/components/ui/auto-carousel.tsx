import React, { useState, useEffect } from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieSkeleton } from '@/components/ui/movie-skeleton';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

interface AutoCarouselProps {
  title: string;
  items: (TMDbMovie | TMDbTVShow)[];
  type: 'movie' | 'tv';
  isLoading?: boolean;
  onItemClick: (id: number, type: 'movie' | 'tv') => void;
  autoPlayInterval?: number;
}

export const AutoCarousel: React.FC<AutoCarouselProps> = ({
  title,
  items,
  type,
  isLoading = false,
  onItemClick,
  autoPlayInterval = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(5);

  // Адаптивное количество элементов
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(2);
      else if (width < 768) setItemsPerView(3);
      else if (width < 1024) setItemsPerView(4);
      else setItemsPerView(5);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Автопрокрутка
  useEffect(() => {
    if (!isPlaying || items.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, items.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, itemsPerView, autoPlayInterval]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < items.length - itemsPerView;

  const scrollPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => Math.min(items.length - itemsPerView, prev + 1));
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gradient-primary">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <MovieSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className="space-y-6 animate-stagger-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gradient-primary neon-underline">
          {title}
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Progress Indicators */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.ceil(items.length / itemsPerView) }).map((_, index) => {
              const isActive = Math.floor(currentIndex / itemsPerView) === index;
              return (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive ? 'w-8 bg-primary' : 'w-2 bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover-neon-primary"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex % itemsPerView) * (100 / itemsPerView)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <MovieCard
                item={item}
                type={type}
                className="animate-scale-in hover-neon-accent transition-neon"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};