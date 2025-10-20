import React from 'react';
import { RouletteBet } from '../../types';
import { getNumberColor } from '../../lib/rouletteUtils';

type BetType = string;
type TotalBetsByType = Record<BetType, { total: number; players: RouletteBet[] }>;
type MyBetsByType = Record<BetType, { total: number }>;

interface RouletteBettingTableProps {
    onBet: (betType: BetType) => void;
    totalBetsByType: TotalBetsByType;
    myBetsByType: MyBetsByType;
    disabled: boolean;
    winningNumber: number | null;
    selectedChip: number;
}

const Chip: React.FC<{ amount: number; isPlayerChip?: boolean; isPreview?: boolean }> = ({ amount, isPlayerChip = false, isPreview = false }) => {
    let colors = { bg: 'bg-red-500', highlight: 'bg-red-400', shadow: 'bg-red-700' };
    if (amount >= 5) colors = { bg: 'bg-blue-500', highlight: 'bg-blue-400', shadow: 'bg-blue-700' };
    if (amount >= 10) colors = { bg: 'bg-orange-500', highlight: 'bg-orange-400', shadow: 'bg-orange-700' };
    if (amount >= 25) colors = { bg: 'bg-green-500', highlight: 'bg-green-400', shadow: 'bg-green-700' };
    if (amount >= 100) colors = { bg: 'bg-gray-800', highlight: 'bg-gray-700', shadow: 'bg-black' };
    if (amount >= 500) colors = { bg: 'bg-purple-600', highlight: 'bg-purple-500', shadow: 'bg-purple-800' };

    const formatAmount = (val: number): string => {
        if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 !== 0 ? 1 : 0)}k`;
        return val.toFixed(2).replace(/\.00$/, '');
    };

    const chipSize = isPlayerChip ? 'w-12 h-12' : 'w-10 h-10';
    const textSize = isPlayerChip ? 'text-sm' : 'text-xs';

    return (
        <div 
            className={`relative ${chipSize} rounded-full transition-all duration-300 ${isPreview ? 'opacity-70 scale-90' : 'scale-100'}`}
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}
        >
            <div className={`absolute inset-0 rounded-full ${colors.shadow} transform translate-y-0.5`}></div>
            <div className={`absolute inset-0 rounded-full ${colors.bg}`}></div>
            <div className="absolute inset-1 sm:inset-1.5 rounded-full border-2 border-white/80"></div>
            <div className={`absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colors.highlight} opacity-70 blur-sm`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-black text-white ${textSize}`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                    ${formatAmount(amount)}
                </span>
            </div>
            {isPlayerChip && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center text-background font-bold text-[8px] leading-none">
                     P
                 </div>
            )}
        </div>
    );
};


const BetSpot: React.FC<{
    betType: BetType;
    label: string | React.ReactNode;
    onBet: (betType: BetType) => void;
    totalBet: { total: number } | undefined;
    myBet: { total: number } | undefined;
    disabled: boolean;
    isWinner: boolean;
    className?: string;
    selectedChip: number;
}> = ({ betType, label, onBet, totalBet, myBet, disabled, isWinner, className, selectedChip }) => {
    
    const myBetAmount = myBet?.total ?? 0;
    const totalBetAmount = totalBet?.total ?? 0;
    const otherPlayersBetAmount = totalBetAmount - myBetAmount;

    const showMyBet = myBetAmount > 0;
    const showOtherPlayersBet = otherPlayersBetAmount > 0;

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
            {/* Hide label if chips are present to avoid overlap */}
            <span className={`${(showMyBet || showOtherPlayersBet) ? 'opacity-20' : ''} ${labelClasses}`}>{label}</span>
            
            {(showMyBet || showOtherPlayersBet) && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="relative w-24 h-12 flex items-center justify-center">
                        {showOtherPlayersBet && (
                            <div className="absolute transition-transform duration-200" style={{ transform: showMyBet ? 'translateX(-12px)' : 'translateX(0)' }}>
                                <Chip amount={otherPlayersBetAmount} />
                            </div>
                        )}
                        {showMyBet && (
                            <div className="absolute transition-transform duration-200" style={{ transform: showOtherPlayersBet ? 'translateX(12px)' : 'translateX(0)' }}>
                                <Chip amount={myBetAmount} isPlayerChip={true} />
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {!showMyBet && !showOtherPlayersBet && !disabled && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
                    <Chip amount={selectedChip} isPreview={true} />
                </div>
            )}
        </button>
    );
};

export const RouletteBettingTable: React.FC<RouletteBettingTableProps> = ({ onBet, totalBetsByType, myBetsByType, disabled, winningNumber, selectedChip }) => {
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
        totalBet: totalBetsByType[betType],
        myBet: myBetsByType[betType],
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
