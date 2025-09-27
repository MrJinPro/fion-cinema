-- Создание системы кураторских подборок для FiOn Cinema
CREATE TABLE public.curated_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  collection_type TEXT NOT NULL CHECK (collection_type IN ('weekly_top', 'monthly_top', 'genre_collection', 'thematic', 'editorial')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  poster_url TEXT,
  total_items INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица элементов подборок
CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.curated_collections(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  custom_description TEXT,
  curator_note TEXT,
  UNIQUE(collection_id, tmdb_id, media_type)
);

-- Включение RLS
ALTER TABLE public.curated_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Политики RLS - подборки доступны всем для просмотра
CREATE POLICY "Collections are publicly readable" 
ON public.curated_collections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Collection items are publicly readable" 
ON public.collection_items 
FOR SELECT 
USING (true);

-- Только админы могут управлять подборками
CREATE POLICY "Admins can manage collections" 
ON public.curated_collections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage collection items" 
ON public.collection_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_curated_collections_updated_at
BEFORE UPDATE ON public.curated_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для автоматического подсчета элементов в подборке
CREATE OR REPLACE FUNCTION update_collection_total_items()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.curated_collections 
  SET total_items = (
    SELECT COUNT(*) 
    FROM public.collection_items 
    WHERE collection_id = COALESCE(NEW.collection_id, OLD.collection_id)
  )
  WHERE id = COALESCE(NEW.collection_id, OLD.collection_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления счетчика элементов
CREATE TRIGGER update_collection_items_count
AFTER INSERT OR UPDATE OR DELETE ON public.collection_items
FOR EACH ROW
EXECUTE FUNCTION update_collection_total_items();

-- Вставка начальных подборок
INSERT INTO public.curated_collections (title, title_en, description, description_en, slug, collection_type, display_order) VALUES
('Топ 50 фильмов недели по мнению FiOn Cinema', 'Top 50 Movies of the Week by FiOn Cinema', 'Лучшие фильмы этой недели, отобранные нашими кураторами', 'Best movies of this week, curated by our editors', 'weekly-top-50', 'weekly_top', 1),
('Топ 250 фильмов месяца от FiOn Cinema', 'Top 250 Movies of the Month by FiOn Cinema', 'Ежемесячная подборка лучших фильмов по версии FiOn Cinema', 'Monthly selection of the best movies according to FiOn Cinema', 'monthly-top-250', 'monthly_top', 2),
('Лучшие драмы всех времен', 'Best Dramas of All Time', 'Драматические фильмы, которые изменили кинематограф', 'Dramatic films that changed cinema', 'best-dramas', 'genre_collection', 3),
('Современная фантастика', 'Modern Sci-Fi', 'Лучшие научно-фантастические фильмы последних лет', 'Best sci-fi movies of recent years', 'modern-scifi', 'genre_collection', 4),
('Российские шедевры', 'Russian Masterpieces', 'Величайшие произведения российского кинематографа', 'Greatest works of Russian cinema', 'russian-masterpieces', 'thematic', 5);

-- Создание индексов для производительности
CREATE INDEX idx_curated_collections_active ON public.curated_collections(is_active, display_order);
CREATE INDEX idx_curated_collections_type ON public.curated_collections(collection_type, is_active);
CREATE INDEX idx_collection_items_collection_position ON public.collection_items(collection_id, position);
CREATE INDEX idx_collection_items_tmdb_media ON public.collection_items(tmdb_id, media_type);