import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search as SearchIcon, Trash2 } from 'lucide-react';
import { FavoriteItem, getStorageRepository } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storage = getStorageRepository();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const items = await storage.getFavorites();
      setFavorites(items);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleRemoveFromFavorites = async (item: FavoriteItem) => {
    try {
      await storage.removeFromFavorites(item.id, item.type);
      setFavorites(prev => prev.filter(fav => !(fav.id === item.id && fav.type === item.type)));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const handleItemClick = (item: FavoriteItem) => {
    navigate(`/${item.type}/${item.id}`);
  };

  const clearAllFavorites = async () => {
    if (window.confirm('Вы уверены, что хотите удалить все избранные фильмы и сериалы?')) {
      try {
        // Удаляем все элементы по одному
        for (const item of favorites) {
          await storage.removeFromFavorites(item.id, item.type);
        }
        setFavorites([]);
      } catch (error) {
        console.error('Failed to clear favorites:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main className="container px-4 py-8">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Избранное
            </h1>
            <p className="text-muted-foreground mt-2">
              Ваши любимые фильмы и сериалы
            </p>
          </div>

          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllFavorites}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Очистить всё
            </Button>
          )}
        </div>

        {/* Статистика */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{favorites.length}</div>
                <p className="text-sm text-muted-foreground">Всего добавлено</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange">
                  {favorites.filter(item => item.type === 'movie').length}
                </div>
                <p className="text-sm text-muted-foreground">Фильмов</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {favorites.filter(item => item.type === 'tv').length}
                </div>
                <p className="text-sm text-muted-foreground">Сериалов</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Сетка избранного */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((item) => (
              <MovieCard
                key={`${item.type}-${item.id}`}
                item={{
                  id: item.id,
                  title: item.title,
                  name: item.title,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  genre_ids: [],
                  overview: '',
                  backdrop_path: null,
                  popularity: 0,
                  vote_count: 0,
                  adult: false,
                  original_language: 'ru',
                  ...(item.type === 'movie' ? {
                    original_title: item.title,
                    release_date: '',
                    video: false
                  } : {
                    original_name: item.title,
                    first_air_date: '',
                    origin_country: ['RU']
                  })
                }}
                type={item.type}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFromFavorites(item)}
                onPlay={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Пока ничего не добавлено
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Найдите интересные фильмы и сериалы, чтобы добавить их в избранное
            </p>
            <Button
              onClick={() => navigate('/search')}
              className="hover-neon-primary"
            >
              <SearchIcon className="mr-2 h-4 w-4" />
              Найти фильмы
            </Button>
          </div>
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[2/3] mb-2" />
                <div className="bg-muted rounded h-4 mb-1" />
                <div className="bg-muted rounded h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;