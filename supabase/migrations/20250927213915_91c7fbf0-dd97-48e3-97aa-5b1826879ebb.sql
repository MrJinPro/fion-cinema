-- Create TMDB caching tables
CREATE TABLE public.movies_tmdb (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  release_date DATE,
  poster_path TEXT,
  backdrop_path TEXT,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  genres JSONB DEFAULT '[]'::jsonb,
  runtime INTEGER,
  budget BIGINT,
  revenue BIGINT,
  production_companies JSONB DEFAULT '[]'::jsonb,
  production_countries JSONB DEFAULT '[]'::jsonb,
  spoken_languages JSONB DEFAULT '[]'::jsonb,
  status TEXT,
  tagline TEXT,
  homepage TEXT,
  imdb_id TEXT,
  popularity DECIMAL(8,3),
  adult BOOLEAN DEFAULT false,
  video BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create TV shows caching table
CREATE TABLE public.tv_shows_tmdb (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT,
  overview TEXT,
  first_air_date DATE,
  last_air_date DATE,
  poster_path TEXT,
  backdrop_path TEXT,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  genres JSONB DEFAULT '[]'::jsonb,
  number_of_episodes INTEGER,
  number_of_seasons INTEGER,
  episode_run_time JSONB DEFAULT '[]'::jsonb,
  networks JSONB DEFAULT '[]'::jsonb,
  production_companies JSONB DEFAULT '[]'::jsonb,
  status TEXT,
  tagline TEXT,
  homepage TEXT,
  popularity DECIMAL(8,3),
  adult BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create persons caching table  
CREATE TABLE public.persons_tmdb (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  biography TEXT,
  birthday DATE,
  deathday DATE,
  place_of_birth TEXT,
  profile_path TEXT,
  adult BOOLEAN DEFAULT false,
  also_known_as JSONB DEFAULT '[]'::jsonb,
  known_for_department TEXT,
  popularity DECIMAL(8,3),
  gender INTEGER,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user behavior tracking table
CREATE TABLE public.user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  action_type TEXT NOT NULL, -- 'view_movie', 'watch_trailer', 'add_favorite', 'create_list', etc.
  content_id INTEGER, -- tmdb_id or kinopoisk_id
  content_type TEXT, -- 'movie', 'tv', 'person'
  metadata JSONB DEFAULT '{}'::jsonb, -- additional data like time_spent, completion_percentage, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user ratings table
CREATE TABLE public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv')),
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Create user reviews table
CREATE TABLE public.user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'tv')),
  title TEXT,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  is_moderated BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cinema match sessions table (for the AI feature)
CREATE TABLE public.cinema_match_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_type TEXT NOT NULL DEFAULT 'mood', -- 'mood', 'group', 'quick'
  mood_data JSONB DEFAULT '{}'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb, -- time, weather, etc.
  recommendations JSONB DEFAULT '[]'::jsonb,
  selected_movie_id INTEGER,
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_movies_tmdb_popularity ON public.movies_tmdb(popularity DESC);
CREATE INDEX idx_movies_tmdb_expires ON public.movies_tmdb(expires_at);
CREATE INDEX idx_tv_shows_tmdb_popularity ON public.tv_shows_tmdb(popularity DESC);
CREATE INDEX idx_tv_shows_tmdb_expires ON public.tv_shows_tmdb(expires_at);
CREATE INDEX idx_persons_tmdb_popularity ON public.persons_tmdb(popularity DESC);
CREATE INDEX idx_persons_tmdb_expires ON public.persons_tmdb(expires_at);
CREATE INDEX idx_user_behavior_user_id ON public.user_behavior(user_id);
CREATE INDEX idx_user_behavior_action ON public.user_behavior(action_type);
CREATE INDEX idx_user_behavior_content ON public.user_behavior(content_id, content_type);
CREATE INDEX idx_user_ratings_user ON public.user_ratings(user_id);
CREATE INDEX idx_user_ratings_content ON public.user_ratings(content_id, content_type);
CREATE INDEX idx_user_reviews_user ON public.user_reviews(user_id);
CREATE INDEX idx_user_reviews_content ON public.user_reviews(content_id, content_type);

-- Enable RLS
ALTER TABLE public.movies_tmdb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_shows_tmdb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons_tmdb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cinema_match_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- TMDB cache tables are publicly readable
CREATE POLICY "TMDB movies cache is publicly readable" ON public.movies_tmdb FOR SELECT USING (true);
CREATE POLICY "System can manage TMDB movies cache" ON public.movies_tmdb FOR ALL USING (true);

CREATE POLICY "TMDB TV shows cache is publicly readable" ON public.tv_shows_tmdb FOR SELECT USING (true);
CREATE POLICY "System can manage TMDB TV shows cache" ON public.tv_shows_tmdb FOR ALL USING (true);

CREATE POLICY "TMDB persons cache is publicly readable" ON public.persons_tmdb FOR SELECT USING (true);
CREATE POLICY "System can manage TMDB persons cache" ON public.persons_tmdb FOR ALL USING (true);

-- User behavior tracking
CREATE POLICY "Users can insert their own behavior" ON public.user_behavior FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view their own behavior" ON public.user_behavior FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "System can manage user behavior" ON public.user_behavior FOR ALL USING (true);

-- User ratings
CREATE POLICY "Users can manage their own ratings" ON public.user_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view ratings" ON public.user_ratings FOR SELECT USING (true);

-- User reviews  
CREATE POLICY "Users can manage their own reviews" ON public.user_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view approved reviews" ON public.user_reviews FOR SELECT USING (is_approved = true);

-- Cinema match sessions
CREATE POLICY "Users can manage their own sessions" ON public.cinema_match_sessions FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_movies_tmdb_updated_at BEFORE UPDATE ON public.movies_tmdb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_shows_tmdb_updated_at BEFORE UPDATE ON public.tv_shows_tmdb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_persons_tmdb_updated_at BEFORE UPDATE ON public.persons_tmdb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON public.user_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON public.user_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();