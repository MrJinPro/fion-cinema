-- Create table for caching movie availability results
CREATE TABLE public.movie_availability_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  tmdb_title TEXT NOT NULL,
  availability_data JSONB NOT NULL,
  region TEXT NOT NULL DEFAULT 'RU',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movie_id, region)
);

-- Enable RLS
ALTER TABLE public.movie_availability_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is movie availability data that's not user-specific)
CREATE POLICY "Movie availability cache is publicly readable" 
ON public.movie_availability_cache 
FOR SELECT 
USING (true);

-- Create policy for system to insert/update cache
CREATE POLICY "System can manage movie availability cache" 
ON public.movie_availability_cache 
FOR ALL 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_movie_availability_cache_updated_at
BEFORE UPDATE ON public.movie_availability_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_movie_availability_cache_movie_id ON public.movie_availability_cache(movie_id);
CREATE INDEX idx_movie_availability_cache_updated_at ON public.movie_availability_cache(updated_at);