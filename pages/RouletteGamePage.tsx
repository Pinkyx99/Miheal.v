import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile, RouletteBet, RouletteHistoryItem } from '../types';
import { RouletteSpinner } from '../components/roulette/RouletteSpinner';
import { RouletteControls } from '../components/roulette/RouletteControls';
import { RouletteBettingTable } from '../components/roulette/RouletteBettingTable';
import { getNumberColorClass, ROULETTE_ORDER } from '../lib/rouletteUtils';
import { ProvablyFair } from '../components/roulette/ProvablyFair';
import { useRealtimeRoulette } from '../hooks/useRealtimeRoulette';
import { soundManager, SOUNDS } from '../lib/sound';
import usePrevious from '../hooks/usePrevious';

interface RouletteGamePageProps {
  onNavigate: (view: 'roulette-info') => void;
  profile: Profile | null;
  session: Session | null;
  onProfileUpdate: () => void;
  onGameRoundCompleted: () => void;
}

const HistoryBar: React.FC<{ history: RouletteHistoryItem[] }> = ({ history }) => (
    <div className="flex items-center space-x-1.5 overflow-hidden">
        {history.slice(0, 15).map((item, index) => (
            <div key={index} className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${getNumberColorClass(item.winning_number)} border-2 border-background`}>
                {item.winning_number}
            </div>
        ))}
        <button className="h-8 w-8 rounded-full bg-card/50 flex-shrink-0 flex items-center justify-center text-text-muted hover:bg-white/10" aria-label="View history">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5" /></svg>
        </button>
    </div>
);

const RouletteGamePage: React.FC<RouletteGamePageProps> = ({ onNavigate, profile, session, onProfileUpdate, onGameRoundCompleted }) => {
    const { round, gameState, countdown, winningNumber, allBets, history, placeBet, undoLastBet, clearBets, error } = useRealtimeRoulette(session, onProfileUpdate);
    
    const [selectedChip, setSelectedChip] = useState(1.00);
    const balance = profile?.balance ?? 0;
    const [clientSeed, setClientSeed] = useState('your-random-client-seed');
    const betPlacedThisRound = useRef(false);
    const prevGameState = usePrevious(gameState);

    useEffect(() => {
        if (prevGameState === 'betting' && gameState === 'spinning') {
            soundManager.play(SOUNDS.ROULETTE_SPIN, { volume: 0.4 });
        }
        if (prevGameState === 'spinning' && gameState === 'ended') {
            soundManager.play(SOUNDS.ROULETTE_LAND, { volume: 0.6 });
        }
    }, [gameState, prevGameState]);

    useEffect(() => {
        if (gameState === 'betting') {
            betPlacedThisRound.current = false;
        }
    }, [gameState]);


    const handlePlaceBet = useCallback((betType: string) => {
        if (gameState !== 'betting') return;
        soundManager.play(SOUNDS.CHIP_PLACE);
        placeBet(selectedChip, betType);
        if (!betPlacedThisRound.current) {
            onGameRoundCompleted();
            betPlacedThisRound.current = true;
        }
    }, [placeBet, selectedChip, gameState, onGameRoundCompleted]);
    
    const previousWinningNumber = history[0]?.winning_number ?? ROULETTE_ORDER[0];

    const myBets = useMemo(() => allBets.filter(b => b.user_id === session?.user?.id), [allBets, session]);

    const myBetsByType = useMemo(() => {
        return myBets.reduce<Record<string, { total: number }>>((acc, bet) => {
            if (!acc[bet.bet_type]) {
                acc[bet.bet_type] = { total: 0 };
            }
            acc[bet.bet_type].total += bet.bet_amount;
            return acc;
        }, {});
    }, [myBets]);

    const totalBetsByType = useMemo(() => {
        return allBets.reduce<Record<string, { total: number, players: RouletteBet[] }>>((acc, bet) => {
            if (!acc[bet.bet_type]) {
                acc[bet.bet_type] = { total: 0, players: [] };
            }
            acc[bet.bet_type].total += bet.bet_amount;
            acc[bet.bet_type].players.push(bet);
            return acc;
        }, {});
    }, [allBets]);

    return (
        <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto px-4 py-6">
            <RouletteSpinner
                gameState={gameState}
                winningNumber={winningNumber}
                previousWinningNumber={previousWinningNumber}
                countdown={countdown}
            />

            <div className="my-4 flex justify-between items-center">
                <HistoryBar history={history} />
            </div>
            
            {error && <div className="text-center text-red-500 bg-red-500/10 p-2 rounded-md mb-4 animate-pulse">{error}</div>}

            <div className="space-y-6">
                <RouletteBettingTable 
                    onBet={handlePlaceBet}
                    totalBetsByType={totalBetsByType}
                    myBetsByType={myBetsByType}
                    disabled={gameState !== 'betting'}
                    winningNumber={gameState === 'ended' ? winningNumber : null}
                    selectedChip={selectedChip}
                />
                <RouletteControls 
                    selectedChip={selectedChip}
                    setSelectedChip={setSelectedChip}
                    onUndo={undoLastBet}
                    onClear={clearBets}
                    myBetsCount={myBets.length}
                    disabled={gameState !== 'betting'}
                />
            </div>
             <ProvablyFair 
                clientSeed={clientSeed}
                setClientSeed={setClientSeed}
                serverSeed={round?.server_seed ?? null} 
                nonce={1} // TODO: Implement nonce tracking
                lastWinningNumber={history[0]?.winning_number}
            />
        </div>
    );
};

export default RouletteGamePage;