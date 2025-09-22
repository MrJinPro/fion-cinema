import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieCard } from '@/components/ui/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  List, 
  Search as SearchIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Film,
  Tv 
} from 'lucide-react';
import { UserList, getStorageRepository } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const Lists = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Форма создания/редактирования списка
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const storage = getStorageRepository();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const userLists = await storage.getLists();
      setLists(userLists);
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleCreateList = async () => {
    if (!formData.name.trim()) return;

    try {
      const newList = await storage.createList(formData.name.trim(), formData.description.trim());
      setLists(prev => [newList, ...prev]);
      setFormData({ name: '', description: '' });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleEditList = async () => {
    if (!selectedList || !formData.name.trim()) return;

    try {
      await storage.updateList(selectedList.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      setLists(prev => prev.map(list => 
        list.id === selectedList.id 
          ? { ...list, name: formData.name.trim(), description: formData.description.trim() }
          : list
      ));
      
      setFormData({ name: '', description: '' });
      setSelectedList(null);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to edit list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот список?')) {
      try {
        await storage.deleteList(listId);
        setLists(prev => prev.filter(list => list.id !== listId));
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
  };

  const openEditDialog = (list: UserList) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description || ''
    });
    setShowEditDialog(true);
  };

  const handleListClick = (list: UserList) => {
    navigate(`/lists/${list.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <List className="h-8 w-8 text-primary" />
              Мои списки
            </h1>
            <p className="text-muted-foreground mt-2">
              Создавайте тематические коллекции фильмов и сериалов
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="hover-neon-primary">
                <Plus className="mr-2 h-4 w-4" />
                Создать список
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Создать новый список</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Название списка</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Любимые комедии"
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-foreground">Описание (необязательно)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Краткое описание списка..."
                    className="mt-1 bg-background border-border"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleCreateList}
                    disabled={!formData.name.trim()}
                    className="hover-neon-primary"
                  >
                    Создать
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Статистика */}
        {!isLoading && lists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{lists.length}</div>
                <p className="text-sm text-muted-foreground">Списков создано</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {lists.reduce((total, list) => total + list.items.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Всего элементов</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {lists.filter(list => list.items.length > 0).length}
                </div>
                <p className="text-sm text-muted-foreground">Заполненных списков</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Сетка списков */}
        {!isLoading && lists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Card 
                key={list.id} 
                className="group bg-card/50 border-border/50 hover-neon-primary transition-neon cursor-pointer"
                onClick={() => handleListClick(list)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-lg line-clamp-1">
                        {list.name}
                      </CardTitle>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {list.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(list);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Превью элементов */}
                    {list.items.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {list.items.slice(0, 4).map((item, index) => (
                          <div key={`${item.type}-${item.id}`} className="aspect-[2/3] rounded overflow-hidden bg-muted">
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.type === 'movie' ? (
                                  <Film className="h-6 w-6 text-muted-foreground" />
                                ) : (
                                  <Tv className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                        <List className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Список пуст</p>
                      </div>
                    )}

                    {/* Информация о списке */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(list.created_at)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {list.items.length} элемент{list.items.length !== 1 ? (list.items.length < 5 ? 'а' : 'ов') : ''}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {!isLoading && lists.length === 0 && (
          <div className="text-center py-16">
            <List className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Пока нет ни одного списка
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Создайте свой первый список для организации фильмов и сериалов по темам
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="hover-neon-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать первый список
            </Button>
          </div>
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-card/50">
                <CardHeader>
                  <div className="bg-muted rounded h-6 w-3/4 mb-2" />
                  <div className="bg-muted rounded h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="bg-muted rounded aspect-[2/3]" />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="bg-muted rounded h-3 w-24" />
                    <div className="bg-muted rounded h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Диалог редактирования */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Редактировать список</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-foreground">Название списка</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Любимые комедии"
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-foreground">Описание (необязательно)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание списка..."
                  className="mt-1 bg-background border-border"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleEditList}
                  disabled={!formData.name.trim()}
                  className="hover-neon-primary"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Lists;