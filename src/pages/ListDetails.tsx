import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Star } from 'lucide-react';
import { getStorageRepository, UserList } from '@/lib/storage';
import { getTMDbClient } from '@/lib/tmdb';
import { toast } from 'sonner';

export const ListDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [list, setList] = useState<UserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const tmdbClient = getTMDbClient();

  useEffect(() => {
    loadList();
  }, [id]);

  const loadList = async () => {
    if (!id) return;
    
    try {
      const storage = getStorageRepository();
      const foundList = await storage.getList(id);
      setList(foundList);
    } catch (error) {
      console.error('Error loading list:', error);
      toast.error('Ошибка загрузки коллекции');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!list || !id) return;

    try {
      const storage = getStorageRepository();
      const item = list.items.find(i => i.id === itemId);
      if (!item) return;
      
      await storage.removeFromList(id, item.tmdb_id, item.media_type);
      await loadList();
      toast.success('Фильм удален из коллекции');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ошибка удаления фильма');
    }
  };

  const handleItemClick = (item: any) => {
    const mediaType = item.media_type || item.type || 'movie';
    navigate(`/${mediaType}/${item.tmdb_id || item.id}`);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearch={handleSearch} 
        />
        <main className="container px-4 py-8">
          <div className="text-center">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearch={handleSearch} 
        />
        <main className="container px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Коллекция не найдена</h1>
            <Button onClick={() => navigate('/lists')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к коллекциям
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchValue={searchValue} 
        onSearchChange={setSearchValue} 
        onSearch={handleSearch} 
      />
      <main className="container px-4 py-8">
        {/* Шапка коллекции */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/lists')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к коллекциям
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-muted-foreground mb-4">{list.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{list.items.length} фильмов</span>
                <span>Создано: {new Date(list.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Содержимое коллекции */}
        {list.items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Коллекция пуста</h2>
            <p className="text-muted-foreground mb-4">
              Добавьте фильмы и сериалы в эту коллекцию
            </p>
            <Button onClick={() => navigate('/search')}>
              Найти фильмы
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {list.items.map((item) => {
              const posterUrl = tmdbClient.getPosterURL(item.poster_path, 'w500');
              
              return (
                <Card 
                  key={item.id}
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-neon hover-neon-primary cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-muted-foreground">Нет изображения</span>
                      </div>
                    )}
                    
                    {/* Градиентный оверлей */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Кнопка удаления */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-all duration-300 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Рейтинг */}
                    {item.vote_average && item.vote_average > 0 && (
                      <Badge 
                        variant="secondary"
                        className="absolute top-2 left-2 bg-black/80 text-white border-none"
                      >
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {item.vote_average.toFixed(1)}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
                        {item.title}
                      </h3>
                      
                      {item.release_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.release_date).getFullYear()}
                        </p>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {item.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};