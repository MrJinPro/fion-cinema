import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useMovieCache } from './useMovieCache';

export interface UserRating {
  id: string;
  user_id: string;
  content_id: number;
  content_type: 'movie' | 'tv';
  rating: number;
  created_at: string;
  updated_at: string;
}

export const useUserRatings = (contentId: number, contentType: 'movie' | 'tv') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { ensureMovieExists } = useMovieCache();
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (contentId) {
      fetchRatings();
    }
  }, [contentId, contentType, user]);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      // Fetch user's rating if logged in
      if (user) {
        const { data: userRatingData } = await supabase
          .from('user_ratings')
          .select('*')
          .eq('content_id', contentId)
          .eq('content_type', contentType)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserRating(userRatingData as UserRating);
      }

      // Fetch average rating and count
      const { data: ratingsData } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      if (ratingsData && ratingsData.length > 0) {
        const total = ratingsData.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating(total / ratingsData.length);
        setRatingCount(ratingsData.length);
      } else {
        setAverageRating(null);
        setRatingCount(0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в аккаунт, чтобы оценить фильм",
        variant: "destructive",
      });
      return;
    }

    try {
      // Убеждаемся, что фильм/сериал существует в базе данных перед сохранением оценки
      const movieExists = await ensureMovieExists(contentId, contentType);
      if (!movieExists) {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить данные о контенте",
          variant: "destructive",
        });
        return;
      }

      const ratingData = {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        rating: rating
      };

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('user_ratings')
          .update({ rating })
          .eq('id', userRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('user_ratings')
          .insert(ratingData);

        if (error) throw error;
      }

      toast({
        title: "Оценка сохранена",
        description: `Вы оценили ${contentType === 'movie' ? 'фильм' : 'сериал'} на ${rating}/10`,
      });

      // Refresh ratings
      await fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить оценку",
        variant: "destructive",
      });
    }
  };

  return {
    userRating: userRating?.rating || null,
    averageRating,
    ratingCount,
    isLoading,
    submitRating
  };
};