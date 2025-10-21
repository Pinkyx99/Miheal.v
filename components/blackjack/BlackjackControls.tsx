
import React from 'react';

type GameState = 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'finished';

interface BlackjackControlsProps {
    gameState: GameState;
    onBet: () => void;
    onHit: () => void;
    onStand: () => void;
    onDouble: () => void;
    onNewRound: () => void;
    onRebet: () => void;
    canRebet: boolean;
    canDouble: boolean;
    betAmount: string;
    onBetAmountChange: (value: string) => void;
    balance: number;
}

const ActionButton: React.FC<{
    label: string | React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    className?: string;
}> = ({ label, onClick, disabled = false, variant = 'secondary', className = '' }) => {
    const baseClasses = `px-8 py-3 rounded-full font-bold text-base uppercase tracking-wider transition-all duration-200 border-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none`;
    const variantClasses = {
        primary: 'bg-red-600 border-red-400 text-white hover:bg-red-500 hover:shadow-red-500/30',
        secondary: 'bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {label}
        </button>
    );
};

export const BlackjackControls: React.FC<BlackjackControlsProps> = ({
    gameState, onBet, onHit, onStand, onDouble, onNewRound, onRebet, canRebet, canDouble, betAmount, onBetAmountChange, balance
}) => {
    
    const isBetting = gameState === 'betting';
    const isPlayerTurn = gameState === 'player_turn';
    const isFinished = gameState === 'finished';

    return (
        <div className="h-20 flex justify-center items-center gap-4">
            {isBetting && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            value={betAmount}
                            onChange={(e) => onBetAmountChange(e.target.value)}
                            className="bg-black/50 backdrop-blur-sm w-56 h-14 rounded-full text-lg font-bold text-white border-2 border-gray-600 text-center focus:border-primary focus:ring-0 outline-none transition pr-24"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                            <button
                                onClick={() => onBetAmountChange((parseFloat(betAmount || '0') / 2).toFixed(2))}
                                className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-xs rounded text-white font-semibold"
                            >1/2</button>
                            <button
                                onClick={() => onBetAmountChange((parseFloat(betAmount || '0') * 2).toFixed(2))}
                                className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-xs rounded text-white font-semibold"
                            >x2</button>
                             <button
                                onClick={() => onBetAmountChange(balance.toFixed(2))}
                                className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-xs rounded text-white font-semibold"
                            >Max</button>
                        </div>
                    </div>
                    <ActionButton
                        label="Bet"
                        onClick={onBet}
                        disabled={parseFloat(betAmount) <= 0}
                        variant="primary"
                        className="h-14"
                    />
                </div>
            )}
            {isPlayerTurn && (
                <>
                    <ActionButton label="Hit" onClick={onHit} />
                    <ActionButton label="Stand" onClick={onStand} />
                    <ActionButton label="Double" onClick={onDouble} disabled={!canDouble} />
                </>
            )}
            {isFinished && (
                 <div className="flex items-center gap-4">
                    <ActionButton label="New Bet" onClick={onNewRound} />
                    <ActionButton label="Rebet" onClick={onRebet} variant="primary" disabled={!canRebet} />
                </div>
            )}
        </div>
    );
};
