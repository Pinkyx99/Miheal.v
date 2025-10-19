
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Profile, RollResult } from '../types';
import { Session } from '@supabase/supabase-js';
import { DiceControls } from '../components/dice/DiceControls';
import { DiceDisplay } from '../components/dice/DiceDisplay';
import { supabase } from '../lib/supabaseClient';

const HOUSE_EDGE = 0.01; // 1%

const getAdjustedWinChance = (fairChance: number): number => {
    let edge;
    if (fairChance <= 10) {
        edge = 0.30;
    } else if (fairChance <= 50) {
        edge = 0.30 - (0.26 * ((fairChance - 10) / 40));
    } else if (fairChance <= 90) {
        edge = 0.04 + (0.05 * ((fairChance - 50) / 40));
    } else {
        const highChance = Math.min(fairChance, 98);
        edge = 0.09 - (0.08 * ((highChance - 90) / 8));
    }
    return fairChance * (1 - edge);
};

const DiceGamePage: React.FC<{
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}> = ({ profile, session, onProfileUpdate }) => {
    const [betAmount, setBetAmount] = useState(1.00);
    const [rollValue, setRollValue] = useState(50.5);
    const [isRollOver, setIsRollOver] = useState(true);
    const [gameState, setGameState] = useState<'idle' | 'rolling' | 'finished'>('idle');
    const [history, setHistory] = useState<RollResult[]>([]);
    const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
    const [previousRollValue, setPreviousRollValue] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const { winChance, multiplier } = useMemo(() => {
        let chance: number;
        if (isRollOver) {
            chance = 100 - rollValue;
        } else {
            chance = rollValue;
        }
        chance = Math.max(0.02, Math.min(98.01, chance));

        const mult = (100 * (1 - HOUSE_EDGE)) / chance;
        return {
            winChance: chance,
            multiplier: Math.min(4950, Math.max(1.0101, mult)),
        };
    }, [rollValue, isRollOver]);
    
    const profitOnWin = useMemo(() => betAmount * (multiplier - 1), [betAmount, multiplier]);

    const handleRollValueChange = useCallback((newValue: number) => {
        let clampedValue;
        if (isRollOver) {
            clampedValue = Math.max(1.99, Math.min(99.98, newValue));
        } else {
            clampedValue = Math.max(0.02, Math.min(98.01, newValue));
        }
        setRollValue(clampedValue);
    }, [isRollOver]);

    const handleMultiplierChange = useCallback((newMultiplier: number) => {
        const clampedMultiplier = Math.max(1.0101, Math.min(4950, newMultiplier));
        const newWinChance = (100 * (1 - HOUSE_EDGE)) / clampedMultiplier;
        
        if (isRollOver) {
            setRollValue(100 - newWinChance);
        } else {
            setRollValue(newWinChance);
        }
    }, [isRollOver]);
    
    const handleRollDice = useCallback(async () => {
        if (gameState !== 'idle' || !session || !profile) {
            if (!session) setError("Please sign in to play.");
            return;
        }
        if (betAmount <= 0) {
            setError("Bet amount must be greater than zero.");
            return;
        }
        if (profile.balance < betAmount) {
            setError("Insufficient funds.");
            return;
        }
        
        setError(null);
        setGameState('rolling');
        setLastRoll(null);

        try {
            const { error: debitError } = await supabase
                .from('profiles')
                .update({ 
                    balance: (Number(profile.balance) || 0) - betAmount,
                    wagered: (Number(profile.wagered) || 0) + betAmount,
                })
                .eq('id', session.user.id);
            if (debitError) throw new Error(debitError.message);
            
            const { error: rpcError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (rpcError) {
                console.error("Failed to increment games_played for Dice:", rpcError.message);
            }

            onProfileUpdate();
            await new Promise(resolve => setTimeout(resolve, 100));

            const resultValue = parseFloat((Math.random() * 100).toFixed(2));
            const actualWinChance = getAdjustedWinChance(winChance);
            const win = isRollOver ? resultValue > (100 - actualWinChance) : resultValue < actualWinChance;
            const payout = win ? betAmount * multiplier : 0;

            if (win) {
                const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
                if (fetchError) throw new Error(fetchError.message);
                if (!currentProfile) throw new Error("Could not find user profile to update balance.");

                const currentBalance = Number(currentProfile.balance) || 0;
                const newBalance = currentBalance + payout;
                const { error: payoutError } = await supabase
                    .from('profiles')
                    .update({ balance: newBalance })
                    .eq('id', session.user.id);
                
                if (payoutError) throw new Error(payoutError.message);
            }

            const result: RollResult = {
                id: crypto.randomUUID(),
                value: resultValue,
                win,
                betAmount,
                payout,
                multiplier,
                isRollOver,
                rollValue,
                createdAt: new Date().toISOString(),
            };

            setLastRoll(result);
            setHistory(prev => [result, ...prev].slice(0, 50));
            setGameState('finished');
            onProfileUpdate();

        } catch (e: any) {
            setError(e.message || "An error occurred.");
            setGameState('idle');
            onProfileUpdate();
        }
    }, [gameState, isRollOver, betAmount, multiplier, session, profile, onProfileUpdate, winChance, rollValue]);


    useEffect(() => {
        if (gameState === 'finished') {
            if(lastRoll) setPreviousRollValue(lastRoll.value);
            const timer = setTimeout(() => {
                setGameState('idle');
            }, 2000); 
            return () => clearTimeout(timer);
        }
    }, [gameState, lastRoll]);

    return (
        <div className="flex flex-col flex-1 bg-[#081018] font-sans">
            <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-6 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
                    <DiceControls
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        rollValue={rollValue}
                        onRollValueChange={handleRollValueChange}
                        multiplier={multiplier}
                        onMultiplierChange={handleMultiplierChange}
                        winChance={winChance}
                        profitOnWin={profitOnWin}
                        isRollOver={isRollOver}
                        setIsRollOver={setIsRollOver}
                        onRollDice={handleRollDice}
                        gameState={gameState}
                        error={error}
                        profile={profile}
                        history={history}
                    />
                    <div className="bg-card rounded-lg border border-outline shadow-soft flex flex-col min-h-[500px] lg:min-h-0">
                        <DiceDisplay
                            rollValue={rollValue}
                            isRollOver={isRollOver}
                            gameState={gameState}
                            lastRoll={lastRoll}
                            onRollValueChange={handleRollValueChange}
                            previousRollValue={previousRollValue}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiceGamePage;