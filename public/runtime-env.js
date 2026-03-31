// Runtime public configuration for deployments where build-time Vite env vars
// are not available (static hosting).
//
// IMPORTANT: Only put PUBLIC values here.
// Supabase URL + anon/publishable key are public by design.

window.__FION_ENV__ = {
  VITE_SUPABASE_URL: "https://qvavaxqdsbwjcimsbqmx.supabase.co",
  // Backward/forward compatible key names (project uses both in different places)
  VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXZheHFkc2J3amNpbXNicW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NjUyNjgsImV4cCI6MjA3NDE0MTI2OH0.OVuP_3hxUXJBVsreJwbntDYvzZOMwIXeXEYMp6TqxBI",
  VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YXZheHFkc2J3amNpbXNicW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NjUyNjgsImV4cCI6MjA3NDE0MTI2OH0.OVuP_3hxUXJBVsreJwbntDYvzZOMwIXeXEYMp6TqxBI",
};
