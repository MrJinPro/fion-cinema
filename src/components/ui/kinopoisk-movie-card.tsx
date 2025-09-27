import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import { KinopoiskMovie } from "@/hooks/useKinopoisk";
import { PosterImage } from "@/components/ui/poster-image";

interface KinopoiskMovieCardProps {
  movie: KinopoiskMovie;
  className?: string;
}

export function KinopoiskMovieCard({ movie, className = "" }: KinopoiskMovieCardProps) {
  const posterUrl = movie.poster?.url;
  const rating = movie.rating?.kp;
  const title = movie.name || movie.alternativeName || "Без названия";
  const genres = movie.genres?.slice(0, 2) || [];

  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card border-border ${className}`}>
      <div className="relative overflow-hidden rounded-t-lg">
        <PosterImage
          src={posterUrl}
          alt={title}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{movie.year}</span>
        </div>
        
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}