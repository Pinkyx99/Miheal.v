
import React, { useState, useEffect } from 'react';
import { Profile } from '../../types';

interface MinesControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    numMines: number;
    setNumMines: (mines: number) => void;
    gameState: 'idle' | 'playing' | 'busted' | 'cashed_out';
    onStartGame: () => void;
    onCashout: () => void;
    profit: number;
    onReset: () => void;
    profile: Profile | null;
    error: string | null;
    setError: (error: string | null) => void;
}

const ControlButton: React.FC<{ onClick: () => void, disabled: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled} className="flex-1 bg-[#3c454e] text-gray-300 text-xs font-bold rounded-md hover:bg-[#4a5568] transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-8">
        {children}
    </button>
);

export const MinesControls: React.FC<MinesControlsProps> = (props) => {
    const { betAmount, setBetAmount, numMines, setNumMines, gameState, onStartGame, onCashout, profit, onReset, profile, error, setError } = props;
    const [activeTab, setActiveTab] = useState('Manual');
    
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, setError]);

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setBetAmount(parseFloat(val) || 0);
    };
    
    const handleSetBet = (modifier: 'min' | '1/2' | 'x2' | 'max') => {
        switch(modifier) {
            case 'min': setBetAmount(0.01); break;
            case '1/2': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'x2': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(profile?.balance ?? 0); break;
        }
    }
    
    const sliderPercentage = ((numMines - 1) / 23) * 100;

    const isIdle = gameState === 'idle';
    const insufficientFunds = profile && betAmount > profile.balance;

    const renderActionButton = () => {
        if (gameState === 'busted') {
            return <button onClick={onReset} className="w-full h-12 text-center rounded-lg text-base font-bold bg-red-500 text-white transition-colors hover:bg-red-600">Busted! Play Again</button>;
        }
        if (gameState === 'cashed_out') {
            return <button onClick={onReset} className="w-full h-12 text-center rounded-lg text-base font-bold bg-green-500 text-white transition-colors hover:bg-green-600">Cashed Out ${profit.toFixed(2)}! Play Again</button>;
        }
        if (gameState === 'playing') {
             return <button onClick={onCashout} disabled={profit <= 0} className="w-full h-12 text-center rounded-lg text-base font-bold bg-green-500 text-white transition-colors hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed">Cashout ${profit.toFixed(2)}</button>;
        }
        return <button onClick={onStartGame} disabled={insufficientFunds || betAmount <= 0} className="w-full h-12 text-center rounded-lg text-base font-bold bg-[#17d182] text-white transition-colors hover:bg-[#1ae88f] disabled:bg-gray-600 disabled:cursor-not-allowed">{insufficientFunds ? 'Insufficient Funds' : 'Start playing'}</button>;
    };

    return (
        <div className="w-[300px] bg-[#1a2127]/80 backdrop-blur-md p-4 rounded-xl border border-gray-600/50 text-white flex flex-col space-y-4">
            <div className="flex bg-[#0f1519] rounded-md p-1">
                <button onClick={() => setActiveTab('Manual')} className={`flex-1 py-1.5 text-sm font-semibold rounded ${activeTab === 'Manual' ? 'bg-white text-black' : 'text-gray-400'}`}>Manual</button>
                <button onClick={() => setActiveTab('Auto')} className={`flex-1 py-1.5 text-sm font-semibold rounded ${activeTab === 'Auto' ? 'bg-white text-black' : 'text-gray-400'}`}>Auto</button>
            </div>

            {activeTab === 'Manual' && (
                <>
                    <div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>Your Bet</span>
                            <span className="font-medium text-white">${profit.toFixed(2)}</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">$</span>
                            <input type="number" value={betAmount.toFixed(2)} onChange={handleBetChange} disabled={!isIdle} className="w-full h-11 bg-[#0f1519] text-white font-semibold py-2 pl-8 pr-4 rounded-md border border-[#2c353d] focus:ring-1 focus:ring-green-400 focus:outline-none disabled:opacity-50" />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {(['min', '1/2', 'x2', 'max'] as const).map(mod => <ControlButton key={mod} onClick={() => handleSetBet(mod)} disabled={!isIdle}>{mod.toUpperCase()}</ControlButton>)}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>Mines</span>
                            <span className="font-bold text-white bg-[#0f1519] border border-[#2c353d] rounded-md px-2 py-0.5">{numMines}</span>
                        </div>
                        <div className="relative flex items-center">
                            <input type="range" min="1" max="24" value={numMines} onChange={(e) => setNumMines(parseInt(e.target.value))} disabled={!isIdle}
                                className="w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer slider-track disabled:opacity-50"
                                style={{ '--slider-progress': `${sliderPercentage}%` } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {renderActionButton()}
                </>
            )}
            
            {activeTab === 'Auto' && <div className="text-center text-gray-400 py-20">Auto-bet controls are not available in this demo.</div>}
            
            <style>{`
                .slider-track {
                    background: linear-gradient(to right, #17d182 var(--slider-progress), #3c454e var(--slider-progress));
                }
                .slider-track::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #ffffff;
                    border-radius: 50%;
                    border: 2px solid #17d182;
                    cursor: pointer;
                    margin-top: -6px; /* (track-height - thumb-height) / 2 */
                }
                .slider-track::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #ffffff;
                    border-radius: 50%;
                    border: 2px solid #17d182;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};
