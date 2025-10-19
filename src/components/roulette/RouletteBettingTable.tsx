
import React, { useMemo } from 'react';
import { Profile, RouletteBet, RouletteColor } from '../../types';

interface RouletteBettingAreaProps {
    color: RouletteColor;
    title: string;
    payout: string;
    bets: RouletteBet[];
    onPlaceBet: () => void;
    disabled: boolean;
    isWinner: boolean;
    isEnded: boolean;
    profile: Profile | null;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
);


export const RouletteBettingArea: React.FC<RouletteBettingAreaProps> = ({ color, title, payout, bets, onPlaceBet, disabled, isWinner, isEnded, profile }) => {
    
    const totalBet = useMemo(() => bets.reduce((sum, bet) => sum + bet.bet_amount, 0), [bets]);

    const buttonColorClasses = {
        red: 'bg-[#F44336] hover:bg-red-500',
        green: 'bg-[#00C17B] hover:bg-green-500',
        black: 'bg-[#2A3341] hover:bg-gray-700',
    };

    return (
        <div className={`bg-[#1A222D] rounded-xl border-2 ${isEnded && isWinner ? 'border-accent-green animate-pulse-slow' : 'border-outline'} flex flex-col min-h-[250px] p-3 space-y-3 transition-colors`}>
            <div className="text-center">
                <p className="text-sm font-semibold text-white">Potential Profit: {payout}</p>
                <button
                    onClick={onPlaceBet}
                    disabled={disabled}
                    className={`w-full py-3 mt-1 rounded-md text-white font-bold text-lg transition-colors disabled:bg-gray-600/50 disabled:cursor-not-allowed ${buttonColorClasses[color]}`}
                >
                    Bet on {title}
                </button>
            </div>
             <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <div className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4" />
                    <span>{bets.length} Player(s)</span>
                </div>
                <span>Total ${totalBet.toFixed(2)}</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
                 {bets.map(bet => (
                     <div key={bet.id} className="flex items-center justify-between p-1.5 rounded-md bg-black/20">
                        <div className="flex items-center space-x-2">
                            <img src={bet.profiles.avatar_url} alt={bet.profiles.username} className="w-6 h-6 rounded-full" />
                            <span className="text-xs text-text-muted truncate max-w-[120px]">{bet.user_id === profile?.id ? 'Your Bet' : bet.profiles.username}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            {isEnded && isWinner && bet.user_id === profile?.id && bet.profit !== null && bet.profit > 0 && (
                                <span className="text-sm font-semibold text-accent-green animate-pulse">
                                    +${bet.profit.toFixed(2)}
                                </span>
                            )}
                            <span className="text-sm font-semibold w-16 text-right">${bet.bet_amount.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
              @keyframes pulse-slow {
                50% { border-color: rgba(0, 193, 123, 0.4); }
              }
              .animate-pulse-slow {
                animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
            `}</style>
        </div>
    );
};