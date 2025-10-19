import React from 'react';

interface NumberButtonProps {
    num: number;
    onClick: () => void;
    isSelected: boolean;
    isRevealed: boolean;
    isWinning: boolean;
    isHit: boolean;
    isFinished: boolean;
    isIdle: boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({ num, onClick, isSelected, isRevealed, isWinning, isHit, isFinished, isIdle }) => {
    let baseClasses = 'aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 ease-in-out transform';
    let content = <span className="text-gray-300">{num}</span>;

    if (isFinished) {
        if (isHit) {
            baseClasses += ' bg-green-500/30 border-2 border-green-400 scale-110 shadow-lg shadow-green-500/30';
            content = <img src="https://i.imgur.com/WAV1sfy.png" alt="Gem" className="w-full h-full object-contain p-1" />;
        } else if (isSelected) {
            baseClasses += ' bg-red-500/20 border border-red-500/50 opacity-80'; // Missed selection
        } else if (isWinning) {
            baseClasses += ' bg-gray-600/30'; // Winning number not selected
            content = <span className="text-green-400">{num}</span>;
        } else {
            baseClasses += ' bg-[#2c353d] opacity-40'; // Not involved
        }
    } else if (isRevealed) {
        if (isHit) {
             baseClasses += ' bg-green-500/30 border-2 border-green-400 scale-110';
             content = <img src="https://i.imgur.com/WAV1sfy.png" alt="Gem" className="w-full h-full object-contain p-1 animate-ping-once" />;
        } else {
            baseClasses += ' bg-gray-600/50';
            content = <span className="text-green-400">{num}</span>;
        }
    } else if (isSelected) {
        baseClasses += ' bg-green-600/80 border-2 border-green-400';
        content = <span className="text-white">{num}</span>;
    } else {
        baseClasses += ' bg-[#2c353d] hover:bg-[#3b4650] hover:-translate-y-1';
    }

    return (
        <button onClick={onClick} disabled={!isIdle} className={baseClasses}>
            {content}
            <style>{`
                @keyframes ping-once {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-ping-once {
                    animation: ping-once 0.5s cubic-bezier(0, 0, 0.2, 1);
                }
            `}</style>
        </button>
    );
};

interface KenoGridProps {
    selectedNumbers: Set<number>;
    winningNumbers: Set<number>;
    revealedNumbers: Set<number>;
    hits: Set<number>;
    gameState: 'idle' | 'playing' | 'finished';
    onNumberSelect: (num: number) => void;
}

export const KenoGrid: React.FC<KenoGridProps> = ({ selectedNumbers, winningNumbers, revealedNumbers, hits, gameState, onNumberSelect }) => {
    const numbers = Array.from({ length: 40 }, (_, i) => i + 1);

    const getMessage = () => {
        if (gameState === 'playing') {
            return `Revealed ${revealedNumbers.size} of 10...`;
        }
        if (gameState === 'finished') {
            return `You matched ${hits.size} of ${selectedNumbers.size} numbers!`;
        }
        if (selectedNumbers.size >= 10) {
            return 'Maximum numbers selected';
        }
        return `Select up to 10 numbers`;
    };

    return (
        <div className="flex flex-col w-full">
            <div className="grid grid-cols-8 gap-2">
                {numbers.map(num => (
                    <NumberButton
                        key={num}
                        num={num}
                        onClick={() => onNumberSelect(num)}
                        isSelected={selectedNumbers.has(num)}
                        isRevealed={revealedNumbers.has(num)}
                        isWinning={winningNumbers.has(num)}
                        isHit={hits.has(num) && gameState === 'finished' || (revealedNumbers.has(num) && selectedNumbers.has(num))}
                        isFinished={gameState === 'finished'}
                        isIdle={gameState === 'idle'}
                    />
                ))}
            </div>
            <div className="mt-4 bg-[#1a2127] text-center py-3 rounded-lg text-gray-400 text-sm font-semibold">
                {getMessage()}
            </div>
        </div>
    );
};