export type PublicEnvKey =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_PUBLISHABLE_KEY'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'VITE_TMDB_API_KEY';

declare global {
  interface Window {
    __FION_ENV__?: Partial<Record<PublicEnvKey, string>>;
  }
}

export function readPublicEnv(key: PublicEnvKey): string | undefined {
  const viteEnv = (import.meta as any)?.env?.[key] as string | undefined;
  if (viteEnv && viteEnv.length > 0) return viteEnv;

  const runtimeEnv = typeof window !== 'undefined' ? window.__FION_ENV__?.[key] : undefined;
  if (runtimeEnv && runtimeEnv.length > 0) return runtimeEnv;

  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  return readPublicEnv('VITE_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    readPublicEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    readPublicEnv('VITE_SUPABASE_ANON_KEY')
  );
}
