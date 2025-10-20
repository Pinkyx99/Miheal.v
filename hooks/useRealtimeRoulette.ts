import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RouletteRound, RouletteBet, RouletteGameState, RouletteHistoryItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { getNumberColor } from '../lib/rouletteUtils';

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

    useEffect(() => {
        const gameTicker = setInterval(async () => {
            const { error } = await supabase.rpc('roulette_game_tick');
            if (error) console.error('Error ticking roulette game state:', error.message);
        }, 2000);
        return () => clearInterval(gameTicker);
    }, []);
    
    const fetchInitialData = useCallback(async () => {
        const { data: roundData } = await supabase.from('roulette_rounds').select('*').order('created_at', { ascending: false }).limit(1).single();
        if (roundData) {
            setRound(roundData);
            const { data: betsData } = await supabase.from('roulette_bets').select(`*, profiles(username, avatar_url)`).eq('round_id', roundData.id);
            if (betsData) setAllBets(betsData as any);
        }
        const { data: historyData } = await supabase.from('roulette_rounds').select('winning_number').not('winning_number', 'is', null).order('created_at', { ascending: false }).limit(20);
        if (historyData) setHistory(historyData.map(d => ({ winning_number: d.winning_number! })));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchInitialData();

        const handleRoundUpdate = (payload: any) => {
            const newRound = payload.new as RouletteRound;
            setRound(prevRound => {
                if (prevRound && newRound.id !== prevRound.id) {
                    setAllBets([]);
                }
                if (newRound.status === 'ended' && newRound.winning_number !== null && prevRound?.status !== 'ended') {
                    setHistory(h => [{ winning_number: newRound.winning_number! }, ...h].slice(0, 50));
                    onProfileUpdate();
                    supabase.from('roulette_bets').select(`*, profiles(username, avatar_url)`).eq('round_id', newRound.id).then(({ data }) => {
                        if (data) setAllBets(data as any);
                    });
                }
                return newRound;
            });
        };
        
        const roundChannel = supabase.channel('roulette-rounds-live').on<RouletteRound>('postgres_changes', { event: '*', schema: 'public', table: 'roulette_rounds' }, handleRoundUpdate).subscribe();
        return () => { supabase.removeChannel(roundChannel); };
    }, [fetchInitialData, onProfileUpdate]);
    
    useEffect(() => {
        if (!round) return;

        const handleBetChange = async (payload: any) => {
            const changedBet = payload.new || payload.old;
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const { data: profileData } = await supabase.from('profiles').select('username, avatar_url').eq('id', changedBet.user_id).single();
                if (profileData) {
                    const betWithProfile = { ...changedBet, profiles: profileData };
                    setAllBets(prev => {
                        const existingIndex = prev.findIndex(b => b.id === betWithProfile.id);
                        if (existingIndex > -1) {
                            const newBets = [...prev];
                            newBets[existingIndex] = betWithProfile;
                            return newBets;
                        }
                        return [...prev, betWithProfile];
                    });
                }
            } else if (payload.eventType === 'DELETE') {
                 setAllBets(prev => prev.filter(b => b.id !== changedBet.id));
            }
        };

        const betsChannel = supabase.channel(`roulette-bets-${round.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'roulette_bets', filter: `round_id=eq.${round.id}`}, handleBetChange).subscribe();
        return () => { supabase.removeChannel(betsChannel) };
    }, [round?.id]);

    useEffect(() => {
        let iv: number | null = null;
        const tick = () => {
            if (!round) { setCountdown(0); return; }
            const now = Date.now();
            let endTime: number;
            switch(round.status) {
                case 'betting': endTime = new Date(round.created_at).getTime() + BETTING_TIME_MS; break;
                case 'spinning': endTime = round.spun_at ? new Date(round.spun_at).getTime() + SPINNING_TIME_MS : now; break;
                case 'ended': endTime = round.ended_at ? new Date(round.ended_at).getTime() + ENDED_TIME_MS : now; break;
                default: endTime = now;
            }
            setCountdown(Math.max(0, (endTime - now) / 1000));
        };
        tick();
        iv = window.setInterval(tick, 50);
        return () => { if (iv) clearInterval(iv); };
    }, [round]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const placeBet = useCallback(async (betAmount: number, betType: string) => {
        if (!session?.user) return setError('Please sign in to place a bet.');
        if (!round || round.status !== 'betting') return setError('Betting is currently closed.');

        const { data: rpcData, error: rpcError } = await supabase.rpc('place_roulette_bet', {
            round_id: round.id,
            bet_amount: betAmount,
            bet_type: betType
        });
        
        onProfileUpdate();
        if (rpcError || (rpcData && !rpcData.success)) {
            const message = rpcError?.message || rpcData?.message || 'Bet failed';
            setError(message);
        }
    }, [session, round, onProfileUpdate]);

    const undoLastBet = useCallback(async () => {
        if (!session?.user || !round || round.status !== 'betting') return;
        const { error: rpcError } = await supabase.rpc('undo_last_roulette_bet', { round_id: round.id });
        onProfileUpdate();
        if (rpcError) setError(rpcError.message);
    }, [session, round, onProfileUpdate]);

    const clearBets = useCallback(async () => {
        if (!session?.user || !round || round.status !== 'betting') return;
        const { error: rpcError } = await supabase.rpc('clear_roulette_bets', { round_id: round.id });
        onProfileUpdate();
        if (rpcError) setError(rpcError.message);
    }, [session, round, onProfileUpdate]);

    return { round, gameState, countdown, winningNumber, allBets, history, placeBet, undoLastBet, clearBets, error, isLoading };
};