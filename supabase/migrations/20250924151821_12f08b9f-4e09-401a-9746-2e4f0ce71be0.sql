-- Create table for caching Kinopoisk.dev movies
CREATE TABLE public.movies_kp (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  poster TEXT,
  rating FLOAT,
  genres TEXT[],
  premiere_russia DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for caching API queries
CREATE TABLE public.cache_queries (
  query TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.movies_kp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Movies KP are publicly readable" 
ON public.movies_kp 
FOR SELECT 
USING (true);

CREATE POLICY "Cache queries are publicly readable" 
ON public.cache_queries 
FOR SELECT 
USING (true);

-- System can manage both tables
CREATE POLICY "System can manage movies KP" 
ON public.movies_kp 
FOR ALL 
USING (true);

CREATE POLICY "System can manage cache queries" 
ON public.cache_queries 
FOR ALL 
USING (true);

-- Create indexes for optimization
CREATE INDEX idx_movies_kp_updated_at ON public.movies_kp(updated_at);
CREATE INDEX idx_movies_kp_year ON public.movies_kp(year);
CREATE INDEX idx_movies_kp_rating ON public.movies_kp(rating);
CREATE INDEX idx_cache_queries_updated_at ON public.cache_queries(updated_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_movies_kp_updated_at
BEFORE UPDATE ON public.movies_kp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cache_queries_updated_at
BEFORE UPDATE ON public.cache_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();