import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'moderator' | 'user' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useUserRole: user changed:', { userId: user?.id, hasUser: !!user });
    
    if (!user) {
      console.log('useUserRole: No user, setting role to null');
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        console.log('useUserRole: Fetching role for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('user');
        } else {
          console.log('useUserRole: Fetched role:', data?.role || 'user');
          setRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || role === 'admin';

  return {
    role,
    loading,
    isAdmin,
    isModerator
  };
};