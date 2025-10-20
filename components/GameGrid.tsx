import React from 'react';
import { GAMES } from '../constants';
import { GameCard } from './GameCard';

export const GameGrid: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Popular Games</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {GAMES.map((game, index) => (
                    <div 
                        key={game.id} 
                        className="game-grid-item" 
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <GameCard game={game} />
                    </div>
                ))}
            </div>
        </div>
    );
};