
import React from 'react';

interface MinesGridProps {
    gridState: ('hidden' | 'gem' | 'mine')[];
    onTileClick: (index: number) => void;
    gameState: 'idle' | 'playing' | 'busted' | 'cashed_out';
}

const Tile: React.FC<{
    state: 'hidden' | 'gem' | 'mine';
    onClick: () => void;
    isRevealed: boolean;
    gameState: MinesGridProps['gameState'];
}> = React.memo(({ state, onClick, isRevealed, gameState }) => {
    
    const isPlaying = gameState === 'playing';
    const isFinished = gameState === 'busted' || gameState === 'cashed_out';

    let content = null;
    let baseClasses = 'w-24 h-24 rounded-lg relative transition-all duration-300 ease-in-out transform';
    let buttonDisabled = !isPlaying || isRevealed;

    if (state === 'gem') {
        baseClasses += ' bg-[#2f4553] scale-105';
        content = <img src="https://i.imgur.com/aUjzAIT.png" alt="Gem" className="w-16 h-16 object-contain animate-reveal" />;
    } else if (state === 'mine') {
        baseClasses += ' bg-red-800/60 scale-105';
        content = <img src="https://i.imgur.com/u9aNSVd.png" alt="Mine" className="w-16 h-16 object-contain animate-reveal" />;
    } else { // 'hidden' state
        content = <img src="https://i.imgur.com/Ny2KcZC.png" alt="Hidden Tile" className="w-full h-full object-cover rounded-lg" />;
        
        if (isFinished) {
            baseClasses += ' opacity-50';
        } else if (isPlaying) {
            baseClasses += ' cursor-pointer hover:brightness-110 hover:-translate-y-1';
        }
    }

    return (
        <button onClick={onClick} disabled={buttonDisabled} className={baseClasses} aria-label={`Tile ${state}`}>
            <div className="w-full h-full flex items-center justify-center">
                {content}
            </div>
            <style>{`
                @keyframes reveal {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-reveal {
                    animation: reveal 0.3s ease-out;
                }
            `}</style>
        </button>
    );
});


export const MinesGrid: React.FC<MinesGridProps> = ({ gridState, onTileClick, gameState }) => {
    return (
        <div className="grid grid-cols-5 gap-3">
            {gridState.map((state, index) => (
                <Tile 
                    key={index}
                    state={state}
                    onClick={() => onTileClick(index)}
                    isRevealed={state !== 'hidden'}
                    gameState={gameState}
                />
            ))}
        </div>
    );
};
