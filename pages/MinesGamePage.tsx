
import React, { useState, useCallback, useMemo } from 'react';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { MinesControls } from '../components/mines/MinesControls';
import { MinesGrid } from '../components/mines/MinesGrid';
import { supabase } from '../lib/supabaseClient';
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

interface MinesGamePageProps {
    profile: Profile | null;
    session: Session | null;
    onProfileUpdate: () => void;
}

// --- Multiplier Calculation ---
const HOUSE_EDGE = 0.01; // 1%

function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

const calculateMultiplier = (gemsRevealed: number, mines: number): number => {
    if (gemsRevealed === 0) return 1;
    if (25 - mines < gemsRevealed) return 0; // Should not happen with valid input
    const multiplier = (1 - HOUSE_EDGE) * combinations(25, gemsRevealed) / combinations(25 - mines, gemsRevealed);
    return multiplier;
};


const MinesGamePage: React.FC<MinesGamePageProps> = ({ profile, session, onProfileUpdate }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted' | 'cashed_out'>('idle');
    const [betAmount, setBetAmount] = useState(0.01);
    const [numMines, setNumMines] = useState(1);
    const [gridState, setGridState] = useState<( 'hidden' | 'gem' | 'mine' )[]>(Array(25).fill('hidden'));
    const [mineLocations, setMineLocations] = useState<Set<number>>(new Set());
    const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
    const [profit, setProfit] = useState(0.00);
    const [error, setError] = useState<string | null>(null);

    const resetGame = useCallback((isNewGame = true) => {
        setGameState('idle');
        setProfit(0.00);
        setRevealedTiles(new Set());
        if(isNewGame){
            setGridState(Array(25).fill('hidden'));
            setMineLocations(new Set());
        }
    }, []);

    const handleStartGame = useCallback(async () => {
        if (gameState !== 'idle') return;
        if (!session || !profile || betAmount > profile.balance) {
            setError("Insufficient funds.");
            return;
        }
        
        const { error: rpcError } = await supabase.rpc('place_mines_bet', { bet_amount_in: betAmount });

        if (rpcError) {
            setError(rpcError.message || "Failed to place bet.");
            return;
        }

        if (session) {
            const { error: gamesPlayedError } = await supabase.rpc('increment_games_played', { p_user_id: session.user.id });
            if (gamesPlayedError) console.error("Error incrementing games_played for Mines:", gamesPlayedError.message);
        }

        onProfileUpdate();
        resetGame(true);
        
        const serverSeed = Math.random().toString(36).substring(2);
        const hashSeed = `${serverSeed}:client-seed-placeholder:1`;
        const hashHex = await sha256Hex(hashSeed);
        const seedArray = hexToUint32Array(hashHex);
        const rng = makeXorshift32(seedArray);

        const cells = Array.from({ length: 25 }, (_, i) => i);
        const shuffledCells = seededShuffle(cells, rng);
        const newMineLocations = new Set<number>(shuffledCells.slice(0, numMines));
        
        setMineLocations(newMineLocations);
        setGameState('playing');
    }, [numMines, gameState, resetGame, betAmount, profile, onProfileUpdate, session]);
    
    const showFinalGrid = useCallback((hitMineIndex?: number) => {
         const finalGrid = Array(25).fill('hidden').map((_, i) => {
            if (mineLocations.has(i)) return 'mine';
            if (revealedTiles.has(i)) return 'gem';
            return 'hidden'; // This will be rendered as a faded tile
        });
        if(typeof hitMineIndex === 'number') finalGrid[hitMineIndex] = 'mine';
        setGridState(finalGrid);
    }, [mineLocations, revealedTiles]);

    const handleTileClick = useCallback((index: number) => {
        if (gameState !== 'playing' || revealedTiles.has(index)) return;

        const newRevealedTiles = new Set(revealedTiles);
        const newGridState = [...gridState];

        if (mineLocations.has(index)) {
            setGameState('busted');
            showFinalGrid(index);
        } else {
            newRevealedTiles.add(index);
            setRevealedTiles(newRevealedTiles);
            newGridState[index] = 'gem';
            setGridState(newGridState);
            
            // Calculate new profit based on multiplier
            const gemsRevealedCount = newRevealedTiles.size;
            const multiplier = calculateMultiplier(gemsRevealedCount, numMines);
            const newProfit = betAmount * multiplier - betAmount;
            setProfit(newProfit);
        }
    }, [gameState, mineLocations, gridState, revealedTiles, betAmount, numMines, showFinalGrid]);

    const handleCashout = useCallback(async () => {
        if (gameState !== 'playing' || revealedTiles.size === 0) return;

        const payoutAmount = betAmount + profit;

        if (payoutAmount > 0 && session) {
            try {
                const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
                if (fetchError) throw fetchError;
                if (!currentProfile) throw new Error("Could not find user profile.");

                const newBalance = (Number(currentProfile.balance) || 0) + payoutAmount;
                const { error: payoutError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
                if (payoutError) throw payoutError;
            } catch (e: any) {
                setError(e.message || "Cashout failed.");
                return;
            }
        }

        onProfileUpdate();
        setGameState('cashed_out');
        showFinalGrid();
    }, [gameState, revealedTiles.size, profit, betAmount, session, showFinalGrid, onProfileUpdate]);
    
    return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-[1200px] aspect-[1200/715] bg-card border border-outline rounded-lg shadow-2xl relative">
                
                <header className="absolute top-5 left-8 right-8 flex justify-between items-start z-10">
                    <Logo />
                    <TopToolbar />
                </header>
                
                <main className="w-full h-full flex items-center justify-center gap-6">
                    <MinesControls
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        numMines={numMines}
                        setNumMines={setNumMines}
                        gameState={gameState}
                        onStartGame={handleStartGame}
                        onCashout={handleCashout}
                        profit={profit}
                        onReset={() => resetGame(true)}
                        profile={profile}
                        error={error}
                        setError={setError}
                    />
                    <div className="p-4 bg-[#1a2127]/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
                        <MinesGrid
                            gridState={gridState}
                            onTileClick={handleTileClick}
                            gameState={gameState}
                        />
                    </div>
                </main>
                
                <footer className="absolute bottom-5 left-8 z-10">
                    <Logo className="h-8 opacity-70" />
                </footer>
            </div>
        </div>
    );
};
export default MinesGamePage;
