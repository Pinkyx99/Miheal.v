
import React from 'react';

const CHIP_VALUES = [1, 5, 10, 25, 100, 500];

const Chip: React.FC<{ value: number; onClick: () => void; disabled: boolean }> = ({ value, onClick, disabled }) => {
    let colorClasses = '';
    if (value === 1) colorClasses = 'bg-blue-600 border-blue-400';
    if (value === 5) colorClasses = 'bg-red-600 border-red-400';
    if (value === 10) colorClasses = 'bg-orange-500 border-orange-400';
    if (value === 25) colorClasses = 'bg-green-600 border-green-400';
    if (value === 100) colorClasses = 'bg-gray-800 border-gray-600';
    if (value === 500) colorClasses = 'bg-purple-600 border-purple-400';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-sm
                transition-transform duration-200 border-4 shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                ${colorClasses}
                ${!disabled ? 'hover:scale-110 hover:-translate-y-2' : ''}
            `}
        >
             <div className="w-full h-full rounded-full border-2 border-white/30 flex items-center justify-center">
                {value}
            </div>
        </button>
    );
};


interface ChipSelectorProps {
    onChipSelect: (value: number) => void;
    onClearBet: () => void;
    disabled: boolean;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({ onChipSelect, onClearBet, disabled }) => {
    return (
        <div className="flex justify-center h-[100px] items-start pt-2">
             <div className="bg-black/40 backdrop-blur-sm p-3 rounded-full flex items-center space-x-3 border border-gray-600">
                <button 
                    onClick={onClearBet} 
                    disabled={disabled}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gray-700/80 border-4 border-gray-600 transition-transform duration-200 hover:scale-110 hover:-translate-y-2 disabled:opacity-50"
                    aria-label="Clear bet"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {CHIP_VALUES.map(value => (
                    <Chip key={value} value={value} onClick={() => onChipSelect(value)} disabled={disabled} />
                ))}
            </div>
        </div>
    );
};
