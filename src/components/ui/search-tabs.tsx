import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieCard } from './movie-card';
import { KinopoiskMovieCard } from './kinopoisk-movie-card';
import { MovieSkeleton } from './movie-skeleton';
import { useSearchMulti } from '@/hooks/useTMDbApi';
import { useKinopoiskSearch } from '@/hooks/useKinopoisk';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';

interface SearchTabsProps {
  searchQuery: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function SearchTabs({ searchQuery, currentPage, onPageChange }: SearchTabsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("world");

  // TMDb search (World)
  const { data: tmdbData, isLoading: tmdbLoading, error: tmdbError } = useSearchMulti(
    searchQuery, 
    currentPage
  );

  // Kinopoisk.dev search (Russian)
  const { data: kinopoiskData, isLoading: kinopoiskLoading, error: kinopoiskError } = useKinopoiskSearch(
    searchQuery,
    activeTab === "russian" && searchQuery.length > 0
  );

  const handleMovieClick = (id: number, type: 'movie' | 'tv') => {
    navigate(`/${type}/${id}`);
  };

  const getItemType = (item: TMDbMovie | TMDbTVShow): 'movie' | 'tv' => {
    return 'title' in item ? 'movie' : 'tv';
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="world">🌍 Мировое</TabsTrigger>
        <TabsTrigger value="russian">🇷🇺 Русское</TabsTrigger>
      </TabsList>
      
      <TabsContent value="world" className="space-y-6 mt-6">
        {searchQuery ? (
          <>
            {tmdbLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : tmdbError ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Ошибка при поиске</p>
              </div>
            ) : tmdbData?.results && tmdbData.results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tmdbData.results
                  .filter((item: any) => item.media_type !== 'person')
                  .map((item: any) => {
                    const movieOrTv = item as TMDbMovie | TMDbTVShow;
                    return (
                      <MovieCard
                        key={`${movieOrTv.id}-${getItemType(movieOrTv)}`}
                        item={movieOrTv}
                        type={getItemType(movieOrTv)}
                      />
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Ничего не найдено</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Введите запрос для поиска</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="russian" className="space-y-6 mt-6">
        {searchQuery ? (
          <>
            {kinopoiskLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : kinopoiskError ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Ошибка при поиске в Кинопоиске</p>
              </div>
            ) : kinopoiskData?.docs && kinopoiskData.docs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {kinopoiskData.docs.map((movie) => (
                  <KinopoiskMovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Ничего не найдено в русском кино</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Введите запрос для поиска русских фильмов</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}