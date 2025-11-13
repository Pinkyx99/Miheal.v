import React from 'react';

export const Hero: React.FC = () => {
    return (
        <div className="relative flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                MIHAEL<span className="text-primary">.BET</span>
            </h1>
            <p className="mt-2 mb-6 text-base sm:text-lg text-text-muted max-w-md">
                Vaša destinacija za premium online zabavu i velike dobitke. Pridružite se odmah!
            </p>
            <a 
                href="https://gamdom.win/landing?aff=majkl"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full max-w-xs mx-auto sm:inline-block sm:w-auto sm:mx-0 bg-gradient-to-r from-primary to-accent-red-dark hover:from-primary-light hover:to-primary text-white font-bold tracking-wider px-8 sm:px-16 py-4 rounded-full text-xl transition-all duration-300 hover:scale-105 hover:shadow-glow-primary active:scale-100 shadow-lg border-2 border-white/30"
            >
                IGRAJ SADA
            </a>
        </div>
    );
};
