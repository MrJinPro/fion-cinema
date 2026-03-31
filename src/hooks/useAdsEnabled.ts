import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

function isTruthy(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'y';
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

function isPremiumUser(user: { user_metadata?: Record<string, unknown> } | null): boolean {
  const meta = user?.user_metadata ?? {};

  // Если в будущем появится явная подписка/план — сюда можно будет подцепить один-единственный источник правды.
  const plan = typeof meta.plan === 'string' ? meta.plan.toLowerCase() : undefined;
  if (plan === 'premium' || plan === 'pro' || plan === 'paid') return true;

  if (isTruthy(meta.is_premium)) return true;
  if (isTruthy(meta.premium)) return true;
  if (isTruthy(meta.is_paid)) return true;

  return false;
}

export function useAdsEnabled(): { adsEnabled: boolean; authLoading: boolean } {
  const { user, loading } = useAuth();

  const premium = useMemo(() => isPremiumUser(user as any), [user]);

  // Важно: пока auth не инициализировался — не показываем рекламу,
  // чтобы случайно не мигнуть баннером premium-пользователю.
  const adsEnabled = !loading && !premium;

  return { adsEnabled, authLoading: loading };
}
