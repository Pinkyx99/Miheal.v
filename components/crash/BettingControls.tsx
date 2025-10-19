import React, { useState, useRef, useEffect } from 'react';
// FIX: Import the centralized GameState type to ensure consistency.
import { Profile, CrashBet, GameState } from '../../types';
import { Session } from '@supabase/supabase-js';
import { Switch } from '../profile/shared/Switch';
import { UsdIcon } from '../icons';

interface BettingControlsProps {
    profile: Profile | null;
    session: Session | null;
    userBets: CrashBet[];
    onPlaceBet: (betAmount: string, autoCashout: string) => void;
    gameState: GameState;
    loading: boolean;
    error: string | null;
}

export const BettingControls: React.FC<BettingControlsProps> = ({ profile, session, userBets, onPlaceBet, gameState, loading, error }) => {
    const [betAmount, setBetAmount] = useState('0.12');
    const [autoCashout, setAutoCashout] = useState('2');
    const [presetsOpen, setPresetsOpen] = useState(false);
    const presetsRef = useRef<HTMLDivElement>(null);
    const amountPresets = [0.5, 1, 5, 10, 25, 50];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (presetsRef.current && !presetsRef.current.contains(event.target as Node)) {
                setPresetsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePlaceBetClick = () => {
        if (!loading) {
            onPlaceBet(betAmount, autoCashout);
        }
    };
    
    const isBettingPhase = gameState === 'waiting';

    const renderActionButton = () => {
        if (!session) {
            return <button disabled className="w-full h-full text-lg font-bold text-white rounded-md bg-[#2A3341] cursor-not-allowed">Sign In to Bet</button>;
        }

        if (!isBettingPhase) {
            return <button disabled className="w-full h-full text-lg font-bold text-white rounded-md bg-[#212832] cursor-not-allowed">Waiting for next round...</button>;
        }

        const insufficientFunds = profile && parseFloat(betAmount) > profile.balance;
        if (insufficientFunds) {
            return <button disabled className="w-full h-full text-lg font-bold text-white rounded-md bg-[#2A3341] cursor-not-allowed">Insufficient Funds</button>;
        }
        
        return (
            <button onClick={handlePlaceBetClick} disabled={loading || !isBettingPhase} className="w-full h-full text-lg font-bold text-white rounded-md transition-all duration-200 bg-gradient-to-b from-accent-green to-secondary-green hover:brightness-110 disabled:from-[#2A3341] disabled:to-[#2A3341] disabled:cursor-not-allowed disabled:hover:brightness-100 shadow-[0_4px_15px_rgba(0,193,123,0.2)] hover:shadow-[0_4px_20px_rgba(0,193,123,0.3)] disabled:shadow-none border border-green-400/50 disabled:border-transparent">
                {loading ? '...' : 'Place Bet'}
            </button>
        );
    }
    
    return (
        <div className="bg-[#0D1316] rounded-b-lg p-4 sm:p-6 text-sm border border-t-0 border-white/5 relative">
             {error && <p className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded ">{error}</p>}
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-text-muted mb-1 block">Your bet</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <UsdIcon className="w-5 h-5" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    className="w-full h-12 bg-[#1A222D] border border-[#2A3341] rounded-md py-2.5 pl-10 pr-16 text-white font-semibold focus:ring-1 focus:ring-accent-green focus:outline-none focus:border-accent-green/50 transition"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <button onClick={() => setBetAmount('')} className="px-2 text-xs font-bold rounded text-gray-400 hover:bg-white/10 hover:text-white transition-colors">Clear</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-text-muted mb-1 block">Auto Cashout</label>
                             <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="2.00x"
                                    value={autoCashout}
                                    onChange={(e) => setAutoCashout(e.target.value)}
                                    className="w-full h-12 bg-[#1A222D] border border-[#2A3341] rounded-md py-2.5 px-3 pr-16 text-white font-semibold focus:ring-1 focus:ring-accent-green focus:outline-none focus:border-accent-green/50 transition"
                                />
                                 <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <button onClick={() => setAutoCashout('')} className="px-2 text-xs font-bold rounded text-gray-400 hover:bg-white/10 hover:text-white transition-colors">Clear</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-12">
                        {renderActionButton()}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="relative" ref={presetsRef}>
                        <button onClick={() => setPresetsOpen(o => !o)} className="text-xs text-text-muted hover:text-white transition-colors flex items-center">
                            Amount Presets
                            <svg className={`w-4 h-4 ml-1 transition-transform ${presetsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        {presetsOpen && (
                            <div className="absolute bottom-full mb-2 bg-[#1A222D] border border-[#2A3341] rounded-md p-2 flex gap-2 shadow-lg z-10">
                                {amountPresets.map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => { setBetAmount(p.toString()); setPresetsOpen(false); }}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0D1316] rounded hover:bg-accent-green/80 transition-colors"
                                    >
                                        ${p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                         <label htmlFor="autobet-toggle" className="text-xs text-text-muted cursor-pointer">Autobet</label>
                         <Switch />
                    </div>
                </div>
            </div>
        </div>
    );
};