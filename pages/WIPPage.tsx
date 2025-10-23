import React from 'react';
import { CrashIcon } from '../components/icons';

interface WIPPageProps {
    onNavigate: (view: 'home') => void;
}

const WIPPage: React.FC<WIPPageProps> = ({ onNavigate }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(var(--color-border-color-rgb), 0.5) 1px, transparent 1px), linear-gradient(to right, rgba(var(--color-border-color-rgb), 0.5) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
            }}></div>
            
            <div className="relative z-10 bg-card/80 backdrop-blur-md border border-outline rounded-2xl p-12 shadow-2xl max-w-lg w-full transform transition-all duration-500 hover:scale-[1.02]">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <CrashIcon className="relative w-24 h-24 text-primary" />
                </div>
                
                <h1 className="text-4xl font-black text-white uppercase tracking-wider">
                    Under Construction
                </h1>
                <p className="mt-4 text-lg text-text-muted">
                    Our team is currently fine-tuning this game for an explosive launch.
                    Please check back soon!
                </p>
                <button
                    onClick={() => onNavigate('home')}
                    className="mt-8 bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3 rounded-full text-base transition-all duration-300 hover:scale-105 hover:shadow-glow-primary active:scale-100 shadow-lg"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default WIPPage;
