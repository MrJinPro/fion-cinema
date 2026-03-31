import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdsEnabled } from '@/hooks/useAdsEnabled';

export type AdPlacement =
  | 'home_top'
  | 'movie_details'
  | 'search'
  | 'categories'
  | 'mobile_bottom';

export type AdFormat = 'banner' | 'rectangle' | 'sticky';

const placementLabel: Record<AdPlacement, string> = {
  home_top: 'Главная',
  movie_details: 'Страница фильма',
  search: 'Поиск',
  categories: 'Категории',
  mobile_bottom: 'Мобильный низ',
};

const formatClass: Record<AdFormat, string> = {
  banner: 'h-24 sm:h-28',
  rectangle: 'h-40 sm:h-44',
  sticky: 'h-14',
};

export function AdSlot({
  placement,
  format = 'rectangle',
  className,
  contentClassName,
}: {
  placement: AdPlacement;
  format?: AdFormat;
  className?: string;
  contentClassName?: string;
}) {
  const { adsEnabled } = useAdsEnabled();

  if (!adsEnabled) return null;

  return (
    <Card className={cn('bg-card/50 border-border/50', className)}>
      <CardContent className={cn('flex items-center justify-center p-4', formatClass[format], contentClassName)}>
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">Реклама</Badge>
            <span className="text-xs text-muted-foreground">{placementLabel[placement]}</span>
          </div>
          <div className="text-sm font-medium text-foreground">Здесь может быть ваш бренд</div>
          <div className="text-xs text-muted-foreground">Плейсхолдер рекламного блока</div>
        </div>
      </CardContent>
    </Card>
  );
}
