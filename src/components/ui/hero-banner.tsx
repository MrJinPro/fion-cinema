import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

interface HeroBannerProps {
  items: (TMDbMovie | TMDbTVShow)[];
  onItemClick: (id: number, type: 'movie' | 'tv') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items, onItemClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  
  const tmdbClient = getTMDbClient();
  const currentItem = items[currentIndex];
  
  // Автопрокрутка каждые 6 секунд
  useEffect(() => {
    if (!isAutoPlay || items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [items.length, isAutoPlay]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlay(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlay(false);
  };

  const handleItemClick = () => {
    const type = 'title' in currentItem ? 'movie' : 'tv';
    onItemClick(currentItem.id, type);
  };

  if (!currentItem) return null;

  const backdropUrl = currentItem.backdrop_path 
    ? tmdbClient.getBackdropURL(currentItem.backdrop_path, 'original')
    : '';
    
  const title = 'title' in currentItem ? currentItem.title : currentItem.name;
  const releaseYear = 'release_date' in currentItem 
    ? new Date(currentItem.release_date).getFullYear()
    : new Date(currentItem.first_air_date).getFullYear();

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-xl">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundPosition: 'center 20%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container px-6">
          <div className="max-w-2xl space-y-6 animate-fade-up">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                {title}
              </h1>
              <p className="text-xl text-white/80">{releaseYear}</p>
            </div>
            
            {currentItem.overview && (
              <p className="text-lg text-white/90 max-w-xl leading-relaxed line-clamp-3">
                {currentItem.overview}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 hover-neon-primary transition-neon"
                onClick={handleItemClick}
              >
                <Play className="w-5 h-5 mr-2" />
                Подробнее
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {items.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-primary w-8' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsAutoPlay(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover-neon-primary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover-neon-primary"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};