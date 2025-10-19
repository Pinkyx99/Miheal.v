
import React from 'react';
import { RouletteGameState } from '../../types';
import { Switch } from '../profile/shared/Switch';

interface RouletteControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    balance: number;
    gameState: RouletteGameState | null;
}

const ControlButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    className?: string;
}> = ({ onClick, disabled, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`h-11 px-3 bg-[#212832] text-text-muted text-xs font-bold rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
    >
        {children}
    </button>
);

export const RouletteControls: React.FC<RouletteControlsProps> = ({ betAmount, setBetAmount, balance, gameState }) => {

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (val < 0) return;
        setBetAmount(isNaN(val) ? 0 : val);
    };

    const handleModifier = (action: 'clear' | '1/2' | 'x2' | 'max') => {
        switch(action) {
            case 'clear': setBetAmount(0.01); break;
            case '1/2': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'x2': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(balance); break;
        }
    };

    const isBettingDisabled = gameState !== 'betting';

    return (
        <div className="bg-[#1A222D] p-3 rounded-xl border border-outline">
            <div className="flex flex-wrap items-center gap-3">
                {/* Bet Amount Input */}
                <div className="flex-grow flex-shrink-0 basis-full sm:basis-48">
                    <label className="text-xs font-semibold text-text-muted mb-1 block">Your bet</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-accent-green">$</span>
                        <input
                            type="number"
                            value={betAmount.toFixed(2)}
                            onChange={handleBetChange}
                            disabled={isBettingDisabled}
                            className="w-full h-11 bg-[#0D1316] border border-outline rounded-lg py-2.5 pl-8 pr-16 text-white font-semibold text-base focus:ring-1 focus:ring-accent-green focus:outline-none disabled:opacity-60"
                        />
                         <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <button onClick={() => handleModifier('clear')} disabled={isBettingDisabled} className="px-2 text-xs font-bold rounded text-gray-400 hover:bg-white/10 hover:text-white transition-colors">Clear</button>
                        </div>
                    </div>
                </div>

                {/* Modifier Buttons */}
                <div className="flex-grow flex-shrink basis-auto flex items-end space-x-2">
                     <ControlButton onClick={() => handleModifier('1/2')} disabled={isBettingDisabled}>1/2</ControlButton>
                     <ControlButton onClick={() => handleModifier('x2')} disabled={isBettingDisabled}>x2</ControlButton>
                     <ControlButton onClick={() => handleModifier('max')} disabled={isBettingDisabled} className="bg-green-600/50 text-white">Max</ControlButton>
                </div>
                 <div className="flex items-center space-x-2 ml-auto">
                    <label htmlFor="autobet" className="text-sm font-semibold text-text-muted">Auto Bet</label>
                    <Switch />
                 </div>
            </div>
        </div>
    );
};
