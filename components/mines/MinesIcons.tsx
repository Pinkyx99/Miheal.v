import React from 'react';

// For the default tile face
export const MinesTileIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10V4M18 4H16M18 4H20M18 10H21M18 10H15M12 4V20M12 4H14M12 4H10M6 10V4M6 4H4M6 4H8M6 10H9M6 10H3M3 14H21V20H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// For the gem
export const MinesGemIcon: React.FC = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" fill="url(#gemGradient)"/>
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" stroke="#6ee7b7" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M2 8.5L12 12L22 8.5" stroke="white" strokeOpacity="0.7" strokeWidth="0.5" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="white" strokeOpacity="0.7" strokeWidth="0.5" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="gemGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981"/>
                <stop offset="1" stopColor="#059669"/>
            </linearGradient>
        </defs>
    </svg>
);

// For the mine
export const MinesMineIcon: React.FC = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#ef4444"/>
        <path d="M12 2V5" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 22V19" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 12H19" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M2 12H5" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18.364 5.63604L16.2427 7.75736" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M5.63604 18.364L7.75736 16.2427" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18.364 18.364L16.2427 16.2427" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M5.63604 5.63604L7.75736 7.75736" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);


// Top right icons
export const MinesSoundIcon: React.FC = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
export const MinesSpeedIcon: React.FC = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
export const MinesHistoryIcon: React.FC = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
export const MinesTimerIcon: React.FC = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
export const MinesHelpIcon: React.FC = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
