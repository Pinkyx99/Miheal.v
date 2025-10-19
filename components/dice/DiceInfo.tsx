
import React from 'react';

export const DiceInfo: React.FC = () => {
    return (
        <div className="bg-[#0D1316] border-t border-outline flex-shrink-0">
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                     <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center p-2">
                        <img src="https://gamdom.com/build/dice-hover.1ffcc2004a8d6bcf448c.svg" alt="Dice" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Dice</h2>
                        <div className="flex items-center space-x-2 text-xs text-text-muted font-semibold">
                            <span>GAMBOOM ORIGINALS</span>
                            <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                            <span>DICE</span>
                            <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                            <span className="text-accent-green">99% RTP</span>
                        </div>
                    </div>
                </div>
                <button className="px-4 py-2 bg-card-bg border border-outline rounded-md text-sm text-white font-semibold flex items-center space-x-2 hover:bg-white/10 transition-colors">
                    <span>How to Play</span>
                </button>
            </div>
        </div>
    );
};
