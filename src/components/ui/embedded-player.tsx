import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Film, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StreamingAvailability } from './streaming-availability';
import { KinoApiMediaType, useKinoApiPlayer } from '@/hooks/useKinoApiPlayer';

interface EmbeddedPlayerProps {
  movieId: number;
  title: string;
  year?: number;
  watchProviders?: any;
  className?: string;
  mediaType?: KinoApiMediaType;
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({ 
  movieId, 
  title, 
  year, 
  watchProviders,
  className,
  mediaType = 'movie',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, error } = useKinoApiPlayer(title, year, isOpen, mediaType);
  const streamUrl = data?.player?.streamUrl ?? null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          variant="default" 
          size="lg"
          className={`bg-primary hover:bg-primary/90 text-primary-foreground ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <Play className="mr-2 h-5 w-5" />
          Смотреть фильм
        </Button>
      
        <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Film className="h-6 w-6" />
              {title} {year && `(${year})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {isLoading && (
              <div className="text-center py-8">
                <div className="rounded-full h-20 w-20 bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Подбираем источник для просмотра...</h3>
                <p className="text-muted-foreground">
                  Ищем {mediaType === 'tv' ? 'сериал' : 'фильм'} в KinoAPI по названию и году.
                </p>
              </div>
            )}

            {!isLoading && error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Не удалось получить поток из KinoAPI: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && streamUrl && (
              <div className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    src={streamUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Источник найден через KinoAPI. Если воспроизведение не начинается, откройте фильм в официальных сервисах ниже.
                </p>
              </div>
            )}

            {!isLoading && !error && !streamUrl && (
              <Alert>
                <AlertDescription>
                  Поток для этого фильма не найден в KinoAPI по запросу «{title}{year ? ` (${year})` : ''}».
                </AlertDescription>
              </Alert>
            )}

            {/* Streaming Availability */}
            <StreamingAvailability 
              watchProviders={watchProviders}
              movieId={movieId}
              title={title}
            />

            {/* Official Sources */}
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Официальные источники</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://www.kinopoisk.ru/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Кинопоиск
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://www.netflix.com/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Netflix
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://www.primevideo.com/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Prime Video
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmbeddedPlayer;