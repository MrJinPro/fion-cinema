import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const RatingStars = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showValue = true 
}: RatingStarsProps) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(rating);

  const handleStarClick = (starRating: number) => {
    if (readonly) return;
    setSelectedRating(starRating);
    onRatingChange?.(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoveredRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  const displayRating = hoveredRating || selectedRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground">
          {displayRating > 0 ? `${displayRating}/10` : '—'}
        </span>
      )}
    </div>
  );
};