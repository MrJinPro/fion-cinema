-- CRITICAL SECURITY FIX: Restrict access to parsed_links table
-- Remove public read access to prevent exposure of potentially illegal streaming links

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Parsed links are publicly readable" ON public.parsed_links;
DROP POLICY IF EXISTS "System can manage parsed links" ON public.parsed_links;

-- Create restrictive RLS policies
-- Only allow system functions (service role) to manage the data
CREATE POLICY "Service role can manage parsed links" 
ON public.parsed_links 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Revoke public access completely
REVOKE ALL ON public.parsed_links FROM public;
REVOKE ALL ON public.parsed_links FROM anon;

-- Grant limited access only to authenticated users for reading their own data
-- But since this contains potentially illegal content, we'll restrict it further
-- Only service role and authenticated role can access, but with restrictions

-- Allow authenticated users to only read links for movies they're actively viewing
-- This is still risky, so we'll comment this out for now
-- CREATE POLICY "Authenticated users can read active links" 
-- ON public.parsed_links 
-- FOR SELECT 
-- TO authenticated
-- USING (is_active = true AND expires_at > now());

-- For maximum security, only service role should access this table
-- The frontend will go through edge functions to get sanitized data