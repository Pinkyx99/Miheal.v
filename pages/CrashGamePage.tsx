



import React, { useState, useEffect, useCallback, useRef, createContext, useMemo } from 'react';
import { PlayerBets } from '../components/crash/PlayerBets';
import { BettingHistory } from '../components/crash/BettingHistory';
import { GameDisplay } from '../components/crash/GameDisplay';
import { BettingControls } from '../components/crash/BettingControls';
import { MyBets } from '../components/crash/MyBets';
import { Profile, CrashBet, CashoutEvent, GameState } from '../types';
import { Session } from '@supabase/supabase-js';
import { ProvablyFairModal } from '../components/crash/ProvablyFairModal';
import { useRealtimeCrash } from '../hooks/useRealtimeCrash';
import { CrashIcon } from '../components/icons';

interface CrashGamePageProps {
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}

export const MultiplierContext = createContext(1.00);

const CrashGamePage: React.FC<CrashGamePageProps> = ({ profile, session, onProfileUpdate }) => {
    // const {
    //     gameState,
    //     multiplier,
    //     countdown,
    //     allBets,
    //     myBets,
    //     history,
    //     placeBet,
    //     cashout,
    // } = useRealtimeCrash(session, onProfileUpdate);
    
    // [TEMPORARY] Mock data for maintenance screen
    // FIX: Replaced mock data declarations with useMemo to prevent TypeScript from over-narrowing the type of `gameState`, which caused comparison errors.
    const {
        gameState,
        multiplier,
        countdown,
        allBets,
        myBets,
        history,
        placeBet,
        cashout,
    } = useMemo(() => ({
        gameState: 'connecting' as GameState,
        multiplier: 1.00,
        countdown: 0,
        allBets: [] as CrashBet[],
        myBets: [] as CrashBet[],
        history: [] as any[],
        placeBet: async () => ({ success: false, message: 'Game is under maintenance.' }),
        cashout: async () => ({ success: false, message: 'Game is under maintenance.' }),
    }), []);

    const [cashoutEvents, setCashoutEvents] = useState<CashoutEvent[]>([]);
    const [isFairnessModalOpen, setIsFairnessModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingBetId, setLoadingBetId] = useState<string | null>(null);
    const [pendingCashoutIds, setPendingCashoutIds] = useState<Set<string>>(new Set());
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const prevAllBetsRef = useRef<CrashBet[]>([]);

    // Effect for detecting new cashout events to display on the graph
    useEffect(() => {
        const previousBets = prevAllBetsRef.current;
        const newCashouts: CashoutEvent[] = [];

        allBets.forEach(currentBet => {
            const prevBet = previousBets.find(b => b.id === currentBet.id);
            if (currentBet.cashout_multiplier && (!prevBet || !prevBet.cashout_multiplier)) {
                 newCashouts.push({
                    id: currentBet.id,
                    userId: currentBet.user_id,
                    betAmount: currentBet.bet_amount,
                    cashoutMultiplier: currentBet.cashout_multiplier,
                    profit: currentBet.profit ?? 0,
                    username: currentBet.profiles.username,
                    avatarUrl: currentBet.profiles.avatar_url,
                });
            }
        });
        
        if (newCashouts.length > 0) {
            setCashoutEvents(prev => [...prev, ...newCashouts]);
        }
        
        prevAllBetsRef.current = allBets;
    }, [allBets]);
    
    // Effect for resetting state at the start of a new round
    useEffect(() => {
        if (gameState === 'waiting') {
            setCashoutEvents([]);
            setPendingCashoutIds(new Set());
        }
    }, [gameState]);


    useEffect(() => {
        const timer = setTimeout(() => {
            if (gameContainerRef.current) {
                gameContainerRef.current.focus();
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const openFairnessModal = useCallback(() => {
        setIsFairnessModalOpen(true);
    }, []);

    const closeFairnessModal = useCallback(() => {
        setIsFairnessModalOpen(false);
    }, []);

    const handlePlaceBet = useCallback(async (betAmountStr: string, autoCashoutStr: string) => {
        if (myBets.length >= 6) {
            setError("You can place a maximum of 6 bets per round.");
            return;
        }
        // FIX: Called mock placeBet function without arguments to match its definition.
        const result = await placeBet();
        if (!result.success) {
            setError(result.message);
        }
    }, [placeBet, myBets.length]);

    const handleCashout = useCallback(async (betId: string) => {
        setPendingCashoutIds(prev => new Set(prev).add(betId));
        setLoadingBetId(betId);
        // FIX: Called mock cashout function without arguments to match its definition.
        const result = await cashout();
        if (!result.success) {
            setError(result.message);
        }
        setTimeout(() => setLoadingBetId(null), 200);
    }, [cashout]);

    // Effect for auto-cashouts
    useEffect(() => {
        if (gameState !== 'running') return;
        myBets.forEach(bet => {
            if (!bet.cashout_multiplier && !pendingCashoutIds.has(bet.id) && bet.auto_cashout_at && multiplier >= bet.auto_cashout_at) {
                handleCashout(bet.id);
            }
        });
    }, [gameState, multiplier, myBets, handleCashout, pendingCashoutIds]);


    return (
        <div className="flex flex-col flex-1">
             {/* [TEMPORARY] Maintenance screen */}
             <div className="flex flex-col items-center justify-center h-full text-center text-text-muted p-8">
                <CrashIcon className="w-24 h-24 text-primary animate-pulse-glow" />
                <h1 className="mt-8 text-4xl font-bold text-white">Repairing...</h1>
                <p className="mt-2 max-w-md">The Crash game is currently undergoing maintenance to improve your experience. Please check back later.</p>
            </div>
        </div>
    );
};

export default CrashGamePage;