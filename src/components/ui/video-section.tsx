import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Play, ExternalLink, Maximize2 } from 'lucide-react';
import { EnhancedVideoPlayer } from './enhanced-video-player';
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

  const featuredVideo = sortedVideos[0];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Видео и трейлеры
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Featured Video */}
          {featuredVideo && (
            <div className="mb-6">
              <div className="relative group cursor-pointer" onClick={() => setSelectedVideo(featuredVideo)}>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${featuredVideo.key}/maxresdefault.jpg`}
                    alt={featuredVideo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${featuredVideo.key}/mqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition-all">
                    <div className="text-center">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="bg-white/90 text-black hover:bg-white mb-2"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Смотреть трейлер
                      </Button>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Полный экран
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${featuredVideo.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            YouTube
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-lg">{featuredVideo.name}</h3>
                  <p className="text-muted-foreground">{featuredVideo.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Videos Grid */}
          {sortedVideos.length > 1 && (
            <>
              <h4 className="font-medium mb-4">Другие видео</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedVideos.slice(1).map((video) => (
                  <div key={video.id} className="relative group cursor-pointer" onClick={() => setSelectedVideo(video)}>
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
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2">{video.name}</h4>
                      <p className="text-xs text-muted-foreground">{video.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Video Player */}
      <EnhancedVideoPlayer
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}