import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Star, ThumbsUp } from 'lucide-react';
import type { TMDbReview } from '@/lib/tmdb';

interface ReviewsSectionProps {
  reviews: TMDbReview[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  if (reviews.length === 0) return null;

  const toggleReview = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('/https://')) {
      return avatarPath.substring(1);
    }
    return `https://image.tmdb.org/t/p/w64_and_h64_face${avatarPath}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отзывы ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.slice(0, 5).map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.content.length > 600;
            const displayContent = isExpanded || !shouldTruncate 
              ? review.content 
              : review.content.substring(0, 600) + '...';

            return (
              <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={getAvatarUrl(review.author_details.avatar_path) || undefined} 
                      alt={review.author_details.name || review.author} 
                    />
                    <AvatarFallback>
                      {(review.author_details.name || review.author)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {review.author_details.name || review.author}
                      </h4>
                      {review.author_details.rating && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {review.author_details.rating}/10
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatDate(review.created_at)}
                    </p>
                    
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p className="whitespace-pre-wrap">{displayContent}</p>
                    </div>
                    
                    {shouldTruncate && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto"
                        onClick={() => toggleReview(review.id)}
                      >
                        {isExpanded ? 'Свернуть' : 'Читать полностью'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {reviews.length > 5 && (
            <div className="text-center pt-4">
              <Button variant="outline">
                Показать больше отзывов
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}