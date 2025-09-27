-- Fix data types to prevent overflow errors
ALTER TABLE movies_tmdb ALTER COLUMN budget TYPE BIGINT;
ALTER TABLE movies_tmdb ALTER COLUMN revenue TYPE BIGINT;
ALTER TABLE movies_tmdb ALTER COLUMN vote_average TYPE DECIMAL(3,1);
ALTER TABLE movies_tmdb ALTER COLUMN popularity TYPE DECIMAL(10,3);

ALTER TABLE tv_shows_tmdb ALTER COLUMN vote_average TYPE DECIMAL(3,1);
ALTER TABLE tv_shows_tmdb ALTER COLUMN popularity TYPE DECIMAL(10,3);

ALTER TABLE user_ratings ALTER COLUMN rating TYPE DECIMAL(2,1);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_cached_at ON movies_tmdb(cached_at);
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_cached_at ON tv_shows_tmdb(cached_at);
CREATE INDEX IF NOT EXISTS idx_user_ratings_content ON user_ratings(content_id, content_type);