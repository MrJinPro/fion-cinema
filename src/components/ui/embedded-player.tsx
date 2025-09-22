import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Maximize2, Volume2, VolumeX, Settings, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Available video sources (VidSrc alternatives)
  const videoSources = [
    {
      name: 'VidSrc.to',
      url: `https://vidsrc.to/embed/movie/${movieId}`,
      description: 'Основной источник'
    },
    {
      name: 'VidSrc.me', 
      url: imdbId ? `https://vidsrc.me/embed/movie?imdb=${imdbId}` : `https://vidsrc.me/embed/movie?tmdb=${movieId}`,
      description: 'Альтернативный источник'
    },
    {
      name: 'AutoEmbed',
      url: `https://www.2embed.to/embed/tmdb/movie?id=${movieId}`,
      description: 'Резервный источник'
    }
  ];

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Не удалось загрузить видео. Попробуйте другой источник.');
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="lg"
          className={`bg-red-600 hover:bg-red-700 text-white ${className}`}
        >
          <Play className="mr-2 h-5 w-5" />
          Смотреть онлайн
        </Button>
      </DialogTrigger>
      
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
            <Alert className="bg-yellow-600/90 border-yellow-500 text-white">
              <AlertDescription>
                ⚠️ Видео предоставляется сторонними сервисами. Качество и доступность могут варьироваться.
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation"
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
  );
};

export default EmbeddedPlayer;