import React, { useRef, useCallback, useEffect, useState } from 'react';
// FIX: Update import path for RollResult type
import { RollResult } from '../../types';

interface DiceDisplayProps {
    rollValue: number;
    isRollOver: boolean;
    gameState: 'idle' | 'rolling' | 'finished';
    lastRoll: RollResult | null;
    onRollValueChange: (value: number) => void;
    previousRollValue: number;
}

// FIX: Add lastRoll to props to fix compilation error.
const Needle: React.FC<{ angle: number, isRolling: boolean, lastRoll: RollResult | null }> = ({ angle, isRolling, lastRoll }) => (
    <div 
        className="absolute bottom-0 left-1/2 w-1 h-1/2 origin-bottom transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
    >
        <div className={`w-full h-full rounded-t-full ${isRolling ? 'bg-white' : (lastRoll?.win ? 'bg-accent-green' : 'bg-red-500')}`}></div>
    </div>
);


export const DiceDisplay: React.FC<DiceDisplayProps> = ({ rollValue, isRollOver, gameState, lastRoll, onRollValueChange, previousRollValue }) => {
    const dialRef = useRef<HTMLDivElement>(null);
    const numberDisplayRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    
    // State for needle animation
    const [startAngle, setStartAngle] = useState((previousRollValue / 100) * 180 - 90);
    const [finalAngle, setFinalAngle] = useState((previousRollValue / 100) * 180 - 90);

    // Number ticker animation
    useEffect(() => {
        const animate = () => {
            if (numberDisplayRef.current) {
                numberDisplayRef.current.textContent = (Math.random() * 100).toFixed(2);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (gameState === 'rolling') {
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState]);

    // Needle animation logic
    useEffect(() => {
        if (gameState === 'rolling') {
            setStartAngle(finalAngle); // Start from where the last roll ended
        }
        if (gameState === 'finished' && lastRoll) {
            setFinalAngle((lastRoll.value / 100) * 180 - 90);
        }
    }, [gameState, lastRoll, finalAngle]);


    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (!dialRef.current) return;
        const rect = dialRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height; // Origin is bottom-center
        
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        angle = Math.max(0, Math.min(180, angle));

        onRollValueChange((angle / 180) * 100);

    }, [onRollValueChange]);

    const handlePointerUp = useCallback(() => {
        document.body.style.cursor = 'default';
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gameState !== 'idle' || !dialRef.current) return;
        document.body.style.cursor = 'grabbing';
        
        // Directly calculate and apply the value on first click
        const rect = dialRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height;
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        angle = Math.max(0, Math.min(180, angle));
        onRollValueChange((angle / 180) * 100);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [gameState, handlePointerMove, handlePointerUp, onRollValueChange]);

    const winPercentage = isRollOver ? 100 - rollValue : rollValue;

    const conicGradient = isRollOver
        ? `conic-gradient(from -90deg at 50% 100%, #16a34a 0%, #16a34a ${winPercentage}%, #ef4444 ${winPercentage}%, #ef4444 100%)`
        : `conic-gradient(from -90deg at 50% 100%, #16a34a 0%, #16a34a ${winPercentage}%, #ef4444 ${winPercentage}%, #ef4444 100%)`;


    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[350px] overflow-hidden">
            <div className="w-full max-w-lg aspect-[2/1] relative">
                <div 
                    ref={dialRef}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    onPointerDown={handlePointerDown}
                    style={{
                        '--start-angle': `${startAngle}deg`,
                        '--final-angle': `${finalAngle}deg`,
                    } as React.CSSProperties}
                >
                    {/* Dial Background */}
                    <div className="w-full h-full rounded-t-full bg-gradient-to-b from-[#0f1519] to-[#1a2127] border-b-2 border-white/10" style={{
                        clipPath: 'path("M 0 100 A 100 100 0 0 1 200 100 L 200 200 L 0 200 Z")',
                        transform: 'scale(2)',
                        transformOrigin: 'bottom'
                    }}/>
                    {/* Color Arc */}
                    <div 
                        className="absolute inset-0 rounded-t-full transition-all duration-200"
                        style={{ background: conicGradient, mask: 'radial-gradient(transparent 65%, black 66%)' }}
                    />
                    
                    {/* Ticks */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <div key={val} className="absolute bottom-0 left-1/2 w-px h-1/2 origin-bottom text-text-muted" style={{ transform: `translateX(-50%) rotate(${(val/100)*180 - 90}deg)`}}>
                           <div className="w-px h-2 bg-text-muted/50"></div>
                           <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs" style={{transform: `translateX(-50%) rotate(${90 - (val/100)*180}deg)`}}>{val}</span>
                        </div>
                    ))}

                    {/* Needle */}
                    <div className={`absolute bottom-0 left-1/2 w-1 h-1/2 origin-bottom needle ${gameState}`}>
                        <div className={`w-full h-full rounded-t-full needle-body ${lastRoll?.win ? 'win' : 'loss'}`}></div>
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#081018] border-2 border-white/50"></div>
                    </div>
                </div>
            </div>

            {/* Central Display */}
            <div className="absolute bottom-1/2 translate-y-[40%] text-center pointer-events-none">
                <div className="flex items-center justify-center transition-opacity" style={{ opacity: gameState === 'idle' ? 1 : 0}}>
                     <span className={`font-bold text-lg ${isRollOver ? 'text-accent-green' : 'text-red-500'}`}>{isRollOver ? 'Over' : 'Under'}</span>
                     <span className="font-bold text-4xl text-white mx-2">{rollValue.toFixed(2)}</span>
                </div>
                
                 {/* Rolling Ticker */}
                 <div ref={numberDisplayRef} className={`absolute inset-0 font-mono font-bold text-6xl text-white tabular-nums transition-opacity ${gameState === 'rolling' ? 'opacity-100' : 'opacity-0'}`}>
                    0.00
                </div>

                {/* Final Result */}
                 <div className={`absolute inset-0 font-mono font-bold text-6xl tabular-nums transition-all duration-300 transform ${gameState === 'finished' && lastRoll ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} ${lastRoll?.win ? 'text-accent-green' : 'text-red-500'}`}
                     style={{ textShadow: lastRoll?.win ? '0 0 20px rgba(100, 255, 218, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)' }}>
                    {lastRoll?.value.toFixed(2)}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: translateX(-50%) rotate(var(--start-angle)); }
                    100% { transform: translateX(-50%) rotate(calc(var(--start-angle) + 360deg)); }
                }
                .needle.rolling {
                    animation: spin 0.5s linear infinite;
                }
                .needle.finished {
                    transform: translateX(-50%) rotate(var(--final-angle));
                    transition: transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .needle.idle {
                     transform: translateX(-50%) rotate(${ (rollValue / 100) * 180 - 90 }deg);
                     transition: transform 0.2s ease-out;
                }
                .needle-body { background-color: white; }
                .needle-body.win { background-color: #64ffda; }
                .needle-body.loss { background-color: #ef4444; }
            `}</style>
        </div>
    );
};
