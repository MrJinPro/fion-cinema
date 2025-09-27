import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MovieCard } from '@/components/ui/movie-card';
import { Heart, List, TrendingUp, Star, Users, Film } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useTrending } from '@/hooks/useTMDbApi';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
interface PersonalizedSectionProps {
  onItemClick: (id: number, type: 'movie' | 'tv') => void;
  onNavigate: (path: string) => void;
}
export const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({
  onItemClick,
  onNavigate
}) => {
  const {
    user
  } = useAuth();
  const {
    favorites
  } = useFavorites();
  const {
    data: trending
  } = useTrending('all', 'week');
  if (!user) {
    return <section className="space-y-6 animate-stagger-3">
        <div className="text-center py-12 px-6 bg-gradient-to-br from-card via-card to-secondary/50 rounded-xl border">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full animate-glow-pulse">
                <Star className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gradient-primary">
              Откройте мир кино
            </h3>
            
            <p className="text-muted-foreground leading-relaxed">
              Создавайте персональные списки, добавляйте фильмы в избранное 
              и получайте рекомендации на основе ваших предпочтений
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-accent">
                <Heart className="w-4 h-4" />
                <span>Избранные фильмы</span>
              </div>
              <div className="flex items-center gap-2 text-info">
                <List className="w-4 h-4" />
                <span>Личные списки</span>
              </div>
              <div className="flex items-center gap-2 text-orange">
                <TrendingUp className="w-4 h-4" />
                <span>Рекомендации</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Star className="w-4 h-4" />
                <span>Персональная статистика</span>
              </div>
            </div>
            
            <Button onClick={() => onNavigate('/auth')} className="bg-gradient-primary hover:bg-gradient-orange text-white border-0 hover-neon-primary transition-neon">
              Начать путешествие
            </Button>
          </div>
        </div>

        {/* Общая статистика для неавторизованных */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center hover-neon-primary transition-neon">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Фильмов</div>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-neon-accent transition-neon">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary">500K+</div>
              <div className="text-sm text-muted-foreground">Сериалов</div>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-neon-info transition-neon">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-info" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary">10M+</div>
              <div className="text-sm text-muted-foreground">Актёров</div>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-neon-orange transition-neon">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-orange" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary">100K+</div>
              <div className="text-sm text-muted-foreground">Пользователей</div>
            </CardContent>
          </Card>
        </div>
      </section>;
  }
  const favoritesCount = favorites.length;
  const recentFavorites = favorites.slice(0, 4);
  const recommendations = trending?.results?.slice(0, 4) || [];
  return <section className="space-y-6 animate-stagger-3">
      {/* Приветствие */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-card border-primary/20 hover-neon-primary transition-neon">
        <CardHeader className="mx-0 px-[15px] py-[18px] my-[7px]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gradient-primary">
                Добро пожаловать, {user.email?.split('@')[0]}!
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Вот что вас ждёт сегодня
              </p>
            </div>
            <div className="animate-float">
              <div className="p-3 bg-primary/10 rounded-full">
                <Star className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Персональная статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center hover-neon-primary transition-neon">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-gradient-primary">{favoritesCount}</div>
            <div className="text-sm text-muted-foreground">В избранном</div>
          </CardContent>
        </Card>
        
        <Card className="text-center hover-neon-accent transition-neon">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <List className="w-6 h-6 text-info" />
            </div>
            <div className="text-2xl font-bold text-gradient-primary">0</div>
            <div className="text-sm text-muted-foreground">Списков</div>
          </CardContent>
        </Card>
        
        <Card className="text-center hover-neon-info transition-neon">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-orange" />
            </div>
            <div className="text-2xl font-bold text-gradient-primary">
              {recommendations.length}
            </div>
            <div className="text-sm text-muted-foreground">Рекомендаций</div>
          </CardContent>
        </Card>
        
        <Card className="text-center hover-neon-orange transition-neon">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gradient-primary">
              {Math.floor(Math.random() * 50) + 10}
            </div>
            <div className="text-sm text-muted-foreground">Часов просмотра</div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => onNavigate('/favorites')} className="hover-neon-accent transition-neon">
          <Heart className="w-4 h-4 mr-2" />
          Мои избранные
        </Button>
        
        <Button variant="outline" onClick={() => onNavigate('/lists')} className="hover-neon-info transition-neon">
          <List className="w-4 h-4 mr-2" />
          Мои списки
        </Button>
        
        <Badge variant="secondary" className="bg-orange/10 text-orange border-orange/20">
          <TrendingUp className="w-3 h-3 mr-1" />
          Рекомендации готовы
        </Badge>
      </div>

      {/* Рекомендации на основе избранного */}
      {recommendations.length > 0 && <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gradient-orange neon-underline">
            Рекомендации для вас
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((item, index) => <MovieCard key={item.id} item={item} type={'title' in item ? 'movie' : 'tv'} className="animate-scale-in hover-neon-primary transition-neon" />)}
          </div>
        </div>}
    </section>;
};