
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { KenoControls } from '../components/keno/KenoControls';
import { KenoGrid } from '../components/keno/KenoGrid';
import { KenoPayoutBar } from '../components/keno/KenoPayoutBar';
import { KenoSoundIcon, KenoSpeedIcon, KenoHistoryIcon, KenoHelpIcon, KenoFairnessIcon, KenoInfoIcon } from '../components/keno/KenoIcons';
import { supabase } from '../lib/supabaseClient';
// FIX: Add missing icon imports
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

    const currentMultipliers = useMemo(() => {
        // This logic assumes 10 numbers are selected, as the payout table varies with the count.
        // For this UI, we'll show the 10-pick multiplier table which is most common.
        return PAYOUT_TABLES[riskLevel] || PAYOUT_TABLES.classic;
    }, [riskLevel]);

    const handleNumberSelect = useCallback((num: number) => {
        if (gameState !== 'idle') return;
        const newSelection = new Set(selectedNumbers);
        if (newSelection.has(num)) {
            newSelection.delete(num);
        } else {
            if (newSelection.size < 10) {
                newSelection.add(num);
            }
        }
        setSelectedNumbers(newSelection);
    }, [gameState, selectedNumbers]);

    const handleClear = useCallback(() => {
        if (gameState !== 'idle') return;
        setSelectedNumbers(new Set());
    }, [gameState]);
    
    const handleRandom = useCallback(() => {
        if (gameState !== 'idle') return;
        const numbers = new Set<number>();
        const count = selectedNumbers.size > 0 ? selectedNumbers.size : 10;
        while(numbers.size < count) {
            const randomNum = Math.floor(Math.random() * 40) + 1;
            numbers.add(randomNum);
        }
        setSelectedNumbers(numbers);
    }, [gameState, selectedNumbers.size]);

    const handlePlay = useCallback(async () => {
        if (gameState !== 'idle' || selectedNumbers.size === 0 || !session || !profile || profile.balance < betAmount) {
            return;
        }

        setGameState('playing');
        setWinningNumbers(new Set());
        setRevealedNumbers(new Set());

        try {
            // Step 1: Debit balance and update wagered amount
            const { error: debitError } = await supabase
                .from('profiles')
                .update({
                    balance: profile.balance - betAmount,
                    wagered: profile.wagered + betAmount,
                })
                .eq('id', session.user.id);
            if (debitError) throw debitError;
            
            // Step 2: Increment games played via a secure RPC call
            const { error: rpcError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (rpcError) {
                 // Non-critical error, log it but let the game proceed
                console.error("Failed to increment games_played for Keno:", rpcError.message);
            }

            onProfileUpdate(); // Update UI with new balance

            // --- Mock Game & Payout Logic ---
            const drawn = new Set<number>();
            while (drawn.size < 10) { drawn.add(Math.floor(Math.random() * 40) + 1); }
            setWinningNumbers(drawn);

            const hitCount = Array.from(selectedNumbers).filter(n => drawn.has(n)).length;
            const multiplier = (PAYOUT_TABLES[riskLevel] || PAYOUT_TABLES.classic)[hitCount] || 0;
            const payout = betAmount * multiplier;

            if (payout > 0) {
                // Fetch latest balance before adding payout to avoid race conditions
                const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
                if (fetchError) throw fetchError;
                if (!currentProfile) throw new Error("Could not find user profile to update balance.");
                // FIX: Argument of type 'unknown' is not assignable to parameter of type 'number'.
                // Safely convert balance to a number.
                const currentBalance = Number(currentProfile.balance) || 0;
                
                const newBalance = currentBalance + payout;
                const { error: payoutError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
                if (payoutError) throw payoutError;

                onProfileUpdate(); // Update UI again after payout
            }

            // --- Animation ---
            const drawnArray = Array.from(drawn);
            drawnArray.forEach((num, index) => {
                setTimeout(() => {
                    setRevealedNumbers(prev => new Set(prev).add(num));
                    if (index === drawnArray.length - 1) {
                        setTimeout(() => setGameState('finished'), 500);
                    }
                }, (index + 1) * 200);
            });
        } catch (e: any) {
            console.error("Keno play error:", e.message);
            setGameState('idle');
            onProfileUpdate(); // Re-sync on error
        }
    }, [gameState, selectedNumbers, betAmount, riskLevel, session, profile, onProfileUpdate]);
    
    // Reset for next round
    useEffect(() => {
        if (gameState === 'finished') {
            const timer = setTimeout(() => {
                setGameState('idle');
                setWinningNumbers(new Set());
                setRevealedNumbers(new Set());
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    return (
        <div className="flex-1 flex flex-col bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://gamdom.com/_proxied/games/keno/background-large.08b7ce281cc14ac9c24a.webp')" }}>
            <div className="w-full max-w-[1200px] mx-auto px-4 py-4 flex justify-between items-center">
                <Logo />
                <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoSoundIcon /></button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoSpeedIcon /></button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoHistoryIcon /></button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoHelpIcon /></button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoFairnessIcon /></button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><KenoInfoIcon /></button>
                </div>
            </div>

            <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-6 items-center pb-8">
                <KenoControls
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    riskLevel={riskLevel}
                    setRiskLevel={setRiskLevel}
                    gameState={gameState}
                    // FIX: Cannot find name 'onPlay'. Did you mean 'onplay'?
                    onPlay={handlePlay}
                    // FIX: Cannot find name 'onClear'.
                    onClear={handleClear}
                    // FIX: Cannot find name 'onRandom'.
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
                    <KenoPayoutBar multipliers={currentMultipliers} />
                </div>
            </div>
        </div>
    );
};

export default KenoGamePage;