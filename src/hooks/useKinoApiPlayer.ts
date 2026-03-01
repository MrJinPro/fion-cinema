import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KinoApiPlaybackResponse {
  found: boolean;
  error?: string;
  match?: {
    id: number;
    title?: string;
    year?: number;
    type?: string;
  };
  player?: {
    streamUrl: string | null;
    streamType: 'http' | 'hls' | null;
    quality?: Array<{
      quality?: string;
      qualityId?: number;
      width?: number;
      height?: number;
    }>;
  };
}

async function fetchKinoApiPlayback(title: string, year?: number): Promise<KinoApiPlaybackResponse> {
  const { data, error } = await supabase.functions.invoke('kinoapi-proxy', {
    body: {
      title: title.trim(),
      year,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as KinoApiPlaybackResponse;
}

export function useKinoApiPlayer(title: string, year?: number, enabled = true) {
  return useQuery({
    queryKey: ['kinoapi-player', title, year],
    queryFn: () => fetchKinoApiPlayback(title, year),
    enabled: enabled && title.trim().length > 1,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}
