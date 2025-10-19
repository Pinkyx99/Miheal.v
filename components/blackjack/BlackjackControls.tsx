import React from 'react';
import { UsdIcon } from '../icons';

type GameState = 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'finished';

interface BlackjackControlsProps {
    gameState: GameState;
    betAmount: number;
    setBetAmount: (amount: number) => void;
    onBet: () => void;
    onHit: () => void;
    onStand: () => void;
    onDouble: () => void;
    canDouble: boolean;
    balance: number;
}

export const BlackjackControls: React.FC<BlackjackControlsProps> = ({
    gameState, betAmount, setBetAmount, onBet, onHit, onStand, onDouble, canDouble, balance
}) => {
    
    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (val >= 0) setBetAmount(val);
    };

    const handleBetModifier = (modifier: '1/2' | 'x2' | 'max') => {
        if (modifier === '1/2') {
            setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2))));
        } else if (modifier === 'x2') {
            setBetAmount(parseFloat((betAmount * 2).toFixed(2)));
        } else if (modifier === 'max') {
            setBetAmount(balance);
        }
    };
    
    const isBetting = gameState === 'betting';
    const isPlayerTurn = gameState === 'player_turn';
    
    return (
        <div className="bg-[#1f1f1f]/90 backdrop-blur-md text-white rounded-lg p-4 flex flex-col space-y-4 border border-white/10">
            {/* Tabs */}
            <div className="flex bg-[#2c2c2c] rounded-md p-1">
                <button className="flex-1 py-2 text-sm font-semibold rounded bg-[#3a3a3a]">Standard</button>
                <button className="flex-1 py-2 text-sm font-semibold rounded text-gray-400">Side bet</button>
            </div>

            {/* Bet Amount */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-semibold text-gray-300">Bet Amount</label>
                    <span className="text-xs text-gray-400">{betAmount.toFixed(2)} USD</span>
                </div>
                <div className="relative flex items-center bg-[#2c2c2c] rounded-md border border-gray-600 p-2">
                    <UsdIcon className="w-5 h-5" />
                    <input 
                        type="number" 
                        step="0.01"
                        value={betAmount.toFixed(2)}
                        onChange={handleBetChange} 
                        disabled={!isBetting}
                        className="flex-1 w-full bg-transparent text-white font-semibold px-2 text-sm focus:outline-none disabled:opacity-50"
                    />
                    <div className="flex space-x-1">
                        <button onClick={() => handleBetModifier('1/2')} disabled={!isBetting} className="px-3 py-1 text-xs font-bold text-gray-300 rounded bg-gray-700/50 hover:bg-white/10 disabled:opacity-50">½</button>
                        <button onClick={() => handleBetModifier('x2')} disabled={!isBetting} className="px-3 py-1 text-xs font-bold text-gray-300 rounded bg-gray-700/50 hover:bg-white/10 disabled:opacity-50">2x</button>
                        <button onClick={() => handleBetModifier('max')} disabled={!isBetting} className="px-3 py-1 text-xs font-bold text-gray-300 rounded bg-gray-700/50 hover:bg-white/10 disabled:opacity-50">Max</button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={onHit}
                    disabled={!isPlayerTurn}
                    className="bg-[#2c2c2c] px-4 py-3 rounded-lg text-white hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-between"
                >
                    <span className="font-semibold">Hit</span>
                    <img src="https://shuffle.com/hit.svg" alt="Hit icon" className="h-5 w-5" onContextMenu={(e) => e.preventDefault()} />
                </button>
                 <button
                    onClick={onStand}
                    disabled={!isPlayerTurn}
                    className="bg-[#2c2c2c] px-4 py-3 rounded-lg text-white hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-between"
                >
                    <span className="font-semibold">Stand</span>
                    <img src="https://shuffle.com/stand.svg" alt="Stand icon" className="h-5 w-5" onContextMenu={(e) => e.preventDefault()} />
                </button>
                 <button
                    onClick={() => {}}
                    disabled={true}
                    className="bg-[#2c2c2c] px-4 py-3 rounded-lg text-white hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-between"
                >
                    <span className="font-semibold">Split</span>
                    <img src="https://shuffle.com/split.svg" alt="Split icon" className="h-5 w-5" onContextMenu={(e) => e.preventDefault()} />
                </button>
                 <button
                    onClick={onDouble}
                    disabled={!isPlayerTurn || !canDouble}
                    className="bg-[#2c2c2c] px-4 py-3 rounded-lg text-white hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-between"
                >
                    <span className="font-semibold">Double</span>
                    <img src="https://shuffle.com/double.svg" alt="Double icon" className="h-5 w-5" onContextMenu={(e) => e.preventDefault()} />
                </button>
            </div>
            
            {/* Bet Button */}
            <div className="flex-1 flex items-end">
                <button 
                    onClick={onBet} 
                    disabled={!isBetting}
                    className="w-full py-4 text-center rounded-lg text-lg font-bold bg-purple-600 text-white transition-all duration-200 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(147,51,234,0.3)] hover:shadow-[0_4px_20px_rgba(147,51,234,0.4)] disabled:shadow-none"
                >
                    Bet
                </button>
            </div>
        </div>
    );
};