import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/HeroCarousel';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Session, Provider } from '@supabase/supabase-js';
import { Profile, ProfileLink } from './types';
import { WalletModal } from './components/WalletModal';
import { OriginalsRow } from './components/OriginalsRow';
import { GameGrid } from './components/GameGrid';
import ProfilePage from './pages/ProfilePage';
import CrashGamePage from './pages/CrashGamePage';
import RouletteGamePage from './pages/RouletteGamePage';
import { ChatRail } from './components/ChatRail';
import { UserProfileModal } from './components/UserProfileModal';
import { Sidebar } from './components/Sidebar';
import { PROFILE_LINKS } from './constants';
import RouletteInfoPage from './pages/RouletteInfoPage';
import SlotsPage from './pages/SlotsPage';
import RewardsPage from './pages/RewardsPage';
import AdminPage from './pages/AdminPage';
import DiceGamePage from './pages/DiceGamePage';
import MinesGamePage from './pages/MinesGamePage';
import BlackjackGamePage from './pages/BlackjackGamePage';

type View = 'home' | 'crash' | 'roulette' | 'roulette-info' | 'slots' | 'rewards' | 'dice' | 'mines' | 'blackjack' | ProfileLink['name'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Hide loading screen on initial app load
  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
  }, []);

  const navigateTo = useCallback((view: View) => {
    const path = view === 'home' ? '' : `/${view.toLowerCase().replace(/ /g, '-')}`;
    if (window.location.hash !== `#${path}`) {
      window.location.hash = path;
    }
  }, []);
  
  useEffect(() => {
    const handleRouting = () => {
      const hash = window.location.hash.substring(1);
      const path = hash.startsWith('/') ? hash.substring(1).toLowerCase() : hash.toLowerCase();
      
      const validGameViews = ['crash', 'roulette', 'roulette-info', 'slots', 'rewards', 'dice', 'mines', 'blackjack'];
      const validProfileViews = PROFILE_LINKS.map(l => l.name.toLowerCase().replace(' ', '-'));
      
      let view: View = 'home';
      if (path === '') {
          view = 'home';
      } else if (validGameViews.includes(path)) {
          view = path as View;
      } else if (validProfileViews.includes(path)) {
          const profileView = PROFILE_LINKS.find(link => link.name.toLowerCase().replace(' ', '-') === path);
          if (profileView) view = profileView.name;
      }
      setCurrentView(view);
    };
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    return () => window.removeEventListener('hashchange', handleRouting);
  }, []);

  const getProfile = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      // This case should be handled by onAuthStateChange, but as a safeguard:
      console.error("Attempted to get profile without a session.");
      return;
    }
    const user = session.user;

    try {
        // Fetch core profile data including admin status
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, balance, wagered, games_played, has_claimed_welcome_bonus, claimed_ranks, is_admin')
            .eq('id', user.id)
            .single();

        if (profileError) {
            // If the profile doesn't exist, it's a critical issue.
            throw profileError;
        }

        if (profileData) {
            const fullProfile: Profile = {
                id: profileData.id,
                username: profileData.username,
                avatar_url: profileData.avatar_url,
                balance: profileData.balance,
                wagered: profileData.wagered,
                games_played: profileData.games_played,
                has_claimed_welcome_bonus: profileData.has_claimed_welcome_bonus,
                claimed_ranks: profileData.claimed_ranks,
                email: user.email!, // Email is guaranteed to be on the user object
                is_admin: profileData.is_admin ?? false, // Directly use the column
            };
            setProfile(fullProfile);
        } else {
            // This case shouldn't be reached if profileError is handled, but as a safeguard.
            throw new Error("Profile data is null for authenticated user.");
        }
    } catch (error: any) {
        console.error("Error getting profile:", error.message);
        // This is a critical failure, sign out to prevent being stuck in a broken state.
        if (error.message.includes('column "is_admin" does not exist')) {
            console.error("DATABASE SETUP ERROR: The 'is_admin' column is missing from the 'profiles' table. Please run the ALTER TABLE script provided in the documentation.");
        } else {
            supabase.auth.signOut();
        }
    }
  }, []);

  // Effect to manage auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getProfile();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      
      if (newSession) {
        getProfile();
      } else {
        setProfile(null);
        navigateTo('home');
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [getProfile, navigateTo]);


  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setAuthView(view);
    setShowAuthModal(true);
  };
  
  const handleOAuthSignIn = async (provider: Provider) => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  };

  const handleProfileUpdate = useCallback(() => {
    if (session) getProfile();
  }, [session, getProfile]);

  const handleGameSelect = (gameName: string) => {
    const game = gameName.toLowerCase();
    if (['crash', 'roulette', 'slots', 'dice', 'mines', 'blackjack'].includes(game)) {
      navigateTo(game as View);
    }
  };
  
  const getAppBgClass = () => {
    switch(currentView) {
        case 'crash': return 'bg-[#0F1923]';
        case 'roulette': return 'bg-[#0D1316]';
        case 'roulette-info': return 'bg-[#0D1316]';
        case 'slots': return 'bg-background';
        case 'rewards': return 'bg-background';
        case 'dice': return 'bg-[#081018]';
        case 'mines': return 'bg-[#0b1016]';
        case 'blackjack': return 'bg-[#081018]';
        default: return 'bg-background';
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-8">
            <Hero session={session} onSignUpClick={() => openAuthModal('signUp')} onGoogleSignInClick={() => handleOAuthSignIn('google')} />
            <OriginalsRow onGameSelect={handleGameSelect} />
            <GameGrid />
          </div>
        );
      case 'crash':
        return <CrashGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'roulette':
        return <RouletteGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onNavigate={navigateTo} />;
      case 'roulette-info':
        return <RouletteInfoPage onNavigate={navigateTo} />;
      case 'dice':
        return <DiceGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'mines':
        return <MinesGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'blackjack':
        return <BlackjackGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'slots':
        return <SlotsPage session={session} onSignInClick={() => openAuthModal('signIn')} />;
      case 'rewards':
        return <RewardsPage profile={profile} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <ProfilePage profile={profile} onProfileUpdate={handleProfileUpdate} activePage={currentView} setActivePage={navigateTo} />;
    }
  };

  return (
    <div className={`h-screen font-sans text-text-main transition-colors duration-300 ${getAppBgClass()}`}>
      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} view={authView} setView={setAuthView} />
      <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <UserProfileModal userId={viewingProfileId} onClose={() => setViewingProfileId(null)} />
      <AdminPage show={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} profile={profile} />

      <div className="flex h-screen max-w-[1920px] mx-auto">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} onNavigate={(page) => navigateTo(page as View)} currentView={currentView} />
          <div className="flex-1 min-w-0 flex flex-col">
              <Header session={session} profile={profile} onSignInClick={() => openAuthModal('signIn')} onSignUpClick={() => openAuthModal('signUp')} onWalletButtonClick={() => setIsWalletModalOpen(true)} onNavigate={(page) => navigateTo(page as View)} currentView={currentView} onChatToggle={() => setIsChatOpen(true)} onProfileUpdate={handleProfileUpdate} onOpenAdminPanel={() => setIsAdminPanelOpen(true)} />
              <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
                {renderMainContent()}
              </main>
          </div>
          
          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <div className="sticky top-0 h-screen">
                <ChatRail session={session} profile={profile} onViewProfile={setViewingProfileId} />
            </div>
          </div>

          <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out xl:hidden ${ isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)}></div>
              <div className="relative w-[320px] h-full float-right">
                <ChatRail session={session} profile={profile} onClose={() => setIsChatOpen(false)} onViewProfile={setViewingProfileId} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default App;