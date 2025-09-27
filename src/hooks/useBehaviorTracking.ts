import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

export interface UserAction {
  action_type: 'view_movie' | 'watch_trailer' | 'add_favorite' | 'create_list' | 'rate_movie' | 'exit_page';
  content_id?: number;
  content_type?: 'movie' | 'tv' | 'person';
  metadata?: Record<string, any>;
}

export const useBehaviorTracking = () => {
  const { user } = useAuth();
  const sessionId = useRef(Math.random().toString(36).substring(7));
  const startTime = useRef(Date.now());
  const hasWatchedTrailer = useRef(false);

  const trackAction = async (action: UserAction) => {
    try {
      await supabase.from('user_behavior').insert({
        user_id: user?.id || null,
        session_id: sessionId.current,
        action_type: action.action_type,
        content_id: action.content_id,
        content_type: action.content_type,
        metadata: {
          ...action.metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: window.location.href
        }
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  };

  const trackMovieView = (movieId: number) => {
    startTime.current = Date.now();
    trackAction({
      action_type: 'view_movie',
      content_id: movieId,
      content_type: 'movie'
    });
  };

  const trackTrailerWatch = (movieId: number) => {
    hasWatchedTrailer.current = true;
    trackAction({
      action_type: 'watch_trailer',
      content_id: movieId,
      content_type: 'movie',
      metadata: { time_on_page: Date.now() - startTime.current }
    });
  };

  const trackPageExit = (movieId: number, movieTitle: string, hasTrailer: boolean) => {
    const timeSpent = Date.now() - startTime.current;
    const watchedTrailer = hasWatchedTrailer.current;
    
    trackAction({
      action_type: 'exit_page',
      content_id: movieId,
      content_type: 'movie',
      metadata: { 
        time_spent: timeSpent,
        watched_trailer: watchedTrailer,
        has_trailer: hasTrailer,
        movie_title: movieTitle
      }
    });

    // Show engagement prompt if conditions are met
    if (timeSpent > 30000 && hasTrailer && !watchedTrailer) { // 30 seconds
      setTimeout(() => {
        if (confirm(`Хотите посмотреть трейлер к фильму "${movieTitle}"?`)) {
          // Don't navigate away, let user watch trailer
          return false;
        }
      }, 100);
    } else if (watchedTrailer) {
      setTimeout(() => {
        if (confirm(`Как вам трейлер к фильму "${movieTitle}"? Хотите добавить фильм в избранное?`)) {
          // Trigger favorite action
          window.dispatchEvent(new CustomEvent('addToFavorites', { detail: { movieId } }));
        }
      }, 100);
    }
  };

  return {
    trackAction,
    trackMovieView,
    trackTrailerWatch,
    trackPageExit,
    sessionId: sessionId.current
  };
};