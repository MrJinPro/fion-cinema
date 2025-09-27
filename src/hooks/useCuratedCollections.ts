import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CuratedCollection {
  id: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  slug: string;
  collection_type: 'weekly_top' | 'monthly_top' | 'genre_collection' | 'thematic' | 'editorial';
  is_active: boolean;
  display_order: number;
  poster_url?: string;
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  position: number;
  added_at: string;
  custom_description?: string;
  curator_note?: string;
}

export const useCuratedCollections = () => {
  return useQuery({
    queryKey: ['curated_collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curated_collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as CuratedCollection[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useCollectionItems = (collectionSlug: string) => {
  return useQuery({
    queryKey: ['collection_items', collectionSlug],
    queryFn: async () => {
      // First get the collection
      const { data: collection, error: collectionError } = await supabase
        .from('curated_collections')
        .select('id')
        .eq('slug', collectionSlug)
        .eq('is_active', true)
        .single();
      
      if (collectionError) throw collectionError;
      if (!collection) throw new Error('Collection not found');

      // Then get the items
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collection.id)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as CollectionItem[];
    },
    enabled: !!collectionSlug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useCollectionBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['curated_collection', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curated_collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as CuratedCollection;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};