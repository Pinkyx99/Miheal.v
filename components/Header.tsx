import React, { useState, useRef, useEffect } from 'react';
import { Logo, ChatBubbleIcon, BellIcon, Bars3Icon, SoundIcon, MutedSoundIcon } from './icons';
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
    onSidebarToggle: () => void;
    onProfileUpdate: () => void;
    onOpenAdminPanel: () => void;
    isChatPinned: boolean;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, profile, onSignInClick, onSignUpClick, onWalletButtonClick, onNavigate, onChatToggle, onSidebarToggle, onProfileUpdate, onOpenAdminPanel, isChatPinned, theme, onToggleTheme, isMuted, onToggleMute }) => {
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
    <header className="flex-shrink-0 relative z-30 flex items-center justify-between h-20 px-4 md:px-6">
      {/* Left Side: Menu Toggle */}
      <button onClick={onSidebarToggle} className="p-2 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors lg:hidden">
          <Bars3Icon className="w-6 h-6" />
      </button>
      
      {/* Center: The Pill Bar */}
      <div className="flex-grow w-full lg:max-w-4xl mx-auto h-16 rounded-full bg-gradient-to-r from-black/20 via-red-900/10 to-black/20 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between h-full px-2 sm:px-6">
          {/* Left side of pill */}
          <div onClick={() => onNavigate('home')} className="flex items-center space-x-3 cursor-pointer group">
              <Logo className="h-8 group-hover:animate-spin-slow" />
              <span className="font-bold text-lg text-white hidden sm:block">Mihael.bet</span>
          </div>

          {/* Right side of pill */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {session && profile ? (
              <>
                <Wallet onWalletButtonClick={onWalletButtonClick} balance={profile.balance} />
                
                <button onClick={onToggleMute} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-white">
                    {isMuted ? <MutedSoundIcon className="w-6 h-6" /> : <SoundIcon className="w-6 h-6" />}
                </button>

                <div ref={notificationsRef} className="relative">
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-white relative">
                        <BellIcon className="w-6 h-6" />
                        {hasUnclaimedBonus && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
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
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignInClick}
                  className="px-3 sm:px-5 py-2 rounded-full text-white font-semibold text-xs sm:text-sm transition bg-white/5 hover:bg-white/10"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUpClick}
                  className="bg-primary hover:bg-primary-light text-white font-semibold px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Side: Chat Toggle */}
      <button 
        onClick={onChatToggle} 
        disabled={isChatPinned}
        className="p-2 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed lg:disabled:opacity-30"
      >
          <ChatBubbleIcon className="w-6 h-6" />
      </button>
    </header>
  );
};