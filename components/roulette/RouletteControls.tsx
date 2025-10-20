import React from 'react';

interface RouletteControlsProps {
    selectedChip: number;
    setSelectedChip: (amount: number) => void;
    onUndo: () => void;
    onClear: () => void;
    myBetsCount: number;
    disabled: boolean;
}

const CHIP_VALUES = [1, 5, 10, 25, 100, 500];

const Chip: React.FC<{ value: number; isSelected: boolean; onClick: () => void }> = ({ value, isSelected, onClick }) => {
    let colorClasses = 'bg-red-600 border-red-800 text-white';
    if (value >= 5) colorClasses = 'bg-blue-600 border-blue-800 text-white';
    if (value >= 25) colorClasses = 'bg-green-600 border-green-800 text-white';
    if (value >= 100) colorClasses = 'bg-black border-gray-600 text-white';
    if (value >= 500) colorClasses = 'bg-purple-600 border-purple-800 text-white';

    return (
        <button 
            onClick={onClick}
            className={`
                relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs
                transition-all duration-200 border-4 shadow-md
                ${colorClasses}
                ${isSelected ? 'scale-110 ring-4 ring-primary ring-offset-2 ring-offset-[#1A222D]' : 'hover:scale-105 hover:-translate-y-1'}
            `}
        >
            <div className="w-full h-full rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                ${value < 1000 ? value : `${value/1000}k`}
            </div>
        </button>
    );
};

export const RouletteControls: React.FC<RouletteControlsProps> = ({ selectedChip, setSelectedChip, onUndo, onClear, myBetsCount, disabled }) => {
    return (
        <div className="bg-[#1A222D] p-3 rounded-xl border border-outline">
            <div className="grid grid-cols-3 items-center gap-4">
                <div className="flex items-center space-x-3 justify-start">
                    <button 
                        onClick={onUndo} 
                        disabled={disabled || myBetsCount === 0}
                        className="px-4 py-2 bg-[#212832] text-text-muted text-sm font-bold rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Undo
                    </button>
                    <button 
                        onClick={onClear} 
                        disabled={disabled || myBetsCount === 0}
                        className="px-4 py-2 bg-[#212832] text-text-muted text-sm font-bold rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear
                    </button>
                </div>

                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    {CHIP_VALUES.map(value => (
                        <Chip key={value} value={value} isSelected={selectedChip === value} onClick={() => setSelectedChip(value)} />
                    ))}
                </div>
                
                <div className="flex items-center space-x-3 justify-end">
                    <button disabled={disabled} className="px-4 py-2 bg-[#212832] text-text-muted text-sm font-bold rounded-md hover:bg-white/10 disabled:opacity-50">x2</button>
                    <button disabled={disabled} className="px-4 py-2 bg-[#212832] text-text-muted text-sm font-bold rounded-md hover:bg-white/10 disabled:opacity-50">Rebet</button>
                </div>
            </div>
        </div>
    );
};