import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { useCuratedCollections } from '@/hooks/useCuratedCollections';
import { Crown, TrendingUp, Star, Film, Calendar } from 'lucide-react';

const getCollectionIcon = (type: string) => {
  switch (type) {
    case 'weekly_top':
      return Calendar;
    case 'monthly_top':
      return TrendingUp;
    case 'genre_collection':
      return Film;
    case 'thematic':
      return Star;
    case 'editorial':
      return Crown;
    default:
      return Star;
  }
};

const getCollectionColor = (type: string) => {
  switch (type) {
    case 'weekly_top':
      return 'text-accent';
    case 'monthly_top':
      return 'text-primary';
    case 'genre_collection':
      return 'text-orange';
    case 'thematic':
      return 'text-info';
    case 'editorial':
      return 'text-primary';
    default:
      return 'text-muted-foreground';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'weekly_top':
      return 'Топ недели';
    case 'monthly_top':
      return 'Топ месяца';
    case 'genre_collection':
      return 'Жанр';
    case 'thematic':
      return 'Тематика';
    case 'editorial':
      return 'Редакция';
    default:
      return 'Подборка';
  }
};

export function CuratedCollectionsSection() {
  const { data: collections, isLoading, error } = useCuratedCollections();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">
            Подборки FiOn Cinema
          </h2>
          <p className="text-muted-foreground">
            Кураторские подборки лучших фильмов и сериалов
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error || !collections) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient-primary mb-2">
          Подборки FiOn Cinema
        </h2>
        <p className="text-muted-foreground">
          Кураторские подборки лучших фильмов и сериалов, отобранных нашими экспертами
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => {
          const IconComponent = getCollectionIcon(collection.collection_type);
          const iconColor = getCollectionColor(collection.collection_type);
          const typeLabel = getTypeLabel(collection.collection_type);

          return (
            <Card 
              key={collection.id} 
              className="bg-card/50 border-border/50 hover-neon-primary transition-neon group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-5 w-5 ${iconColor}`} />
                    <Badge variant="secondary" className="text-xs">
                      {typeLabel}
                    </Badge>
                  </div>
                  {collection.total_items > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {collection.total_items} фильмов
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {collection.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <Link to={`/collections/${collection.slug}`}>
                    Смотреть подборку
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12">
          <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Подборки скоро появятся
          </h3>
          <p className="text-sm text-muted-foreground">
            Наши кураторы работают над созданием уникальных подборок фильмов
          </p>
        </div>
      )}
    </section>
  );
}