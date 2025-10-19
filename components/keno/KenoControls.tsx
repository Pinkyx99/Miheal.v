import React, { useState } from 'react';
import { KenoRandomIcon, KenoClearIcon } from './KenoIcons';
import { Logo } from '../icons';

type RiskLevel = 'low' | 'medium' | 'high' | 'classic';

interface KenoControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    riskLevel: RiskLevel;
    setRiskLevel: (level: RiskLevel) => void;
    gameState: 'idle' | 'playing' | 'finished';
    onPlay: () => void;
    onClear: () => void;
    onRandom: () => void;
    balance: number;
    selectedCount: number;
}

export const KenoControls: React.FC<KenoControlsProps> = ({
    betAmount, setBetAmount, riskLevel, setRiskLevel, gameState, onPlay, onClear, onRandom, balance, selectedCount
}) => {
    const [activeTab, setActiveTab] = useState('Manual');
    const riskLevels: { name: string; value: RiskLevel }[] = [
        { name: 'Low', value: 'low' },
        { name: 'Classic', value: 'classic' },
        { name: 'High', value: 'high' },
    ];

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setBetAmount(isNaN(val) ? 0 : val);
    };

    const handleSetBet = (modifier: 'min' | '1/2' | 'x2' | 'max') => {
        switch(modifier) {
            case 'min': setBetAmount(0.01); break;
            case '1/2': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'x2': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(balance); break;
        }
    };

    const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setRiskLevel(riskLevels[value].value);
    };
    
    const effectiveRiskLevel = riskLevel === 'medium' ? 'classic' : riskLevel;
    const riskValueIndex = riskLevels.findIndex(r => r.value === effectiveRiskLevel);
    const isIdle = gameState === 'idle';
    const insufficientFunds = balance < betAmount;

    return (
        <div className="bg-[#1a2127] p-4 rounded-xl shadow-lg border border-[#2c353d] w-full max-w-sm mx-auto lg:max-w-none">
            <div className="flex bg-[#0f1519] rounded-md p-1 mb-4">
                <button
                    onClick={() => setActiveTab('Manual')}
                    className={`flex-1 py-2 text-sm font-semibold rounded ${activeTab === 'Manual' ? 'bg-[#2c353d] text-white' : 'text-gray-400'}`}
                >
                    Manual
                </button>
                <button
                    onClick={() => setActiveTab('Auto')}
                    className={`flex-1 py-2 text-sm font-semibold rounded ${activeTab === 'Auto' ? 'bg-[#2c353d] text-white' : 'text-gray-400'}`}
                >
                    Auto
                </button>
            </div>
            
            {activeTab === 'Manual' && (
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>Your Bet</span>
                            <span className="text-white font-medium">$ {balance.toFixed(2)}</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold text-lg">$</span>
                            <input
                                type="number"
                                value={betAmount.toFixed(2)}
                                onChange={handleBetChange}
                                disabled={!isIdle}
                                className="w-full bg-[#0f1519] text-white font-semibold py-3 pl-8 pr-4 rounded-md border border-[#2c353d] focus:ring-1 focus:ring-green-400 focus:outline-none disabled:opacity-50"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {(['min', '1/2', 'x2', 'max'] as const).map(mod => (
                               <button key={mod} onClick={() => handleSetBet(mod)} disabled={!isIdle} className="py-1.5 bg-[#2c353d] text-gray-300 text-xs font-bold rounded-md hover:bg-[#3b4650] disabled:opacity-50">
                                   {mod.toUpperCase()}
                               </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                         <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>Risk</span>
                            <span className="font-semibold text-white">{riskLevels[riskValueIndex > -1 ? riskValueIndex : 1].name}</span>
                        </div>
                        <input type="range" min="0" max="2" value={riskValueIndex > -1 ? riskValueIndex : 1} onChange={handleRiskChange} disabled={!isIdle} 
                            className="w-full h-2 bg-[#0f1519] rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={onRandom} disabled={!isIdle} className="flex items-center justify-center space-x-2 py-2.5 bg-[#2c353d] text-gray-300 text-sm font-semibold rounded-md hover:bg-[#3b4650] disabled:opacity-50">
                            <KenoRandomIcon /> <span>Random</span>
                        </button>
                        <button onClick={onClear} disabled={!isIdle} className="flex items-center justify-center space-x-2 py-2.5 bg-[#2c353d] text-gray-300 text-sm font-semibold rounded-md hover:bg-[#3b4650] disabled:opacity-50">
                            <KenoClearIcon /> <span>Clear</span>
                        </button>
                    </div>

                    <button 
                        onClick={onPlay} 
                        disabled={!isIdle || selectedCount === 0 || insufficientFunds}
                        className="w-full py-4 text-center rounded-lg text-lg font-bold bg-accent-green text-[#1a2127] transition-transform hover:scale-105 shadow-lg shadow-green-500/20 disabled:bg-[#2c353d] disabled:text-gray-500 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {insufficientFunds ? 'Insufficient Funds' : 'Start playing'}
                    </button>
                </div>
            )}
            
            {activeTab === 'Auto' && (
                <div className="text-center text-gray-400 py-16">Auto-bet controls coming soon!</div>
            )}

            <div className="mt-4 flex items-center justify-center">
                 <Logo className="h-8" />
            </div>
        </div>
    );
};