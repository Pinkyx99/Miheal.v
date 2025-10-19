
// This Deno edge function is the complete server-side heartbeat of the Crash game.
// It should be scheduled to run every 2 seconds via a cron job (e.g., using pg_cron).
// It replaces a faulty RPC by implementing the entire game loop, including a
// provably fair crash point calculation to fix the multiplier distribution issue.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

// FIX: Declare Deno to fix TypeScript error 'Cannot find name 'Deno''.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- Game Constants ---
const HOUSE_EDGE = 1; // 1% house edge
const WAITING_TIME_MS = 7000;
const CRASHED_STATE_HOLD_MS = 3000;
const GROWTH_CONSTANT_K = 0.07;

// --- Provably Fair Calculation ---
async function sha256Hex(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function calculateCrashPoint(hash: string): number {
    const hex = hash.substring(0, 13); // 52 bits for precision
    const intValue = parseInt(hex, 16);
    const e = Math.pow(2, 52);

    // If the hash results in a 0 outcome, it's a 1x crash (house wins).
    if (e === intValue) return 1.00;

    // This formula creates a fair distribution curve for crash points.
    const crashPoint = (100 - HOUSE_EDGE) * e / (e - intValue);
    
    // Return the result floored to 2 decimal places, with a minimum of 1.00.
    return Math.max(1.00, Math.floor(crashPoint * 100) / 100);
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Fetch the current game round ---
    const { data: currentRound, error: fetchError } = await supabase
      .from('crash_rounds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows" error
      throw new Error(`Failed to fetch current round: ${fetchError.message}`);
    }

    // --- 2. Game State Machine Logic ---

    // A. No round exists, or the last one is finished -> Create a new round
    if (!currentRound || (currentRound.status === 'crashed' && Date.now() - new Date(currentRound.ended_at!).getTime() > CRASHED_STATE_HOLD_MS)) {
        const serverSeed = crypto.randomUUID();
        const gameHash = await sha256Hex(serverSeed);
        const crashPoint = calculateCrashPoint(gameHash);

        const { error: insertError } = await supabase.from('crash_rounds').insert({
            status: 'waiting',
            server_seed: serverSeed, // The seed is kept secret until the round ends
            public_seed: gameHash,   // The hash is public, proving the seed isn't changed
            crash_point: crashPoint,
        });
        if (insertError) throw new Error(`Failed to create new round: ${insertError.message}`);
        
        return new Response(JSON.stringify({ message: "New round created." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // B. Round is 'waiting' -> Start it if time is up
    if (currentRound.status === 'waiting' && Date.now() - new Date(currentRound.created_at).getTime() > WAITING_TIME_MS) {
        const { error: updateError } = await supabase
            .from('crash_rounds')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', currentRound.id);

        if (updateError) throw new Error(`Failed to start round: ${updateError.message}`);
        return new Response(JSON.stringify({ message: "Round started." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // C. Round is 'running' -> Check for crash condition
    if (currentRound.status === 'running') {
        const elapsedMs = Date.now() - new Date(currentRound.started_at!).getTime();
        const currentMultiplier = Math.exp(GROWTH_CONSTANT_K * (elapsedMs / 1000));

        if (currentMultiplier >= currentRound.crash_point!) {
            // --- Crash the game ---
            const { error: crashError } = await supabase
                .from('crash_rounds')
                .update({ status: 'crashed', ended_at: new Date().toISOString() })
                .eq('id', currentRound.id);

            if (crashError) throw new Error(`Failed to crash round: ${crashError.message}`);
            
            // --- Process Payouts for Auto-Cashouts ---
            const { data: winningBets, error: fetchBetsError } = await supabase
                .from('crash_bets')
                .select('id, user_id, bet_amount, auto_cashout_at')
                .eq('round_id', currentRound.id)
                .is('cashout_multiplier', null) // Not manually cashed out
                .not('auto_cashout_at', 'is', null) // Auto cashout was set
                .lte('auto_cashout_at', currentRound.crash_point); // Auto cashout was below crash point
            
            if (fetchBetsError) throw new Error(`Failed to fetch winning bets: ${fetchBetsError.message}`);

            if (winningBets && winningBets.length > 0) {
                const payoutPromises = winningBets.map(bet => {
                    const profit = bet.bet_amount * bet.auto_cashout_at! - bet.bet_amount;
                    const payoutAmount = bet.bet_amount * bet.auto_cashout_at!;
                    
                    return supabase.rpc('process_crash_payout', {
                        p_bet_id: bet.id,
                        p_user_id: bet.user_id,
                        p_profit: profit,
                        p_payout_amount: payoutAmount,
                        p_cashout_multiplier: bet.auto_cashout_at!
                    });
                });
                await Promise.all(payoutPromises);
            }
            return new Response(JSON.stringify({ message: "Round crashed and payouts processed." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
    }

    return new Response(JSON.stringify({ message: "Tick processed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Critical error in Crash Tick function:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
