

import React from 'react';
import { SidebarNavItem, ProfileLink, RoyaltyRank, Game } from './types';
import { HomeIcon, UserCircleIcon, ChartBarIcon, ArrowsRightLeftIcon, BellIcon, CogIcon, UsersIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, DiceIcon, CrashIcon, RouletteIcon, PlinkoIcon, MinesIcon, BlackjackIcon, SlotMachineIcon, TrophyIcon, ShieldExclamationIcon, Squares2X2Icon, CurrencyDollarIcon, MegaphoneIcon, ClipboardDocumentListIcon } from './components/icons';
import { UsdIcon, GoogleIcon } from './components/icons';


export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Home', href: '#', icon: HomeIcon, active: true },
  { name: 'Crash', href: '#', icon: CrashIcon },
  { name: 'Mines', href: '#', icon: MinesIcon },
  { name: 'Roulette', href: '#', icon: RouletteIcon },
  { name: 'Dice', href: '#', icon: DiceIcon },
  { name: 'Blackjack', href: '#', icon: BlackjackIcon },
  { name: 'Slots', href: '#', icon: SlotMachineIcon },
  { name: 'Rewards', href: '#', icon: TrophyIcon },
];

export const SIDEBAR_BOTTOM_NAV_ITEMS: SidebarNavItem[] = [];

const BtcIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/bitcoin--v1.png", alt: "BTC", className: "w-6 h-6" });
const EthIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/ethereum.png", alt: "ETH", className: "w-6 h-6" });
const LtcIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/litecoin.png", alt: "LTC", className: "w-6 h-6" });
const TrxIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/tron.png", alt: "TRX", className: "w-6 h-6" });
const XrpIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/xrp.png", alt: "XRP", className: "w-6 h-6" });
const DogeIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/dogecoin.png", alt: "DOGE", className: "w-6 h-6" });
const SolIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/solana.png", alt: "SOL", className: "w-6 h-6" });

export const WALLET_CURRENCIES = [
    { code: 'USD', balance: '0.00', icon: React.createElement(UsdIcon, { className: "w-6 h-6" }) },
    { code: 'BTC', balance: '0.00', icon: React.createElement(BtcIcon) },
    { code: 'ETH', balance: '0.00', icon: React.createElement(EthIcon) },
    { code: 'LTC', balance: '0.00', icon: React.createElement(LtcIcon) },
    { code: 'TRX', balance: '0.00', icon: React.createElement(TrxIcon) },
    { code: 'XRP', balance: '0.00', icon: React.createElement(XrpIcon) },
    { code: 'DOGE', balance: '0.00', icon: React.createElement(DogeIcon) },
    { code: 'SOL', balance: '0.00', icon: React.createElement(SolIcon) },
];

export const WALLET_BET_CURRENCIES = [
    'USD', 'EUR', 'RUB', 'JPY', 'CAD', 'KRW', 'TRY', 'NGN', 'NZD', 'PLN', 'CZK', 'INR'
];

// FIX: Added missing constants for WalletModal
// FIX: Replaced JSX with React.createElement to prevent parsing errors in .ts file.
const VisaIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/visa.png", alt: "Visa", className: "w-8 h-8" });
const MastercardIcon = () => React.createElement('img', { src: "https://img.icons8.com/color/48/mastercard.png", alt: "Mastercard", className: "w-8 h-8" });
export const PAYMENT_CATEGORIES = [
    {
        title: 'Cryptocurrency',
        methods: [
            { name: 'Bitcoin', icon: React.createElement(BtcIcon), tag: 'Fast', tagColor: 'bg-green-500/20 text-green-300' },
            { name: 'Ethereum', icon: React.createElement(EthIcon) },
            { name: 'Litecoin', icon: React.createElement(LtcIcon) },
        ]
    },
    {
        title: 'Credit / Debit Card',
        methods: [
            { name: 'Visa', icon: React.createElement(VisaIcon) },
            { name: 'Mastercard', icon: React.createElement(MastercardIcon) },
        ]
    }
];

// FIX: Added missing PROFILE_LINKS constant
export const PROFILE_LINKS: ProfileLink[] = [
    { name: 'Profile', icon: UserCircleIcon },
    { name: 'Statistics', icon: ChartBarIcon },
    { name: 'Transactions', icon: ArrowsRightLeftIcon },
    { name: 'Notifications', icon: BellIcon },
    { name: 'Settings', icon: CogIcon },
    { name: 'Affiliates', icon: UsersIcon },
    { name: 'Privacy', icon: ShieldCheckIcon },
    { name: 'Log out', icon: ArrowRightOnRectangleIcon },
];

export const ADMIN_SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Dashboard', href: '#', icon: Squares2X2Icon },
  { name: 'Users', href: '#', icon: UsersIcon },
  { name: 'Games', href: '#', icon: DiceIcon },
  { name: 'Financials', href: '#', icon: CurrencyDollarIcon },
  { name: 'Announcements', href: '#', icon: MegaphoneIcon },
  { name: 'Settings', href: '#', icon: CogIcon },
  { name: 'Audit Log', href: '#', icon: ClipboardDocumentListIcon },
];


// FIX: Added missing constants for Rewards pages
export const REWARDS_HERO_SLIDES = [
    { preTitle: 'Daily', title: 'Rakeback', subtitle: 'Claim your rakeback every day!', imageUrl: 'https://i.imgur.com/L4pP31z.png', textColor: 'text-white' },
    { preTitle: 'Weekly', title: 'Cashback', subtitle: 'Get a percentage of your losses back every week.', imageUrl: 'https://i.imgur.com/fO2Iq3a.jpeg', textColor: 'text-white' },
    { preTitle: 'Monthly', title: 'Bonus', subtitle: 'A big bonus awaits you every month.', imageUrl: 'https://i.imgur.com/uQfWDbw.jpeg', textColor: 'text-white' },
];

export const CLAIMABLE_REWARDS = [
    { title: 'Daily Rakeback', timeLeft: '14:35:12', reward: '$ 1.25', claimable: true, imageUrl: 'https://i.imgur.com/OqVfUkw.png' },
    { title: 'Weekly Cashback', timeLeft: '3d 12h', reward: '$ 12.50', claimable: false, imageUrl: 'https://i.imgur.com/G5Sy5yL.png' },
    { title: 'Monthly Bonus', timeLeft: '21d 8h', reward: '$ 50.00', claimable: false, imageUrl: 'https://i.imgur.com/4lXAn4g.png' },
];

export const ROYALTY_RANKS: RoyaltyRank[] = [
    { name: 'Bronze 1', tier: 'Bronze', status: 'claimed', image: 'https://i.imgur.com/RTnegm7.png', levelRequirement: 3, rewardAmount: 5 },
    { name: 'Bronze 2', tier: 'Bronze', status: 'unlocked', image: 'https://i.imgur.com/yaZok1C.png', levelRequirement: 6, rewardAmount: 10 },
    { name: 'Bronze 3', tier: 'Bronze', status: 'locked', image: 'https://i.imgur.com/48ebNM3.png', levelRequirement: 8, rewardAmount: 15 },
    { name: 'Silver 1', tier: 'Silver', status: 'locked', image: 'https://i.imgur.com/mEef1zo.png', levelRequirement: 10, rewardAmount: 25 },
    { name: 'Silver 2', tier: 'Silver', status: 'locked', image: 'https://i.imgur.com/Z8lhufC.png', levelRequirement: 12, rewardAmount: 35 },
    { name: 'Silver 3', tier: 'Silver', status: 'locked', image: 'https://i.imgur.com/5l8SDlJ.png', levelRequirement: 15, rewardAmount: 50 },
    { name: 'Gold 1', tier: 'Gold', status: 'locked', image: 'https://i.imgur.com/uaXVsFn.png', levelRequirement: 20, rewardAmount: 75 },
    { name: 'Gold 2', tier: 'Gold', status: 'locked', image: 'https://i.imgur.com/7TtoXGz.png', levelRequirement: 30, rewardAmount: 100 },
    { name: 'Gold 3', tier: 'Gold', status: 'locked', image: 'https://i.imgur.com/6HRlKAt.png', levelRequirement: 40, rewardAmount: 150 },
    { name: 'Emerald 1', tier: 'Emerald', status: 'locked', image: 'https://i.imgur.com/Mm1gNxt.png', levelRequirement: 50, rewardAmount: 250 },
    { name: 'Emerald 2', tier: 'Emerald', status: 'locked', image: 'https://i.imgur.com/u4pdS0w.png', levelRequirement: 60, rewardAmount: 350 },
    { name: 'Emerald 3', tier: 'Emerald', status: 'locked', image: 'https://i.imgur.com/oQTUieh.png', levelRequirement: 75, rewardAmount: 500 },
    { name: 'Sapphire 1', tier: 'Sapphire', status: 'locked', image: 'https://i.imgur.com/H1dRXrH.png', levelRequirement: 80, rewardAmount: 750 },
    { name: 'Sapphire 2', tier: 'Sapphire', status: 'locked', image: 'https://i.imgur.com/Qd5bKc5.png', levelRequirement: 85, rewardAmount: 1000 },
    { name: 'Sapphire 3', tier: 'Sapphire', status: 'locked', image: 'https://i.imgur.com/fWFoKr9.png', levelRequirement: 100, rewardAmount: 1500 },
];

export const ORIGINAL_GAMES: ({ name: string; image: string; rtp: number; blobColor: string; comingSoon?: boolean })[] = [
  { name: 'Mines', image: 'https://i.imgur.com/GzQSFH0.png', rtp: 99, blobColor: '#64ffda' },
  { name: 'Crash', image: 'https://i.imgur.com/D4qpkPt.png', rtp: 99, blobColor: '#ef4444' },
  { name: 'Roulette', image: 'https://i.imgur.com/0rDInCq.png', rtp: 97.3, blobColor: '#8b5cf6' },
  { name: 'Slots', image: 'https://i.imgur.com/UQVF1x6.png', rtp: 96, blobColor: '#f59e0b', comingSoon: true },
  { name: 'Blackjack', image: 'https://i.imgur.com/ESlUshO.png', rtp: 99.5, blobColor: '#a78bfa' },
];

export const GAMES: Game[] = [
  { id: '1', name: 'Gates of Olympus', provider: 'Pragmatic Play', image: 'https://i.imgur.com/wiCzOFG.png', tags: ['New', 'Popular'] },
  { id: '2', name: 'Sweet Bonanza', provider: 'Pragmatic Play', image: 'https://i.imgur.com/Jdb27cI.png' },
  { id: '3', name: 'The Dog House', provider: 'Pragmatic Play', image: 'https://i.imgur.com/gp7nQcL.png' },
  { id: '4', name: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', image: 'https://i.imgur.com/ElXz5TY.jpeg' },
  { id: '5', name: 'Book of Dead', provider: 'Play\'n GO', image: 'https://i.imgur.com/AnTDMDH.jpeg' },
  { id: '6', name: 'Razor Shark', provider: 'Push Gaming', image: 'https://i.imgur.com/WPRnFHW.jpeg' },
  { id: '7', name: 'Money Train 2', provider: 'Relax Gaming', image: 'https://i.imgur.com/IFzcwSg.png' },
  { id: '8', name: 'Jammin\' Jars 2', provider: 'Push Gaming', image: 'https://i.imgur.com/FEfkOK3.jpeg' },
];