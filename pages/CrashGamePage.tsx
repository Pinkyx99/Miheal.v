
import React, { useState, useCallback, useEffect, createContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile, CashoutEvent } from '../types';
import { useRealtimeCrash } from '../hooks/useRealtimeCrash';
import { BettingHistory } from '../components/crash/BettingHistory';
import { GameDisplay } from '../components/crash/GameDisplay';
import { BettingControls } from '../components/crash/BettingControls';
import { PlayerBets } from '../components/crash/PlayerBets';
import { MyBets } from '../components/crash/MyBets';
import { ProvablyFairModal } from '../components/crash/ProvablyFairModal';
import { soundManager, SOUNDS } from '../lib/sound';
import usePrevious from '../hooks/usePrevious';

// FIX: Create and export the context to solve the import error in MyBets.tsx
export const MultiplierContext = createContext<number>(1.00);

// Based on other game pages, these props are expected
interface CrashGamePageProps {
  profile: Profile | null;
  session: Session | null;
  onProfileUpdate: () => void;
  onGameRoundCompleted: () => void;
}

const CrashGamePage: React.FC<CrashGamePageProps> = ({ profile, session, onProfileUpdate, onGameRoundCompleted }) => {
    const { gameState, multiplier, countdown, allBets, myBets, history, placeBet, cashout } = useRealtimeCrash(session, onProfileUpdate);
    const [betLoading, setBetLoading] = useState(false);
    const [cashoutLoadingId, setCashoutLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFairnessModalOpen, setIsFairnessModalOpen] = useState(false);
    const [cashoutEvents, setCashoutEvents] = useState<CashoutEvent[]>([]);
    
    const betPlacedThisRound = React.useRef(false);
    const prevGameState = usePrevious(gameState);

    useEffect(() => {
        if (prevGameState !== 'running' && gameState === 'running') {
            soundManager.playLoop(SOUNDS.CRASH_TICK);
        } else if (gameState !== 'running') {
            soundManager.stopLoop(SOUNDS.CRASH_TICK);
        }

        if (prevGameState === 'running' && gameState === 'crashed') {
            soundManager.play(SOUNDS.CRASH_EXPLODE, { volume: 0.4 });
        }
        
        // Cleanup on unmount
        return () => {
            soundManager.stopAllLoops();
        }
    }, [gameState, prevGameState]);


    useEffect(() => {
        if (gameState === 'waiting') {
            betPlacedThisRound.current = false;
        } else if (gameState === 'running' && myBets.length > 0 && !betPlacedThisRound.current) {
            onGameRoundCompleted();
            betPlacedThisRound.current = true;
        }
    }, [gameState, myBets, onGameRoundCompleted]);

    const handlePlaceBet = useCallback(async (betAmount: string, autoCashout: string) => {
        setBetLoading(true);
        setError(null);
        soundManager.play(SOUNDS.CHIP_PLACE);
        const result = await placeBet(betAmount, autoCashout);
        if (!result.success) {
            setError(result.message || 'Failed to place bet.');
        }
        setBetLoading(false);
    }, [placeBet]);

    const handleCashout = useCallback(async (betId: string) => {
        setCashoutLoadingId(betId);
        setError(null);
        const result = await cashout(betId, multiplier);
        if (result.success) {
            soundManager.play(SOUNDS.CASHOUT);
        } else {
            setError(result.message || 'Failed to cash out.');
        }
        // Loading state is managed by cashoutLoadingId, it will clear when game state changes or myBets updates
    }, [cashout, multiplier]);

    useEffect(() => {
        // Clear loading state when not running
        if (gameState !== 'running') {
            setCashoutLoadingId(null);
        }
    }, [gameState]);

    useEffect(() => {
        // Clear error after a few seconds
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (gameState === 'waiting') {
            setCashoutEvents([]);
        }
    }, [gameState]);
    
    // This is just a placeholder for cashout events for the graph, as it's not fully implemented.
    const cashedOutBets = allBets.filter(bet => bet.cashout_multiplier !== null);
    useEffect(() => {
      setCashoutEvents(cashedOutBets.map(b => ({
        id: b.id,
        userId: b.user_id,
        betAmount: b.bet_amount,
        cashoutMultiplier: b.cashout_multiplier!,
        profit: b.profit!,
        username: b.profiles.username,
        avatarUrl: b.profiles.avatar_url,
      })))
    }, [cashedOutBets]);

    return (
        <MultiplierContext.Provider value={multiplier}>
            <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto px-4 py-6">
                <ProvablyFairModal show={isFairnessModalOpen} onClose={() => setIsFairnessModalOpen(false)} />
                <BettingHistory history={history} />
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 mt-4">
                    <div className="flex flex-col min-h-0">
                        <GameDisplay 
                            gameState={gameState} 
                            countdown={countdown} 
                            multiplier={multiplier} 
                            cashoutEvents={cashoutEvents} 
                        />
                        <BettingControls
                            profile={profile}
                            session={session}
                            userBets={myBets}
                            onPlaceBet={handlePlaceBet}
                            gameState={gameState}
                            loading={betLoading}
                            error={error}
                        />
                        <MyBets
                            bets={myBets}
                            onCashout={handleCashout}
                            loadingBetId={cashoutLoadingId}
                            gameState={gameState}
                        />
                    </div>
                    <PlayerBets bets={allBets} onOpenFairnessModal={() => setIsFairnessModalOpen(true)} />
                </div>
            </div>
        </MultiplierContext.Provider>
    );
};

export default CrashGamePage;
