import React from 'react';

interface GameLauncherProps {
    game: { name: string; url: string };
    onClose: () => void;
}

export const GameLauncher: React.FC<GameLauncherProps> = ({ game, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-fade-in" aria-modal="true" role="dialog">
            <header className="flex-shrink-0 h-16 bg-card flex items-center justify-between px-4 border-b border-outline">
                <h2 className="text-lg font-bold text-white truncate">{game.name}</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Close game"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </header>
            <div className="flex-1 bg-black">
                <iframe
                    src={game.url}
                    title={game.name}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};
