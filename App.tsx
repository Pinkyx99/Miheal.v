
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/HeroCarousel';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Session, Provider } from '@supabase/supabase-js';
import { Profile, ProfileLink, MuteBanRecord } from './types';
import { WalletModal } from './components/WalletModal';
import { OriginalsRow } from './components/OriginalsRow';
import { ChatRail } from './components/ChatRail';
import { UserProfileModal } from './components/UserProfileModal';
import { Sidebar } from './components/Sidebar';
import { PROFILE_LINKS } from './constants';
import { PromotionalModal } from './components/PromotionalModal';
import { soundManager } from './lib/sound';
import { BannedOverlay } from './components/BannedOverlay';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WIPPage = lazy(() => import('./pages/WIPPage'));
const RouletteGamePage = lazy(() => import('./pages/RouletteGamePage'));
const RouletteInfoPage = lazy(() => import('./pages/RouletteInfoPage'));
const SlotsPage = lazy(() => import('./pages/SlotsPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DiceGamePage = lazy(() => import('./pages/DiceGamePage'));
const MinesGamePage = lazy(() => import('./pages/MinesGamePage'));
const BlackjackGamePage = lazy(() => import('./pages/BlackjackGamePage'));


type View = 'home' | 'crash' | 'roulette' | 'roulette-info' | 'slots' | 'rewards' | 'dice' | 'mines' | 'blackjack' | ProfileLink['name'];

const LoadingFallback: React.FC = () => (
    <div className="flex-1 flex items-center justify-center h-full">
        <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo" className="h-16 animate-spin" />
    </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatPinned, setIsChatPinned] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuteState());
  const [banDetails, setBanDetails] = useState<MuteBanRecord | null>(null);

  // State for round-based promotional modal
  const [roundsSinceLastPromo, setRoundsSinceLastPromo] = useState(0);
  const [promoTriggerCount, setPromoTriggerCount] = useState(() => Math.floor(Math.random() * 2) + 3); // 3 or 4
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videos = ['https://i.imgur.com/vEkEIzN.mp4', 'https://i.imgur.com/hk3R808.mp4', 'https://i.imgur.com/CjNXN7F.mp4'];

  const handleGameRoundCompleted = useCallback(() => {
    setRoundsSinceLastPromo(prev => {
        const newCount = prev + 1;
        if (newCount >= promoTriggerCount) {
            setShowPromotionModal(true);
            // Reset for the next time
            setPromoTriggerCount(Math.floor(Math.random() * 2) + 3);
            return 0;
        }
        return newCount;
    });
  }, [promoTriggerCount]);


  useEffect(() => {
      try {
          const savedState = localStorage.getItem('chatPinned');
          if (savedState !== null) {
              setIsChatPinned(JSON.parse(savedState));
          }
      } catch (e) {
          console.error("Could not load pinned chat state from localStorage", e);
      }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    // The inline script in index.html already sets the class, this just syncs React state
    setTheme(savedTheme || 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return newTheme;
    });
  }, []);
  
  const toggleMute = useCallback(() => {
    const newMuteState = soundManager.toggleMute();
    setIsMuted(newMuteState);
  }, []);

  const handlePinToggle = () => {
      const newPinnedState = !isChatPinned;
      setIsChatPinned(newPinnedState);
      setIsChatOpen(false); // Close overlay when pinning/unpinning
      try {
          localStorage.setItem('chatPinned', JSON.stringify(newPinnedState));
      } catch (e) {
          console.error("Could not save pinned chat state to localStorage", e);
      }
  };

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
    videoRefs.current.forEach((video, index) => {
        if (!video) return;

        if (index === activeVideoIndex) {
            video.currentTime = 0; // Always start from the beginning.
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // AbortError is expected if the user navigates away quickly.
                    if (e.name !== 'AbortError') {
                        console.error("Error playing video:", e);
                    }
                });
            }
        } else {
            video.pause();
        }
    });
    
    // The cleanup function is crucial. It runs before the effect runs again
    // (e.g., on view change), pausing the video and preventing interruption errors.
    return () => {
        const activeVideo = videoRefs.current[activeVideoIndex];
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
  
  const handlePromoConfirm = () => {
    window.open('https://gamdom.win/landing?aff=majkl', '_blank', 'noopener,noreferrer');
    setShowPromotionModal(false);
  };

  const handlePromoClose = () => {
      setShowPromotionModal(false);
  };

  const getProfile = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Attempted to get profile without a session.");
      return;
    }
    const user = session.user;

    try {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, role, muted_until, banned_until')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        if (profileData) {
            const now = new Date();
            const bannedUntil = profileData.banned_until ? new Date(profileData.banned_until) : null;
            if (bannedUntil && bannedUntil > now) {
                const { data: banLog } = await supabase
                    .from('moderation_actions')
                    .select('reason, expires_at, moderator:moderator_id(username)')
                    .eq('target_user_id', user.id)
                    .eq('action_type', 'ban')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                setBanDetails(banLog as MuteBanRecord || { reason: 'No reason provided.', expires_at: profileData.banned_until, moderator: { username: 'System' } });
                setProfile(null);
                return;
            }
            setBanDetails(null);

            const isOwner = profileData.username === 'Owner' && user.email === 'userr.98a@gmail.com';
            const isAdminRole = profileData.role === 'Admin';
            const isAdmin = isOwner || isAdminRole;

            const fullProfile: Profile = {
                id: profileData.id,
                username: profileData.username,
                avatar_url: profileData.avatar_url,
                balance: profileData.balance,
                wagered: profileData.wagered,
                games_played: profileData.games_played,
                has_claimed_welcome_bonus: profileData.has_claimed_welcome_bonus,
                claimed_ranks: profileData.claimed_ranks,
                email: user.email!,
                is_admin: isAdmin,
                role: profileData.role,
                muted_until: profileData.muted_until,
                banned_until: profileData.banned_until,
            };
            setProfile(fullProfile);
        } else {
            throw new Error("Profile data is null for authenticated user.");
        }
    } catch (error: any) {
        console.error("Error getting profile:", error.message);
        supabase.auth.signOut();
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
        setBanDetails(null);
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
        return <WIPPage onNavigate={navigateTo} />;
      case 'roulette':
        return <RouletteGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onNavigate={navigateTo} onGameRoundCompleted={handleGameRoundCompleted} />;
      case 'roulette-info':
        return <RouletteInfoPage onNavigate={navigateTo} />;
      case 'dice':
        return <DiceGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onGameRoundCompleted={handleGameRoundCompleted} />;
      case 'mines':
        return <MinesGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onGameRoundCompleted={handleGameRoundCompleted} />;
      case 'blackjack':
        return <BlackjackGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onGameRoundCompleted={handleGameRoundCompleted} />;
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

  if (banDetails) {
    return <BannedOverlay banDetails={banDetails} />;
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
        </div>
      )}
      
      {/* Content & UI Layer */}
      <div className={`relative z-10 h-full w-full transition-colors duration-700 ${getGamePageSpecificClass()}`}>
        <PromotionalModal
            show={showPromotionModal}
            onClose={handlePromoClose}
            onConfirm={handlePromoConfirm}
        />
        <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} view={authView} setView={setAuthView} />
        <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
        <UserProfileModal userId={viewingProfileId} onClose={() => setViewingProfileId(null)} />
        <Suspense fallback={null}>
            <AdminPage show={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} profile={profile} />
        </Suspense>

        {/* Sidebar and its backdrop */}
        <div 
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar isSidebarOpen={isSidebarOpen} onNavigate={(page) => { navigateTo(page as View); setIsSidebarOpen(false); }} currentView={currentView} />

        <div className={`h-full transition-all duration-300 ${isChatPinned ? 'pr-[320px]' : 'pr-0'}`}>
            <div className="flex flex-col h-full">
                <Header 
                    session={session} 
                    profile={profile} 
                    onSignInClick={() => openAuthModal('signIn')} 
                    onSignUpClick={() => openAuthModal('signUp')} 
                    onWalletButtonClick={() => setIsWalletModalOpen(true)} 
                    onNavigate={(page) => navigateTo(page as View)} 
                    currentView={currentView} 
                    onChatToggle={() => { if (!isChatPinned) setIsChatOpen(true); }}
                    onProfileUpdate={handleProfileUpdate} 
                    onOpenAdminPanel={() => setIsAdminPanelOpen(true)} 
                    onSidebarToggle={() => setIsSidebarOpen(true)}
                    isChatPinned={isChatPinned}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                />
                <main className={`flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 flex flex-col ${currentView === 'home' ? 'justify-center' : ''}`}>
                  <Suspense fallback={<LoadingFallback />}>
                    {renderMainContent()}
                  </Suspense>
                </main>
            </div>
        </div>
        
        {/* Chat Rail Container (Single Instance) */}
        <div className={`fixed top-0 right-0 h-full z-40 w-[320px] transform transition-transform duration-300 ease-in-out ${ isChatOpen || isChatPinned ? 'translate-x-0' : 'translate-x-full'}`}>
            <ChatRail
                session={session}
                profile={profile}
                onClose={() => setIsChatOpen(false)}
                onViewProfile={setViewingProfileId}
                isPinned={isChatPinned}
                onPinToggle={handlePinToggle}
            />
        </div>

        {/* Overlay for unpinned chat */}
        <div
            className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isChatOpen && !isChatPinned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsChatOpen(false)}
        />
        <footer className={`absolute bottom-2 text-xs text-text-muted/50 z-50 transition-all duration-300 ${isChatPinned ? 'right-[calc(320px+0.5rem)]' : 'right-2'}`}>
          Made by{' '}
          <a
            href="https://www.instagram.com/site.builderhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-muted/80 transition-colors"
          >
            Ramill
          </a>{' '}
          &{' '}
          <a
            href="https://www.instagram.com/site.builderhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-muted/80 transition-colors"
          >
            Mixi
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;