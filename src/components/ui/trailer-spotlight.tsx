import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Play, ExternalLink } from 'lucide-react';

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

interface TrailerSpotlightProps {
  trailer: Video;
  className?: string;
}

export function TrailerSpotlight({ trailer, className }: TrailerSpotlightProps) {
  const handleWatchTrailer = () => {
    if (trailer.site === 'YouTube') {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    }
  };

  const getTrailerThumbnail = (key: string) => {
    return `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
  };

  return (
    <Card className={`overflow-hidden hover-neon-primary transition-neon group ${className}`}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={getTrailerThumbnail(trailer.key)}
          alt={trailer.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="lg"
            onClick={handleWatchTrailer}
            className="bg-primary/90 hover:bg-primary hover-neon-primary"
          >
            <Play className="h-6 w-6 mr-2" />
            Смотреть трейлер
          </Button>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-black/80 text-white border-none">
            {trailer.type}
          </Badge>
        </div>

        {/* Official badge */}
        {trailer.official && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground">
              Официальный
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {trailer.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{trailer.site}</span>
            <span>•</span>
            <span>{new Date(trailer.published_at).toLocaleDateString('ru-RU')}</span>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleWatchTrailer}
            className="text-primary hover:text-primary-foreground hover:bg-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}