import React from 'react';
import { ORIGINAL_GAMES } from '../constants';

const OriginalGameCard: React.FC<{
  name: string;
  image: string;
  comingSoon?: boolean;
  onClick: () => void;
}> = ({ name, image, comingSoon, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-3 cursor-pointer group"
  >
    <div className="relative w-44 h-32 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-in-out group-hover:left-[100%]"></div>
      
        <img src={image} alt={name} className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110" />
        {comingSoon && (
            <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">SOON</div>
        )}
    </div>
    <span className="text-white font-semibold text-sm">{name}</span>
  </div>
);


export const OriginalsRow: React.FC<{ onGameSelect: (name: string) => void }> = ({ onGameSelect }) => {
    return (
        <div className="mt-12 max-w-7xl mx-auto w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Mihael Originals</h2>
            </div>
            <div className="flex justify-start items-center gap-4 lg:gap-6 flex-wrap">
                {ORIGINAL_GAMES.map(game => (
                    <OriginalGameCard
                        key={game.name}
                        name={game.name}
                        image={game.image}
                        comingSoon={game.comingSoon}
                        onClick={() => {
                            if (game.comingSoon) {
                                alert('Coming Soon!');
                            } else {
                                onGameSelect(game.name === 'Coinflip' ? 'Crash' : game.name);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};