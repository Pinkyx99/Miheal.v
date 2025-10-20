import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/HeroCarousel';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Session, Provider } from '@supabase/supabase-js';
import { Profile, ProfileLink } from './types';
import { WalletModal } from './components/WalletModal';
import { OriginalsRow } from './components/OriginalsRow';
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
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videos = ['https://i.imgur.com/vEkEIzN.mp4', 'https://i.imgur.com/hk3R808.mp4'];

  const handleVideoEnded = useCallback(() => {
    setActiveVideoIndex(prevIndex => (prevIndex + 1) % videos.length);
  }, [videos.length]);

  useEffect(() => {
    // This effect handles the entire video lifecycle based on view and active index.
    if (currentView !== 'home') {
      // If we navigate away, pause all videos to prevent errors and background playback.
      videoRefs.current.forEach(v => v?.pause());
      return; // Exit early.
    }

    // If we are on the home page, manage video playback.
    const activeVideo = videoRefs.current[activeVideoIndex];
    if (activeVideo) {
      activeVideo.currentTime = 0; // Always start from the beginning.
      const playPromise = activeVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // AbortError is expected if the user navigates away quickly.
          if (e.name !== 'AbortError') {
            console.error("Error playing video:", e);
          }
        });
      }
    }
    
    // Explicitly pause the other, non-active video.
    const inactiveVideo = videoRefs.current[(activeVideoIndex + 1) % videos.length];
    if (inactiveVideo) {
      inactiveVideo.pause();
    }
    
    // The cleanup function is crucial. It runs before the effect runs again
    // (e.g., on view change), pausing the video and preventing interruption errors.
    return () => {
        if (activeVideo) {
            activeVideo.pause();
        }
    }
  }, [currentView, activeVideoIndex]);


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
    
    handleRouting(); // Determine initial view from URL

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
  
  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero />
            <OriginalsRow onGameSelect={handleGameSelect} />
          </>
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

  const getGamePageSpecificClass = () => {
     switch(currentView) {
        case 'crash': return 'bg-[#0F1923]';
        case 'roulette': return 'bg-[#0D1316]';
        case 'roulette-info': return 'bg-[#0D1316]';
        case 'slots': return 'bg-background';
        case 'rewards': return 'bg-background';
        case 'dice': return 'bg-[#081018]';
        case 'mines': return 'bg-[#0b1016]';
        case 'blackjack': return 'bg-[#081018]';
        default: return 'bg-transparent';
    }
  }

  return (
    <div className="h-full font-sans text-text-main relative">
      {/* Background Layer */}
      {currentView === 'home' && (
        <div className="absolute inset-0 z-0 overflow-hidden">
           {videos.map((url, index) => (
              <video
                  key={url}
                  // FIX: The ref callback should not return a value. Encapsulating the assignment in braces fixes this.
                  ref={el => { videoRefs.current[index] = el; }}
                  playsInline
                  muted
                  preload="auto"
                  onEnded={index === activeVideoIndex ? handleVideoEnded : undefined}
                  className={`absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${activeVideoIndex === index ? 'opacity-100' : 'opacity-0'}`}
              >
                  <source src={url} type="video/mp4" />
              </video>
           ))}
            <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      
      {/* Content & UI Layer */}
      <div className={`relative z-10 h-full w-full transition-colors duration-700 ${getGamePageSpecificClass()}`}>
        <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} view={authView} setView={setAuthView} />
        <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
        <UserProfileModal userId={viewingProfileId} onClose={() => setViewingProfileId(null)} />
        <AdminPage show={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} profile={profile} />

        {/* Sidebar and its backdrop */}
        <div 
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar isSidebarOpen={isSidebarOpen} onNavigate={(page) => { navigateTo(page as View); setIsSidebarOpen(false); }} currentView={currentView} />

        <div className="flex flex-col h-full">
            <Header session={session} profile={profile} onSignInClick={() => openAuthModal('signIn')} onSignUpClick={() => openAuthModal('signUp')} onWalletButtonClick={() => setIsWalletModalOpen(true)} onNavigate={(page) => navigateTo(page as View)} currentView={currentView} onChatToggle={() => setIsChatOpen(true)} onProfileUpdate={handleProfileUpdate} onOpenAdminPanel={() => setIsAdminPanelOpen(true)} onSidebarToggle={() => setIsSidebarOpen(true)} />
            <main className={`flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 ${currentView === 'home' ? 'flex flex-col justify-center' : ''}`}>
              {renderMainContent()}
            </main>
        </div>
        
        {/* Chat Overlay for all screen sizes */}
        <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${ isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
