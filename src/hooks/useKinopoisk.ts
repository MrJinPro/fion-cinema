import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KinopoiskMovie {
  id: number;
  name: string;
  alternativeName?: string;
  year: number;
  poster?: {
    url: string;
  };
  rating?: {
    kp: number;
  };
  genres?: Array<{ name: string }>;
  premiere?: {
    russia: string;
  };
}

export interface KinopoiskResponse {
  docs: KinopoiskMovie[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

async function fetchKinopoiskData(endpoint: string, params: Record<string, string> = {}): Promise<KinopoiskResponse> {
  const searchParams = new URLSearchParams(params);
  searchParams.append('endpoint', endpoint);
  
  const { data, error } = await supabase.functions.invoke('kinopoisk-proxy', {
    body: { 
      endpoint,
      params 
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (error) {
    throw new Error(`Kinopoisk API error: ${error.message}`);
  }

  return data;
}

export function useKinopoiskSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['kinopoisk-search', query],
    queryFn: () => fetchKinopoiskData('/movie/search', { 
      query,
      limit: '20'
    }),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useKinopoiskPremieres() {
  return useQuery({
    queryKey: ['kinopoisk-premieres'],
    queryFn: () => fetchKinopoiskData('/movie', {
      'premiere.russia': `${new Date().getFullYear()}-01-01-${new Date().getFullYear()}-12-31`,
      'sortField': 'premiere.russia',
      'sortType': '-1',
      'limit': '20'
    }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useKinopoiskNewReleases() {
  return useQuery({
    queryKey: ['kinopoisk-new-releases'],
    queryFn: () => fetchKinopoiskData('/movie', {
      'year': new Date().getFullYear().toString(),
      'sortField': 'year',
      'sortType': '-1',
      'limit': '20'
    }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}