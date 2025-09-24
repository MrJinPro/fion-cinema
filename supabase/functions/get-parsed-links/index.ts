import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for secure database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { movieId, title, year, imdbId } = await req.json();
    
    if (!movieId) {
      return new Response(
        JSON.stringify({ error: 'Movie ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Getting parsed links for movie: ${title} (ID: ${movieId})`);

    // Check for existing cached links
    const { data: existingLinks, error: fetchError } = await supabase
      .from('parsed_links')
      .select('video_links, expires_at, source_site')
      .eq('movie_id', movieId)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('parsed_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing links:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', links: [] }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return existing links if found and still valid
    if (existingLinks && existingLinks.length > 0) {
      const links = existingLinks[0];
      console.log(`Found cached links for movie ${movieId}, source: ${links.source_site}`);
      
      // Sanitize links before returning (remove direct URLs for security)
      const sanitizedLinks = Array.isArray(links.video_links) ? links.video_links.map((link: any) => ({
        quality: link.quality || 'HD',
        type: link.type || 'embed',
        source: link.source || 'Unknown',
        // Return identifier instead of direct URL for security
        id: link.id || Math.random().toString(36).substr(2, 9)
      })) : [];

      return new Response(
        JSON.stringify({ 
          links: sanitizedLinks,
          source: links.source_site,
          cached: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no cached links found, trigger parsing via kinogo-parser
    console.log(`No cached links found for movie ${movieId}, triggering parser`);
    
    // Call kinogo-parser function to parse new links
    const { data: parseResult, error: parseError } = await supabase.functions.invoke('kinogo-parser', {
      body: { movieId, title, year, imdbId }
    });

    if (parseError) {
      console.error('Error calling kinogo-parser:', parseError);
      return new Response(
        JSON.stringify({ error: 'Parser error', links: [] }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the parsed results
    return new Response(
      JSON.stringify({ 
        links: parseResult?.links || [],
        source: parseResult?.source || 'kinogo',
        cached: false 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-parsed-links function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error),
        links: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});