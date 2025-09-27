-- Add multilingual fields to movies_kp table
ALTER TABLE public.movies_kp 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS director_en TEXT,
ADD COLUMN IF NOT EXISTS actors_en TEXT[],
ADD COLUMN IF NOT EXISTS genres_en TEXT[],
ADD COLUMN IF NOT EXISTS country_en TEXT;

-- Create actors table for multilingual actor data
CREATE TABLE IF NOT EXISTS public.actors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  name_ru TEXT NOT NULL,
  name_en TEXT,
  profile_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on actors table
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;

-- Create policies for actors table
CREATE POLICY "Actors are publicly readable" 
ON public.actors 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage actors" 
ON public.actors 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on actors
CREATE TRIGGER update_actors_updated_at
BEFORE UPDATE ON public.actors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_actors_tmdb_id ON public.actors(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_kp_title_en ON public.movies_kp(title_en);

-- Add multilingual fields to movie_categories table
ALTER TABLE public.movie_categories 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;