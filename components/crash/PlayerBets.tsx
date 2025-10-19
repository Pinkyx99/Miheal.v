
import React, { useMemo } from 'react';
import { CrashBet } from '../../types';
import { TrophyIcon } from '../icons';

const SoundIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 15.858a5 5 0 01-2.828-7.072m11.314 0a1 1 0 011.414 0l3.536 3.536a1 1 0 010 1.414l-3.536 3.536a1 1 0 01-1.414-1.414L15 12l-2.121-2.121a1 1 0 010-1.414zM8 12l-2.121 2.121a1 1 0 01-1.414 0L.929 10.586a1 1 0 010-1.414l3.536-3.536a1 1 0 011.414 0L8 7.879V12z" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HistoryIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;


interface PlayerBetsProps {
    bets: CrashBet[];
    onOpenFairnessModal: () => void;
}

const BetRow = React.memo(({ bet }: { bet: CrashBet }) => {
    const hasCashedOut = !!bet.cashout_multiplier;
    const profit = bet.profit;

    let profitDisplay;
    if (profit !== undefined) {
        if (profit > 0) {
            profitDisplay = <span className="text-green-400">+${profit.toFixed(2)}</span>;
        } else if (profit < 0) {
            profitDisplay = <span className="text-red-400">${profit.toFixed(2)}</span>;
        } else {
            profitDisplay = <span className="text-gray-500">$0.00</span>;
        }
    } else {
        profitDisplay = <span className="text-gray-500">-</span>;
    }

    return (
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 items-center px-4 py-2.5 border-b border-white/5 last:border-b-0">
            <div className="flex items-center space-x-2 truncate">
                <img src={bet.profiles.avatar_url} alt={bet.profiles.username} className="w-6 h-6 rounded-full flex-shrink-0" />
                <span className="text-white/80 truncate text-xs">{bet.profiles.username}</span>
            </div>
            <div className="text-right text-white/60 text-xs">
                {hasCashedOut ? `${bet.cashout_multiplier?.toFixed(2)}x` : '-'}
            </div>
             <div className="text-right text-white/80 text-xs">
                ${bet.bet_amount.toFixed(2)}
            </div>
            <div className="text-right font-semibold text-xs">
                {profitDisplay}
            </div>
        </div>
    );
});


export const PlayerBets: React.FC<PlayerBetsProps> = React.memo(({ bets, onOpenFairnessModal }) => {
    
    const sortedBets = useMemo(() => 
        [...bets].sort((a, b) => {
            if (a.cashout_multiplier && !b.cashout_multiplier) return -1;
            if (!a.cashout_multiplier && b.cashout_multiplier) return 1;
            if (a.cashout_multiplier && b.cashout_multiplier) return b.profit! - a.profit!;
            return b.bet_amount - a.bet_amount;
        })
    , [bets]);

    const { totalPlayers, totalBetAmount, totalProfit } = useMemo(() => ({
        totalPlayers: bets.length,
        totalBetAmount: bets.reduce((sum, bet) => sum + bet.bet_amount, 0),
        totalProfit: bets.reduce((sum, bet) => sum + (bet.profit && bet.profit > 0 ? bet.profit : 0), 0)
    }), [bets]);

    return (
        <div className="bg-[#0D1316] h-full rounded-lg flex flex-col text-sm border border-white/5">
            <div className="p-3 border-b border-white/5 flex items-center justify-between text-text-muted">
                <div className="flex items-center space-x-3">
                    <button className="p-1.5 rounded-full bg-black/20 hover:bg-white/10 hover:text-white transition-colors"><SoundIcon /></button>
                    <button onClick={onOpenFairnessModal} className="p-1.5 rounded-full bg-black/20 hover:bg-white/10 hover:text-white transition-colors"><InfoIcon /></button>
                    <button className="p-1.5 rounded-full bg-black/20 hover:bg-white/10 hover:text-white transition-colors"><HistoryIcon /></button>
                </div>
                <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <span className="font-bold text-sm text-white">$ 6197.93</span>
                </div>
            </div>
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 text-xs text-text-muted uppercase px-4 py-2 bg-[#1A222D]/40 font-semibold border-b border-white/5">
                <span>User</span>
                <span className="text-right">@</span>
                <span className="text-right">Bet</span>
                <span className="text-right">Profit</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {sortedBets.map((bet) => (
                    <BetRow key={bet.id} bet={bet} />
                ))}
            </div>
            <div className="p-3 border-t border-white/10 grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 items-center text-sm font-semibold">
                <div className="flex items-center space-x-2 text-text-muted">
                    <UserIcon />
                    <span>{totalPlayers}</span>
                </div>
                <div/>
                <div className="text-right text-white">${totalBetAmount.toFixed(2)}</div>
                <div className="text-right text-accent-green">${totalProfit.toFixed(2)}</div>
            </div>
        </div>
    );
});
    