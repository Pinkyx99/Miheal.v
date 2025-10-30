import React, { useEffect, useRef, useMemo } from 'react';
import { Hero } from './components/HeroCarousel';

const PromoPanel: React.FC = () => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-outline rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4 text-center">
        <div className="flex justify-center items-center gap-3">
            <img src="https://i.imgur.com/cGalbSS.png" alt="Kick Stream Logo" className="h-12" />
            <span className="text-3xl font-bold text-white">STREAM</span>
        </div>
        <div className="bg-white/10 h-px w-full my-2"></div>
        <p className="text-text-main text-lg font-semibold">22:00PM svako veče</p>
        <p className="text-text-muted">Giveaway <span className="font-bold text-primary-light">3000$+</span> svaki mesec</p>
        <p className="text-text-muted">Zaradi novac gledajući stream!</p>
    </div>
  );
};

const FloatingPromoImage: React.FC = () => {
  return (
    <div className="relative mt-6 w-72 h-48">
      <img 
        src="https://i.imgur.com/mBJnW3o.png"
        alt="Floating money bill" 
        className="absolute top-0 right-0 w-48 h-auto animate-bob-float transform -rotate-12"
        style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
      />
      <img 
        src="https://i.imgur.com/TxgRSeZ.png"
        alt="Floating money" 
        className="absolute bottom-0 left-0 w-56 h-auto animate-bob-float"
        style={{ animationDuration: '3s' }}
      />
    </div>
  );
}

const FloatingMoney: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const moneyIcons = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationName: 'float-up',
      animationDuration: `${Math.random() * 10 + 5}s`,
      animationDelay: `${Math.random() * 7}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      fontSize: `${Math.random() * 1 + 0.5}rem`,
    };
    return (
      <div key={i} className="absolute bottom-[-20px] text-primary" style={style}>
        $
      </div>
    );
  }), [count]);

  return <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">{moneyIcons}</div>;
};

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
            ref={videoRef}
            playsInline
            muted
            loop
            autoPlay
            preload="auto"
            className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30"
         >
            <source src={backgroundVideoUrl} type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-black/50"></div>
         <FloatingMoney />
      </div>
      
      <div className="relative z-10 h-full w-full flex items-center justify-center p-4 lg:gap-16 flex-wrap">
        <main className="flex flex-col items-center gap-6 order-2 lg:order-1">
            <div className="w-full max-w-2xl xl:max-w-3xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-primary/30 hover:border-primary/70 transition-all duration-300">
                <video src="https://i.imgur.com/vC8MZLN.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>
            <Hero />
        </main>
        <aside className="order-1 lg:order-2 mb-8 lg:mb-0 flex flex-col items-center">
          <PromoPanel />
          <FloatingPromoImage />
        </aside>
      </div>
    </div>
  );
};

export default App;