



import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryCards } from './components/CategoryCards';
import { OriginalsRow } from './components/OriginalsRow';
import { GameGrid } from './components/GameGrid';
import { ChatRail } from './components/ChatRail';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { Game, Profile, ProfileLink } from './types';
import { GAMES } from './constants';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import ProfilePage from './pages/ProfilePage';
import CrashGamePage from './pages/CrashGamePage';
import MinesGamePage from './pages/MinesGamePage';
import RouletteGamePage from './pages/RouletteGamePage';
import RouletteInfoPage from './pages/RouletteInfoPage';

type View = 'home' | 'crash' | 'mines' | 'roulette' | 'roulette-info' | ProfileLink['name'];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [currentView, setCurrentView] = useState<View>('home');

  const getProfile = useCallback(async (session: Session) => {
    try {
      const { user } = session;
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`id, username, avatar_url, balance`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile({ ...data, email: user.email || '' });
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getProfile(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session);
      } else {
        setProfile(null);
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setAuthView(view);
    setShowAuthModal(true);
  };
  
  const handleProfileUpdate = useCallback(() => {
      if (session) {
          getProfile(session);
      }
  }, [session, getProfile]);

  const handleBalanceChange = (amount: number) => {
    setProfile(p => p ? ({ ...p, balance: p.balance + amount }) : null);
  };

  const handleGameSelect = (gameName: string) => {
    const game = gameName.toLowerCase();
    if (game === 'crash') {
      setCurrentView('crash');
    } else if (game === 'mines') {
      setCurrentView('mines');
    } else if (game === 'roulette') {
      setCurrentView('roulette');
    }
    // Handle other games later
  };
  
  const getAppBgClass = () => {
    switch(currentView) {
        case 'crash': return 'bg-[#0F1923]';
        case 'mines': return 'bg-[#0b1016]';
        case 'roulette': return 'bg-[#0D1316]';
        case 'roulette-info': return 'bg-[#0D1316]';
        default: return 'bg-background';
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HeroCarousel />
            <div className="flex flex-col md:flex-row justify-between items-center my-8 md:my-12">
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4 md:mb-0">
                Welcome back <span className="text-accent-green">{profile?.username || 'Guest'}!</span>
              </h1>
              <div className="relative w-full md:w-auto">
                <input
                  type="search"
                  placeholder="Search 7,385 games"
                  aria-label="Search games"
                  className="bg-card-bg/50 border border-outline rounded-full py-2.5 pl-10 pr-4 w-full md:w-80 focus:ring-2 focus:ring-accent-green focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
            </div>
            <CategoryCards />
            <OriginalsRow onGameSelect={handleGameSelect} />
            <GameGrid games={GAMES as Game[]} />
          </main>
        );
      case 'crash':
        return <CrashGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onBalanceChange={handleBalanceChange} />;
      case 'mines':
        return <MinesGamePage profile={profile} session={session} onProfileUpdate={handleProfileUpdate} onBalanceChange={handleBalanceChange} />;
      case 'roulette':
        return <RouletteGamePage 
                    onNavigate={(view) => setCurrentView(view as View)} 
                    profile={profile}
                    session={session}
                    onProfileUpdate={handleProfileUpdate}
                />;
      case 'roulette-info':
        return <RouletteInfoPage onNavigate={(view) => setCurrentView(view as View)} />;
      default: // Profile pages
        return (
           <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProfilePage
                    profile={profile}
                    onProfileUpdate={handleProfileUpdate}
                    activePage={currentView}
                    setActivePage={(page) => setCurrentView(page)}
                />
           </main>
        );
    }
  };


  return (
    <div className={`min-h-screen font-sans text-heading-bright transition-colors duration-300 ${getAppBgClass()}`}>
      <WalletModal show={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        view={authView}
        setView={setAuthView}
      />
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Header 
            session={session}
            profile={profile}
            onSignInClick={() => openAuthModal('signIn')}
            onCreateAccountClick={() => openAuthModal('signUp')}
            onWalletButtonClick={() => setIsWalletModalOpen(true)}
            onMenuClick={() => setIsChatOpen(!isChatOpen)}
            onNavigate={(view) => setCurrentView(view as View)}
            onGameSelect={handleGameSelect}
            currentView={currentView}
          />
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
             {renderMainContent()}
          </div>
        </div>

        {/* Desktop Chat Rail */}
        <div className="hidden xl:block w-[320px] flex-shrink-0">
          <div className="sticky top-0 h-screen">
            <ChatRail session={session} />
          </div>
        </div>
        
        {/* Mobile Chat Overlay */}
        <div
          className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out xl:hidden ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)}></div>
          <div className="relative w-[320px] h-full float-right">
             <ChatRail session={session} onClose={() => setIsChatOpen(false)} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;