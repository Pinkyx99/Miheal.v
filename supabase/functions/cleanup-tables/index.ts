// This Deno edge function is a scheduled job for cleaning up large tables.
// It should be triggered by a cron job (e.g., pg_cron) to run periodically (e.g., every 10 minutes).

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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Table Limits (how many recent records to keep) ---
    const CHAT_MESSAGES_LIMIT = 100;
    const GAME_BETS_LIMIT = 50;
    const ROULETTE_ROUNDS_LIMIT = 50;
    const CRASH_ROUNDS_LIMIT = 50;

    const counts = {
      chat_messages_deleted: 0,
      game_bets_deleted: 0,
      roulette_rounds_deleted: 0,
      roulette_bets_deleted: 0,
      crash_rounds_deleted: 0,
      crash_bets_deleted: 0,
    };

    // --- 1. Cleanup chat_messages table ---
    const { data: chatThreshold, error: chatErr } = await supabaseAdmin
      .from('chat_messages')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(CHAT_MESSAGES_LIMIT - 1, CHAT_MESSAGES_LIMIT - 1);
    if(chatErr) console.error("Cleanup error (chat threshold):", chatErr.message);

    if (chatThreshold && chatThreshold.length > 0) {
      const { count } = await supabaseAdmin.from('chat_messages').delete({ count: 'exact' }).lt('created_at', chatThreshold[0].created_at);
      counts.chat_messages_deleted = count || 0;
    }

    // --- 2. Cleanup game_bets table (live feed) ---
    const { data: betsThreshold, error: betsErr } = await supabaseAdmin
      .from('game_bets')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(GAME_BETS_LIMIT - 1, GAME_BETS_LIMIT - 1);
    if(betsErr) console.error("Cleanup error (bets threshold):", betsErr.message);
    
    if (betsThreshold && betsThreshold.length > 0) {
      const { count } = await supabaseAdmin.from('game_bets').delete({ count: 'exact' }).lt('created_at', betsThreshold[0].created_at);
      counts.game_bets_deleted = count || 0;
    }
    
    // --- 3. Cleanup Roulette tables ---
    const { data: rouletteThreshold, error: rThresholdErr } = await supabaseAdmin
      .from('roulette_rounds')
      .select('created_at')
      .eq('status', 'ended')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(ROULETTE_ROUNDS_LIMIT - 1, ROULETTE_ROUNDS_LIMIT - 1);
    if(rThresholdErr) console.error("Cleanup error (roulette threshold):", rThresholdErr.message);

    if (rouletteThreshold && rouletteThreshold.length > 0) {
      const thresholdTimestamp = rouletteThreshold[0].created_at;
      const { data: oldRoundIds, error: oldRoundsErr } = await supabaseAdmin
        .from('roulette_rounds').select('id').lt('created_at', thresholdTimestamp).eq('status', 'ended');
      if(oldRoundsErr) console.error("Cleanup error (fetch old roulette rounds):", oldRoundsErr.message);

      if (oldRoundIds && oldRoundIds.length > 0) {
        const idsToDelete = oldRoundIds.map(r => r.id);
        // Assuming no ON DELETE CASCADE, delete bets first
        const { count: betsDeletedCount } = await supabaseAdmin.from('roulette_bets').delete({ count: 'exact' }).in('round_id', idsToDelete);
        counts.roulette_bets_deleted = betsDeletedCount || 0;
        // Then delete the old rounds
        const { count: roundsDeletedCount } = await supabaseAdmin.from('roulette_rounds').delete({ count: 'exact' }).in('id', idsToDelete);
        counts.roulette_rounds_deleted = roundsDeletedCount || 0;
      }
    }

    // --- 4. Cleanup Crash tables ---
    const { data: crashThreshold, error: cThresholdErr } = await supabaseAdmin
      .from('crash_rounds')
      .select('created_at')
      .eq('status', 'crashed')
      .order('created_at', { ascending: false })
      .limit(1)
      .range(CRASH_ROUNDS_LIMIT - 1, CRASH_ROUNDS_LIMIT - 1);
    if(cThresholdErr) console.error("Cleanup error (crash threshold):", cThresholdErr.message);
      
    if (crashThreshold && crashThreshold.length > 0) {
      const thresholdTimestamp = crashThreshold[0].created_at;
      const { data: oldCrashRoundIds, error: oldCrashRoundsErr } = await supabaseAdmin
        .from('crash_rounds').select('id').lt('created_at', thresholdTimestamp).eq('status', 'crashed');
      if(oldCrashRoundsErr) console.error("Cleanup error (fetch old crash rounds):", oldCrashRoundsErr.message);
      
      if (oldCrashRoundIds && oldCrashRoundIds.length > 0) {
        const idsToDelete = oldCrashRoundIds.map(r => r.id);
        const { count: betsDeletedCount } = await supabaseAdmin.from('crash_bets').delete({ count: 'exact' }).in('round_id', idsToDelete);
        counts.crash_bets_deleted = betsDeletedCount || 0;
        const { count: roundsDeletedCount } = await supabaseAdmin.from('crash_rounds').delete({ count: 'exact' }).in('id', idsToDelete);
        counts.crash_rounds_deleted = roundsDeletedCount || 0;
      }
    }

    return new Response(JSON.stringify({ 
      message: "Cleanup successful",
      deleted_counts: counts
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
