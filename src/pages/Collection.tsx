import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { MovieCard } from '@/components/ui/movie-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCollectionBySlug, useCollectionItems } from '@/hooks/useCuratedCollections';
import { useMovieDetails } from '@/hooks/useTMDbApi';
import { MobileNavigationFix } from '@/components/ui/mobile-navigation-fix';
import { useCollectionsPopulation } from '@/hooks/useCollectionsPopulation';
import { Crown, ArrowLeft, Calendar, TrendingUp, Star, Film } from 'lucide-react';

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

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'weekly_top':
      return 'Топ недели';
    case 'monthly_top':
      return 'Топ месяца';
    case 'genre_collection':
      return 'Жанровая подборка';
    case 'thematic':
      return 'Тематическая подборка';
    case 'editorial':
      return 'Редакционная подборка';
    default:
      return 'Подборка';
  }
};

export default function Collection() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const { checkCollectionsStatus, triggerCollectionsPopulation } = useCollectionsPopulation();
  const [populationAttempted, setPopulationAttempted] = useState(false);

  const { data: collection, isLoading: collectionLoading } = useCollectionBySlug(slug || '');
  const { data: items, isLoading: itemsLoading, refetch: refetchItems } = useCollectionItems(slug || '');

  // Если подборка пуста, а items в базе ещё не заполнены — пробуем один раз пополнить
  React.useEffect(() => {
    const run = async () => {
      if (populationAttempted) return;
      if (itemsLoading) return;
      if (!items || items.length > 0) return;

      const status = await checkCollectionsStatus();
      if (!status.needsPopulation) return;

      setPopulationAttempted(true);
      await triggerCollectionsPopulation();
      await refetchItems();
    };

    run();
  }, [items, itemsLoading, populationAttempted, checkCollectionsStatus, triggerCollectionsPopulation, refetchItems]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  if (collectionLoading) {
    return (
      <>
        <Header 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="aspect-[2/3] bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
        />
        <main className="container mx-auto px-4 py-8 text-center">
          <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Подборка не найдена
          </h1>
          <p className="text-muted-foreground mb-6">
            Запрошенная подборка не существует или была удалена
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            На главную
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const IconComponent = getCollectionIcon(collection.collection_type);
  const typeLabel = getTypeLabel(collection.collection_type);

  return (
    <>
      <SEOHead 
        title={`${collection.title} | FiOn Cinema`}
        description={collection.description || `${typeLabel} от FiOn Cinema`}
        keywords={`подборка фильмов, ${collection.title.toLowerCase()}, фион кинема, кураторская подборка`}
      />
      
      <MobileNavigationFix className="md:hidden" />
      
      <Header 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к главной
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <IconComponent className="h-8 w-8 text-primary" />
            <div>
              <Badge variant="secondary" className="mb-2">
                {typeLabel}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary">
                {collection.title}
              </h1>
            </div>
          </div>
          
          {collection.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {collection.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Обновлено: {new Date(collection.updated_at).toLocaleDateString('ru-RU')}</span>
            {collection.total_items > 0 && (
              <span>• {collection.total_items} фильмов</span>
            )}
          </div>
        </div>

        {/* Movies Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="aspect-[2/3] bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <CollectionMovieCard 
                key={`${item.tmdb_id}-${item.media_type}`}
                tmdbId={item.tmdb_id}
                mediaType={item.media_type}
                position={item.position}
                curatorNote={item.curator_note}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Подборка пуста
            </h3>
            <p className="text-muted-foreground">
              В этой подборке пока нет фильмов. Загляните позже!
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}

interface CollectionMovieCardProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  position: number;
  curatorNote?: string;
}

function CollectionMovieCard({ tmdbId, mediaType, position, curatorNote }: CollectionMovieCardProps) {
  const { data: movie } = useMovieDetails(tmdbId);
  
  if (!movie) {
    return (
      <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">#{position}</span>
      </div>
    );
  }
  
  return (
    <div className="relative group">
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className="text-xs font-bold">
          #{position}
        </Badge>
      </div>
      <MovieCard 
        item={movie}
        type={mediaType}
        className="transition-transform group-hover:scale-105"
      />
      {curatorNote && (
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-3">
          <p className="text-white text-xs leading-relaxed">
            {curatorNote}
          </p>
        </div>
      )}
    </div>
  );
}