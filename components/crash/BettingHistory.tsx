import React from 'react';
import { CrashHistoryItem } from '../../types';

interface BettingHistoryProps {
    history: CrashHistoryItem[];
}

const HistoryRefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5" />
    </svg>
);

export const BettingHistory: React.FC<BettingHistoryProps> = ({ history }) => {
    const getColor = (multiplier: number) => {
        if (multiplier < 2) return 'bg-red-500/10 text-red-400 border border-red-500/20';
        if (multiplier < 10) return 'bg-green-500/10 text-green-400 border border-green-500/20';
        return 'bg-yellow-400/10 text-yellow-400 border border-yellow-500/20';
    };

    return (
        <div className="bg-[#0D1316] border-b border-white/5 flex-shrink-0">
            <div className="flex items-center space-x-2 p-2 overflow-x-auto no-scrollbar">
                {history.map((item, index) => (
                    <div
                        key={index}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-transform hover:scale-105 ${getColor(item.multiplier)}`}
                    >
                        {item.multiplier.toFixed(2)}x
                    </div>
                ))}
                 <button className="flex-shrink-0 ml-2 p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10">
                    <HistoryRefreshIcon />
                </button>
            </div>
        </div>
    );
};