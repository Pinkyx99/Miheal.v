// This Deno edge function is a scheduled job for cleaning up large tables.
// It should be triggered by a cron job (e.g., pg_cron) to run periodically (e.g., every 10 minutes).
// It now calls a single, powerful SQL function to perform all cleanup tasks.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key to ensure it has permission to run the cleanup
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Call the master cleanup function in the database
    const { data, error } = await supabaseAdmin.rpc('cleanup_all_tables');

    if (error) {
      console.error("Error calling cleanup_all_tables RPC:", error.message);
      throw new Error(`Database cleanup function failed: ${error.message}`);
    }

    // Return the detailed report from the SQL function for logging and verification
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Critical error in cleanup-tables edge function:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
