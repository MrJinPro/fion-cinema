import { useQuery } from "@tanstack/react-query";
import { useTrending } from '@/hooks/useTMDbApi';
import { useKinopoiskPremieres, useKinopoiskNewReleases } from '@/hooks/useKinopoisk';
import type { TMDbMovie, TMDbTVShow } from '@/lib/tmdb';
import type { KinopoiskMovie } from '@/hooks/useKinopoisk';

interface MixedHeroItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  source: 'tmdb' | 'kinopoisk';
  media_type?: 'movie' | 'tv';
}

export const useMixedHeroContent = () => {
  const { data: tmdbTrending, isLoading: tmdbLoading } = useTrending('all', 'week');
  const { data: kinopoiskPremieres, isLoading: kpPremieresLoading } = useKinopoiskPremieres();
  const { data: kinopoiskNewReleases, isLoading: kpNewLoading } = useKinopoiskNewReleases();

  const { data: mixedContent, isLoading: mixedLoading } = useQuery({
    queryKey: ['mixed-hero-content', tmdbTrending, kinopoiskPremieres, kinopoiskNewReleases],
    queryFn: () => {
      const mixedItems: MixedHeroItem[] = [];

      // Добавляем ТОП-5 из TMDb trending
      if (tmdbTrending?.results) {
        const tmdbItems = tmdbTrending.results.slice(0, 5).map((item: TMDbMovie | TMDbTVShow): MixedHeroItem => ({
          id: item.id,
          title: 'title' in item ? item.title : undefined,
          name: 'name' in item ? item.name : undefined,
          overview: item.overview,
          backdrop_path: item.backdrop_path,
          poster_path: item.poster_path,
          release_date: 'release_date' in item ? item.release_date : undefined,
          first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
          vote_average: item.vote_average,
          source: 'tmdb',
          media_type: 'title' in item ? 'movie' : 'tv'
        }));
        mixedItems.push(...tmdbItems);
      }

      // Добавляем ТОП-3 из Kinopoisk премьеры
      if (kinopoiskPremieres?.docs) {
        const kpPremiereItems = kinopoiskPremieres.docs.slice(0, 3).map((item: KinopoiskMovie): MixedHeroItem => ({
          id: item.id,
          title: item.name,
          overview: `${item.alternativeName || ''} (${item.year})${item.genres?.length ? ` • ${item.genres.map(g => g.name).slice(0, 2).join(', ')}` : ''}`,
          backdrop_path: item.poster?.url,
          poster_path: item.poster?.url,
          release_date: item.premiere?.russia,
          vote_average: item.rating?.kp,
          source: 'kinopoisk',
          media_type: 'movie'
        }));
        mixedItems.push(...kpPremiereItems);
      }

      // Добавляем ТОП-3 из Kinopoisk новинки
      if (kinopoiskNewReleases?.docs) {
        const kpNewItems = kinopoiskNewReleases.docs.slice(0, 3).map((item: KinopoiskMovie): MixedHeroItem => ({
          id: item.id,
          title: item.name,
          overview: `${item.alternativeName || ''} (${item.year})${item.genres?.length ? ` • ${item.genres.map(g => g.name).slice(0, 2).join(', ')}` : ''}`,
          backdrop_path: item.poster?.url,
          poster_path: item.poster?.url,
          release_date: `${item.year}-01-01`,
          vote_average: item.rating?.kp,
          source: 'kinopoisk',
          media_type: 'movie'
        }));
        mixedItems.push(...kpNewItems);
      }

      // Перемешиваем массив для лучшего отображения
      return mixedItems.sort(() => Math.random() - 0.5).slice(0, 11);
    },
    enabled: !tmdbLoading && !kpPremieresLoading && !kpNewLoading,
    staleTime: 1000 * 60 * 30, // 30 минут
  });

  return {
    data: mixedContent,
    isLoading: tmdbLoading || kpPremieresLoading || kpNewLoading || mixedLoading,
  };
};