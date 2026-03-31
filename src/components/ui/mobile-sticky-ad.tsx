import React from 'react';
import { AdSlot } from '@/components/ui/ad-slot';
import { useAdsEnabled } from '@/hooks/useAdsEnabled';

export function MobileStickyAd() {
  const { adsEnabled } = useAdsEnabled();

  if (!adsEnabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div
        className="px-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <AdSlot placement="mobile_bottom" format="sticky" className="rounded-t-lg" />
      </div>
    </div>
  );
}
