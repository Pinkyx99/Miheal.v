import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';
import { CrashRound, CrashBet, CrashHistoryItem, GameState } from '../types';
import { Session } from '@supabase/supabase-js';

const GROWTH_CONSTANT_K = 0.07;
const WAITING_TIME_MS = 7000;
const CRASHED_STATE_HOLD_MS = 3000; // How long to visually show the "crashed" state

export const useRealtimeCrash = (session: Session | null, onProfileUpdate: () => void) => {
    const [currentRound, setCurrentRound] = useState<CrashRound | null>(null);
    const [allBets, setAllBets] = useState<CrashBet[]>([]);
    const [myBets, setMyBets] = useState<CrashBet[]>([]);
    const [history, setHistory] = useState<CrashHistoryItem[]>([]);
    const [gameState, setGameState] = useState<GameState>('connecting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [countdown, setCountdown] = useState(WAITING_TIME_MS / 1000);
    
    const animationFrameId = useRef<number | null>(null);
    const roundStateTimer = useRef<number | null>(null);
    const previousRoundId = useRef<string | null>(null);

    // This effect acts as the game loop trigger. In a production environment,
    // this would be a server-side cron job. For this demo, the client
    // will periodically call the game_tick function to advance the state.
    useEffect(() => {
        const gameTicker = setInterval(async () => {
            try {
                const headers: HeadersInit = {
                    'apikey': supabaseAnonKey,
                };

                const response = await fetch(`${supabaseUrl}/functions/v1/crash-tick`, {
                    method: 'POST',
                    headers: headers,
                    body: null, // Sending null body instead of empty JSON
                });
    
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Failed to tick game state');
                }
    
            } catch (error: any) {
                console.error('Error ticking crash game state:', error.message);
            }
        }, 2000); // Call every 2 seconds to advance the game state.

        // Cleanup on component unmount
        return () => clearInterval(gameTicker);
    }, []); // This effect runs only once when the hook is mounted.

    // Fetch initial history
    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('crash_rounds')
                .select('crash_point')
                .not('crash_point', 'is', null)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) console.error("Error fetching history:", error);
            else if (data) {
                setHistory(data.map(d => ({ multiplier: d.crash_point! })));
            }
        };
        fetchHistory();
    }, []);

    // Main subscription and game logic effect
    useEffect(() => {
        const processRoundUpdate = (newRound: CrashRound) => {
             // --- CRITICAL: New Round Detection & State Reset ---
             if (newRound.id !== previousRoundId.current) {
                if (roundStateTimer.current) clearTimeout(roundStateTimer.current);
                
                // Unconditionally reset all round-specific state
                setAllBets([]);
                setMyBets([]);
                setMultiplier(1.00);
                
                previousRoundId.current = newRound.id;
             }

            setCurrentRound(newRound);

            // The server is the source of truth for the game's state.
            // The client just follows what the server says.
            switch(newRound.status) {
                case 'waiting':
                    setGameState('waiting');
                    break;
                case 'running':
                    setGameState('running');
                    break;
                case 'crashed':
                    if (newRound.crash_point) {
                        setGameState('crashed');
                        setMultiplier(newRound.crash_point);
                        
                        // Update history only once when the round crashes
                        setHistory(prevHist => {
                            if (prevHist.length > 0 && prevHist[0].multiplier === newRound.crash_point) {
                                return prevHist;
                            }
                            return [{ multiplier: newRound.crash_point! }, ...prevHist].slice(0, 20);
                        });

                        // Add a cosmetic delay before showing "resetting" so users see the crash point
                        roundStateTimer.current = window.setTimeout(() => {
                           setGameState('resetting');
                        }, CRASHED_STATE_HOLD_MS);
                    }
                    break;
            }
        };

        const handleRoundUpdate = (payload: any) => {
            const newRound = payload.new as CrashRound;
            processRoundUpdate(newRound);
        };

        const roundChannel = supabase
            .channel('crash-rounds')
            .on<CrashRound>('postgres_changes', { event: '*', schema: 'public', table: 'crash_rounds' }, handleRoundUpdate)
            .subscribe();

        const initializeGame = async () => {
             const { data, error } = await supabase
                .from('crash_rounds')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 is "exact one row not found", which is fine
                console.error("Error fetching initial round:", error);
                setGameState('connecting');
                return;
            }
            
            if (data) {
                processRoundUpdate(data as CrashRound);
            }
        };

        initializeGame();

        return () => {
            supabase.removeChannel(roundChannel);
            if (roundStateTimer.current) clearTimeout(roundStateTimer.current);
        };
    }, []);


    // Bets subscription effect
    useEffect(() => {
        if (!currentRound) return;

        const betsChannel = supabase
             .channel(`crash-bets-${currentRound.id}`)
             .on('postgres_changes', { event: '*', schema: 'public', table: 'crash_bets', filter: `round_id=eq.${currentRound.id}` },
                async (payload) => {
                    const newBet = payload.new as CrashBet;
                     const { data, error } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', newBet.user_id)
                        .single();
                    
                    if (error) return;

                    const newBetWithProfile = { ...newBet, profiles: data };

                    setAllBets(prev => {
                        const existingIndex = prev.findIndex(b => b.id === newBetWithProfile.id);
                        if (existingIndex > -1) {
                            const newBets = [...prev];
                            newBets[existingIndex] = newBetWithProfile;
                            return newBets;
                        }
                        return [...prev, newBetWithProfile];
                    });
                }
            )
            .subscribe();
        
        const fetchInitialBets = async () => {
            const { data, error } = await supabase.from('crash_bets').select(`*, profiles(username, avatar_url)`).eq('round_id', currentRound.id);
            if (error) console.error("Error fetching initial bets", error);
            else if (data) setAllBets(data as any[] as CrashBet[]);
        }
        fetchInitialBets();
        
        return () => {
            supabase.removeChannel(betsChannel);
        };
    }, [currentRound?.id]);

    // Derive user's bets from all bets
    useEffect(() => {
        if (session?.user) {
            setMyBets(allBets.filter(b => b.user_id === session.user.id));
        } else {
            setMyBets([]);
        }
    }, [allBets, session]);

    // Client-side animation loop for countdowns and multiplier growth
    useEffect(() => {
        const gameLoop = () => {
            if (!currentRound) {
                animationFrameId.current = requestAnimationFrame(gameLoop);
                return;
            };

            switch(gameState) {
                case 'waiting':
                    const createdAt = new Date(currentRound.created_at);
                    if (isNaN(createdAt.getTime())) {
                        console.error("Invalid created_at date for round:", currentRound);
                        setCountdown(7.0); // Default to 7s on error
                    } else {
                        const elapsed = Date.now() - createdAt.getTime();
                        setCountdown(Math.max(0, (WAITING_TIME_MS - elapsed) / 1000));
                    }
                    break;
                case 'running':
                    if (currentRound.started_at) {
                        const startedAt = new Date(currentRound.started_at);
                         if (!isNaN(startedAt.getTime())) {
                            const elapsedMs = Date.now() - startedAt.getTime();
                            const currentMultiplier = Math.exp(GROWTH_CONSTANT_K * (elapsedMs / 1000));
                            // Cap client-side multiplier just in case of desync
                            const crashPoint = currentRound.crash_point || Infinity;
                            setMultiplier(Math.min(currentMultiplier, crashPoint));
                         }
                    }
                    break;
            }
            animationFrameId.current = requestAnimationFrame(gameLoop);
        };
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        }
    }, [currentRound, gameState]);

    const placeBet = useCallback(async (betAmountStr: string, autoCashoutStr: string) => {
        if (!session || !currentRound || currentRound.status !== 'waiting') {
            return { success: false, message: 'Betting is currently closed.'};
        }
        const bet_amount = parseFloat(betAmountStr);
        const auto_cashout_at = parseFloat(autoCashoutStr) || null;

        if (isNaN(bet_amount) || bet_amount <= 0) return { success: false, message: 'Invalid bet amount.' };
        
        const { data, error } = await supabase.rpc('place_crash_bet', {
            round_id_in: currentRound.id, bet_amount_in: bet_amount, auto_cashout_at_in: auto_cashout_at
        });
        
        if (error || (data && !data.success)) {
             onProfileUpdate();
             return { success: false, message: error?.message || data?.message || "Failed to place bet." };
        }
        
        if (session) {
            const { error: rpcError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (rpcError) {
                // This is a non-critical error, so we just log it and don't block the user.
                console.error("Error incrementing games_played for Crash:", rpcError.message);
            }
        }
        
        onProfileUpdate();
        
        return { success: true };
    }, [session, currentRound, onProfileUpdate]);
    
    const cashout = useCallback(async (betId: string, cashoutMultiplier: number) => {
        if (!session) return { success: false, message: 'Not logged in' };
        
        const { data, error } = await supabase.rpc('cashout_crash_bet', {
            bet_id_in: betId, cashout_multiplier_in: cashoutMultiplier
        });
        
        onProfileUpdate(); // Update balance immediately after cashout attempt
        
        if (error) return { success: false, message: error.message };
        if (data.success === false) return { success: false, message: data.message };
        
        return { success: true };
    }, [session, onProfileUpdate]);

    return { gameState, multiplier, countdown, currentRound, allBets, myBets, history, placeBet, cashout };
};