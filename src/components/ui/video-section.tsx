import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Play, ExternalLink } from 'lucide-react';
import type { TMDbVideo } from '@/lib/tmdb';

interface VideoSectionProps {
  videos: TMDbVideo[];
}

export function VideoSection({ videos }: VideoSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<TMDbVideo | null>(null);

  // Prioritize trailers and teasers
  const sortedVideos = videos
    .filter(video => video.site === 'YouTube')
    .sort((a, b) => {
      const typeOrder = { 'Trailer': 0, 'Teaser': 1, 'Clip': 2, 'Featurette': 3 };
      return (typeOrder[a.type as keyof typeof typeOrder] ?? 4) - (typeOrder[b.type as keyof typeof typeOrder] ?? 4);
    })
    .slice(0, 10);

  if (sortedVideos.length === 0) return null;

  const getYouTubeEmbedUrl = (key: string) => `https://www.youtube.com/embed/${key}`;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Видео</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedVideos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-all">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 text-black hover:bg-white"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-medium text-sm leading-tight">{video.name}</h4>
                  <p className="text-xs text-muted-foreground">{video.type}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVideo?.name}
              <Button
                size="icon"
                variant="outline"
                asChild
              >
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo?.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.key)}
                title={selectedVideo.name}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}