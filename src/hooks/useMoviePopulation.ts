import { supabase } from '@/integrations/supabase/client';

// Hook для запуска автоматического пополнения фильмов
export const useMoviePopulation = () => {
  
  const triggerAutoPopulation = async () => {
    console.log('🚀 Triggering auto-population of movies...');
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-populate-movies', {
        body: { 
          pages: 10, // Больше страниц для лучшего покрытия
          trigger: 'user_request' 
        }
      });

      if (error) {
        console.error('❌ Error triggering auto-population:', error);
        return { success: false, error };
      }

      console.log('✅ Auto-population triggered successfully:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Failed to trigger auto-population:', error);
      return { success: false, error };
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      // Проверяем общее количество фильмов
      const { count: totalMovies } = await supabase
        .from('movies_tmdb')
        .select('*', { count: 'exact', head: true });

      // Проверяем недавние фильмы (2020+)
      const { count: recentMovies } = await supabase
        .from('movies_tmdb')
        .select('*', { count: 'exact', head: true })
        .gte('release_date', '2020-01-01');

      // Проверяем фильмы 2024 года
      const { count: movies2024 } = await supabase
        .from('movies_tmdb')
        .select('*', { count: 'exact', head: true })
        .gte('release_date', '2024-01-01')
        .lt('release_date', '2025-01-01');

      const status = {
        totalMovies: totalMovies || 0,
        recentMovies: recentMovies || 0,
        movies2024: movies2024 || 0,
        needsPopulation: (totalMovies || 0) < 1000 // Если меньше 1000 фильмов
      };

      console.log('📊 Database status:', status);
      return status;
      
    } catch (error) {
      console.error('Error checking database status:', error);
      return {
        totalMovies: 0,
        recentMovies: 0,
        movies2024: 0,
        needsPopulation: true
      };
    }
  };

  return {
    triggerAutoPopulation,
    checkDatabaseStatus
  };
};