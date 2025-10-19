

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { CashoutEvent, GameState } from '../../types';

interface GameDisplayProps {
    gameState: GameState;
    countdown: number;
    multiplier: number;
    cashoutEvents: CashoutEvent[];
}

interface DisplayState {
    text: string;
    subtext: string;
    color: string;
    progress: number | null;
}

const GROWTH_CONSTANT_K = 0.07;

// A helper function to create scaling functions, to avoid repetition.
const getScalingFunctions = (
    width: number,
    height: number,
    xAxisMax: number,
    yAxisMax: number
) => {
    const PADDING = { top: 30, bottom: 40, left: 0, right: 50 };
    const GRAPH_WIDTH = width - PADDING.left - PADDING.right;
    const GRAPH_HEIGHT = height - PADDING.top - PADDING.bottom;

    const multiplierToY = (m: number) => {
        const logMax = Math.log(yAxisMax);
        const logMin = Math.log(1);
        const logM = Math.log(Math.max(1, m));
        const percentage = (logM - logMin) / (logMax - logMin) || 0;
        return PADDING.top + GRAPH_HEIGHT - (percentage * GRAPH_HEIGHT);
    };

    const timeToX = (s: number) => {
        const logMax = Math.log(xAxisMax);
        const logMin = Math.log(0.1);
        const logT = Math.log(Math.max(0.1, s));
        const percentage = (logT - logMin) / (logMax - logMin) || 0;
        return PADDING.left + percentage * GRAPH_WIDTH;
    };

    return { timeToX, multiplierToY, PADDING };
};


export const GameDisplay: React.FC<GameDisplayProps> = ({ gameState, countdown, multiplier, cashoutEvents }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineCanvasRef = useRef<HTMLCanvasElement>(null);
    const markersCanvasRef = useRef<HTMLCanvasElement>(null);
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);

    const [axisMax, setAxisMax] = useState({ y: 2.0, x: 8.0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const drawnMarkersRef = useRef(new Set<string>());
    const lastAxisMaxRef = useRef(axisMax);

    const resizeCanvases = useCallback(() => {
        const canvases = [lineCanvasRef.current, markersCanvasRef.current, gridCanvasRef.current];
        const container = containerRef.current;
        if (!canvases.every(c => c) || !container) return;

        const { width, height } = container.getBoundingClientRect();
        if (dimensions.width !== width || dimensions.height !== height) {
            canvases.forEach(canvas => {
                if(canvas) {
                    canvas.width = width;
                    canvas.height = height;
                }
            });
            setDimensions({ width, height });
        }
    }, [dimensions.width, dimensions.height]);

    useEffect(() => {
        resizeCanvases();
        const resizeObserver = new ResizeObserver(resizeCanvases);
        const container = containerRef.current;
        if (container) resizeObserver.observe(container);
        return () => { if (container) resizeObserver.unobserve(container); };
    }, [resizeCanvases]);

    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'connecting') {
            [lineCanvasRef, markersCanvasRef].forEach(ref => {
                const ctx = ref.current?.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            });
            drawnMarkersRef.current.clear();
            setAxisMax({ y: 2.0, x: 8.0 });
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'running') return;
        const elapsedSeconds = multiplier > 1 ? Math.log(multiplier) / GROWTH_CONSTANT_K : 0;
        const yAxisMax = Math.max(2.0, multiplier * 1.25);
        const xAxisMax = Math.max(8.0, elapsedSeconds * 1.25);
        
        if (yAxisMax > axisMax.y || xAxisMax > axisMax.x) {
            setAxisMax({ y: yAxisMax, x: xAxisMax });
        }
    }, [multiplier, gameState, axisMax.x, axisMax.y]);

    // GRID drawing effect
    useEffect(() => {
        const ctx = gridCanvasRef.current?.getContext('2d');
        if (!ctx || dimensions.width === 0) return;
        const { width, height } = dimensions;
        
        ctx.clearRect(0, 0, width, height);
        
        const { timeToX, multiplierToY, PADDING } = getScalingFunctions(width, height, axisMax.x, axisMax.y);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '12px Inter';
        ctx.lineWidth = 1;

        const xLabels = new Set<number>();
        const xInterval = axisMax.x < 10 ? 1 : axisMax.x < 20 ? 2 : 5;
        for (let i = xInterval; i < axisMax.x; i += xInterval) xLabels.add(Math.round(i));
        xLabels.forEach(label => ctx.fillText(`${label}s`, timeToX(label) - 5, height - PADDING.bottom + 20));
        
        const yLabels = new Set([1]);
        const yInterval = axisMax.y < 5 ? 0.5 : axisMax.y < 10 ? 1 : Math.pow(10, Math.floor(Math.log10(axisMax.y / 4)));
        for (let i = 1; i * yInterval < axisMax.y; i++) yLabels.add(Math.round(i * yInterval * 10) / 10);
        yLabels.forEach(label => {
            const y = multiplierToY(label);
            ctx.beginPath();
            ctx.moveTo(PADDING.left, y);
            ctx.lineTo(width - PADDING.right, y);
            ctx.stroke();
            ctx.fillText(`${label.toFixed(label < 5 ? 1 : 0)}x`, width - PADDING.right + 5, y + 4);
        });
    }, [axisMax, dimensions]);

    // MARKERS drawing effect
    useEffect(() => {
        const ctx = markersCanvasRef.current?.getContext('2d');
        if (!ctx || dimensions.width === 0) return;
        const { width, height } = dimensions;

        const hasAxisChanged = lastAxisMaxRef.current.x !== axisMax.x || lastAxisMaxRef.current.y !== axisMax.y;
        if (hasAxisChanged) {
            ctx.clearRect(0, 0, width, height);
            drawnMarkersRef.current.clear();
            lastAxisMaxRef.current = axisMax;
        }

        const { timeToX, multiplierToY } = getScalingFunctions(width, height, axisMax.x, axisMax.y);
        
        cashoutEvents.forEach(event => {
            if (!drawnMarkersRef.current.has(event.id) || hasAxisChanged) {
                const eventElapsedSeconds = Math.log(event.cashoutMultiplier) / GROWTH_CONSTANT_K;
                const x = timeToX(eventElapsedSeconds);
                const y = multiplierToY(event.cashoutMultiplier);
                
                if (x < width - 20 && y > 20) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 11px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(`$${event.profit.toFixed(2)}`, x, y - 20);
                    ctx.fillStyle = '#9CA3AF';
                    ctx.font = '11px Inter';
                    ctx.fillText(`${event.cashoutMultiplier.toFixed(2)}x`, x, y - 8);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.font = '16px sans-serif';
                    ctx.fillText('🐾', x, y + 6);
                }
                drawnMarkersRef.current.add(event.id);
            }
        });
    }, [cashoutEvents, axisMax, dimensions]);

    // LINE drawing effect (animation loop)
    useEffect(() => {
        const ctx = lineCanvasRef.current?.getContext('2d');
        if (!ctx || dimensions.width === 0) return;
        const { width, height } = dimensions;

        ctx.clearRect(0, 0, width, height);

        if (gameState !== 'running' && gameState !== 'crashed' && gameState !== 'resetting') return;

        const { timeToX, multiplierToY, PADDING } = getScalingFunctions(width, height, axisMax.x, axisMax.y);
        const elapsedSeconds = multiplier > 1 ? Math.log(multiplier) / GROWTH_CONSTANT_K : 0;
        
        const points = [];
        const numPoints = 150; // Reduced from 200 for performance
        for (let i = 0; i <= numPoints; i++) {
            const t = (i / numPoints) * elapsedSeconds;
            const m = Math.exp(GROWTH_CONSTANT_K * t);
            if (m > multiplier * 1.01) break;
            points.push({ x: timeToX(t), y: multiplierToY(m) });
        }
        if (points.length === 0 || (points.length > 0 && points[points.length-1].y > multiplierToY(multiplier))) {
            points.push({ x: timeToX(elapsedSeconds), y: multiplierToY(multiplier) });
        }

        if (points.length > 0) {
            const path = new Path2D();
            path.moveTo(PADDING.left, height - PADDING.bottom);
            points.forEach(p => path.lineTo(p.x, p.y));

            const fillPath = new Path2D(path);
            fillPath.lineTo(points[points.length - 1].x, height - PADDING.bottom);
            fillPath.closePath();

            const color = (gameState === 'crashed' || gameState === 'resetting') ? '#ef4444' : '#00E794';
            const gradientColor = (gameState === 'crashed' || gameState === 'resetting') ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 193, 123, 0.4)';
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, gradientColor);
            gradient.addColorStop(1, 'rgba(13, 19, 22, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fill(fillPath);

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke(path);

            if (points.length > 1 && gameState === 'running') {
                const lastPoint = points[points.length - 1];
                const prevPoint = points[points.length - 2];
                const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);
                ctx.save();
                ctx.fillStyle = color;
                ctx.translate(lastPoint.x, lastPoint.y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-12, 6);
                ctx.lineTo(-12, -6);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    }, [multiplier, gameState, axisMax, dimensions]);

    const getDisplayState = (): DisplayState => {
        switch(gameState) {
            case 'connecting':
                return { text: '', subtext: 'Connecting...', color: 'text-text-muted', progress: null };
            case 'waiting':
                const progress = countdown ? (1 - (countdown / (7000/1000))) * 100 : 0;
                return { 
                    text: countdown ? countdown.toFixed(1) + 's' : '7.0s', 
                    subtext: 'SPINNING IN', 
                    color: 'text-white', 
                    progress: progress
                };
            case 'running':
                return { 
                    text: `${multiplier.toFixed(2)}x`, 
                    subtext: '', 
                    color: 'text-[#00E794]', 
                    progress: null 
                };
            case 'crashed':
                return { 
                    text: `${(multiplier || 1.00).toFixed(2)}x`, 
                    subtext: 'CRASHED', 
                    color: 'text-red-500', 
                    progress: null 
                };
            case 'resetting':
                 return { 
                    text: `${(multiplier || 1.00).toFixed(2)}x`, 
                    subtext: 'Next round starting...', 
                    color: 'text-text-muted', 
                    progress: null 
                };
            default:
                 return { text: '', subtext: 'Connecting...', color: 'text-text-muted', progress: null };
        }
    };

    const { text, subtext, color, progress } = getDisplayState();

    return (
        <div ref={containerRef} className={`bg-[#1A222D] rounded-t-lg relative flex-1 w-full flex items-center justify-center border border-b-0 border-white/5 aspect-[756/495] ${gameState === 'running' ? 'running-glow' : ''}`}>
            <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full" />
            <canvas ref={markersCanvasRef} className="absolute inset-0 w-full h-full" />
            <canvas ref={lineCanvasRef} className="absolute inset-0 w-full h-full" />
            <div className="relative text-center z-10 pointer-events-none">
                {subtext && <p className="text-sm font-bold uppercase tracking-wider text-text-muted">{subtext}</p>}
                <p className={`font-display font-bold text-5xl sm:text-7xl transition-colors duration-200 ${color}`}>
                    {text}
                </p>
            </div>
            {progress !== null && (
                 <div className="absolute bottom-0 left-0 h-1 bg-white" style={{ width: `${progress}%` }}></div>
            )}
            <style>{`
                .running-glow {
                    position: relative;
                    overflow: hidden;
                }
                .running-glow::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(from 180deg at 50% 50%, transparent, #00e794, transparent);
                    animation: rotateGlow 4s linear infinite;
                    z-index: 1;
                    pointer-events: none;
                }
                .running-glow::after {
                    content: '';
                    position: absolute;
                    inset: 2px;
                    background-color: #1A222D;
                    border-radius: 0.45rem;
                    z-index: 1;
                }
                canvas, .relative.z-10 { z-index: 2; }
                @keyframes rotateGlow {
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};