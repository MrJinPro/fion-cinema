import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Film } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StreamingAvailability } from './streaming-availability';

interface EmbeddedPlayerProps {
  movieId: number;
  title: string;
  year?: number;
  watchProviders?: any;
  className?: string;
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({ 
  movieId, 
  title, 
  year, 
  watchProviders,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

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
          {t('player.watchOnline')}
        </Button>
      
        <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Film className="h-6 w-6" />
              {title} {year && `(${year})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {/* Main Message */}
            <div className="text-center py-8">
              <div className="animate-pulse rounded-full h-20 w-20 bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                <Play className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('player.message')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('player.subtitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('player.useOfficialSources')}
              </p>
            </div>

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
                  <p className="font-medium">{t('player.officialSources')}</p>
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