
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

interface CrashGamePageProps {
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
    onGameRoundCompleted: () => void;
}

export const MultiplierContext = createContext(1.00);

const CrashGamePage: React.FC<CrashGamePageProps> = ({ profile, session, onProfileUpdate, onGameRoundCompleted }) => {
    const {
        gameState,
        multiplier,
        countdown,
        allBets,
        myBets,
        history,
        placeBet,
        cashout,
    } = useRealtimeCrash(session, onProfileUpdate);

    const [cashoutEvents, setCashoutEvents] = useState<CashoutEvent[]>([]);
    const [isFairnessModalOpen, setIsFairnessModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingBetId, setLoadingBetId] = useState<string | null>(null);
    const [pendingCashoutIds, setPendingCashoutIds] = useState<Set<string>>(new Set());
    const [isPlacingBet, setIsPlacingBet] = useState(false);
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
        setIsPlacingBet(true);
        const result = await placeBet(betAmountStr, autoCashoutStr);
        if (result.success) {
            onGameRoundCompleted();
        } else {
            setError(result.message);
        }
        setIsPlacingBet(false);
    }, [placeBet, myBets.length, onGameRoundCompleted]);

    const handleCashout = useCallback(async (betId: string) => {
        setPendingCashoutIds(prev => new Set(prev).add(betId));
        setLoadingBetId(betId);
        const result = await cashout(betId, multiplier);
        if (!result.success) {
            setError(result.message);
        }
        setTimeout(() => setLoadingBetId(null), 200);
    }, [cashout, multiplier]);

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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 flex-1">
                <div className="flex flex-col">
                    <BettingHistory history={history} />
                    <div className="flex-1 flex flex-col">
                        <GameDisplay
                            gameState={gameState}
                            countdown={countdown}
                            multiplier={multiplier}
                            cashoutEvents={cashoutEvents}
                        />
                        <MultiplierContext.Provider value={multiplier}>
                            <BettingControls
                                profile={profile}
                                session={session}
                                userBets={myBets}
                                onPlaceBet={handlePlaceBet}
                                gameState={gameState}
                                loading={isPlacingBet}
                                error={error}
                            />
                            <MyBets
                                bets={myBets}
                                onCashout={handleCashout}
                                loadingBetId={loadingBetId}
                                gameState={gameState}
                            />
                        </MultiplierContext.Provider>
                    </div>
                </div>
                <PlayerBets bets={allBets} onOpenFairnessModal={openFairnessModal} />
            </div>
            <ProvablyFairModal show={isFairnessModalOpen} onClose={closeFairnessModal} />
        </div>
    );
};

export default CrashGamePage;