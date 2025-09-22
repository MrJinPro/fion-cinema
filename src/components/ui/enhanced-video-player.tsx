import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Play, ExternalLink, Maximize2, Volume2, VolumeX } from 'lucide-react';
import type { TMDbVideo } from '@/lib/tmdb';

interface EnhancedVideoPlayerProps {
  video: TMDbVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedVideoPlayer({ video, isOpen, onClose }: EnhancedVideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!video) return null;

  const getYouTubeEmbedUrl = (key: string) => {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      showinfo: '0',
      modestbranding: '1',
      fs: '1',
      mute: isMuted ? '1' : '0'
    });
    return `https://www.youtube.com/embed/${key}?${params.toString()}`;
  };

  const toggleFullscreen = () => {
    const element = document.querySelector('.video-container');
    if (!document.fullscreenElement && element) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 bg-black border-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{video.name}</DialogTitle>
        </DialogHeader>
        
        <div className="video-container relative bg-black rounded-lg overflow-hidden group">
          {/* Video Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/70 hover:bg-black/90 text-white border-none"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFullscreen}
              className="bg-black/70 hover:bg-black/90 text-white border-none"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              asChild
              className="bg-black/70 hover:bg-black/90 text-white border-none"
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.key}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Video Info Overlay */}
          <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-white font-semibold text-lg shadow-md">{video.name}</h3>
            <p className="text-gray-300 text-sm">{video.type}</p>
          </div>

          {/* YouTube Embed */}
          <div className="aspect-video">
            <iframe
              key={`${video.key}-${isMuted}`}
              src={getYouTubeEmbedUrl(video.key)}
              title={video.name}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}