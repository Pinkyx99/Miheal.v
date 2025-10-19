
import React from 'react';

// Updated Logo to use the new image
export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => (
    <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo" className={className} />
);

// New Icons for Sidebar
export const HomeIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0L1.72 11.47a.75.75 0 001.06 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101A2.25 2.25 0 0117.75 22h-1.5a.75.75 0 01-.75-.75V15a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v6.25a.75.75 0 01-.75.75h-1.5A2.25 2.25 0 013.75 19.75v-6.101c.02-.03.044-.058.07-.084L12 5.432z" />
    </svg>
);
export const PromotionsIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);
export const LeaderboardIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c-1.035 0-1.875.84-1.875 1.875v9.375c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V10.5c0-1.035-.84-1.875-1.875-1.875h-.75zM3 15.375c-1.035 0-1.875.84-1.875 1.875V21c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875v-3.75c0-1.035-.84-1.875-1.875-1.875h-.75z" />
    </svg>
);
export const ChallengesIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.213 2.11a.75.75 0 011.574 0l1.364 4.113a.75.75 0 001.375-.453l-1.364-4.113A2.25 2.25 0 0012 1.5c-.947 0-1.782.584-2.146 1.44l-1.364 4.113a.75.75 0 001.375.453L11.213 2.11z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM4.75 12a7.25 7.25 0 1114.5 0 7.25 7.25 0 01-14.5 0z" clipRule="evenodd" />
    </svg>
);
export const InstantPayoutIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
);
export const SocialCasinoIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197"/></svg>
);
export const SportsIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 11-12h-9l1-8z"/></svg>
);
export const CustomerHelpIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5z" clipRule="evenodd" />
      <path d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="m8.26 6.01.707-.707a.75.75 0 0 1 1.06 1.06l-.707.707a.75.75 0 0 1-1.06-1.06zm-1.253 4.582-1.414-1.414a.75.75 0 1 0-1.06 1.06l1.414 1.414a.75.75 0 1 0 1.06-1.06zm1.06 3.182-1.414 1.414a.75.75 0 1 0 1.06 1.06l1.414-1.414a.75.75 0 1 0-1.06-1.06zm3.182 1.06 1.414 1.414a.75.75 0 1 0 1.06-1.06l-1.414-1.414a.75.75 0 1 0-1.06 1.06zm3.393-2.242 1.414-1.414a.75.75 0 1 0-1.06-1.06l-1.414 1.414a.75.75 0 1 0 1.06 1.06zm1.06-3.182 1.414 1.414a.75.75 0 1 0 1.06-1.06l-1.414-1.414a.75.75 0 1 0-1.06 1.06zm-2.03-2.031.707-.707a.75.75 0 1 0-1.06-1.06l-.707.707a.75.75 0 1 0 1.06 1.06z" />
    </svg>
);
export const FaqIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-1.423-2.595-1.856-3.996-1.023a.75.75 0 00-.583 1.341 2.25 2.25 0 013.166 2.34c-1.04.298-2.036.837-2.65 1.565a.75.75 0 001.06 1.06c.71-.78 1.637-1.253 2.65-1.565A3.75 3.75 0 0013.628 8.083zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75A.75.75 0 0112 15z" clipRule="evenodd" />
    </svg>
);
export const SearchIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
);
export const ChevronDownIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
);

// Social Icons
export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export const SteamIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm5.016 4.908l-5.78 3.337c-.43.248-.71.722-.71 1.254v.002c0 .531.28.995.71 1.254l5.78 3.337c.43.248.97.01 1.218-.42l1.636-2.833c.248-.43.01-.97-.42-1.218l-3.337-1.928 3.337-1.928c.43-.248.668-.788.42-1.218l-1.636-2.833c-.248-.43-.788-.668-1.218-.42zM9.98 12.38l-2.07-.803c-.35-.136-.35-.65 0-.786l2.07-.803c.35-.136.72.115.72.5v.893c0 .385-.37.636-.72.5z"/></svg>
);

export const TelegramIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.62 11.93c-.58-.19-.59-.54.1-.73l15.6-5.99c.51-.2 1.01.17 1.01.73l-2.43 11.49c-.19.92-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.85.42z"/></svg>
);

export const UploadIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
);

export const BellIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
);
export const DiceIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        {/* Back die */}
        <g transform="rotate(-15 12 12) translate(-2 -1) scale(0.9)">
            <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" opacity="0.6"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}} />
            <circle cx="15.5" cy="15.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}} />
        </g>
        {/* Front die */}
        <g transform="rotate(15 12 12) translate(2 1) scale(0.9)">
            <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}}/>
            <circle cx="8.5" cy="15.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}}/>
            <circle cx="15.5" cy="8.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}}/>
            <circle cx="15.5" cy="15.5" r="1.5" fill="white" style={{mixBlendMode: 'difference'}}/>
            <circle cx="12" cy="12" r="1.5" fill="white" style={{mixBlendMode: 'difference'}}/>
        </g>
    </svg>
);
export const CrashIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
);
export const RouletteIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.66-4.66l-1.42 1.42M6.76 17.24l-1.42 1.42m12.72 0l-1.42-1.42M6.76 6.76L5.34 5.34"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
export const PlinkoIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v4m0 4h.01"></path></svg>
);
export const MinesIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.25,2C6.16,2,2,6.16,2,11.25S6.16,20.5,11.25,20.5,20.5,16.34,20.5,11.25,16.34,2,11.25,2Zm3.1,12.1a1,1,0,0,1-1.4,0L11,12.15,9.05,14.1a1,1,0,0,1-1.4-1.4L9.6,10.75,7.65,8.8a1,1,0,0,1,1.4-1.4L11,9.35,1.95-1.95a1,1,0,0,1,1.4,1.4L12.4,10.75Z"/>
      <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.66,13.06a1,1,0,0,1-1.41,0L14.83,13.6a3,3,0,0,0-4.24,0L9.17,15.06a1,1,0,0,1-1.41-1.41l1.42-1.42a3,3,0,0,0,0-4.24L7.76,6.57a1,1,0,0,1,1.41-1.41l1.42,1.42a3,3,0,0,0,4.24,0l1.42-1.42a1,1,0,0,1,1.41,1.41L16.24,8a3,3,0,0,0,0,4.24Z"/>
    </svg>
);
export const BlackjackIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        {/* Back card */}
        <g transform="rotate(-12 12 12) translate(-1, 0)">
            <path d="M5 4C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H15C16.1046 20 17 19.1046 17 18V6C17 4.89543 16.1046 4 15 4H5Z" opacity="0.6"/>
        </g>
        {/* Front card (Ace) */}
        <g transform="rotate(12 12 12) translate(1, 0)">
            <path d="M7 2C5.89543 2 5 2.89543 5 4V16C5 17.1046 5.89543 18 7 18H17C18.1046 18 19 17.1046 19 16V4C19 2.89543 18.1046 2 17 2H7Z"/>
            <text x="6.5" y="6.5" fontFamily="Inter, sans-serif" fontSize="4" fontWeight="bold" fill="white" style={{mixBlendMode: 'difference'}}>A</text>
        </g>
    </svg>
);
export const SlotMachineIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h16l.002 14H4z"></path>
        <path d="M9 10l-2 2 2 2 2-2-2-2zm4 0-2 2 2 2 2-2-2-2zm4 0-2 2 2 2 2-2-2-2zM6 7h12v2H6z"></path>
    </svg>
);
export const TrophyIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19,4H17A2,2 0 0,0 15,2H9A2,2 0 0,0 7,4H5A2,2 0 0,0 3,6V11C3,13.21 4.79,15 7,15V19H9V15H15V19H17V15C19.21,15 21,13.21 21,11V6A2,2 0 0,0 19,4M9,4H15V6H9V4Z" />
    </svg>
);
export const GiftIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.75 16.5C12.75 17.3284 12.0784 18 11.25 18C10.4216 18 9.75 17.3284 9.75 16.5V13.5H12.75V16.5Z" />
    <path fillRule="evenodd" d="M8.25 12V3.75A1.5 1.5 0 019.75 2.25h3A1.5 1.5 0 0114.25 3.75V12H18a3 3 0 013 3v1.5a3 3 0 01-3 3h-2.25V21a.75.75 0 01-1.5 0v-1.5H8.25V21a.75.75 0 01-1.5 0v-1.5H4.5a3 3 0 01-3-3V15a3 3 0 013-3h3.75Zm-1.5 1.5H3a1.5 1.5 0 00-1.5 1.5V15a1.5 1.5 0 001.5 1.5h1.5v-3Zm12 3v-3h1.5a1.5 1.5 0 011.5 1.5V15a1.5 1.5 0 01-1.5 1.5h-1.5Z" clipRule="evenodd" />
  </svg>
);
export const UsdIcon: React.FC<{ className?: string }> = (props) => (
    <div {...props} className={`bg-[#34A853] rounded-full flex items-center justify-center text-white font-bold ${props.className}`}>
        <span className="text-sm leading-none select-none">$</span>
    </div>
);

export const MutedSoundIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5L6 9H2v6h4l5 10V5zM23 9l-6 6M17 9l6 6"></path></svg>
);
export const InfoCircleIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
export const CheckCircleIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

export const RankIcon: React.FC<{ tier: string, className?: string }> = ({ tier, className }) => {
    return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
};
export const LockIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
export const ArrowsRightLeftIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 12L3 8m4 4l4-4m6 12v-4m0 4l4-4m-4 4l-4-4" /></svg>);
export const CogIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
export const UsersIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
export const ShieldCheckIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.611m8.618-3.04A12.02 12.02 0 0121 20.944a11.955 11.955 0 01-9-17.611z" /></svg>);
export const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);

export const Bars3Icon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

// FIX: Added missing ChevronRightIcon component
export const ChevronRightIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "h-12" }) => (
    <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo" className={className} />
);

export const ChatBubbleIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);

export const FaceSmileIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PlayCircleIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

export const StarIcon: React.FC<{ className?: string, filled?: boolean }> = ({ className, filled }) => (
    <svg {...{className}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);


// --- START OF MINES GAME ICONS ---
export const SoundIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>);
export const LightningIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>);
export const CalendarIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
export const ClockIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
export const CheckIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
export const QuestionIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

export const FortressIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M20,11V7h-2V4h-3V1h-2v3h-2V1H9v3H6v3H4v4H1v5h3v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h3v-5H20z M16,9h-2V7h2V9z M10,9H8V7h2V9z"/></svg>);
export const GemIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" fill="currentColor"/><path d="M2 8.5L12 12L22 8.5" stroke="white" strokeOpacity="0.5" strokeWidth="0.5"/><path d="M12 22V12" stroke="white" strokeOpacity="0.5" strokeWidth="0.5"/></svg>);
export const MineIcon: React.FC<{ className?: string }> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" /><path d="M12,5a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V6A1,1,0,0,0,12,5Z" /><path d="M12,15a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V16A1,1,0,0,0,12,15Z" /><path d="M18,11H16a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z" /><path d="M8,11H6a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z" /><path d="M16.95,6.05a1,1,0,0,0-1.41,0l-1.42,1.42a1,1,0,0,0,1.41,1.41L17,7.46A1,1,0,0,0,16.95,6.05Z" /><path d="M8.46,15.54a1,1,0,0,0-1.41,0L5.64,16.95a1,1,0,0,0,1.41,1.41l1.41-1.41A1,1,0,0,0,8.46,15.54Z" /><path d="M16.95,16.95a1,1,0,0,0,0-1.41L15.54,14.13a1,1,0,0,0-1.41,1.41l1.41,1.41A1,1,0,0,0,16.95,16.95Z" /><path d="M8.46,7.46A1,1,0,0,0,7.05,6.05L5.64,7.46A1,1,0,0,0,7.05,8.87l1.41-1.41Z" /></svg>);
// --- END OF MINES GAME ICONS ---

// --- ADMIN PANEL ICONS ---
export const ShieldExclamationIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </svg>
);
export const Squares2X2Icon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
  </svg>
);
export const CurrencyDollarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const MegaphoneIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h8.05a1.5 1.5 0 00.975-2.635l-4.12-3.431A.75.75 0 0115.07 15H15V9.312a.75.75 0 01.99-1.63l1.83.61a.75.75 0 00.93-.93L16.29 4.5a.75.75 0 00-1.22.463l-.44 2.86a.75.75 0 01-1.44-.22z" />
    </svg>
);
export const ClipboardDocumentListIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
// --- END OF ADMIN PANEL ICONS ---