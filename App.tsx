
import React, { useEffect, useMemo } from 'react';
import { Hero } from './components/HeroCarousel';
import { InstagramIcon, TikTokIcon, DiscordIcon } from './components/icons';

const floatingImages = [
  'https://res.cloudinary.com/ddgmnys0o/image/upload/v1763064136/580b585b2edbce24c47b2884_xawcaw.png', // cash stack
  'https://i.imgur.com/flnTawQ.png', // new bill
];

const FloatingElements: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const elements = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const imageUrl = floatingImages[i % floatingImages.length];
    const size = Math.random() * 80 + 40; // size between 40px and 120px
    const style = {
      left: `${Math.random() * 100}%`,
      animationName: 'float-up',
      animationDuration: `${Math.random() * 20 + 20}s`, // Slower and longer duration
      animationDelay: `${Math.random() * 30}s`, // Longer delay
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      width: `${size}px`,
      height: 'auto',
    };
    return (
      <img
        key={i}
        src={imageUrl}
        alt="Floating element"
        className="absolute bottom-[-150px] opacity-30"
        style={style}
      />
    );
  }), [count]);

  return <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">{elements}</div>;
};

const PromoPanel: React.FC = () => {
  return (
    <a
      href="https://kick.com/michaelhere"
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-transform duration-300 hover:scale-105 group"
    >
      <div className="bg-card/50 backdrop-blur-sm border border-outline rounded-lg p-4 sm:p-6 w-full max-w-[320px] sm:w-80 shadow-lg flex flex-col gap-2 sm:gap-3 text-center transition-all duration-300 group-hover:border-primary/70 group-hover:shadow-glow-primary">
          <div className="flex justify-center items-center gap-4">
              <img src="https://i.imgur.com/cGalbSS.png" alt="Kick Stream Logo" className="h-10 sm:h-12" />
              <div className="text-left">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">STREAM</span>
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse"></div>
                      <span className="text-sm font-semibold text-accent-green">LIVE NOW</span>
                  </div>
              </div>
          </div>
          <div className="bg-white/10 h-px w-full my-1"></div>
          <p className="text-text-main text-base font-semibold">22:00H SVAKE NOĆI</p>
          <p className="text-text-muted text-sm leading-snug">
            Giveaway <span className="font-bold text-primary-light">3000$+</span> Mesečno
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> • </span>
            Zaradite gledajući stream!
          </p>
      </div>
    </a>
  );
};


const Socials: React.FC = () => {
    const socialLinks = [
        { Icon: InstagramIcon, href: 'https://www.instagram.com/mihael.here/', name: 'Instagram' },
        { Icon: TikTokIcon, href: 'https://www.tiktok.com/@mihael_live', name: 'TikTok' },
        { Icon: DiscordIcon, href: 'https://discord.gg/XPg4XrKB', name: 'Discord' },
    ];

    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 bg-card/50 backdrop-blur-sm border border-outline rounded-lg p-4 sm:p-6 w-full max-w-[320px] sm:w-80 shadow-lg">
            <p className="font-bold text-text-main tracking-widest text-base sm:text-lg">Follow me</p>
            <div className="flex justify-center gap-8 sm:gap-10">
                {socialLinks.map(({ Icon, href, name }) => (
                    <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow on ${name}`}
                        className="opacity-100 hover:opacity-80 transition-all duration-300 transform hover:scale-110">
                        <Icon className="w-9 h-9 sm:w-10 sm:h-10" />
                    </a>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const backgroundVideoUrl = 'https://i.imgur.com/vEkEIzN.mp4';

  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
  }, []);

  return (
    <div className="h-full font-sans text-text-main relative">
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
         <video
            playsInline
            muted
            loop
            autoPlay
            preload="auto"
            className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30"
         >
            <source src={backgroundVideoUrl} type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
         <FloatingElements />
      </div>
      
      <div className="relative z-10 h-full w-full flex items-center justify-center p-4 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl items-center">
            {/* Main Content */}
            <main className="lg:col-span-3 xl:col-span-2 flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl xl:max-w-3xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-primary/30 hover:border-primary/70 transition-all duration-300">
                    <video src="https://i.imgur.com/vC8MZLN.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
                <Hero />
            </main>
            
            {/* Sidebar */}
            <aside className="lg:col-span-2 xl:col-span-1 flex flex-col items-center justify-start gap-8">
              <PromoPanel />
              <Socials />
            </aside>
          </div>
      </div>
    </div>
  );
};

export default App;
