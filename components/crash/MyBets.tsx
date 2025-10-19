

import React, { useContext } from 'react';
import { CrashBet, GameState } from '../../types';
import { UsdIcon } from '../icons';
import { MultiplierContext } from '../../pages/CrashGamePage';


interface MyBetsProps {
    bets: CrashBet[];
    onCashout: (betId: string) => void;
    loadingBetId: string | null;
    gameState: GameState;
}

const DynamicBetContent: React.FC<{
    bet: CrashBet;
    onCashout: (betId: string) => void;
    loadingBetId: string | null;
    gameState: GameState;
}> = ({ bet, onCashout, loadingBetId, gameState }) => {
    const currentMultiplier = useContext(MultiplierContext);
    const hasCashedOut = !!bet.cashout_multiplier;
    const potentialProfit = gameState === 'running' ? (bet.bet_amount * currentMultiplier) - bet.bet_amount : 0;
    const profit = bet.profit || 0;
    const isCashoutDisabled = gameState !== 'running' || loadingBetId === bet.id;
    const isLost = (gameState === 'crashed' || gameState === 'resetting') && !hasCashedOut;

    return (
        <>
            <div className="flex flex-col items-center justify-center h-20 mb-2 bg-black/20 rounded-md">
                <span className="text-xs text-text-muted">
                    {hasCashedOut ? 'PROFIT' : isLost ? 'LOSS' : 'POTENTIAL PROFIT'}
                </span>
                <span className={`text-xl font-bold ${hasCashedOut ? 'text-green-400' : isLost ? 'text-red-400' : 'text-white'}`}>
                    {hasCashedOut ? `+$${profit.toFixed(2)}` : isLost ? `-$${bet.bet_amount.toFixed(2)}` : `+$${potentialProfit.toFixed(2)}`}
                </span>
            </div>

            {hasCashedOut ? (
                <button disabled className="w-full py-2 text-xs font-bold text-white rounded-md bg-green-500/50 cursor-not-allowed">Cashed Out</button>
            ) : isLost ? (
                <button disabled className="w-full py-2 text-xs font-bold text-white rounded-md bg-red-500/50 cursor-not-allowed">Lost</button>
            ) : (
                <button
                    onClick={() => onCashout(bet.id)}
                    disabled={isCashoutDisabled}
                    className="w-full py-2 text-sm font-bold text-white rounded-md bg-gradient-to-b from-yellow-500 to-yellow-600 hover:brightness-110 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:brightness-100"
                >
                    {loadingBetId === bet.id ? '...' : `Cashout @ ${currentMultiplier.toFixed(2)}x`}
                </button>
            )}
        </>
    );
};


const BetCard: React.FC<{
    bet: CrashBet;
    onCashout: (betId: string) => void;
    loadingBetId: string | null;
    gameState: GameState;
}> = React.memo(({ bet, onCashout, loadingBetId, gameState }) => {
    const hasCashedOut = !!bet.cashout_multiplier;
    const isLost = (gameState === 'crashed' || gameState === 'resetting') && !hasCashedOut;

    let statusColor = 'bg-[#1A222D] border-[#2A3341]';
    if (hasCashedOut) statusColor = 'bg-green-500/10 border-green-500/30';
    if (isLost) statusColor = 'bg-red-500/10 border-red-500/30';

    return (
        <div className={`p-3 rounded-lg border transition-colors duration-300 ${statusColor}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <UsdIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-white">${bet.bet_amount.toFixed(2)}</span>
                </div>
                {hasCashedOut && <span className="text-xs font-bold text-gray-400">@{bet.cashout_multiplier?.toFixed(2)}x</span>}
            </div>
            
            <DynamicBetContent 
                bet={bet}
                onCashout={onCashout}
                loadingBetId={loadingBetId}
                gameState={gameState}
            />
        </div>
    );
});

export const MyBets: React.FC<MyBetsProps> = React.memo(({ bets, onCashout, loadingBetId, gameState }) => {
    
    if (bets.length === 0) {
        return null;
    }
    
    const sortedBets = [...bets].sort((a,b) => (a.cashout_multiplier ? 1 : -1) - (b.cashout_multiplier ? 1 : -1) || (b.bet_amount - a.bet_amount));

    return (
        <div className="mt-4">
            <h3 className="text-xs text-text-muted uppercase font-semibold mb-2">My Bets ({bets.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedBets.map(bet => (
                    <BetCard
                        key={bet.id}
                        bet={bet}
                        onCashout={onCashout}
                        loadingBetId={loadingBetId}
                        gameState={gameState}
                    />
                ))}
            </div>
        </div>
    );
});