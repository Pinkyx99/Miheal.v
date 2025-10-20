import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GameBet, Profile } from '../types';
import { Session } from '@supabase/supabase-js';
import { DiceIcon, CrashIcon, RouletteIcon, MinesIcon, BlackjackIcon, ChartBarIcon, TrophyIcon, UserCircleIcon } from './icons';

interface StatsFeedProps {
    session: Session | null;
    profile: Profile | null;
}

const gameIcons: { [key: string]: React.FC<{ className?: string }> } = {
  Dice: DiceIcon,
  Crash: CrashIcon,
  Roulette: RouletteIcon,
  Mines: MinesIcon,
  Blackjack: BlackjackIcon,
};

const BetRow: React.FC<{ bet: GameBet }> = ({ bet }) => {
    const GameIcon = gameIcons[bet.game_name] || DiceIcon;
    const isWin = bet.payout !== null && bet.payout > bet.bet_amount;
    const profit = bet.payout !== null ? bet.payout - bet.bet_amount : -bet.bet_amount;

    return (
        <tr className="border-b border-border-color/50 animate-fade-in-fast hover:bg-white/5">
            <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                    <GameIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-white">{bet.game_name}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                    <img src={bet.profiles.avatar_url} alt={bet.profiles.username} className="w-6 h-6 rounded-full" />
                    <span className="text-text-muted truncate">{bet.profiles.username}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-right font-mono text-text-muted">${bet.bet_amount.toFixed(2)}</td>
            <td className="px-4 py-3 text-right font-mono text-text-muted">{bet.multiplier ? `${bet.multiplier.toFixed(2)}x` : '-'}</td>
            <td className={`px-4 py-3 text-right font-mono font-semibold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`}
            </td>
        </tr>
    );
};

export const StatsFeed: React.FC<StatsFeedProps> = ({ session, profile }) => {
    const [activeTab, setActiveTab] = useState<'live' | 'high' | 'my'>('live');
    const [bets, setBets] = useState<GameBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalGamesPlayed, setTotalGamesPlayed] = useState<number | null>(null);

    useEffect(() => {
        const fetchTotalGames = async () => {
            const { data, error } = await supabase.rpc('get_total_games_played');
            if (data) setTotalGamesPlayed(data);
        };
        fetchTotalGames();
    }, []);

    useEffect(() => {
        const fetchBets = async () => {
            setLoading(true);
            
            let query = supabase
                .from('game_bets')
                .select('*, profiles(username, avatar_url)')
                .limit(20);

            if (activeTab === 'live') {
                query = query.order('created_at', { ascending: false });
            } else if (activeTab === 'high') {
                query = query.order('bet_amount', { ascending: false });
            } else if (activeTab === 'my') {
                if (!profile) {
                    setBets([]);
                    setLoading(false);
                    return;
                }
                query = query.eq('user_id', profile.id).order('created_at', { ascending: false });
            }
            
            const { data, error } = await query;
            if (data) setBets(data as any);
            setLoading(false);
        };

        fetchBets();
    }, [activeTab, profile]);

    // Real-time listener for live bets
    useEffect(() => {
        const channel = supabase
            .channel('live-bets-feed-main')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_bets' }, async (payload) => {
                const newBet = payload.new as Omit<GameBet, 'profiles'>;
                
                // Only update total games played on INSERT
                setTotalGamesPlayed(current => (current ?? 0) + 1);

                // Only update live feed table if on that tab
                if (activeTab === 'live') {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', newBet.user_id)
                        .single();

                    if (profileData) {
                        const betWithProfile: GameBet = { ...newBet, profiles: profileData, id: newBet.id, created_at: newBet.created_at, game_name: newBet.game_name, bet_amount: newBet.bet_amount, payout: newBet.payout, multiplier: newBet.multiplier, user_id: newBet.user_id };
                        setBets(currentBets => [betWithProfile, ...currentBets].slice(0, 20));
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTab]);

    const TabButton: React.FC<{ tabId: 'live' | 'high' | 'my'; children: React.ReactNode; icon: React.FC<{className?: string}> }> = ({ tabId, children, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabId
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-white'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{children}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Live Statistics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-card border border-border-color rounded-xl overflow-hidden">
                    <div className="flex items-center border-b border-border-color px-4">
                        <TabButton tabId="live" icon={ChartBarIcon}>Live Bets</TabButton>
                        <TabButton tabId="high" icon={TrophyIcon}>High Rollers</TabButton>
                        <TabButton tabId="my" icon={UserCircleIcon}>My Bets</TabButton>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-muted uppercase bg-background/50">
                                <tr>
                                    <th className="px-4 py-2">Game</th>
                                    <th className="px-4 py-2">Player</th>
                                    <th className="px-4 py-2 text-right">Bet</th>
                                    <th className="px-4 py-2 text-right">Multiplier</th>
                                    <th className="px-4 py-2 text-right">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={5} className="text-center p-8 text-text-muted">Loading...</td></tr>
                                )}
                                {!loading && bets.length === 0 && (
                                    <tr><td colSpan={5} className="text-center p-8 text-text-muted">{activeTab === 'my' && !profile ? 'Log in to see your bets' : 'No bets to show.'}</td></tr>
                                )}
                                {!loading && bets.map(bet => <BetRow key={bet.id} bet={bet} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-card border border-border-color rounded-xl p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Games Played</h3>
                    <div className="my-4">
                        <DiceIcon className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(100,255,218,0.4)]"/>
                    </div>
                    {totalGamesPlayed !== null ? (
                        <p className="font-mono font-bold text-4xl text-white tracking-wider">
                            {totalGamesPlayed.toLocaleString()}
                        </p>
                    ) : (
                        <div className="h-10 bg-background/50 w-32 rounded animate-pulse" />
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.5s ease-out; }
            `}</style>
        </div>
    );
};
