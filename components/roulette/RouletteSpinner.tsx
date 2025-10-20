

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RouletteGameState } from '../../types';
import { MutedSoundIcon, InfoCircleIcon, CheckCircleIcon } from '../icons';
import { ROULETTE_ORDER, TILE_WIDTH, TILE_STEP, getNumberColorClass } from '../../lib/rouletteUtils';

// Helper hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

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
        case 'betting':
            const progress = (countdown / 15) * 100;
            return (
                <div className="text-center w-64">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">Spinning in</h2>
                        <p className="font-mono font-bold text-lg text-white">{countdown.toFixed(1)}s</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                                width: `${progress}%`,
                                transition: progress > 99.5 || progress < 0.5 ? 'none' : 'width 0.05s linear'
                            }}
                        />
                    </div>
                </div>
            );
        case 'spinning':
            return (
                <div className="text-center bg-black/30 backdrop-blur-sm p-4 rounded-2xl">
                    <p className="text-xl font-bold text-white animate-pulse">Spinning...</p>
                </div>
            );
        case 'ended': {
             if (winningNumber === null) return <div className="h-24"></div>; // Placeholder
            return (
                <div className="text-center flex items-center space-x-4">
                    <p className="text-lg font-semibold text-text-muted">Landed on</p>
                     <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-bold text-white ${getNumberColorClass(winningNumber)}`}>
                        {winningNumber}
                    </div>
                </div>
            );
        }
        default:
            return <div className="h-24"></div>; // Placeholder to maintain height
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
    const snapTimerRef = useRef<number | null>(null);
    const [viewportWidth, setViewportWidth] = useState(0);
    // FIX: Pass gameState to the usePrevious hook as it expects one argument.
    const prevGameState = usePrevious(gameState);

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
    
        // This is the trigger: when the game transitions from betting to spinning.
        const justStartedSpinning = (prevGameState === 'betting' || !prevGameState) && gameState === 'spinning';
    
        if (justStartedSpinning && winningNumber !== null) {
            // We have the result. Animate the landing now.
            const targetCycle = 45;
            const targetIndexInOrder = ROULETTE_ORDER.indexOf(winningNumber);
            if (targetIndexInOrder === -1) return;
    
            const targetIndex = (targetCycle * ROULETTE_ORDER.length) + targetIndexInOrder;
            
            // Add a random wobble for visual effect, which will be corrected on snap
            const wobble = (Math.random() - 0.5) * (TILE_WIDTH * 0.4);
            const finalTranslate = getTranslateForIndex(targetIndex, wobble);
    
            setIsAnimating(true); // Enable CSS transition
            setTranslateX(finalTranslate);
    
            // After the animation duration, snap to the perfect position without wobble.
            // This is more reliable than using onTransitionEnd events.
            snapTimerRef.current = window.setTimeout(() => {
                const perfectTranslate = getTranslateForIndex(targetIndex, 0);
                setIsAnimating(false); // Disable animation for the final snap
                setTranslateX(perfectTranslate);
            }, 5000); // Animation is 4.5s, 5s gives a safe buffer.
    
        } else if (gameState === 'betting') {
            // In betting phase, rest on the previous winner without animation.
            const restingCycle = 5;
            const prevWinnerIdx = ROULETTE_ORDER.indexOf(previousWinningNumber);
            if (prevWinnerIdx === -1) return;
            const restingIndex = (restingCycle * ROULETTE_ORDER.length) + prevWinnerIdx;
    
            setIsAnimating(false);
            setTranslateX(getTranslateForIndex(restingIndex));
    
        } else if (gameState === 'ended' && winningNumber !== null) {
            // This handles cases where the component loads directly into an 'ended' state,
            // or to ensure it's perfectly snapped after animation.
            const targetCycle = 45; // Use same cycle as spin to prevent visual jumps on re-render
            const winnerIdx = ROULETTE_ORDER.indexOf(winningNumber);
            if (winnerIdx === -1) return;
            const restingIndex = (targetCycle * ROULETTE_ORDER.length) + winnerIdx;
            
            setIsAnimating(false);
            setTranslateX(getTranslateForIndex(restingIndex));
        }
        
    }, [gameState, winningNumber, previousWinningNumber, reel, viewportWidth, getTranslateForIndex, prevGameState]);
    
    return (
        <div className="bg-card pt-4 rounded-xl border border-outline relative overflow-hidden shadow-lg bg-gradient-to-b from-[#1A222D] to-[#12181F]">
            <div className="absolute top-4 right-4 flex justify-end items-center z-30">
                <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><MutedSoundIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><InfoCircleIcon className="w-5 h-5"/></button>
                    <button className="w-8 h-8 rounded-md bg-black/30 text-text-muted hover:text-white transition flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="h-24 flex items-center justify-center z-20 relative">
                 <GameStatusDisplay gameState={gameState} countdown={countdown} winningNumber={winningNumber} />
            </div>
            
            <div className="w-full h-20 relative mt-4 bg-[#0D1316] shadow-inner-strong">
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
                
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0D1316] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0D1316] to-transparent pointer-events-none z-10" />
            </div>
            
            <style>{`
              .shadow-inner-strong {
                  box-shadow: inset 0 4px 8px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.4);
              }
            `}</style>
        </div>
    );
};