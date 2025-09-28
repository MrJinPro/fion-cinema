-- Создаем индексы для улучшения производительности категорий и фильтров

-- Индекс для фильтрации по году выпуска
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_release_year 
ON movies_tmdb (EXTRACT(YEAR FROM release_date::date));

-- Индекс для фильтрации по рейтингу
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_vote_average 
ON movies_tmdb (vote_average);

-- Индекс для сортировки по популярности
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_popularity 
ON movies_tmdb (popularity DESC);

-- Индекс для фильтрации по жанрам (JSONB)
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_genres 
ON movies_tmdb USING GIN (genres);

-- Индекс для быстрого поиска по дате релиза
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_release_date 
ON movies_tmdb (release_date);

-- Составной индекс для фильтрации и сортировки
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_year_rating 
ON movies_tmdb (EXTRACT(YEAR FROM release_date::date), vote_average DESC);

-- Индекс для проверки актуальности кэша
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_expires_at 
ON movies_tmdb (expires_at);

-- Аналогичные индексы для TV shows
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_first_air_year 
ON tv_shows_tmdb (EXTRACT(YEAR FROM first_air_date::date));

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_vote_average 
ON tv_shows_tmdb (vote_average);

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_popularity 
ON tv_shows_tmdb (popularity DESC);

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_genres 
ON tv_shows_tmdb USING GIN (genres);

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_expires_at 
ON tv_shows_tmdb (expires_at);

-- Функция для очистки устаревшего кэша
CREATE OR REPLACE FUNCTION public.cleanup_expired_tmdb_cache()
RETURNS void
LANGUAGE sql
AS $function$
  DELETE FROM public.movies_tmdb 
  WHERE expires_at < now();
  
  DELETE FROM public.tv_shows_tmdb 
  WHERE expires_at < now();
$function$;