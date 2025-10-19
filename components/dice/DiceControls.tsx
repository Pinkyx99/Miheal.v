import React from 'react';
import { DiceIcon } from '../icons';
import { Profile, RollResult } from '../../types';
import { DiceHistory } from './DiceHistory';

interface DiceControlsProps {
    betAmount: number;
    setBetAmount: (value: number) => void;
    rollValue: number;
    onRollValueChange: (value: number) => void;
    multiplier: number;
    onMultiplierChange: (value: number) => void;
    winChance: number;
    profitOnWin: number;
    isRollOver: boolean;
    setIsRollOver: (value: boolean) => void;
    onRollDice: () => void;
    gameState: 'idle' | 'rolling' | 'finished';
    error: string | null;
    profile: Profile | null;
    history: RollResult[];
}

const InputField: React.FC<{ label: string, children: React.ReactNode, className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="text-xs text-text-muted mb-1 block font-semibold">{label}</label>
        <div className="relative bg-[#0D1316] border border-[#2A3341] rounded-lg h-12 flex items-center">
            {children}
        </div>
    </div>
);

const BetModifierButton: React.FC<{ onClick: () => void, disabled: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="py-2.5 bg-[#2c353d] text-gray-300 text-sm font-bold rounded-md hover:bg-[#3b4650] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);


export const DiceControls: React.FC<DiceControlsProps> = (props) => {
    const { betAmount, setBetAmount, onRollValueChange, multiplier, onMultiplierChange, winChance, profitOnWin, isRollOver, setIsRollOver, onRollDice, gameState, error, profile, history } = props;

    const isIdle = gameState === 'idle';

    const handleBetModifier = (modifier: '1/2' | 'x2' | 'max') => {
        switch(modifier) {
            case '1/2': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'x2': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(profile?.balance ?? 0); break;
        }
    };

    return (
        <div className="bg-card rounded-lg p-4 flex flex-col border border-outline shadow-soft min-h-[500px] lg:min-h-0">
            <div className="flex-1 flex flex-col space-y-4">
                {/* Tabs */}
                <div className="flex bg-[#0D1316] rounded-md p-1">
                    <button className="flex-1 py-2 text-sm font-semibold rounded bg-[#2D3748] text-white">Manual</button>
                    <button className="flex-1 py-2 text-sm font-semibold rounded text-text-muted">Autobet</button>
                </div>

                {/* Bet Amount */}
                <div>
                    <label className="text-xs text-text-muted mb-1 block font-semibold">Your bet</label>
                    <div className="relative bg-[#0D1316] border border-[#2A3341] rounded-lg h-12 flex items-center">
                        <span className="pl-3 text-lg font-bold text-accent-green">$</span>
                        <input 
                            type="number" 
                            value={betAmount.toFixed(2)} 
                            onChange={e => setBetAmount(parseFloat(e.target.value) || 0)} 
                            className="flex-1 w-full bg-transparent pl-2 pr-4 text-white font-semibold text-base focus:outline-none" 
                            disabled={!isIdle}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <BetModifierButton onClick={() => handleBetModifier('1/2')} disabled={!isIdle}>1/2</BetModifierButton>
                        <BetModifierButton onClick={() => handleBetModifier('x2')} disabled={!isIdle}>x2</BetModifierButton>
                        <BetModifierButton onClick={() => handleBetModifier('max')} disabled={!isIdle}>Max</BetModifierButton>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <InputField label="Multiplier">
                        <input type="number" step="0.01" value={multiplier.toFixed(4)} onChange={e => onMultiplierChange(parseFloat(e.target.value))} className="w-full bg-transparent px-3 text-white font-semibold" disabled={!isIdle}/>
                    </InputField>
                    <InputField label="Win Chance">
                        <input readOnly value={winChance.toFixed(2)} className="w-full bg-transparent pl-3 pr-8 text-white font-semibold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold">%</span>
                    </InputField>
                </div>
                
                <InputField label="Profit on Win">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-accent-green">$</span>
                    <input readOnly value={profitOnWin.toFixed(2)} className="w-full bg-transparent pl-8 pr-3 text-white font-semibold" />
                </InputField>
                
                <div className="pt-2">
                    {error && (
                        <div className="mb-2 bg-red-500/20 text-red-400 text-center text-xs p-2 rounded-md">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={onRollDice}
                        disabled={!isIdle}
                        className={`w-full py-4 text-center rounded-lg text-lg font-bold flex items-center justify-center bg-accent-green text-white transition-transform hover:scale-105 shadow-lg shadow-green-500/30 disabled:bg-[#2d3748] disabled:text-text-muted disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed ${!isIdle ? 'animate-pulse' : ''}`}
                    >
                        <DiceIcon className="w-6 h-6 mr-2" />
                        <span>{gameState === 'idle' ? 'Roll Dice' : 'Rolling...'}</span>
                    </button>
                </div>
            </div>

            <DiceHistory history={history} />
        </div>
    );
};