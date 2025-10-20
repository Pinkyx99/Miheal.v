import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GameBet } from '../types';
import { DiceIcon, CrashIcon, RouletteIcon, MinesIcon, BlackjackIcon, ChartBarIcon } from './icons';

interface SidebarLiveFeedProps {
    isSidebarOpen: boolean;
}

const gameIcons: { [key: string]: React.FC<{ className?: string }> } = {
  Dice: DiceIcon,
  Crash: CrashIcon,
  Roulette: RouletteIcon,
  Mines: MinesIcon,
  Blackjack: BlackjackIcon,
};

const BetItem: React.FC<{ bet: GameBet; isSidebarOpen: boolean }> = React.memo(({ bet, isSidebarOpen }) => {
    const GameIcon = gameIcons[bet.game_name] || DiceIcon;
    const isWin = bet.payout !== null && bet.payout > bet.bet_amount;
    const profit = bet.payout !== null ? bet.payout - bet.bet_amount : -bet.bet_amount;

    return (
        <div className="bg-background/50 p-2 rounded-md flex items-center space-x-2 animate-fade-in-fast">
            <GameIcon className="w-6 h-6 text-primary flex-shrink-0 p-1 bg-sidebar rounded-md" />
            <div 
                className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
                style={{ transitionDelay: isSidebarOpen ? '150ms' : '0ms' }}
            >
                <div className="flex items-center space-x-2">
                    <img src={bet.profiles.avatar_url} alt={bet.profiles.username} className="w-4 h-4 rounded-full" />
                    <span className="text-xs text-text-muted truncate font-semibold">{bet.profiles.username}</span>
                </div>
            </div>
            <span className={`text-xs font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`}
            </span>
        </div>
    );
});

export const SidebarLiveFeed: React.FC<SidebarLiveFeedProps> = ({ isSidebarOpen }) => {
    const [bets, setBets] = useState<GameBet[]>([]);
    const [totalGamesPlayed, setTotalGamesPlayed] = useState<number | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: gamesData } = await supabase.rpc('get_total_games_played');
            if (gamesData) setTotalGamesPlayed(gamesData);
            
            const { data: betsData } = await supabase
                .from('game_bets')
                .select('*, profiles(username, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(15);
            if (betsData) setBets(betsData as any);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel('sidebar-live-bets-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_bets' }, async (payload) => {
                const newBet = payload.new as Omit<GameBet, 'profiles'>;
                
                setTotalGamesPlayed(current => (current ?? 0) + 1);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', newBet.user_id)
                    .single();

                if (profileData) {
                    const betWithProfile: GameBet = { ...newBet, profiles: profileData, id: newBet.id, created_at: newBet.created_at, game_name: newBet.game_name, bet_amount: newBet.bet_amount, payout: newBet.payout, multiplier: newBet.multiplier, user_id: newBet.user_id };
                    setBets(currentBets => [betWithProfile, ...currentBets].slice(0, 30));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="flex-1 flex flex-col min-h-0 py-4 space-y-4">
            {/* Total Games Played */}
            <div className="px-1">
                <div className={`bg-background rounded-lg p-3 text-center transition-all duration-300 ${isSidebarOpen ? '' : 'flex items-center justify-center space-x-2'}`}>
                    <ChartBarIcon className={`text-primary ${isSidebarOpen ? 'w-8 h-8 mx-auto mb-2' : 'w-5 h-5 flex-shrink-0'}`} />
                     <div className="min-w-0">
                        {isSidebarOpen && <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Games Played</h3>}
                        {totalGamesPlayed !== null ? (
                            <p className={`font-mono font-bold text-white tracking-wider ${isSidebarOpen ? 'text-2xl mt-1' : 'text-sm'}`}>
                                {totalGamesPlayed.toLocaleString()}
                            </p>
                        ) : (
                            <div className={`bg-sidebar rounded animate-pulse ${isSidebarOpen ? 'h-7 mt-1 w-24 mx-auto' : 'h-5 w-16'}`} />
                        )}
                     </div>
                </div>
            </div>

            {/* Live Bet Feed */}
            <h3 className={`px-3 text-sm font-bold text-white transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Live Bets</h3>
            <div className={`flex-1 min-h-0 overflow-y-auto no-scrollbar px-1`}>
                <div className="space-y-2">
                    {bets.map(bet => <BetItem key={bet.id} bet={bet} isSidebarOpen={isSidebarOpen} />)}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};