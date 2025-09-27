import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { MovieSkeleton } from './movie-skeleton';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Badge } from './badge';
import { Info, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKinopoiskCategories, useCategoryMovies, useRussianMoviesFromDB } from '@/hooks/useWebScraping';
export function RussianContentEnhanced() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('russian-cinema');
  const {
    data: categories,
    isLoading: isLoadingCategories
  } = useKinopoiskCategories();
  const {
    data: categoryMovies,
    isLoading: isLoadingCategory
  } = useCategoryMovies(activeCategory);
  const {
    data: russianMoviesDB,
    isLoading: isLoadingRussianDB
  } = useRussianMoviesFromDB();
  const isLoading = isLoadingCategories || isLoadingCategory || isLoadingRussianDB;
  const handleKinopoiskClick = (id: number) => {
    navigate(`/search?q=${id}`);
  };
  if (isLoading && !categories) {
    return <div className="space-y-8">
        <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <MovieSkeleton key={i} />)}
        </div>
      </div>;
  }
  return <div className="space-y-8">
      

      {/* Categories Navigation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-primary">Категории российского кино</h2>
        {categories && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(category => <Button key={category.slug} variant={activeCategory === category.slug ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(category.slug)} className="text-xs">
                {category.name}
              </Button>)}
          </div>}
      </div>

      {/* Current Category Content */}
      <div className="space-y-6">
        {categories && <div>
            <h3 className="text-xl font-semibold mb-4">
              {categories.find(c => c.slug === activeCategory)?.name || 'Российское кино'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {categories.find(c => c.slug === activeCategory)?.description}
            </p>
            
            {isLoadingCategory ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => <MovieSkeleton key={i} />)}
              </div> : categoryMovies && categoryMovies.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryMovies.slice(0, 18).map(movie => <div key={movie.id} className="group cursor-pointer" onClick={() => handleKinopoiskClick(parseInt(movie.id))}>
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted transition-transform group-hover:scale-105">
                      {movie.poster ? <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center">
                          <span className="text-muted-foreground">Нет постера</span>
                        </div>}
                      
                      {movie.rating && <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                          {movie.rating.toFixed(1)}
                        </div>}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <h4 className="text-sm font-medium line-clamp-2">{movie.title}</h4>
                      {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
                      {movie.genres && movie.genres.length > 0 && <p className="text-xs text-muted-foreground">
                          {movie.genres.slice(0, 2).join(', ')}
                        </p>}
                    </div>
                  </div>)}
              </div> : <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Загружаем фильмы для этой категории...
                </p>
                {russianMoviesDB && russianMoviesDB.length > 0 && <div>
                    <h4 className="text-lg font-medium mb-4">Популярные российские фильмы из нашей базы:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {russianMoviesDB.slice(0, 12).map(movie => <div key={movie.id} className="group cursor-pointer" onClick={() => handleKinopoiskClick(parseInt(movie.id))}>
                          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted transition-transform group-hover:scale-105">
                            {movie.poster ? <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center">
                                <span className="text-muted-foreground">Нет постера</span>
                              </div>}
                            
                            {movie.rating && <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                                {movie.rating.toFixed(1)}
                              </div>}
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <h4 className="text-sm font-medium line-clamp-2">{movie.title}</h4>
                            {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
                          </div>
                        </div>)}
                    </div>
                  </div>}
              </div>}
          </div>}
      </div>
    </div>;
}