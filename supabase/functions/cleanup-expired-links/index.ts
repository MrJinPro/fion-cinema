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

    console.log('Starting cleanup of expired parsed links...');

    // Delete expired links
    const { data: deletedLinks, error: deleteError } = await supabase
      .from('parsed_links')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id, movie_id, title, source_site');

    if (deleteError) {
      console.error('Error deleting expired links:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Database error during cleanup' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deletedCount = deletedLinks?.length || 0;
    console.log(`Cleaned up ${deletedCount} expired parsed links`);

    // Also deactivate old links that are close to expiring (within 1 hour)
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    const { data: deactivatedLinks, error: deactivateError } = await supabase
      .from('parsed_links')
      .update({ is_active: false })
      .lt('expires_at', oneHourFromNow)
      .eq('is_active', true)
      .select('id, movie_id, title');

    if (deactivateError) {
      console.error('Error deactivating soon-to-expire links:', deactivateError);
    } else {
      const deactivatedCount = deactivatedLinks?.length || 0;
      console.log(`Deactivated ${deactivatedCount} soon-to-expire links`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        deleted: deletedCount,
        deactivated: deactivatedLinks?.length || 0,
        message: `Cleanup completed: ${deletedCount} deleted, ${deactivatedLinks?.length || 0} deactivated`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup-expired-links function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});