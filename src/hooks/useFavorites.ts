import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';

export interface FavoriteItem {
  id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  added_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      
      if (error) throw error;
      return data as FavoriteItem[];
    },
    enabled: !!user,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async ({ item, mediaType }: { item: TMDbMovie | TMDbTVShow; mediaType: 'movie' | 'tv' }) => {
      if (!user) throw new Error('User not authenticated');

      const favoriteData = {
        user_id: user.id,
        tmdb_id: item.id,
        media_type: mediaType,
        title: mediaType === 'movie' ? (item as TMDbMovie).title : (item as TMDbTVShow).name,
        poster_path: item.poster_path,
        release_date: mediaType === 'movie' 
          ? (item as TMDbMovie).release_date 
          : (item as TMDbTVShow).first_air_date,
        vote_average: item.vote_average
      };

      const { error } = await supabase
        .from('favorites')
        .insert(favoriteData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    }
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async ({ tmdbId, mediaType }: { tmdbId: number; mediaType: 'movie' | 'tv' }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId)
        .eq('media_type', mediaType);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    }
  });

  // Check if item is favorite
  const isFavorite = (tmdbId: number, mediaType: 'movie' | 'tv') => {
    return favorites.some(fav => fav.tmdb_id === tmdbId && fav.media_type === mediaType);
  };

  // Toggle favorite
  const toggleFavorite = async (item: TMDbMovie | TMDbTVShow, mediaType: 'movie' | 'tv') => {
    if (isFavorite(item.id, mediaType)) {
      await removeFromFavoritesMutation.mutateAsync({ 
        tmdbId: item.id, 
        mediaType 
      });
    } else {
      await addToFavoritesMutation.mutateAsync({ item, mediaType });
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isAdding: addToFavoritesMutation.isPending,
    isRemoving: removeFromFavoritesMutation.isPending
  };
};