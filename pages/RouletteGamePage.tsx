
import React, { useState, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile, RouletteColor, RouletteBet, RouletteHistoryItem } from '../types';
import { RouletteSpinner } from '../components/roulette/RouletteSpinner';
import { RouletteControls } from '../components/roulette/RouletteControls';
import { RouletteBettingArea } from '../components/roulette/RouletteBettingTable';
import { getNumberColor, getNumberColorClass, ROULETTE_ORDER } from '../lib/rouletteUtils';
import { ProvablyFair } from '../components/roulette/ProvablyFair';
import { useRealtimeRoulette } from '../hooks/useRealtimeRoulette';

interface RouletteGamePageProps {
  onNavigate: (view: 'roulette-info') => void;
  profile: Profile | null;
  session: Session | null;
  onProfileUpdate: () => void;
}

const HistoryBar: React.FC<{ history: RouletteHistoryItem[] }> = ({ history }) => (
    <div className="flex items-center space-x-1.5 overflow-hidden">
        {history.slice(0, 12).map((item, index) => (
            <div key={index} className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${getNumberColorClass(item.winning_number)} border-2 border-background`}>
                {item.winning_number}
            </div>
        ))}
        <button className="h-8 w-8 rounded-full bg-card/50 flex-shrink-0 flex items-center justify-center text-text-muted hover:bg-white/10" aria-label="View history">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5" /></svg>
        </button>
    </div>
);

const RouletteGamePage: React.FC<RouletteGamePageProps> = ({ onNavigate, profile, session, onProfileUpdate }) => {
    const { gameState, countdown, winningNumber, allBets, history, placeBet, error, isLoading } = useRealtimeRoulette(session, onProfileUpdate);
    
    const [betAmount, setBetAmount] = useState(1.00);
    const balance = profile?.balance ?? 0;

    // TODO: Implement provably fair logic with seeds from the backend round data
    const [clientSeed, setClientSeed] = useState('your-random-client-seed');

    const handlePlaceBet = useCallback((color: RouletteColor) => {
        placeBet(betAmount, color);
    }, [placeBet, betAmount]);

    const { redBets, greenBets, blackBets } = useMemo(() => {
        const red: RouletteBet[] = [];
        const green: RouletteBet[] = [];
        const black: RouletteBet[] = [];
        allBets.forEach(bet => {
            if (bet.bet_color === 'red') red.push(bet);
            else if (bet.bet_color === 'green') green.push(bet);
            else black.push(bet);
        });
        return { redBets: red, greenBets: green, blackBets: black };
    }, [allBets]);

    const previousWinningNumber = history[0]?.winning_number ?? ROULETTE_ORDER[0];

    return (
        <div className="flex flex-col flex-1 w-full max-w-[1600px] mx-auto px-4 py-6">
            <RouletteSpinner
                gameState={gameState}
                winningNumber={winningNumber}
                previousWinningNumber={previousWinningNumber}
                countdown={countdown}
            />

            <div className="my-4 flex justify-between items-center">
                <div className="text-white font-semibold">Balance: ${balance.toFixed(2)}</div>
                <HistoryBar history={history} />
            </div>
            
            <ProvablyFair 
                clientSeed={clientSeed}
                setClientSeed={setClientSeed}
                serverSeed={null} // TODO: Get revealed seed from backend
                nonce={1} // TODO: Get nonce from backend
                lastWinningNumber={history[0]?.winning_number}
            />

            {error && <div className="text-center text-red-500 bg-red-500/10 p-2 rounded-md mb-4 animate-pulse">{error}</div>}

            <div className="space-y-6">
                <RouletteControls 
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    balance={balance}
                    gameState={gameState}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RouletteBettingArea 
                        color="red"
                        title="Red"
                        payout="2x"
                        bets={redBets}
                        onPlaceBet={() => handlePlaceBet('red')}
                        disabled={gameState !== 'betting' || betAmount > balance || betAmount <= 0}
                        isWinner={winningNumber !== null && getNumberColor(winningNumber) === 'red'}
                        isEnded={gameState === 'ended'}
                        profile={profile}
                    />
                     <RouletteBettingArea 
                        color="green"
                        title="Green"
                        payout="14x"
                        bets={greenBets}
                        onPlaceBet={() => handlePlaceBet('green')}
                        disabled={gameState !== 'betting' || betAmount > balance || betAmount <= 0}
                        isWinner={winningNumber !== null && getNumberColor(winningNumber) === 'green'}
                        isEnded={gameState === 'ended'}
                        profile={profile}
                    />
                     <RouletteBettingArea 
                        color="black"
                        title="Black"
                        payout="2x"
                        bets={blackBets}
                        onPlaceBet={() => handlePlaceBet('black')}
                        disabled={gameState !== 'betting' || betAmount > balance || betAmount <= 0}
                        isWinner={winningNumber !== null && getNumberColor(winningNumber) === 'black'}
                        isEnded={gameState === 'ended'}
                        profile={profile}
                    />
                </div>
            </div>
        </div>
    );
};

export default RouletteGamePage;
