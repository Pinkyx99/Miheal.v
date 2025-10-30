import React from 'react';

export const Hero: React.FC = () => {
    return (
        <div className="relative flex flex-col justify-center items-center text-center">
            <div className="mt-2">
                <a 
                    href="https://gamdom.win/landing?aff=majkl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-primary to-accent-red-dark hover:from-primary-light hover:to-primary text-white font-semibold px-12 sm:px-16 py-4 rounded-full text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-glow-primary active:scale-100 shadow-lg border-2 border-white/30"
                >
                    PLAY
                </a>
            </div>
        </div>
    );
};