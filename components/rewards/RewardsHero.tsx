import React from 'react';
import { REWARDS_HERO_SLIDES } from '../../constants';

export const RewardsHero: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {REWARDS_HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl p-6 md:p-7 flex flex-col justify-start min-h-[240px] border border-outline shadow-soft group bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        >
          <div className="relative z-10">
            {slide.preTitle && (
              <h3 className={`font-display font-bold text-xl md:text-2xl ${slide.textColor} [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]`}>
                {slide.preTitle}
              </h3>
            )}
            <h2 className={`font-display font-extrabold ${slide.preTitle ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} ${slide.textColor} whitespace-pre-line leading-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]`}>
              {slide.title}
            </h2>
            <p className="text-gray-200 mt-2 text-sm max-w-xs whitespace-pre-line [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                {slide.subtitle}
            </p>
          </div>
          
          <button aria-label={`Learn more about ${slide.title || 'promotion'}`} className="absolute bottom-4 left-4 z-10 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-text-muted group-hover:bg-white/20 group-hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      ))}
    </div>
  );
};