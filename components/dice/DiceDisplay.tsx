
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { RollResult } from '../../types';

interface DiceDisplayProps {
    rollValue: number;
    isRollOver: boolean;
    gameState: 'idle' | 'rolling' | 'finished';
    lastRoll: RollResult | null;
    onRollValueChange: (value: number) => void;
    previousRollValue: number;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ rollValue, isRollOver, gameState, lastRoll, onRollValueChange, previousRollValue }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const numberDisplayRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const [isDragging, setIsDragging] = useState(false);
    
    const [markerPos, setMarkerPos] = useState(previousRollValue);
    const [showMarker, setShowMarker] = useState(false);

    useEffect(() => {
        // Ticking number animation
        const animate = () => {
            if (numberDisplayRef.current) {
                numberDisplayRef.current.textContent = (Math.random() * 100).toFixed(2);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (gameState === 'rolling') {
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        // Marker position animation
        if (gameState === 'rolling') {
            setShowMarker(false);
            setMarkerPos(previousRollValue);
        } else if (gameState === 'finished' && lastRoll) {
            setShowMarker(true);
            setMarkerPos(lastRoll.value);
        } else if (gameState === 'idle') {
            setShowMarker(false);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState, lastRoll, previousRollValue]);


    const handleValueChange = useCallback((clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        onRollValueChange(percent * 100);
    }, [onRollValueChange]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (gameState !== 'idle' || !e.currentTarget.contains(e.target as Node)) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        handleValueChange(e.clientX);
    }, [gameState, handleValueChange]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        handleValueChange(e.clientX);
    }, [isDragging, handleValueChange]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setIsDragging(false);
    }, []);

    const rollValuePercent = rollValue / 100;

    const winRegionGlowClass = gameState === 'finished' && lastRoll?.win ? 'animate-win-glow' : '';

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <style>{`
                @keyframes win-glow {
                    0%, 100% { box-shadow: 0 0 4px #64ffda; }
                    50% { box-shadow: 0 0 16px #64ffda, 0 0 24px #64ffda; }
                }
                .animate-win-glow {
                    animation: win-glow 1.5s ease-in-out;
                }
            `}</style>

            {/* Central Number Display */}
            <div className="relative h-24 flex items-center justify-center">
                 <div className={`transition-opacity duration-300 ${gameState === 'idle' ? 'opacity-100' : 'opacity-0'}`}>
                    <span className={`font-bold text-xl ${isRollOver ? 'text-accent-green' : 'text-red-500'}`}>{isRollOver ? 'Over' : 'Under'}</span>
                    <span className="font-bold text-5xl text-white mx-2">{rollValue.toFixed(2)}</span>
                </div>
                <div ref={numberDisplayRef} className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-6xl tabular-nums transition-all duration-300 ${gameState === 'rolling' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    0.00
                </div>
                {lastRoll && (
                    <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-6xl tabular-nums transition-all duration-300 ${gameState === 'finished' ? 'opacity-100 scale-110' : 'opacity-0 scale-75'} ${lastRoll.win ? 'text-accent-green' : 'text-red-500'}`}>
                        {lastRoll.value.toFixed(2)}
                    </div>
                )}
            </div>

            {/* Slider */}
            <div className="w-full max-w-2xl mt-8">
                <div
                    ref={sliderRef}
                    className="relative h-8 cursor-pointer"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    {/* Track Background */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-background rounded-full" />
                    
                    {/* Win/Loss Regions */}
                    <div className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${isRollOver ? 'bg-red-500' : 'bg-accent-green'} ${!isRollOver ? winRegionGlowClass : ''}`} style={{ width: `calc(${rollValuePercent * 100}% - 4px)`, left: '2px' }} />
                    <div className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${isRollOver ? 'bg-accent-green' : 'bg-red-500'} ${isRollOver ? winRegionGlowClass : ''}`} style={{ width: `calc(${(1 - rollValuePercent) * 100}% - 4px)`, right: '2px' }} />
                    
                    {/* Draggable Thumb */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-card shadow-lg" style={{ left: `${rollValuePercent * 100}%` }} />

                    {/* Result Marker */}
                    <div
                        className="absolute -translate-x-1/2"
                        style={{
                            left: `${markerPos}%`,
                            top: '-24px',
                            opacity: showMarker ? 1 : 0,
                            transition: 'left 1s ease-out, opacity 0.3s ease-in-out',
                        }}
                    >
                        <svg className={`w-5 h-5 drop-shadow-lg ${lastRoll?.win ? 'text-accent-green' : 'text-red-500'}`} viewBox="0 0 24 14" fill="currentColor"><path d="M12 14L0 0h24L12 14z" /></svg>
                    </div>
                </div>

                {/* Number Line */}
                <div className="flex justify-between mt-2 text-xs text-text-muted">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    );
};