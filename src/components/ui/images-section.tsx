import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Dialog, DialogContent } from './dialog';
import { Button } from './button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTMDbClient } from '@/lib/tmdb';
import type { TMDbImages } from '@/lib/tmdb';

interface ImagesSectionProps {
  images: TMDbImages;
}

export function ImagesSection({ images }: ImagesSectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageType, setImageType] = useState<'backdrops' | 'posters'>('backdrops');
  
  const tmdbClient = getTMDbClient();
  
  const allImages = [
    ...images.backdrops.map(img => ({ ...img, type: 'backdrop' as const })),
    ...images.posters.map(img => ({ ...img, type: 'poster' as const }))
  ].sort((a, b) => b.vote_average - a.vote_average);

  const displayImages = imageType === 'backdrops' 
    ? images.backdrops.slice(0, 12)
    : images.posters.slice(0, 12);

  if (displayImages.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    const totalImages = displayImages.length;
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex === 0 ? totalImages - 1 : selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex === totalImages - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Изображения</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={imageType === 'backdrops' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageType('backdrops')}
              >
                Кадры ({images.backdrops.length})
              </Button>
              <Button
                variant={imageType === 'posters' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageType('posters')}
              >
                Постеры ({images.posters.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayImages.map((image, index) => (
              <div
                key={image.file_path}
                className="aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={tmdbClient.getImageURL(image.file_path, 'w342')}
                  alt={`${imageType === 'backdrops' ? 'Кадр' : 'Постер'} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-6xl w-full p-0">
          {selectedImageIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <img
                src={tmdbClient.getImageURL(displayImages[selectedImageIndex].file_path, 'original')}
                alt={`${imageType === 'backdrops' ? 'Кадр' : 'Постер'} ${selectedImageIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {displayImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}