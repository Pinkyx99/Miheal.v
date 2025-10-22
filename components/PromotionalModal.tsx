import React from 'react';
import { Logo } from './icons';

interface PromotionalModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PromotionalModal: React.FC<PromotionalModalProps> = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-fade-in-fast">
      <div 
        className="relative bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-primary/50 overflow-hidden text-center transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        style={{
            backgroundImage: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 60%)',
            boxShadow: '0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.2)'
        }}
      >
        <div className="p-8 md:p-12">
            <button onClick={onClose} className="absolute top-2 right-2 text-[10px] text-text-muted/50 hover:text-white/50 transition-colors">
              Ask me later
            </button>
            
            <Logo className="h-16 mx-auto mb-6 animate-pulse-glow" />

            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                The Ultimate <span className="text-primary">Thrill Awaits</span>
            </h2>
            <p className="mt-4 text-lg text-text-muted max-w-md mx-auto">
                You're playing for fun, but you could be winning for real. Elevate your game on our partner site!
            </p>

            <div className="mt-10">
                <button 
                    onClick={onConfirm}
                    className="bg-gradient-to-r from-primary to-accent-red-dark hover:from-primary-light hover:to-primary text-white font-bold px-12 py-4 rounded-full text-xl transition-all duration-300 hover:scale-105 hover:shadow-glow-primary active:scale-100 shadow-lg"
                >
                    WIN REAL MONEY NOW
                </button>
            </div>
            <p className="text-xs text-text-muted/50 mt-4">Opens in a new tab. T&Cs apply.</p>
        </div>
      </div>
       <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
          @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-scale-in { animation: scale-in 0.3s ease-out 0.1s forwards; }
       `}</style>
    </div>
  );
};