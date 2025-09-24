import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Maximize2, X, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DisclaimerModal } from './disclaimer-modal';

interface EmbeddedPlayerProps {
  movieId: number;
  title: string;
  year?: number;
  imdbId?: string;
  className?: string;
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({ 
  movieId, 
  title, 
  year, 
  imdbId,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Safe video sources with minimal ads
  const videoSources = [
    {
      name: 'VidSrc Pro',
      url: `https://vidsrc.pro/embed/movie/${movieId}`,
      description: 'Чистый источник без рекламы',
      official: false
    },
    {
      name: 'SuperEmbed',
      url: `https://multiembed.mov/directstream.php?video_id=${movieId}&tmdb=1`,
      description: 'Стабильный источник',
      official: false
    }
  ];

  const handlePlayerOpen = () => {
    const hasSeenDisclaimer = localStorage.getItem('player-disclaimer-accepted');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    } else {
      setDisclaimerAccepted(true);
      setIsOpen(true);
    }
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem('player-disclaimer-accepted', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    setIsOpen(true);
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    const errorMessages = [
      'Источник недоступен или заблокирован блокировщиком рекламы.',
      'Попробуйте другой источник или отключите AdBlock.',
      'Некоторые провайдеры блокируют показ в iframe (Sandbox mode).'
    ];
    setError(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const switchSource = (sourceIndex: number) => {
    setCurrentSource(sourceIndex);
    setIsLoading(true);
    setError(null);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const currentSourceData = videoSources[currentSource];

  return (
    <>
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
        movieTitle={title}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          variant="default" 
          size="lg"
          className={`bg-destructive hover:bg-destructive/90 text-destructive-foreground ${className}`}
          onClick={handlePlayerOpen}
        >
          <Play className="mr-2 h-5 w-5" />
          Смотреть онлайн
        </Button>
      
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black">
        <div ref={playerContainerRef} className="relative w-full h-full">
          {/* Header */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <DialogTitle className="text-lg font-semibold">
                {title} {year && `(${year})`}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {/* Source Selector */}
                <select 
                  value={currentSource} 
                  onChange={(e) => switchSource(Number(e.target.value))}
                  className="bg-black/50 text-white border border-white/20 rounded px-2 py-1 text-sm"
                >
                  {videoSources.map((source, index) => (
                    <option key={index} value={index}>
                      {source.name}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/10"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Warning Alert */}
          <div className="absolute top-16 left-4 right-4 z-10">
            <Alert className="bg-destructive/20 border-destructive text-destructive-foreground">
              <AlertDescription className="flex items-center justify-between">
                <span>⚠️ Неофициальный источник. Используйте на свой страх и риск.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive-foreground hover:bg-destructive/20 ml-2"
                  onClick={() => window.open('https://www.kinopoisk.ru/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Официальные источники
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          {/* Video Player */}
          <div className="w-full h-full pt-32 pb-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Загрузка плеера...</p>
                  <p className="text-sm text-gray-300 mt-2">{currentSourceData.description}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-center max-w-md">
                  <p className="text-red-400 mb-4">{error}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {videoSources.map((source, index) => (
                      <Button
                        key={index}
                        variant={index === currentSource ? "default" : "outline"}
                        size="sm"
                        onClick={() => switchSource(index)}
                        className="text-xs"
                      >
                        {source.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={currentSourceData.url}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox"
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading || error ? 'none' : 'block' }}
            />
          </div>

          {/* Controls Overlay */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{currentSourceData.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">
                      Источник: {currentSourceData.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EmbeddedPlayer;