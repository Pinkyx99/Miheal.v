import React from 'react';
import { RouletteBet } from '../../types';
import { getNumberColor } from '../../lib/rouletteUtils';

type BetType = string;
type BetsByType = Record<BetType, { total: number; players: RouletteBet[] }>;

interface RouletteBettingTableProps {
    onBet: (betType: BetType) => void;
    betsByType: BetsByType;
    disabled: boolean;
    winningNumber: number | null;
    selectedChip: number;
}

const Chip: React.FC<{ amount: number; isPreview?: boolean }> = ({ amount, isPreview }) => {
    let colorClasses = 'bg-red-600 border-red-800';
    if (amount >= 5) colorClasses = 'bg-blue-600 border-blue-800';
    if (amount >= 25) colorClasses = 'bg-green-600 border-green-800';
    if (amount >= 100) colorClasses = 'bg-gray-800 border-black';
    if (amount >= 500) colorClasses = 'bg-purple-600 border-purple-800';

    const formatAmount = (val: number): string => {
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toString();
    }

    return (
        <div className={`
            w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-[10px]
            border-[3px] shadow-lg transform transition-all duration-200
            ${colorClasses} ${isPreview ? 'opacity-70 scale-90' : 'scale-100'}
        `}>
            <div className="w-full h-full rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                ${formatAmount(amount)}
            </div>
        </div>
    );
};

const BetSpot: React.FC<{
    betType: BetType;
    label: string | React.ReactNode;
    onBet: (betType: BetType) => void;
    bets: { total: number };
    disabled: boolean;
    isWinner: boolean;
    className?: string;
    selectedChip: number;
}> = ({ betType, label, onBet, bets, disabled, isWinner, className, selectedChip }) => {
    
    let specificClasses = 'bg-black/20 backdrop-blur-sm text-white';
    let labelClasses = 'font-bold text-base';

    if (betType.startsWith('number_')) {
        const numStr = betType.split('_')[1];
        if (numStr) {
            const num = parseInt(numStr, 10);
            const color = getNumberColor(num);
            if (color === 'red') specificClasses = 'bg-[#C52727] text-white';
            else if (color === 'black') specificClasses = 'bg-gray-800 text-white';
            else specificClasses = 'bg-green-600 text-white';
            labelClasses += ' text-xl';
        }
    } else if (betType === 'red') {
        specificClasses = 'bg-[#C52727] text-white';
        labelClasses += ' tracking-wider';
    } else if (betType === 'black') {
        specificClasses = 'bg-gray-800 text-white';
        labelClasses += ' tracking-wider';
    }


    return (
        <button
            onClick={() => onBet(betType)}
            disabled={disabled}
            className={`
                relative flex items-center justify-center text-center rounded-md min-h-[3.5rem]
                border border-white/10 hover:border-primary/80 transition-all duration-200
                disabled:cursor-not-allowed group 
                ${isWinner ? 'winner-glow' : ''} ${specificClasses} ${className}
            `}
        >
            <span className={labelClasses}>{label}</span>
            
            {bets && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <Chip amount={bets.total} />
                </div>
            )}
            {!bets && !disabled && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
                    <Chip amount={selectedChip} isPreview={true} />
                </div>
            )}
        </button>
    );
};

export const RouletteBettingTable: React.FC<RouletteBettingTableProps> = ({ onBet, betsByType, disabled, winningNumber, selectedChip }) => {
    const numbers = Array.from({ length: 36 }, (_, i) => i + 1);
    const row3Numbers = numbers.filter(n => n % 3 === 0).sort((a, b) => a - b);
    const row2Numbers = numbers.filter(n => n % 3 === 2).sort((a, b) => a - b);
    const row1Numbers = numbers.filter(n => n % 3 === 1).sort((a, b) => a - b);

    const isWinner = (betType: string): boolean => {
        if (winningNumber === null) return false;
        if (betType === `number_${winningNumber}`) return true;
        
        const color = getNumberColor(winningNumber);
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0;

        switch(betType) {
            case 'red': return color === 'red';
            case 'black': return color === 'black';
            case 'even': return isEven;
            case 'odd': return !isEven && winningNumber !== 0;
            case '1-18': return winningNumber >= 1 && winningNumber <= 18;
            case '19-36': return winningNumber >= 19 && winningNumber <= 36;
            case '1st12': return winningNumber >= 1 && winningNumber <= 12;
            case '2nd12': return winningNumber >= 13 && winningNumber <= 24;
            case '3rd12': return winningNumber >= 25 && winningNumber <= 36;
            case 'col1': return winningNumber !== 0 && winningNumber % 3 === 1;
            case 'col2': return winningNumber !== 0 && winningNumber % 3 === 2;
            case 'col3': return winningNumber !== 0 && winningNumber % 3 === 0;
            default: return false;
        }
    };
    
    const commonProps = (betType: string) => ({
        betType,
        onBet,
        bets: betsByType[betType],
        disabled,
        isWinner: isWinner(betType),
        selectedChip
    });

    return (
        <div className="bg-[#0a1f14] p-2 rounded-xl border border-green-300/20 shadow-lg" style={{backgroundImage: 'radial-gradient(circle, rgba(10, 40, 20, 0.5) 0%, #0D1316 80%)'}}>
            <div className="grid grid-cols-[4rem_repeat(12,_minmax(0,_1fr))_4rem] grid-rows-[repeat(5,_3.5rem)] gap-1.5">
                {/* Zero */}
                <BetSpot {...commonProps('number_0')} label="0" className="row-span-3 col-start-1" />

                {/* Number Rows */}
                {row3Numbers.map((num, i) => <BetSpot key={num} {...commonProps(`number_${num}`)} label={num.toString()} className={`col-start-${i+2} row-start-1`} />)}
                {row2Numbers.map((num, i) => <BetSpot key={num} {...commonProps(`number_${num}`)} label={num.toString()} className={`col-start-${i+2} row-start-2`} />)}
                {row1Numbers.map((num, i) => <BetSpot key={num} {...commonProps(`number_${num}`)} label={num.toString()} className={`col-start-${i+2} row-start-3`} />)}
                
                {/* Column Bets */}
                <BetSpot {...commonProps('col3')} label="2:1" className="col-start-14 row-start-1" />
                <BetSpot {...commonProps('col2')} label="2:1" className="col-start-14 row-start-2" />
                <BetSpot {...commonProps('col1')} label="2:1" className="col-start-14 row-start-3" />
                
                {/* Dozen Bets */}
                <BetSpot {...commonProps('1st12')} label="1st 12" className="col-start-2 col-span-4 row-start-4" />
                <BetSpot {...commonProps('2nd12')} label="2nd 12" className="col-start-6 col-span-4 row-start-4" />
                <BetSpot {...commonProps('3rd12')} label="3rd 12" className="col-start-10 col-span-4 row-start-4" />

                {/* Outside Bets */}
                <BetSpot {...commonProps('1-18')} label="1-18" className="col-start-2 col-span-2 row-start-5" />
                <BetSpot {...commonProps('even')} label="EVEN" className="col-start-4 col-span-2 row-start-5" />
                <BetSpot {...commonProps('red')} label="RED" className="col-start-6 col-span-2 row-start-5" />
                <BetSpot {...commonProps('black')} label="BLACK" className="col-start-8 col-span-2 row-start-5" />
                <BetSpot {...commonProps('odd')} label="ODD" className="col-start-10 col-span-2 row-start-5" />
                <BetSpot {...commonProps('19-36')} label="19-36" className="col-start-12 col-span-2 row-start-5" />
            </div>
             <style>{`
                @keyframes winner-glow-animation {
                    0%, 100% { box-shadow: 0 0 4px #64ffda, inset 0 0 4px #64ffda; border-color: #64ffda; }
                    50% { box-shadow: 0 0 16px #64ffda, inset 0 0 8px #64ffda; border-color: #fff; }
                }
                .winner-glow {
                    animation: winner-glow-animation 2s ease-in-out infinite;
                    z-index: 5;
                }
            `}</style>
        </div>
    );
};