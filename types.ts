import React from 'react';

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  active?: boolean;
  isDropdown?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  balance: number;
  email: string;
  wagered: number;
  games_played: number;
  has_claimed_welcome_bonus: boolean;
  claimed_ranks: string[] | null;
  is_admin: boolean;
}

export interface ProfileLink {
    name: 'Profile' | 'Statistics' | 'Notifications' | 'Settings' | 'Affiliates' | 'Privacy' | 'Log out';
    icon: React.FC<{ className?: string }>;
}

export type GameState = 'connecting' | 'waiting' | 'running' | 'crashed' | 'resetting';

export interface CrashRound {
    id: string;
    created_at: string;
    status: 'waiting' | 'running' | 'crashed';
    started_at: string | null;
    ended_at: string | null;
    crash_point: number | null;
    server_seed: string | null;
    public_seed: string | null;
}

export interface CrashBet {
    id: string;
    user_id: string;
    round_id: string;
    bet_amount: number;
    cashout_multiplier: number | null;
    profit: number | null;
    auto_cashout_at: number | null;
    profiles: {
        username: string;
        avatar_url: string;
    };
}

export interface CashoutEvent {
    id: string;
    userId: string;
    betAmount: number;
    cashoutMultiplier: number;
    profit: number;
    username: string;
    avatarUrl: string;
}

export interface CrashHistoryItem {
    multiplier: number;
}

export type RouletteColor = 'red' | 'green' | 'black';
export type RouletteGameState = 'betting' | 'spinning' | 'ended';

export interface RouletteRound {
    id: string;
    created_at: string;
    status: RouletteGameState;
    spun_at: string | null;
    ended_at: string | null;
    winning_number: number | null;
    server_seed: string | null;
    public_seed: string | null;
}

export interface RouletteBet {
    id: string;
    user_id: string;
    round_id: string;
    bet_amount: number;
    bet_type: string; // e.g. 'number_7', 'red', 'column_1'
    profit: number | null;
    profiles: {
        username: string;
        avatar_url: string;
    };
}

export interface RouletteHistoryItem {
    winning_number: number;
}

export interface RoyaltyRank {
    name: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Emerald' | 'Sapphire' | 'Ruby' | 'Diamond' | 'Opal';
    status: 'locked' | 'unlocked' | 'claimed';
    image: string;
    levelRequirement: number;
    rewardAmount: number;
}

export interface Game {
  id: string;
  name:string;
  provider: string;
  image: string;
  tags?: string[];
  rtp?: number;
  gameId?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    wagered: number;
  };
}

// Admin Panel Types
export type UserStatus = 'Online' | 'Offline';

export interface AdminUser {
    id: string;
    username: string;
    email: string | null;
    avatar_url: string;
    role: string | null;
    balance: number;
    status: UserStatus;
    last_seen: string | null;
    wagered: number;
    games_played: number;
    claimed_ranks: string[] | null;
}

// Add RollResult type for Dice game components
export interface RollResult {
  id: string;
  value: number;
  win: boolean;
  betAmount: number;
  payout: number;
  multiplier: number;
  isRollOver: boolean;
  rollValue: number;
  createdAt: string;
}

// Add MuteBanRecord type for BannedOverlay component
export interface MuteBanRecord {
  reason: string | null;
  expires_at: string | null;
  moderator: {
    username: string;
  } | null;
}

export interface GameBet {
  id: string;
  created_at: string;
  user_id: string;
  game_name: string;
  bet_amount: number;
  payout: number | null;
  multiplier: number | null;
  profiles: {
    username: string;
    avatar_url: string;
  };
}