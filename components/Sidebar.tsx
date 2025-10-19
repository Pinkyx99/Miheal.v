import React, { useState, useEffect } from 'react';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../constants';
import { Logo, ChevronDownIcon, DiceIcon, CrashIcon, RouletteIcon, MinesIcon, BlackjackIcon } from './icons';
import { SidebarNavItem, GameBet } from '../types';
import { supabase } from '../lib/supabaseClient';

const gameIcons: { [key: string]: React.FC<{ className?: string }> } = {
  Dice: DiceIcon,
  Crash: CrashIcon,
  Roulette: RouletteIcon,
  Mines: MinesIcon,
  Blackjack: BlackjackIcon,
};

const LiveBetsFeed: React.FC<{ isSidebarOpen: boolean; showTopBorder: boolean }> = ({ isSidebarOpen, showTopBorder }) => {
    const [bets, setBets] = useState<GameBet[]>([]);

    useEffect(() => {
        const fetchInitialBets = async () => {
            const { data, error } = await supabase
                .from('game_bets')
                .select('*, profiles(username, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(15);
            if (data) {
                setBets(data as any);
            }
        };
        fetchInitialBets();
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel('live-bets-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_bets' }, async (payload) => {
                const newBet = payload.new as Omit<GameBet, 'profiles'>;
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', newBet.user_id)
                    .single();

                if (profileData) {
                    const betWithProfile: GameBet = { ...newBet, profiles: profileData, id: newBet.id, created_at: newBet.created_at, game_name: newBet.game_name, bet_amount: newBet.bet_amount, payout: newBet.payout, multiplier: newBet.multiplier, user_id: newBet.user_id };
                    setBets(currentBets => [betWithProfile, ...currentBets].slice(0, 15));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!isSidebarOpen) {
        return null; // Don't render when sidebar is collapsed
    }

    return (
        <div className={`mt-4 ${showTopBorder ? 'pt-4 border-t border-border-color' : ''}`}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Live Bets</h3>
            <ul className="space-y-1">
                {bets.map(bet => {
                    const GameIcon = gameIcons[bet.game_name] || DiceIcon;
                    const isWin = bet.payout !== null && bet.payout > bet.bet_amount;
                    const profit = bet.payout !== null ? bet.payout - bet.bet_amount : -bet.bet_amount;

                    return (
                        <li key={bet.id} className="flex items-center p-1.5 rounded-md bg-white/5 text-xs transition-opacity animate-fade-in-fast">
                            <GameIcon className="w-5 h-5 mr-2 flex-shrink-0 text-primary" />
                            <div className="truncate">
                                <span className="font-semibold text-white">{bet.profiles.username}</span>
                                <span className="text-text-muted"> bet ${bet.bet_amount.toFixed(2)} and </span>
                                <span className={isWin ? 'text-green-400' : 'text-red-400'}>
                                    {isWin ? `won $${profit.toFixed(2)}` : `lost`}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onNavigate: (page: string) => void;
  currentView: string;
}

const NavItem: React.FC<{ item: SidebarNavItem; isSidebarOpen: boolean; isActive: boolean; onClick: () => void }> = ({ item, isSidebarOpen, isActive, onClick }) => {
  // Improved active state styling
  const activeClasses = isActive ? 'bg-primary/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  
  return (
    <li title={!isSidebarOpen ? item.name : ''}>
      <a
        href={item.href}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${activeClasses} ${!isSidebarOpen ? 'justify-center' : ''}`}
      >
        <item.icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
        <span className={`font-medium text-sm flex-1 ml-4 text-left whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{item.name}</span>
        {item.isDropdown && <ChevronDownIcon className={`w-4 h-4 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} />}
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, onNavigate, currentView }) => {
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number | null>(null);

  useEffect(() => {
    const fetchInitialCount = async () => {
        const { data, error } = await supabase.rpc('get_total_games_played');
        if (error) {
            console.error("Error fetching total games played:", error.message);
            setTotalGamesPlayed(0);
        } else {
            setTotalGamesPlayed(data);
        }
    };
    fetchInitialCount();

    const channel = supabase
        .channel('total-games-played-counter')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_bets' },
            () => {
                setTotalGamesPlayed(currentCount => (currentCount ?? 0) + 1);
            }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };
  }, []);
  
  const handleNavClick = (item: SidebarNavItem) => {
    onNavigate(item.name.toLowerCase());
  };

  const showTotalGamesWidget = isSidebarOpen && totalGamesPlayed !== null;

  return (
    <aside 
      onMouseEnter={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
      className={`bg-sidebar h-screen flex flex-col p-4 flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
      <div className="px-2 mb-6 h-12 flex items-center">
        <button onClick={() => onNavigate('home')} className="w-full">
            <Logo className={`text-white transition-all duration-300 h-10 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`} />
            <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo Icon" className={`h-10 mx-auto transition-all duration-300 ${!isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1 min-h-0">
          <nav>
            <ul className="space-y-2">
              {SIDEBAR_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isSidebarOpen={isSidebarOpen}
                  isActive={currentView.toLowerCase() === item.name.toLowerCase()}
                  onClick={() => handleNavClick(item)} 
                />
              ))}
            </ul>
          </nav>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {showTotalGamesWidget && (
                <div className="mt-4 pt-4 border-t border-border-color">
                    <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Total Games Played</h3>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <DiceIcon className="w-6 h-6 text-primary flex-shrink-0"/>
                        <span className="font-mono font-bold text-xl text-white tracking-wider truncate">
                            {totalGamesPlayed.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
            <LiveBetsFeed isSidebarOpen={isSidebarOpen} showTopBorder={!showTotalGamesWidget} />
          </div>

          <div className="flex-shrink-0 mt-4 pt-4 border-t border-border-color">
            <ul className="space-y-2">
              {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isSidebarOpen={isSidebarOpen}
                  isActive={false}
                  onClick={() => {}} // Placeholder for help/faq modals
                />
              ))}
            </ul>
          </div>
      </div>
    </aside>
  );
};