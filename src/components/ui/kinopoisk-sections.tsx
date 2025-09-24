import { useKinopoiskPremieres, useKinopoiskNewReleases } from "@/hooks/useKinopoisk";
import { KinopoiskMovieCard } from "./kinopoisk-movie-card";
import { MovieSkeleton } from "./movie-skeleton";
import { ChevronRight } from "lucide-react";

export function KinopoiskPremieres() {
  const { data, isLoading, error } = useKinopoiskPremieres();

  if (error) {
    return null; // Silently fail to preserve user experience
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🇷🇺 RU Премьеры
        </h2>
        <ChevronRight className="w-6 h-6 text-muted-foreground" />
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px]">
              <MovieSkeleton />
            </div>
          ))
        ) : (
          data?.docs?.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[140px]">
              <KinopoiskMovieCard movie={movie} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function KinopoiskNewReleases() {
  const { data, isLoading, error } = useKinopoiskNewReleases();

  if (error) {
    return null; // Silently fail to preserve user experience
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎬 Русские новинки
        </h2>
        <ChevronRight className="w-6 h-6 text-muted-foreground" />
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px]">
              <MovieSkeleton />
            </div>
          ))
        ) : (
          data?.docs?.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[140px]">
              <KinopoiskMovieCard movie={movie} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}