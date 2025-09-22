import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading } = useFavorites();
  const [searchValue, setSearchValue] = useState('');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearch={handleSearch} 
        />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">Загрузка...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearch={handleSearch} 
        />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-6">
              Чтобы сохранять избранные фильмы и сериалы
            </p>
            <Button asChild>
              <a href="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Войти
              </a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        searchValue={searchValue} 
        onSearchChange={setSearchValue} 
        onSearch={handleSearch} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Избранное</h1>
          </div>
          <p className="text-muted-foreground">
            Ваши любимые фильмы и сериалы
          </p>
        </div>

        {/* Контент избранного */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[2/3]">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {favorites.map((favorite) => (
              <MovieCard
                key={favorite.id}
                item={{
                  id: favorite.tmdb_id,
                  poster_path: favorite.poster_path,
                  backdrop_path: null,
                  vote_average: favorite.vote_average,
                  vote_count: 0,
                  genre_ids: [],
                  overview: '',
                  popularity: 0,
                  adult: false,
                  video: false,
                  original_language: 'en',
                  ...(favorite.media_type === 'movie' ? {
                    title: favorite.title,
                    original_title: favorite.title,
                    release_date: favorite.release_date || '',
                  } : {
                    name: favorite.title,
                    original_name: favorite.title,
                    first_air_date: favorite.release_date || '',
                    origin_country: []
                  })
                }}
                type={favorite.media_type}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Избранное пусто</h2>
            <p className="text-muted-foreground mb-6">
              Добавляйте фильмы и сериалы в избранное, нажимая на сердечко
            </p>
            <Button asChild>
              <a href="/">Перейти к каталогу</a>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;