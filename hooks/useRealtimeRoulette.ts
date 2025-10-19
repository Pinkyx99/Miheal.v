import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RouletteRound, RouletteBet, RouletteColor, RouletteGameState, RouletteHistoryItem } from '../types';
import { Session } from '@supabase/supabase-js';

const BETTING_TIME_MS = 15000;
const SPINNING_TIME_MS = 5000;
const ENDED_TIME_MS = 5000;

export const useRealtimeRoulette = (session: Session | null, onProfileUpdate: () => void) => {
    const [round, setRound] = useState<RouletteRound | null>(null);
    const [allBets, setAllBets] = useState<RouletteBet[]>([]);
    const [history, setHistory] = useState<RouletteHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const gameState: RouletteGameState | null = round?.status || null;
    const winningNumber = round?.winning_number ?? null;

    // This effect acts as the game loop trigger, replacing the need for a server-side cron job.
    useEffect(() => {
        const gameTicker = setInterval(async () => {
            const { error } = await supabase.rpc('roulette_game_tick');
            if (error) {
                // Silently log the error, as the game should recover.
                console.error('Error ticking roulette game state:', error.message);
            }
        }, 2000); // Call every 2 seconds to advance the game state.

        return () => clearInterval(gameTicker);
    }, []); // This effect runs only once when the hook is mounted.
    
    const fetchInitialData = useCallback(async () => {
        let isMounted = true;
        
        const { data: roundData, error: roundError } = await supabase
            .from('roulette_rounds').select('*').order('created_at', { ascending: false }).limit(1).single();
            
        if (!isMounted) return;

        if (roundData) {
            setRound(roundData);
            const { data: betsData } = await supabase.from('roulette_bets').select(`*, profiles(username, avatar_url)`).eq('round_id', roundData.id);
            if (isMounted && betsData) setAllBets(betsData as any);
        }

        const { data: historyData } = await supabase
            .from('roulette_rounds').select('winning_number').not('winning_number', 'is', null)
            .order('created_at', { ascending: false }).limit(20);
        if (isMounted && historyData) setHistory(historyData.map(d => ({ winning_number: d.winning_number! })));

        setIsLoading(false);
        
        return () => { isMounted = false; };
    }, []);

    // Main real-time subscription effect
    useEffect(() => {
        fetchInitialData();

        const handleNewRound = (payload: any) => {
            const newRound = payload.new as RouletteRound;
             setRound(prevRound => {
                if (prevRound && newRound.id !== prevRound.id) {
                    setAllBets([]); // Clear bets for the new round
                }
                if (newRound.status === 'ended' && newRound.winning_number !== null && prevRound?.status !== 'ended') {
                     setHistory(h => [{ winning_number: newRound.winning_number! }, ...h].slice(0, 50));
                     onProfileUpdate(); // Re-fetch profile to get updated balance after payouts
                     // Re-fetch all bets for the completed round to get final profit numbers
                     supabase.from('roulette_bets').select(`*, profiles(username, avatar_url)`).eq('round_id', newRound.id)
                        .then(({ data }) => {
                            if (data) setAllBets(data as any);
                        });
                }
                return newRound;
             });
        };
        
        const roundChannel = supabase
            .channel('roulette-rounds-live')
            .on<RouletteRound>('postgres_changes', { event: '*', schema: 'public', table: 'roulette_rounds' }, handleNewRound)
            .subscribe();

        return () => {
            supabase.removeChannel(roundChannel);
        };
    }, [fetchInitialData, onProfileUpdate]);
    
    // Bets subscription - separate channel to handle just bets for the current round
    useEffect(() => {
        if (!round || round.status !== 'betting') return;

        const handleNewBet = async (payload: any) => {
            const newBet = payload.new as any;
            const { data: profileData, error } = await supabase.from('profiles').select('username, avatar_url').eq('id', newBet.user_id).single();
            if (error) return;

            setAllBets(prev => {
                const existingIndex = prev.findIndex(b => b.user_id === newBet.user_id && b.bet_color === newBet.bet_color);
                if (existingIndex > -1) {
                    const updatedBets = [...prev];
                    updatedBets[existingIndex] = { ...updatedBets[existingIndex], ...newBet, profiles: profileData || updatedBets[existingIndex].profiles };
                    return updatedBets;
                }
                return [...prev, { ...newBet, profiles: profileData }];
            });
        };

        const betsChannel = supabase
            .channel(`roulette-bets-${round.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'roulette_bets', filter: `round_id=eq.${round.id}`}, handleNewBet)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'roulette_bets', filter: `round_id=eq.${round.id}`}, handleNewBet)
            .subscribe();

        return () => { supabase.removeChannel(betsChannel) };
    }, [round?.id, round?.status]);


    // Countdown timer effect
    useEffect(() => {
        let iv: number | null = null;
        const tick = () => {
            if (!round) { setCountdown(0); return; }
            const now = Date.now();
            let endTime: number;

            switch(round.status) {
                case 'betting':
                    endTime = new Date(round.created_at).getTime() + BETTING_TIME_MS;
                    break;
                case 'spinning':
                    endTime = round.spun_at ? new Date(round.spun_at).getTime() + SPINNING_TIME_MS : now;
                    break;
                case 'ended':
                    endTime = round.ended_at ? new Date(round.ended_at).getTime() + ENDED_TIME_MS : now;
                    break;
                default:
                    endTime = now;
            }
             setCountdown(Math.max(0, (endTime - now) / 1000));
        };
        tick();
        iv = window.setInterval(tick, 50);
        return () => { if (iv) clearInterval(iv); };
    }, [round]);

    // Error message timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const placeBet = useCallback(async (betAmount: number, betColor: RouletteColor) => {
        if (!session?.user) {
            setError('Please sign in to place a bet.');
            return;
        }
        if (!round || round.status !== 'betting') {
            setError('Betting is currently closed.');
            return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('place_roulette_bet', {
            round_id_in: round.id,
            bet_amount_in: betAmount,
            bet_color_in: betColor
        });
        
        if (rpcError || (rpcData && !rpcData.success)) {
            onProfileUpdate();
            const message = rpcError?.message || rpcData?.message || 'Bet failed';
            console.error('Place bet RPC error', message);
            setError(message);
            return;
        }
        
        if (session) {
             // Fetch the user's current wagered amount for a safer update
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('wagered')
                .eq('id', session.user.id)
                .single();
            
            if (profileError) {
                console.error("Could not fetch profile to update stats:", profileError.message);
            } else {
                const newWagered = (profileData.wagered || 0) + betAmount;
                // Update wagered amount
                await supabase.from('profiles').update({ wagered: newWagered }).eq('id', session.user.id);
            }

            // Increment games played
            const { error: gamesPlayedError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (gamesPlayedError) {
                console.error("Error incrementing games_played for Roulette:", gamesPlayedError.message);
            }
        }

        onProfileUpdate();
        
    }, [session, round, onProfileUpdate]);

    return { gameState, countdown, winningNumber, allBets, history, placeBet, error, isLoading };
};