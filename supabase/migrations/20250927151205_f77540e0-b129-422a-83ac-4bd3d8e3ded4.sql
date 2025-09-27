-- Расширение таблицы movies_kp для веб-скрейпинга
ALTER TABLE public.movies_kp 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS original_title TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS director TEXT,
ADD COLUMN IF NOT EXISTS actors TEXT[],
ADD COLUMN IF NOT EXISTS streaming_services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trailer_url TEXT,
ADD COLUMN IF NOT EXISTS kinopoisk_url TEXT,
ADD COLUMN IF NOT EXISTS kinopoisk_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_scraped TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Создание таблицы для категорий фильмов
CREATE TABLE IF NOT EXISTS public.movie_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kinopoisk_url TEXT,
  description TEXT,
  movie_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы связи фильмов и категорий
CREATE TABLE IF NOT EXISTS public.movie_category_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.movie_categories(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES public.movies_kp(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category_id, movie_id)
);

-- Создание таблицы для кэширования парсинга
CREATE TABLE IF NOT EXISTS public.scraping_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включение RLS для новых таблиц
ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_category_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_cache ENABLE ROW LEVEL SECURITY;

-- Политики для публичного доступа к категориям и их содержимому
CREATE POLICY "Movie categories are publicly readable" 
ON public.movie_categories FOR SELECT USING (true);

CREATE POLICY "Movie category items are publicly readable" 
ON public.movie_category_items FOR SELECT USING (true);

CREATE POLICY "Scraping cache is publicly readable" 
ON public.scraping_cache FOR SELECT USING (true);

-- Политики для системного управления
CREATE POLICY "System can manage movie categories" 
ON public.movie_categories FOR ALL USING (true);

CREATE POLICY "System can manage movie category items" 
ON public.movie_category_items FOR ALL USING (true);

CREATE POLICY "System can manage scraping cache" 
ON public.scraping_cache FOR ALL USING (true);

-- Функция для очистки устаревшего кэша
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.scraping_cache 
  WHERE expires_at < now();
$$;

-- Триггер для обновления updated_at
CREATE TRIGGER update_movie_categories_updated_at
  BEFORE UPDATE ON public.movie_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scraping_cache_updated_at
  BEFORE UPDATE ON public.scraping_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_movies_kp_kinopoisk_id ON public.movies_kp(kinopoisk_id);
CREATE INDEX IF NOT EXISTS idx_movies_kp_last_scraped ON public.movies_kp(last_scraped);
CREATE INDEX IF NOT EXISTS idx_scraping_cache_url ON public.scraping_cache(url);
CREATE INDEX IF NOT EXISTS idx_scraping_cache_expires_at ON public.scraping_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_movie_category_items_category_id ON public.movie_category_items(category_id);

-- Вставка базовых категорий Kinopoisk
INSERT INTO public.movie_categories (name, slug, kinopoisk_url, description) VALUES
('250 лучших фильмов', 'top-250', 'https://www.kinopoisk.ru/top/lists/58/', '250 лучших фильмов по версии КиноПоиск'),
('100 популярных фильмов', 'popular-100', 'https://www.kinopoisk.ru/lists/movies/popular-films/', '100 самых популярных фильмов'),
('Новинки кино', 'new-movies', 'https://www.kinopoisk.ru/lists/movies/new/', 'Последние новинки кинематографа'),
('Российское кино', 'russian-cinema', 'https://www.kinopoisk.ru/lists/categories/movies/1/', 'Лучшие российские фильмы'),
('Зарубежные фильмы', 'foreign-cinema', 'https://www.kinopoisk.ru/lists/categories/movies/2/', 'Популярные зарубежные фильмы'),
('Сериалы', 'tv-series', 'https://www.kinopoisk.ru/lists/categories/series/1/', 'Популярные сериалы'),
('Мультфильмы', 'cartoons', 'https://www.kinopoisk.ru/lists/categories/cartoons/1/', 'Лучшие мультфильмы')
ON CONFLICT (slug) DO NOTHING;