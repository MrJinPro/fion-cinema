import React from 'react';
import { cn } from '@/lib/utils';
import fionPlaceholder from '@/assets/fion-placeholder.png';

interface PosterImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop';
  showTitle?: boolean;
}

export const PosterImage: React.FC<PosterImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'poster',
  showTitle = false,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const aspectClasses = {
    poster: 'aspect-[2/3]',
    backdrop: 'aspect-video',
  };

  if (!src || hasError) {
    return (
      <div className={cn(
        "relative overflow-hidden flex items-center justify-center bg-muted",
        aspectClasses[aspectRatio],
        className
      )}>
        <img
          src={fionPlaceholder}
          alt="FiOn placeholder"
          className="h-full w-full object-cover opacity-60"
        />
        {showTitle && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center px-2 bg-background/80 rounded">
              {alt}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden",
      aspectClasses[aspectRatio],
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <img
            src={fionPlaceholder}
            alt="Loading..."
            className="h-full w-full object-cover opacity-40 animate-pulse"
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};