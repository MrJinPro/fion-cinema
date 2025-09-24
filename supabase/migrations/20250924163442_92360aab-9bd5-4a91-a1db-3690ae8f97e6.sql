-- Create table for caching parsed movie links
CREATE TABLE public.parsed_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  imdb_id TEXT,
  title TEXT NOT NULL,
  source_site TEXT NOT NULL,
  video_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  parsed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parsed_links ENABLE ROW LEVEL SECURITY;

-- Create policies for parsed links
CREATE POLICY "Parsed links are publicly readable" 
ON public.parsed_links 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage parsed links" 
ON public.parsed_links 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_parsed_links_movie_id ON public.parsed_links(movie_id);
CREATE INDEX idx_parsed_links_expires_at ON public.parsed_links(expires_at);
CREATE INDEX idx_parsed_links_source_site ON public.parsed_links(source_site);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_parsed_links_updated_at
BEFORE UPDATE ON public.parsed_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();