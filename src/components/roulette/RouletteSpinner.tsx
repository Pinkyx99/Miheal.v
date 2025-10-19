import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RouletteGameState } from '../../types';
import { MutedSoundIcon, InfoCircleIcon, CheckCircleIcon } from '../icons';
import { ROULETTE_ORDER, TILE_WIDTH, TILE_GAP, TILE_STEP, getNumberColorClass } from '../../lib/rouletteUtils';

interface RouletteSpinnerProps {
    gameState: RouletteGameState | null;
    winningNumber: number | null;
    previousWinningNumber: number;
    countdown: number;
}

const NumberTile: React.FC<{ num: number }> = React.memo(({ num }) => (
    <div className={`w-20 h-20 flex-shrink-0 rounded-lg flex items-center justify-center text-3xl font-bold text-white shadow-md ${getNumberColorClass(num)}`} aria-label={`Number ${num}`}>
        {num}
    </div>
));

const GameStatusDisplay: React.FC<{ gameState: RouletteGameState | null; countdown: number; winningNumber: number | null }> = ({ gameState, countdown, winningNumber }) => {
    switch (gameState) {
        case 'betting': {
            const progress = (countdown / 15) * 100;
            return (
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-lg font-bold text-white">Spinning in</h2>
                    <p className="font-display font-bold text-4xl text-white my-1">{countdown.toFixed(2)}s</p>
                    <div className="w-64 h-[5px] bg-black/30 rounded-full overflow-hidden mt-1">
                        <div 
                            className="bg-red-500 h-full" 
                            style={{ 
                                width: `${progress}%`,
                                transition: progress > 99.5 || progress < 0.5 ? 'none' : 'width 0.05s linear'
                            }}
                        ></div>
                    </div>
                </div>
            );
        }
        case 'spinning': {
            return (
                <div className="text-center flex flex-col items-center">
                    <p className="text-lg font-bold text-white">Spinning...</p>
                     <div className="w-48 h-[3px] bg-white/20 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 animate-spin-progress"></div>
                    </div>
                </div>
            );
        }
        case 'ended': {
             if (winningNumber === null) return <div className="h-20"></div>;
            return (
                <div className="text-center flex flex-col items-center">
                    <p className="text-base font-semibold text-text-muted">Landed on</p>
                     <div className={`w-16 h-16 mt-1 rounded-lg flex items-center justify-center text-4xl font-bold text-white ${getNumberColorClass(winningNumber)}`}>
                        {winningNumber}
                    </div>
                </div>
            );
        }
        default:
            return <div className="h-20"></div>; // Placeholder to maintain height
    }
};

const TopArrowMarker: React.FC = () => (
    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <svg width="24" height="14" viewBox="0 0 24 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-lg">
            <path d="M0 0 L24 0 L12 14 Z" />
        </svg>
    </div>
);


export const RouletteSpinner: React.FC<RouletteSpinnerProps> = ({ gameState, winningNumber, previousWinningNumber, countdown }) => {
    const [reel, setReel] = useState<number[]>([]);
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const viewportRef = useRef<HTMLDivElement>(null);
    // FIX: Initialize useRef with null and update type to handle timer IDs correctly, resolving a potential type error.
    const snapTimerRef = useRef<number | null>(null);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => viewportRef.current && setViewportWidth(viewportRef.current.offsetWidth);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const REEL_CYCLES = 60;
        setReel(Array.from({ length: ROULETTE_ORDER.length * REEL_CYCLES }, (_, i) => ROULETTE_ORDER[i % ROULETTE_ORDER.length]));
    }, []);
    
    const getTranslateForIndex = useCallback((index: number, wobble = 0): number => {
        if (viewportWidth === 0) return 0;
        const centerOffset = viewportWidth / 2 - TILE_WIDTH / 2;
        const targetPosition = index * TILE_STEP;
        return centerOffset - targetPosition + wobble;
    }, [viewportWidth]);

    useEffect(() => {
        if (reel.length === 0 || viewportWidth === 0) return;
        if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

        if (gameState === 'spinning' && winningNumber !== null) {
            const targetCycle = 45; // Pick a cycle deep into the reel for a long spin
            const targetIndexInOrder = ROULETTE_ORDER.indexOf(winningNumber);
            if (targetIndexInOrder === -1) return;

            const targetIndex = (targetCycle * ROULETTE_ORDER.length) + targetIndexInOrder;
            
            // Wobble for visual randomness during spin, which will be corrected on snap
            const wobble = (Math.random() - 0.5) * (TILE_WIDTH * 0.4);
            const finalTranslate = getTranslateForIndex(targetIndex, wobble);
            
            setIsAnimating(true);
            setTranslateX(finalTranslate);

            // RELIABLE SNAP: A setTimeout is more robust than onTransitionEnd events.
            // After the animation duration, we force the reel to the perfect position.
            snapTimerRef.current = window.setTimeout(() => {
                 const perfectTranslate = getTranslateForIndex(targetIndex, 0);
                 setIsAnimating(false); // Disable animation for the final snap
                 setTranslateX(perfectTranslate);
            }, 5000); // Animation is 4.5s, 5s gives a safe buffer.

        } else if (gameState === 'ended' && winningNumber !== null) {
             // When the round has ended, ensure we are snapped perfectly to the winner.
             // This handles cases where the component might re-render.
            const targetCycle = 45; // Use the same cycle as the spin to prevent visual jumps
            const winnerIdx = ROULETTE_ORDER.indexOf(winningNumber);
            if (winnerIdx === -1) return;
            const restingIndex = (targetCycle * ROULETTE_ORDER.length) + winnerIdx;
            
            setIsAnimating(false);
            setTranslateX(getTranslateForIndex(restingIndex, 0));

        } else if (gameState === 'betting') {
            // Before a new spin, rest on the previous winner.
            const restingCycle = 5; // Use a closer cycle for efficiency.
            const prevWinnerIdx = ROULETTE_ORDER.indexOf(previousWinningNumber);
            if (prevWinnerIdx === -1) return;
            const restingIndex = (restingCycle * ROULETTE_ORDER.length) + prevWinnerIdx;
            
            setIsAnimating(false);
            setTranslateX(getTranslateForIndex(restingIndex, 0));
        }

    }, [gameState, winningNumber, previousWinningNumber, reel, viewportWidth, getTranslateForIndex]);
    
    return (
        <div className="bg-card-bg pt-4 rounded-xl border border-outline relative overflow-hidden shadow-lg">
            {/* Decorative Green Circles */}
            <div className="absolute top-1/2 -translate-y-1/2 left-8 w-12 h-12 rounded-full border-2 border-accent-green opacity-40 shadow-[0_0_25px_theme(colors.accent-green)] z-0 pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 left-20 w-16 h-16 rounded-full border-2 border-accent-green opacity-20 shadow-[0_0_25px_theme(colors.accent-green)] z-0 pointer-events-none" />

            <div className="absolute top-4 right-4 flex justify-end items-center z-20">
                <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><MutedSoundIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><InfoCircleIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="h-28 flex items-center justify-center">
                <GameStatusDisplay gameState={gameState} countdown={countdown} winningNumber={winningNumber} />
            </div>

            <div className="w-full h-20 relative">
                <TopArrowMarker />
                <div ref={viewportRef} className="h-full w-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 flex items-center gap-2"
                        style={{
                            transform: `translate3d(${translateX}px, 0, 0)`,
                            transition: isAnimating
                                ? 'transform 4500ms cubic-bezier(0.15, 0.85, 0.35, 1)'
                                : 'none',
                            willChange: 'transform'
                        }}
                    >
                        {reel.map((num, index) => <NumberTile key={index} num={num} />)}
                    </div>
                </div>
                
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card-bg via-card-bg/80 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-card-bg via-card-bg/80 to-transparent pointer-events-none z-10" />
            </div>
            
            <style>{`
              @keyframes spin-progress-bar-anim {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-spin-progress {
                width: 50%;
                animation: spin-progress-bar-anim 1.5s linear infinite;
              }
            `}</style>
        </div>
    );
};