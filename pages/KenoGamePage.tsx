
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { KenoControls } from '../components/keno/KenoControls';
import { KenoGrid } from '../components/keno/KenoGrid';
import { KenoPayoutBar } from '../components/keno/KenoPayoutBar';
import { supabase } from '../lib/supabaseClient';
// Add missing icon imports
import { Logo, SoundIcon, LightningIcon, CalendarIcon, ClockIcon, CheckIcon, QuestionIcon } from '../components/icons';

// --- Provably Fair Helper Functions ---
async function sha256Hex(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToUint32Array(hex: string): Uint32Array {
    const u32s = new Uint32Array(8);
    for (let i = 0; i < 8; i++) {
        u32s[i] = parseInt(hex.substring(i * 8, (i + 1) * 8), 16);
    }
    return u32s;
}
function makeXorshift32(seedArray: Uint32Array) {
    let state = [...seedArray];
    return function() {
        let t = state[0];
        t ^= t << 11;
        t ^= t >> 8;
        state[0] = state[1];
        state[1] = state[2];
        state[2] = state[3];
        t ^= state[3];
        t ^= state[3] >> 19;
        state[3] = t;
        return (state[3] & 0xFFFFFFFF) / 0x100000000;
    };
}
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const TopToolbar: React.FC = () => (
    <div className="flex items-center space-x-1">
        <button className="w-9 h-9 flex items-center justify-center bg-[#37b54a]/30 text-[#37b54a] rounded-md transition hover:bg-[#37b54a]/50"><SoundIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center bg-white/5 text-gray-400 rounded-md transition hover:bg-white/10"><LightningIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center bg-white/5 text-gray-400 rounded-md transition hover:bg-white/10"><CalendarIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center bg-white/5 text-gray-400 rounded-md transition hover:bg-white/10"><ClockIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center bg-white/5 text-gray-400 rounded-md transition hover:bg-white/10"><CheckIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center bg-white/5 text-gray-400 rounded-md transition hover:bg-white/10"><QuestionIcon className="w-5 h-5" /></button>
    </div>
);

interface KenoGamePageProps {
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}

const PAYOUT_TABLES: Record<string, number[]> = {
    low: [0, 0, 1.1, 1.2, 1.3, 1.8, 3.5, 15, 50, 250, 1000],
    classic: [0, 0, 0, 1.4, 2.25, 4.5, 8, 17, 50, 80, 100],
    high: [0, 0, 0, 0, 3.5, 8, 15, 65, 500, 800, 1000],
    medium: [0, 0, 0, 1.4, 2.25, 4.5, 8, 17, 50, 80, 100], // Fallback for medium to act as classic
};


const KenoGamePage: React.FC<KenoGamePageProps> = ({ profile, session, onProfileUpdate }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [betAmount, setBetAmount] = useState(0.10);
    const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'classic'>('classic');
    const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
    const [winningNumbers, setWinningNumbers] = useState<Set<number>>(new Set());
    const [revealedNumbers, setRevealedNumbers] = useState<Set<number>>(new Set());

    const hits = useMemo(() => {
        if (gameState !== 'finished') return new Set<number>();
        const hitNumbers = new Set<number>();
        selectedNumbers.forEach(num => {
            if (winningNumbers.has(num)) {
                hitNumbers.add(num);
            }
        });
        return hitNumbers;
    }, [gameState, selectedNumbers, winningNumbers]);

    const payouts = useMemo(() => {
        const table = PAYOUT_TABLES[riskLevel === 'medium' ? 'classic' : riskLevel];
        return table;
    }, [riskLevel]);

    const currentMultiplier = useMemo(() => {
        if (gameState !== 'finished') return 0;
        const numSelected = selectedNumbers.size;
        if (numSelected === 0) return 0;
        const numHits = hits.size;
        return payouts[numHits] || 0;
    }, [gameState, selectedNumbers.size, hits.size, payouts]);

    const profit = useMemo(() => {
        if (gameState !== 'finished') return 0;
        return betAmount * currentMultiplier;
    }, [gameState, betAmount, currentMultiplier]);

    const handleNumberSelect = useCallback((num: number) => {
        if (gameState !== 'idle') return;
        setSelectedNumbers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(num)) {
                newSet.delete(num);
            } else if (newSet.size < 10) {
                newSet.add(num);
            }
            return newSet;
        });
    }, [gameState]);

    const handleClear = useCallback(() => {
        if (gameState !== 'idle') return;
        setSelectedNumbers(new Set());
    }, [gameState]);

    const handleRandom = useCallback(() => {
        if (gameState !== 'idle') return;
        const numbers = Array.from({ length: 40 }, (_, i) => i + 1);
        const shuffled = numbers.sort(() => 0.5 - Math.random());
        setSelectedNumbers(new Set(shuffled.slice(0, 10)));
    }, [gameState]);

    const handlePlay = useCallback(async () => {
        if (gameState !== 'idle' || selectedNumbers.size === 0 || !session || !profile) return;
        if (betAmount > (profile.balance ?? 0)) {
            // setError("Insufficient funds.");
            return;
        }

        setGameState('playing');
        setWinningNumbers(new Set());
        setRevealedNumbers(new Set());

        // Simple balance deduction for demo; production would use a robust transaction system.
        const { error: debitError } = await supabase.from('profiles').update({ balance: profile.balance - betAmount }).eq('id', session.user.id);
        if (debitError) {
            setGameState('idle');
            return;
        }
        onProfileUpdate();

        // Generate winning numbers
        const serverSeed = Math.random().toString(36).substring(2);
        const hashSeed = `${serverSeed}:client-seed-placeholder:1`;
        const hashHex = await sha256Hex(hashSeed);
        const seedArray = hexToUint32Array(hashHex);
        const rng = makeXorshift32(seedArray);

        const cells = Array.from({ length: 40 }, (_, i) => i + 1);
        const shuffledCells = seededShuffle(cells, rng);
        const newWinningNumbers = new Set<number>(shuffledCells.slice(0, 10));
        setWinningNumbers(newWinningNumbers);

        // Reveal numbers one by one
        const revealOrder = Array.from(newWinningNumbers);
        for (let i = 0; i < revealOrder.length; i++) {
            setTimeout(() => {
                setRevealedNumbers(prev => new Set(prev).add(revealOrder[i]));
            }, (i + 1) * 200);
        }
        
        // Finish game after reveals
        setTimeout(async () => {
            const hitCount = Array.from(selectedNumbers).filter(num => newWinningNumbers.has(num)).length;
            const multiplier = PAYOUT_TABLES[riskLevel === 'medium' ? 'classic' : riskLevel][hitCount] || 0;
            const payout = betAmount * multiplier;
            
            if (payout > 0) {
                 const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
                 if (fetchError || !currentProfile) return;
                 // FIX: Safely calculate the new balance by handling potential null/undefined values and ensuring the result is a number. This replaces a less type-safe implementation that may have caused the 'unknown' type error.
                 const newBalance = Number((currentProfile as any).balance ?? 0) + payout;
                 await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
            }

            setGameState('finished');
            onProfileUpdate();
            
            // Log to game_bets
            await supabase.from('game_bets').insert({
                user_id: session.user.id,
                game_name: 'Keno',
                bet_amount: betAmount,
                payout: payout,
                multiplier: multiplier,
            });

            setTimeout(() => {
                setGameState('idle');
            }, 3000);
        }, (revealOrder.length + 1) * 200);
    }, [gameState, selectedNumbers, betAmount, session, profile, onProfileUpdate, riskLevel]);


    return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#081018]">
            <div className="w-full max-w-[1200px] aspect-[1200/715] bg-card border border-outline rounded-lg shadow-2xl relative">
                <header className="absolute top-5 left-8 right-8 flex justify-between items-start z-10">
                    <Logo />
                    <TopToolbar />
                </header>

                <main className="w-full h-full flex items-center justify-center gap-6">
                    <KenoControls
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        riskLevel={riskLevel}
                        setRiskLevel={setRiskLevel}
                        gameState={gameState}
                        onPlay={handlePlay}
                        onClear={handleClear}
                        onRandom={handleRandom}
                        balance={profile?.balance ?? 0}
                        selectedCount={selectedNumbers.size}
                    />
                    <div className="flex flex-col items-center">
                        <KenoGrid
                            selectedNumbers={selectedNumbers}
                            winningNumbers={winningNumbers}
                            revealedNumbers={revealedNumbers}
                            hits={hits}
                            gameState={gameState}
                            onNumberSelect={handleNumberSelect}
                        />
                        <KenoPayoutBar multipliers={payouts} />
                    </div>
                </main>
            </div>
        </div>
    );
};
export default KenoGamePage;
