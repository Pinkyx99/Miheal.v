import React from 'react';

export const Hero: React.FC = () => {
    return (
        <div className="relative p-6 lg:p-8 flex flex-col justify-center items-start text-left max-w-7xl mx-auto w-full">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-wider leading-tight" style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}>
                Welcome To<br/>
                <span className="bg-gradient-to-r from-primary-light to-primary text-transparent bg-clip-text">
                    Mihael.bet
                </span>
            </h1>
            <p className="mt-4 text-lg text-text-muted max-w-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>
                Global Reach, Local Touch. Cutting-edge gaming, personalized service, and instant payouts.
            </p>
            <div className="mt-8">
                <button 
                    className="bg-gradient-to-r from-primary to-accent-red-dark hover:from-primary-light hover:to-primary text-white font-semibold px-10 py-3 rounded-full text-base transition-all duration-300 hover:scale-105 hover:shadow-glow-primary active:scale-100 shadow-lg border-2 border-white/30"
                >
                    CONTACT US
                </button>
            </div>
        </div>
    );
};