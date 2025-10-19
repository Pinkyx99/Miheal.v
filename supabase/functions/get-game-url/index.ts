import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGameUrl(supabaseClient: SupabaseClient, gameId: string, userId: string) {
    if (!gameId) {
        throw new Error("Game ID is required.");
    }
    if (!userId) {
        throw new Error("User must be authenticated.");
    }
    
    // 1. Get user profile from Supabase
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('username, balance')
        .eq('id', userId)
        .single();
    
    if (profileError || !profile) {
        throw new Error(profileError?.message || "User profile not found.");
    }

    const apiKey = Deno.env.get("ZHENGAMES_API_KEY") || "3f82aac97cmshd2dbb074757cbc7p1e8abajsne347e0cfd05b";
    if (!apiKey) {
        throw new Error("ZhenGames API key is not available.");
    }

    const requestBody = {
        username: profile.username,
        gameID: gameId,
        lang: "en",
        money: profile.balance,
        currency: "USD",
        home_url: "https://mihael.bet" // Placeholder, should be your site's URL
    };

    // 2. Make the request to ZhenGames API
    const response = await fetch('https://zhengames-live-casino-slots-sports-api.p.rapidapi.com/getGameUrl', {
        method: 'POST',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'zhengames-live-casino-slots-sports-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("ZhenGames API Error:", errorText);
        throw new Error(`Game provider API error: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.URL) {
        throw new Error("Game URL not found in API response.");
    }

    return { url: responseData.URL };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        const { gameId } = await req.json();
        
        const data = await getGameUrl(supabaseClient, gameId, user.id);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});