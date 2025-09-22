// Environment configuration for TMDb API
export const env = {
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY,
} as const;

// Validate required environment variables
if (!env.TMDB_API_KEY) {
  console.warn('VITE_TMDB_API_KEY is not configured. TMDb API features will not work.');
}