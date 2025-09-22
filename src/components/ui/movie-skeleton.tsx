import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MovieSkeletonProps {
  className?: string;
}

export const MovieSkeleton: React.FC<MovieSkeletonProps> = ({ className }) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-[2/3]">
        <Skeleton className="h-full w-full" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};