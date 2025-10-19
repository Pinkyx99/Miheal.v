// This Deno edge function is a scheduled job for cleaning up large tables.
// It should be triggered by a cron job (e.g., pg_cron) every few minutes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This function is designed to be called by an internal system like pg_cron,
  // which will use the service_role_key for authentication.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use the Service Role Key to bypass RLS for cleanup.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const CHAT_MESSAGES_LIMIT = 100;
    const GAME_BETS_LIMIT = 50;
    let chat_deleted_count = 0;
    let bets_deleted_count = 0;

    // --- 1. Cleanup chat_messages table ---
    const { data: chatThreshold, error: chatThresholdError } = await supabaseAdmin
      .from('chat_messages')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(CHAT_MESSAGES_LIMIT - 1, CHAT_MESSAGES_LIMIT - 1);

    if (chatThresholdError) throw new Error(`Chat threshold error: ${chatThresholdError.message}`);

    if (chatThreshold && chatThreshold.length > 0) {
      const thresholdTimestamp = chatThreshold[0].created_at;
      // Delete all messages created before the 100th most recent message.
      const { count, error: chatDeleteError } = await supabaseAdmin
        .from('chat_messages')
        .delete({ count: 'exact' })
        .lt('created_at', thresholdTimestamp);
      
      if (chatDeleteError) throw new Error(`Chat delete error: ${chatDeleteError.message}`);
      chat_deleted_count = count || 0;
    }

    // --- 2. Cleanup game_bets table ---
    const { data: betsThreshold, error: betsThresholdError } = await supabaseAdmin
      .from('game_bets')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(GAME_BETS_LIMIT - 1, GAME_BETS_LIMIT - 1);
    
    if (betsThresholdError) throw new Error(`Game bets threshold error: ${betsThresholdError.message}`);

    if (betsThreshold && betsThreshold.length > 0) {
      const thresholdTimestamp = betsThreshold[0].created_at;
      // Delete all bets created before the 50th most recent bet.
      const { count, error: betsDeleteError } = await supabaseAdmin
        .from('game_bets')
        .delete({ count: 'exact' })
        .lt('created_at', thresholdTimestamp);
        
      if (betsDeleteError) throw new Error(`Game bets delete error: ${betsDeleteError.message}`);
      bets_deleted_count = count || 0;
    }
    
    return new Response(JSON.stringify({ 
      message: "Cleanup successful",
      chat_messages_deleted: chat_deleted_count,
      game_bets_deleted: bets_deleted_count,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Critical error in cleanup-tables function:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
