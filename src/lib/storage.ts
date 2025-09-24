/**
 * Абстракция для работы с локальными данными пользователя
 * Поддерживает IndexedDB с fallback на LocalStorage
 */

export interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  added_at: string;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  items: FavoriteItem[];
  created_at: string;
  updated_at: string;
}

export interface StorageRepository {
  // Избранное
  getFavorites(): Promise<FavoriteItem[]>;
  addToFavorites(item: FavoriteItem): Promise<void>;
  removeFromFavorites(id: number, type: 'movie' | 'tv'): Promise<void>;
  isFavorite(id: number, type: 'movie' | 'tv'): Promise<boolean>;

  // Списки
  getLists(): Promise<UserList[]>;
  getList(id: string): Promise<UserList | null>;
  createList(name: string, description?: string): Promise<UserList>;
  updateList(id: string, updates: Partial<Omit<UserList, 'id' | 'created_at'>>): Promise<void>;
  deleteList(id: string): Promise<void>;
  addToList(listId: string, item: FavoriteItem): Promise<void>;
  removeFromList(listId: string, itemId: number, itemType: 'movie' | 'tv'): Promise<void>;
}

// IndexedDB implementation
class IndexedDBStorage implements StorageRepository {
  private dbName = 'fion-cinema';
  private version = 1;
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Создаём store для избранного
        if (!db.objectStoreNames.contains('favorites')) {
          const favoritesStore = db.createObjectStore('favorites', { 
            keyPath: ['id', 'type'] 
          });
          favoritesStore.createIndex('type', 'type', { unique: false });
          favoritesStore.createIndex('added_at', 'added_at', { unique: false });
        }

        // Создаём store для списков
        if (!db.objectStoreNames.contains('lists')) {
          const listsStore = db.createObjectStore('lists', { keyPath: 'id' });
          listsStore.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      return await this.performTransaction('favorites', 'readonly', store => 
        store.getAll()
      );
    } catch (error) {
      console.error('Failed to get favorites from IndexedDB:', error);
      return [];
    }
  }

  async addToFavorites(item: FavoriteItem): Promise<void> {
    try {
      await this.performTransaction('favorites', 'readwrite', store =>
        store.put(item)
      );
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(id: number, type: 'movie' | 'tv'): Promise<void> {
    try {
      await this.performTransaction('favorites', 'readwrite', store =>
        store.delete([id, type])
      );
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }

  async isFavorite(id: number, type: 'movie' | 'tv'): Promise<boolean> {
    try {
      const result = await this.performTransaction('favorites', 'readonly', store =>
        store.get([id, type])
      );
      return !!result;
    } catch (error) {
      console.error('Failed to check if favorite:', error);
      return false;
    }
  }

  async getLists(): Promise<UserList[]> {
    try {
      return await this.performTransaction('lists', 'readonly', store =>
        store.getAll()
      );
    } catch (error) {
      console.error('Failed to get lists from IndexedDB:', error);
      return [];
    }
  }

  async getList(id: string): Promise<UserList | null> {
    try {
      const result = await this.performTransaction('lists', 'readonly', store =>
        store.get(id)
      );
      return result || null;
    } catch (error) {
      console.error('Failed to get list:', error);
      return null;
    }
  }

  async createList(name: string, description?: string): Promise<UserList> {
    const list: UserList = {
      id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await this.performTransaction('lists', 'readwrite', store =>
        store.put(list)
      );
      return list;
    } catch (error) {
      console.error('Failed to create list:', error);
      throw error;
    }
  }

  async updateList(id: string, updates: Partial<Omit<UserList, 'id' | 'created_at'>>): Promise<void> {
    try {
      const existingList = await this.getList(id);
      if (!existingList) {
        throw new Error(`List with id ${id} not found`);
      }

      const updatedList: UserList = {
        ...existingList,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.performTransaction('lists', 'readwrite', store =>
        store.put(updatedList)
      );
    } catch (error) {
      console.error('Failed to update list:', error);
      throw error;
    }
  }

  async deleteList(id: string): Promise<void> {
    try {
      await this.performTransaction('lists', 'readwrite', store =>
        store.delete(id)
      );
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error;
    }
  }

  async addToList(listId: string, item: FavoriteItem): Promise<void> {
    try {
      const list = await this.getList(listId);
      if (!list) {
        throw new Error(`List with id ${listId} not found`);
      }

      // Проверяем, что элемента ещё нет в списке
      const existingIndex = list.items.findIndex(
        i => i.id === item.id && i.type === item.type
      );

      if (existingIndex === -1) {
        list.items.push(item);
        await this.updateList(listId, { items: list.items });
      }
    } catch (error) {
      console.error('Failed to add to list:', error);
      throw error;
    }
  }

  async removeFromList(listId: string, itemId: number, itemType: 'movie' | 'tv'): Promise<void> {
    try {
      const list = await this.getList(listId);
      if (!list) {
        throw new Error(`List with id ${listId} not found`);
      }

      list.items = list.items.filter(
        item => !(item.id === itemId && item.type === itemType)
      );

      await this.updateList(listId, { items: list.items });
    } catch (error) {
      console.error('Failed to remove from list:', error);
      throw error;
    }
  }
}

// LocalStorage fallback
class LocalStorageRepository implements StorageRepository {
  private favoritesKey = 'fion-favorites';
  private listsKey = 'fion-lists';

  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return defaultValue;
    }
  }

  private setToStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set to localStorage:', error);
    }
  }

  async getFavorites(): Promise<FavoriteItem[]> {
    return this.getFromStorage(this.favoritesKey, []);
  }

  async addToFavorites(item: FavoriteItem): Promise<void> {
    const favorites = await this.getFavorites();
    const existingIndex = favorites.findIndex(
      f => f.id === item.id && f.type === item.type
    );

    if (existingIndex === -1) {
      favorites.push(item);
      this.setToStorage(this.favoritesKey, favorites);
    }
  }

  async removeFromFavorites(id: number, type: 'movie' | 'tv'): Promise<void> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(f => !(f.id === id && f.type === type));
    this.setToStorage(this.favoritesKey, filtered);
  }

  async isFavorite(id: number, type: 'movie' | 'tv'): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(f => f.id === id && f.type === type);
  }

  async getLists(): Promise<UserList[]> {
    return this.getFromStorage(this.listsKey, []);
  }

  async getList(id: string): Promise<UserList | null> {
    const lists = await this.getLists();
    return lists.find(list => list.id === id) || null;
  }

  async createList(name: string, description?: string): Promise<UserList> {
    const lists = await this.getLists();
    const list: UserList = {
      id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    lists.push(list);
    this.setToStorage(this.listsKey, lists);
    return list;
  }

  async updateList(id: string, updates: Partial<Omit<UserList, 'id' | 'created_at'>>): Promise<void> {
    const lists = await this.getLists();
    const index = lists.findIndex(list => list.id === id);
    
    if (index === -1) {
      throw new Error(`List with id ${id} not found`);
    }

    lists[index] = {
      ...lists[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.setToStorage(this.listsKey, lists);
  }

  async deleteList(id: string): Promise<void> {
    const lists = await this.getLists();
    const filtered = lists.filter(list => list.id !== id);
    this.setToStorage(this.listsKey, filtered);
  }

  async addToList(listId: string, item: FavoriteItem): Promise<void> {
    const list = await this.getList(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }

    const existingIndex = list.items.findIndex(
      i => i.id === item.id && i.type === item.type
    );

    if (existingIndex === -1) {
      list.items.push(item);
      await this.updateList(listId, { items: list.items });
    }
  }

  async removeFromList(listId: string, itemId: number, itemType: 'movie' | 'tv'): Promise<void> {
    const list = await this.getList(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }

    list.items = list.items.filter(
      item => !(item.id === itemId && item.type === itemType)
    );

    await this.updateList(listId, { items: list.items });
  }
}

// Factory function для создания хранилища
function createStorageRepository(): StorageRepository {
  // Проверяем доступность IndexedDB
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      return new IndexedDBStorage();
    } catch (error) {
      console.warn('IndexedDB not available, falling back to LocalStorage');
    }
  }

  // Fallback на LocalStorage
  return new LocalStorageRepository();
}

// Singleton instance
let storageRepository: StorageRepository | null = null;

export function getStorageRepository(): StorageRepository {
  if (!storageRepository) {
    storageRepository = createStorageRepository();
  }
  return storageRepository;
}

export default getStorageRepository;