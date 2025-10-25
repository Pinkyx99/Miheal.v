
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Ball } from '../../pages/PlinkoGamePage';
import { MULTIPLIERS } from './plinkoData';
import { Risk, Rows } from './PlinkoControls';

interface PlinkoBoardProps {
  rows: Rows;
  risk: Risk;
  balls: Ball[];
  onAnimationEnd: (ball: Ball) => void;
}

const PEG_SIZE = 8;
const BALL_SIZE = 16;
const ROW_HEIGHT = 32;

const getMultiplierColor = (multiplier: number) => {
  if (multiplier < 1) return 'bg-[#3f488a] text-[#8c9eff]';
  if (multiplier < 2) return 'bg-[#4a54a8] text-[#a4b3ff]';
  if (multiplier < 10) return 'bg-[#4b3d9a] text-[#b3a4ff]';
  if (multiplier < 100) return 'bg-[#6d3a9a] text-[#d3a4ff]';
  return 'bg-[#9a3a8d] text-[#ffa4f2]';
};

const AnimatedBall: React.FC<{ ball: Ball; onEnd: (ball: Ball) => void; boardWidth: number }> = ({ ball, onEnd, boardWidth }) => {
  const [position, setPosition] = useState({ x: boardWidth / 2 - BALL_SIZE / 2, y: 0 });
  const hasEnded = useRef(false);

  useEffect(() => {
    // Path calculation
    const path: { x: number, y: number }[] = [];
    const directions = (ball as any).directions;
    let currentXOffset = 0;

    for (let i = 0; i < directions.length; i++) {
      const y = (i + 1) * ROW_HEIGHT;
      const x = boardWidth / 2 - BALL_SIZE / 2 + currentXOffset * (ROW_HEIGHT / 2) + (directions[i] * (ROW_HEIGHT / 2));
      path.push({ x, y });
      currentXOffset += directions[i];
    }
    
    // Animate through path
    path.forEach((pos, index) => {
      setTimeout(() => {
        if (hasEnded.current) return;
        setPosition(pos);
        if (index === path.length - 1) {
          // Final step: drop into bucket and fade out
          setTimeout(() => {
            if (hasEnded.current) return;
            setPosition(prev => ({ ...prev, y: prev.y + ROW_HEIGHT * 2 }));
            hasEnded.current = true;
            onEnd(ball);
          }, 200);
        }
      }, (index + 1) * 150);
    });

  }, [ball, onEnd, boardWidth]);

  return (
    <div
      className="absolute w-4 h-4 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316] z-10"
      style={{
        left: position.x,
        top: position.y,
        transition: 'all 0.15s ease-in-out',
        opacity: hasEnded.current ? 0 : 1,
      }}
    />
  );
};

export const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ rows, risk, balls, onAnimationEnd }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
      const updateWidth = () => {
          if (boardRef.current) {
              setBoardWidth(boardRef.current.offsetWidth);
          }
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const multipliers = MULTIPLIERS[risk][rows];

  const pegs = useMemo(() => {
    // FIX: Changed `JSX.Element` to `React.ReactElement` to resolve the 'Cannot find namespace JSX' error.
    const pegElements: React.ReactElement[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j <= i; j++) {
        const top = (i + 1) * ROW_HEIGHT;
        const left = `calc(50% + ${j * ROW_HEIGHT - (i * ROW_HEIGHT) / 2}px)`;
        pegElements.push(
          <div
            key={`${i}-${j}`}
            className="absolute w-2 h-2 bg-gray-300 rounded-full"
            style={{
              top: top,
              left: left,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      }
    }
    return pegElements;
  }, [rows]);

  return (
    <div ref={boardRef} className="flex-1 flex flex-col justify-end items-center relative min-h-[550px]">
      {pegs}
      {balls.map(ball => (
          boardWidth > 0 && <AnimatedBall key={ball.id} ball={ball} onEnd={onAnimationEnd} boardWidth={boardWidth} />
      ))}
      <div className="flex" style={{ width: '100%', paddingLeft: `calc(50% - ${(rows + 1) * (ROW_HEIGHT / 2)}px - ${ROW_HEIGHT / 4}px)` }}>
        {multipliers.map((m, i) => (
          <div
            key={i}
            className={`h-10 flex items-center justify-center text-xs font-bold rounded-t-md border-x border-t border-transparent transition-all duration-300 ${getMultiplierColor(m)}`}
            style={{ width: ROW_HEIGHT, minWidth: ROW_HEIGHT }}
          >
            {m === 0 ? 'x' : `${m}x`}
          </div>
        ))}
      </div>
    </div>
  );
};
