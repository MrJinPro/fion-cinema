import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Check } from 'lucide-react';
import { getStorageRepository, UserList, FavoriteItem } from '@/lib/storage';
import { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import { toast } from 'sonner';

interface AddToCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: TMDbMovie | TMDbTVShow;
  mediaType: 'movie' | 'tv';
}

export const AddToCollectionDialog: React.FC<AddToCollectionDialogProps> = ({
  isOpen,
  onClose,
  item,
  mediaType
}) => {
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLists();
    }
  }, [isOpen]);

  const loadLists = async () => {
    try {
      const storage = getStorageRepository();
      const userLists = await storage.getLists();
      setLists(userLists);
      
      // Проверяем, в каких списках уже есть этот фильм
      const itemInLists = new Set<string>();
      for (const list of userLists) {
        const isInList = list.items.some(listItem => 
          listItem.tmdb_id === item.id && listItem.media_type === mediaType
        );
        if (isInList) {
          itemInLists.add(list.id);
        }
      }
      setSelectedLists(itemInLists);
    } catch (error) {
      console.error('Error loading lists:', error);
      toast.error('Ошибка загрузки коллекций');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Введите название коллекции');
      return;
    }

    setIsLoading(true);
    try {
      const storage = getStorageRepository();
      const newList = await storage.createList(newListName, newListDescription);

      setLists(prev => [...prev, newList]);
      setNewListName('');
      setNewListDescription('');
      setShowCreateForm(false);
      toast.success('Коллекция создана');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Ошибка создания коллекции');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleList = async (listId: string) => {
    const storage = getStorageRepository();
    const isCurrentlySelected = selectedLists.has(listId);

    try {
      if (isCurrentlySelected) {
        // Удаляем из коллекции
        const list = lists.find(l => l.id === listId);
        const listItem = list?.items.find(i => 
          i.tmdb_id === item.id && i.media_type === mediaType
        );
        
        if (listItem) {
          await storage.removeFromList(listId, listItem.tmdb_id, listItem.media_type);
          setSelectedLists(prev => {
            const newSet = new Set(prev);
            newSet.delete(listId);
            return newSet;
          });
          toast.success('Удалено из коллекции');
        }
      } else {
        // Добавляем в коллекцию
        const title = mediaType === 'movie' ? (item as TMDbMovie).title : (item as TMDbTVShow).name;
        const releaseDate = mediaType === 'movie' 
          ? (item as TMDbMovie).release_date 
          : (item as TMDbTVShow).first_air_date;

        const favoriteItem: FavoriteItem = {
          id: `${item.id}-${mediaType}`,
          tmdb_id: item.id,
          media_type: mediaType,
          type: mediaType,
          title,
          poster_path: item.poster_path,
          release_date: releaseDate,
          vote_average: item.vote_average,
          added_at: new Date().toISOString()
        };
        
        await storage.addToList(listId, favoriteItem);

        setSelectedLists(prev => new Set([...prev, listId]));
        toast.success('Добавлено в коллекцию');
      }
    } catch (error) {
      console.error('Error toggling list:', error);
      toast.error('Произошла ошибка');
    }
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setNewListName('');
    setNewListDescription('');
    onClose();
  };

  const title = mediaType === 'movie' ? (item as TMDbMovie).title : (item as TMDbTVShow).name;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить в коллекцию</DialogTitle>
          <p className="text-sm text-muted-foreground">{title}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Список коллекций */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lists.map((list) => {
              const isSelected = selectedLists.has(list.id);
              return (
                <Card 
                  key={list.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:border-border'
                  }`}
                  onClick={() => handleToggleList(list.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{list.name}</h4>
                        {list.description && (
                          <p className="text-xs text-muted-foreground mt-1">{list.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {list.items.length} фильмов
                          </Badge>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Форма создания новой коллекции */}
          {showCreateForm ? (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="listName">Название коллекции</Label>
                <Input
                  id="listName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Мои любимые фильмы..."
                />
              </div>
              
              <div>
                <Label htmlFor="listDescription">Описание (необязательно)</Label>
                <Textarea
                  id="listDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Краткое описание коллекции..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateList}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Создать
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать новую коллекцию
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};