import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, Logo, ChatBubbleIcon, BellIcon, Bars3Icon } from './icons';
import { Session } from '@supabase/supabase-js';
import { Profile, ProfileLink } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Wallet } from './Wallet';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
    session: Session | null;
    profile: Profile | null;
    onSignInClick: () => void;
    onSignUpClick: () => void;
    onWalletButtonClick: () => void;
    onNavigate: (page: ProfileLink['name'] | 'home') => void;
    currentView: string;
    onChatToggle: () => void;
    onProfileUpdate: () => void;
    onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, profile, onSignInClick, onSignUpClick, onWalletButtonClick, onNavigate, currentView, onChatToggle, onProfileUpdate, onOpenAdminPanel }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasUnclaimedBonus = profile && !profile.has_claimed_welcome_bonus;

  return (
    <header className="flex-shrink-0 relative z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Left Side: Search */}
          <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-sm hidden sm:block">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-text-muted" />
                </div>
                <input
                    type="search"
                    placeholder="Search games"
                    className="w-full bg-sidebar/80 border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
                />
            </div>
          </div>

          {/* Center: Wallet on Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {session && profile && (
              <Wallet onWalletButtonClick={onWalletButtonClick} balance={profile.balance} />
            )}
          </div>

          {/* Right Side: Auth/Profile & Mobile Chat Toggle */}
          <div className="flex items-center space-x-2">
            {session && profile ? (
              <>
                {/* Wallet for Mobile/Tablet */}
                <div className="lg:hidden">
                    <Wallet onWalletButtonClick={onWalletButtonClick} balance={profile.balance} />
                </div>

                <div ref={notificationsRef} className="relative">
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-white relative">
                        <BellIcon className="w-6 h-6" />
                        {hasUnclaimedBonus && (
                            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                        )}
                    </button>
                    <NotificationsDropdown 
                        show={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        hasUnclaimedBonus={hasUnclaimedBonus}
                        onProfileUpdate={onProfileUpdate}
                    />
                </div>
                
                <ProfileDropdown 
                    profile={profile} 
                    onNavigate={onNavigate} 
                    onLogout={async () => { await supabase.auth.signOut(); }} 
                    onOpenAdminPanel={onOpenAdminPanel}
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignInClick}
                  className="btn-interactive px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition bg-card hover:bg-card/70 border border-border-color"
                >
                  Log in
                </button>
                <button
                  onClick={onSignUpClick}
                  className="btn-interactive bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
                >
                  Sign up
                </button>
              </div>
            )}
            
            <button onClick={onChatToggle} className="xl:hidden p-2 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                <ChatBubbleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
