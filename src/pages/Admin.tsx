import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Film, Star, Database, Settings, Shield, MessageSquare, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalMovies: number;
  totalFavorites: number;
  totalLists: number;
}

interface UserWithRole {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

interface UserReviewItem {
  id: string;
  user_id: string;
  content_id: number;
  content_type: 'movie' | 'tv';
  title: string | null;
  content: string;
  is_spoiler: boolean;
  is_moderated: boolean;
  is_approved: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const didInitRef = useRef(false);
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMovies: 0,
    totalFavorites: 0,
    totalLists: 0
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [populatingCollections, setPopulatingCollections] = useState(false);
  const [populatingMovies, setPopulatingMovies] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<UserReviewItem[]>([]);
  const [pendingReviewsLoading, setPendingReviewsLoading] = useState(false);
  const [opsResult, setOpsResult] = useState<string>('');

  useEffect(() => {
    console.log('Admin: Auth state:', { 
      authLoading,
      roleLoading, 
      hasUser: !!user, 
      userId: user?.id, 
      isAdmin, 
      loading
    });

    if (authLoading || roleLoading) return;

    if (!user) {
      console.log('Admin: No authenticated user, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (!isAdmin) {
      console.log('Admin: User is not admin, redirecting to home');
      navigate('/');
      return;
    }

    if (!didInitRef.current) {
      didInitRef.current = true;
      fetchStats();
      fetchUsers();
    }
  }, [authLoading, isAdmin, roleLoading, navigate, user]);

  const fetchStats = async () => {
    try {
      const [usersResponse, moviesResponse, favoritesResponse, listsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('movies_kp').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('user_lists').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersResponse.count || 0,
        totalMovies: moviesResponse.count || 0,
        totalFavorites: favoritesResponse.count || 0,
        totalLists: listsResponse.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Preferred: fetch emails via admin edge function
      const { data: adminData, error: adminError } = await supabase.functions.invoke('admin-list-users');
      if (!adminError && (adminData as any)?.users) {
        setUsers((adminData as any).users);
        return;
      }

      // Fallback: profiles + roles without emails
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          created_at,
          user_roles!left (role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithRoles = usersData?.map(user => ({
        id: user.id,
        email: '',
        display_name: user.display_name || 'No name',
        role: (user.user_roles as any)?.[0]?.role || 'user',
        created_at: user.created_at
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    setPendingReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('id, user_id, content_id, content_type, title, content, is_spoiler, is_moderated, is_approved, created_at')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPendingReviews((data ?? []) as any);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отзывы на модерации',
        variant: 'destructive',
      });
    } finally {
      setPendingReviewsLoading(false);
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('user_reviews')
        .update({ is_approved: true, is_moderated: true })
        .eq('id', reviewId);
      if (error) throw error;

      toast({
        title: 'Отзыв одобрен',
        description: 'Отзыв стал видимым для пользователей',
      });
      await fetchPendingReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось одобрить отзыв',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('user_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;

      toast({
        title: 'Отзыв удалён',
        description: 'Отзыв удалён из базы',
      });
      await fetchPendingReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить отзыв',
        variant: 'destructive',
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // First delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role: newRole as any
        }]);

      if (error) throw error;

      toast({
        title: 'Роль обновлена',
        description: `Роль пользователя успешно изменена на ${newRole}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить роль пользователя',
        variant: 'destructive',
      });
    }
  };

  const populateCollections = async () => {
    setPopulatingCollections(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-collections');
      
      if (error) throw error;
      
      toast({
        title: 'Подборки заполнены',
        description: 'Базовые подборки фильмов успешно заполнены',
      });

      setOpsResult(JSON.stringify(data ?? { ok: true }, null, 2));
      
      // Refresh stats after populating
      await fetchStats();
    } catch (error) {
      console.error('Error populating collections:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось заполнить подборки',
        variant: 'destructive',
      });
    } finally {
      setPopulatingCollections(false);
    }
  };

  const populateMovies = async () => {
    setPopulatingMovies(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-populate-movies', {
        body: { trigger: 'admin' },
      });
      if (error) throw error;

      toast({
        title: 'Готово',
        description: 'Прогрев фильмов запущен',
      });

      setOpsResult(JSON.stringify(data ?? { ok: true }, null, 2));
      await fetchStats();
    } catch (error) {
      console.error('Error populating movies:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось запустить прогрев фильмов',
        variant: 'destructive',
      });
    } finally {
      setPopulatingMovies(false);
    }
  };

  const opsSummary = useMemo(() => {
    if (!opsResult) return '';
    return opsResult.length > 3500 ? `${opsResult.slice(0, 3500)}\n...` : opsResult;
  }, [opsResult]);

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Требуется аутентификация</h2>
          <p className="text-muted-foreground mb-4">
            Для доступа к панели администратора необходимо войти в систему
          </p>
          <Button onClick={() => navigate('/auth')}>
            Войти в систему
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
          <p className="text-muted-foreground mb-4">
            У вас нет прав администратора для доступа к этой странице
          </p>
          <Button onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Панель администратора</h1>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <Database className="h-4 w-4 mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="content">
              <Film className="h-4 w-4 mr-2" />
              Контент
            </TabsTrigger>
            <TabsTrigger value="moderation">
              <MessageSquare className="h-4 w-4 mr-2" />
              Модерация
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Операции
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Фильмы</CardTitle>
                  <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMovies}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Избранное</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFavorites}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Списки</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLists}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{user.display_name}</div>
                        {user.email ? (
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Регистрация: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                        {true && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={user.role === 'user'}
                            >
                              User
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'moderator')}
                              disabled={user.role === 'moderator'}
                            >
                              Mod
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              Admin
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Управление контентом</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Подборки фильмов</h3>
                    <p className="text-sm text-muted-foreground">
                      Заполните базовые подборки фильмами из TMDB API
                    </p>
                    <Button 
                      onClick={populateCollections}
                      disabled={populatingCollections}
                      className="w-full sm:w-auto"
                    >
                      {populatingCollections ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Заполняем подборки...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Заполнить подборки
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Прогрев фильмов (TMDb кэш)</h3>
                    <p className="text-sm text-muted-foreground">
                      Запускает Edge Function для загрузки популярных/топ/свежих фильмов в кэш
                    </p>
                    <Button
                      onClick={populateMovies}
                      disabled={populatingMovies}
                      className="w-full sm:w-auto"
                    >
                      {populatingMovies ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Запускаем...
                        </>
                      ) : (
                        <>
                          <Film className="h-4 w-4 mr-2" />
                          Запустить прогрев
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="text-center py-8">
                      <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Дополнительное управление контентом будет доступно в следующих обновлениях
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Модерация отзывов</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Здесь показываются не одобренные отзывы (is_approved = false)
                  </p>
                </div>
                <Button variant="outline" onClick={fetchPendingReviews} disabled={pendingReviewsLoading}>
                  {pendingReviewsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Обновляем...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Обновить
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {pendingReviewsLoading ? (
                  <div className="min-h-[120px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет отзывов на модерации</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((r) => (
                      <div key={r.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {r.title || '(без заголовка)'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.content_type} #{r.content_id} • {new Date(r.created_at).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Автор: {r.user_id}{r.is_spoiler ? ' • spoiler' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline">pending</Badge>
                            <Button size="sm" onClick={() => approveReview(r.id)}>
                              Одобрить
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteReview(r.id)}>
                              Удалить
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {r.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Операции и диагностика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={populateCollections} disabled={populatingCollections}>
                      {populatingCollections ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          populate-collections...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          populate-collections
                        </>
                      )}
                    </Button>

                    <Button variant="outline" onClick={populateMovies} disabled={populatingMovies}>
                      {populatingMovies ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          auto-populate-movies...
                        </>
                      ) : (
                        <>
                          <Film className="h-4 w-4 mr-2" />
                          auto-populate-movies
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Последний результат</div>
                    </div>
                    {opsSummary ? (
                      <pre className="text-xs whitespace-pre-wrap break-words bg-muted/40 rounded p-3 max-h-[360px] overflow-auto">
                        {opsSummary}
                      </pre>
                    ) : (
                      <div className="text-sm text-muted-foreground">Пока нет запусков</div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <Settings className="h-4 w-4 inline-block mr-2" />
                    Для модерации отзывов нужен деплой миграции с admin‑политиками RLS.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;