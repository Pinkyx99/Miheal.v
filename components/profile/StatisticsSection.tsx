import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { ChartBarIcon, DiceIcon, CrashIcon, RouletteIcon, PlinkoIcon, MinesIcon } from '../icons';
import { Profile } from '../../types';

interface StatisticsSectionProps {
    profile: Profile | null;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ profile }) => {
    
    const statsCards = [
        { label: 'Games Played', value: (profile?.games_played ?? 0).toLocaleString(), icon: <DiceIcon className="w-6 h-6 text-blue-400" /> },
        { label: 'Wagered', value: `$${(profile?.wagered ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <span className="text-xl font-bold text-accent-green">$</span> },
        { label: 'Wagered Today', value: '$0.17', icon: <span className="text-xl font-bold text-accent-green">$</span> },
        { label: 'Net Profit', value: '-$11.54', icon: <span className="text-xl font-bold text-red-500">$</span> },
    ];

    const last24hStats = [
        { game: 'Crash', longest_bet: '-', largest_profit: '-' },
        { game: 'Roulette', longest_bet: '$0.17', largest_profit: '-$0.17' },
        { game: 'Hilo', longest_bet: '-', largest_profit: '-' },
        { game: 'Dice', longest_bet: '-', largest_profit: '-' },
        { game: 'Plinko', longest_bet: '-', largest_profit: '-' },
    ];

    const gameIcons: { [key: string]: React.ReactNode } = {
        Crash: <CrashIcon className="w-5 h-5 text-emerald-400" />,
        Roulette: <RouletteIcon className="w-5 h-5 text-red-400" />,
        Slots: <span className="text-lg">🎰</span>,
        Hilo: <span className="text-lg">🃏</span>,
        Dice: <DiceIcon className="w-5 h-5 text-blue-400" />,
        Plinko: <PlinkoIcon className="w-5 h-5 text-green-400" />,
        Mines: <MinesIcon className="w-5 h-5 text-pink-400" />,
    };

    return (
        <SectionShell title="Statistics">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsCards.map(card => (
                    <div key={card.label} className="bg-card/50 border border-outline rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-card hover:-translate-y-1">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center">{card.icon}</div>
                        <div>
                            <p className="text-sm text-text-muted">{card.label}</p>
                            <p className="text-lg font-bold text-white">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-card/50 border border-outline rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-white">Cumulative Net Profit</h4>
                    <button className="text-xs font-semibold text-accent-green hover:underline">Reset Net Profit</button>
                </div>
                {/* Chart Placeholder */}
                <div className="h-64 bg-background rounded-lg flex items-center justify-center text-text-muted">
                    <ChartBarIcon className="w-12 h-12 text-text-muted/50" />
                    <p className="ml-4">Chart Data Would Go Here</p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    {['Crash', 'Roulette', 'Slots', 'Hilo', 'Dice', 'Plinko', 'Mines'].map(game => (
                        <div key={game} className="flex items-center space-x-2 text-sm text-text-muted">
                            {gameIcons[game]}
                            <span>{game}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-white mb-4">Last 24 Hours Stats</h4>
                <div className="bg-card/50 border border-outline rounded-lg">
                    <div className="grid grid-cols-3 text-left text-xs text-text-muted uppercase px-4 py-2 border-b border-outline">
                        <th>Game</th>
                        <th className="text-right">Longest Bet</th>
                        <th className="text-right">Largest Profit</th>
                    </div>
                    <div className="space-y-2 p-2">
                        {last24hStats.map(stat => (
                            <div key={stat.game} className="grid grid-cols-3 items-center text-sm px-2 py-1.5 rounded-md hover:bg-white/5">
                                <span className="font-semibold text-white">{stat.game}</span>
                                <span className="text-right text-text-muted">{stat.longest_bet}</span>
                                <span className={`text-right font-medium ${stat.largest_profit.startsWith('-') ? 'text-red-500' : 'text-accent-green'}`}>{stat.largest_profit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </SectionShell>
    );
};