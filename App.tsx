import React, { useState, useEffect, useCallback } from 'react';
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
import MinesGamePage from './pages/MinesGamePage';
import RouletteGamePage from './pages/RouletteGamePage';
import DiceGamePage from './pages/DiceGamePage';
import BlackjackGamePage from './pages/BlackjackGamePage';
import { ChatRail } from './components/ChatRail';
import { TipUserModal } from './components/TipUserModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CogIcon } from './components/icons';
import { Sidebar } from './components/Sidebar';
import { PROFILE_LINKS } from './constants';
import RouletteInfoPage from './pages/RouletteInfoPage';
import SlotsPage from './pages/SlotsPage';
import RewardsPage from './pages/RewardsPage';
import AdminPage from './pages/AdminPage';

type View = 'home' | 'crash' | 'mines' | 'roulette' | 'dice' | 'blackjack' | 'roulette-info' | 'slots' | 'rewards' | ProfileLink['name'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tipRecipient, setTipRecipient] = useState<{ id: string; username: string } | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Hide loading screen on initial app load
  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Start fading out
        loadingScreen.style.opacity = '0';
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
  }, []);

  const navigateTo = useCallback((view: View) => {
    // Set the URL hash. The 'hashchange' event listener will handle updating the view state.
    const path = view === 'home' 
      ? '' 
      : `/${view.toLowerCase().replace(/ /g, '-')}`;
    
    // Only update if the hash is different to avoid redundant event triggers and history entries.
    if (window.location.hash !== `#${path}`) {
      window.location.hash = path;
    }
  }, []);
  
  useEffect(() => {
    // This function reads the URL hash and updates the component state.
    const handleRouting = () => {
      // Get path from hash, remove '#' and any leading '/'
      const hash = window.location.hash.substring(1);
      const path = hash.startsWith('/') ? hash.substring(1).toLowerCase() : hash.toLowerCase();
      
      const validGameViews = ['crash', 'mines', 'roulette', 'dice', 'blackjack', 'roulette-info', 'slots', 'rewards'];
      const validProfileViews = PROFILE_LINKS.map(l => l.name.toLowerCase().replace(' ', '-'));
      
      let view: View = 'home';
      if (path === '') {
          view = 'home';
      } else if (validGameViews.includes(path)) {
          view = path as View;
      } else if (validProfileViews.includes(path)) {
          const profileView = PROFILE_LINKS.find(link => link.name.toLowerCase().replace(' ', '-') === path);
          if (profileView) {
              view = profileView.name;
          }
      }
      setCurrentView(view);
    };

    // Run routing logic on initial page load
    handleRouting();

    // Listen for hash changes (e.g., back/forward buttons, navigateTo calls)
    window.addEventListener('hashchange', handleRouting);
    
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('hashchange', handleRouting);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  // To fix the "claimed_ranks does not exist" error, run this SQL in your Supabase SQL Editor:
  // ALTER TABLE profiles
  // ADD COLUMN claimed_ranks TEXT[] DEFAULT ARRAY[]::TEXT[];
  const getProfile = useCallback(async () => {
    try {
      // Use the new RPC function to get the profile with the role name included
      const { data, error } = await supabase
        .rpc('get_my_profile')
        .single();

      if (error) {
        console.error("Error getting profile with role:", error);
        throw error;
      }

      if (data) {
        // The RPC returns all necessary fields, so we can set the profile directly
        setProfile(data as Profile);
      }
    } catch (error) {
      console.log('Error getting profile:', error);
    }
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile();
      } else {
        setProfile(null);
        navigateTo('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [getProfile, navigateTo]);

  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setAuthView(view);
    setShowAuthModal(true);
  };
  
  const handleOAuthSignIn = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'https://gamdom2.vercel.app',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
        console.error("OAuth sign-in error:", error);
        alert(`OAuth sign-in error: ${error.message}`);
    }
  };

  const handleProfileUpdate = useCallback(() => {
    if (session) getProfile();
  }, [session, getProfile]);

  const handleGameSelect = (gameName: string) => {
    const game = gameName.toLowerCase();
    if (['crash', 'mines', 'roulette', 'dice', 'blackjack', 'slots'].includes(game)) {
      navigateTo(game as View);
    }
  };
  
  const getAppBgClass = () => {
    switch(currentView) {
        case 'crash': return 'bg-[#0F1923]';
        case 'mines': return 'bg-background';
        case 'roulette': return 'bg-[#0D1316]';
        case 'roulette-info': return 'bg-[#0D1316]';
        case 'dice': return 'bg-[#081018]';
        case 'blackjack': return 'bg-[#1a1a1a]';
        case 'slots': return 'bg-background';
        case 'rewards': return 'bg-background';
        default: return 'bg-background';
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <Hero session={session} onSignUpClick={() => openAuthModal('signUp')} onGoogleSignInClick={() => handleOAuthSignIn('google')} />
            <OriginalsRow onGameSelect={handleGameSelect} />
            <GameGrid />
          </div>
        );
      case 'crash':
        return <CrashGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'mines':
        return <MinesGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'roulette':
        return <RouletteGamePage 
                    profile={profile}
                    session={session}
                    onProfileUpdate={handleProfileUpdate}
                    onNavigate={navigateTo}
                />;
      case 'roulette-info':
        return <RouletteInfoPage onNavigate={navigateTo} />;
      case 'dice':
        return <DiceGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'blackjack':
        return <BlackjackGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} />;
      case 'slots':
        return <SlotsPage session={session} onSignInClick={() => openAuthModal('signIn')} />;
      case 'rewards':
        return <RewardsPage profile={profile} onProfileUpdate={handleProfileUpdate} />;
      default: // Profile pages
        return (
            <ProfilePage
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
                activePage={currentView}
                setActivePage={navigateTo}
            />
        );
    }
  };

  return (
    <div className={`h-screen font-sans text-text-main transition-colors duration-300 ${getAppBgClass()}`}>
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        view={authView}
        setView={setAuthView}
      />
      <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <TipUserModal
        show={!!tipRecipient}
        onClose={() => setTipRecipient(null)}
        recipient={tipRecipient}
        onTipped={handleProfileUpdate}
      />
       <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onTipUser={setTipRecipient}
      />
      <AdminPage show={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} profile={profile} />

      <div className="flex h-screen">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onNavigate={(page) => navigateTo(page as View)}
            currentView={currentView}
          />
          <div className="flex-1 min-w-0 flex flex-col">
              <Header
                session={session}
                profile={profile}
                onSignInClick={() => openAuthModal('signIn')}
                onSignUpClick={() => openAuthModal('signUp')}
                onWalletButtonClick={() => setIsWalletModalOpen(true)}
                onNavigate={(page) => navigateTo(page as View)}
                currentView={currentView}
                onChatToggle={() => setIsChatOpen(true)}
                onProfileUpdate={handleProfileUpdate}
                onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
              />
              <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
                {renderMainContent()}
              </main>
          </div>
          
          {/* Desktop Chat Rail */}
          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <div className="sticky top-0 h-screen">
                <ChatRail session={session} profile={profile} onTipUser={setTipRecipient} onViewProfile={setViewingProfileId} />
            </div>
          </div>

          {/* Mobile Chat Overlay */}
          <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out xl:hidden ${ isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)}></div>
              <div className="relative w-[320px] h-full float-right">
                <ChatRail session={session} profile={profile} onClose={() => setIsChatOpen(false)} onTipUser={setTipRecipient} onViewProfile={setViewingProfileId} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default App;