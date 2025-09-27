-- Fix user_ratings data type issue to support ratings 1-10
ALTER TABLE user_ratings ALTER COLUMN rating TYPE INTEGER;