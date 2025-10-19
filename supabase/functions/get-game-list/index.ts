import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// This function fetches the list of available games from the third-party provider.
// NOTE: This function does not require Supabase client and can be called anonymously.

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGameList() {
    const apiKey = Deno.env.get("RAPID_KEY") || Deno.env.get("ZHENGAMES_API_KEY") || "3f82aac97cmshd2dbb074757cbc7p1e8abajsne347e0cfd05b";
    if (!apiKey) {
        throw new Error("RapidAPI key is not available.");
    }

    const url = 'https://slot-and-betting-games.p.rapidapi.com/';
    const host = 'slot-and-betting-games.p.rapidapi.com';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': host,
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("RapidAPI Error fetching game list:", errorText);
        throw new Error(`Failed to fetch slots: API returned status ${response.status}`);
    }

    const responseData = await response.json();
    
    const mapGame = (game: any, index: number) => ({
        id: game.id || String(index), // Use game.id if available, otherwise use index for a stable key
        name: game.name,
        provider: game.provider || 'Unknown Provider',
        image: game.image,
        gameId: game.gameID || null, // The new API does not provide a gameId for launching
    });
    
    // Handle if the response is { games: [...] }
    if (responseData && responseData.games && Array.isArray(responseData.games)) {
         return responseData.games.map(mapGame);
    }
    
    // Handle if the response is a direct array [...]
    if(Array.isArray(responseData)) {
        return responseData.map(mapGame);
    }

    throw new Error("Unexpected API response format for game list.");
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const games = await getGameList();
        
        return new Response(JSON.stringify({ games }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Error in get-game-list function:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
