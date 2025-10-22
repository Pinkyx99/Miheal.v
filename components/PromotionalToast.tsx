import React, { useEffect } from 'react';
import { GiftIcon } from './icons';

interface PromotionalToastProps {
  show: boolean;
  onClose: () => void;
}

export const PromotionalToast: React.FC<PromotionalToastProps> = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Auto-dismiss after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`fixed bottom-5 right-5 w-full max-w-sm rounded-lg shadow-2xl z-[1000] transition-all duration-500 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'}`} onClick={onClose}>
      <div className="bg-card border border-primary/50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <GiftIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-base font-bold text-white">
              Play for Real Winnings!
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Click the button to play with real stakes and win cash prizes.
            </p>
            <div className="mt-4">
              <a 
                href="https://gamdom.win/landing?aff=majkl" 
                target="_blank" rel="noopener noreferrer" 
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-primary"
                onClick={(e) => e.stopPropagation()} // Prevent closing toast when clicking link
              >
                Play Now & Earn Money
              </a>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={onClose} className="inline-flex text-text-muted rounded-md hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
