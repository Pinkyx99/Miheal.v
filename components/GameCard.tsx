import React from 'react';
import { Game } from '../types';

interface GameCardProps {
    game: Game;
    onPlay?: (game: Game) => void;
    isLoading?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, isLoading }) => {
    return (
        <div 
            className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 aspect-[3/4]"
            onClick={() => onPlay && !isLoading && onPlay(game)}
        >
            <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">{game.name}</h3>
                <p className="text-sm text-text-muted">{game.provider}</p>
            </div>
            {onPlay && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isLoading ? (
                        <div className="w-12 h-12 border-4 border-white/20 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                        <div className="w-20 h-20 bg-primary/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-primary transition-transform group-hover:scale-110">
                            <svg className="w-10 h-10 text-background" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};