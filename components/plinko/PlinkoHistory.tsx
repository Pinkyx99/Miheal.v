import React from 'react';
import { PlinkoBet } from '../../pages/PlinkoGamePage'; // Assuming type is exported from page

interface PlinkoHistoryProps {
  history: PlinkoBet[];
}

const getMultiplierColor = (multiplier: number) => {
  if (multiplier < 1) return 'text-gray-400';
  if (multiplier < 2) return 'text-white';
  if (multiplier < 10) return 'text-cyan-400';
  if (multiplier < 100) return 'text-purple-400';
  return 'text-yellow-400';
};

export const PlinkoHistory: React.FC<PlinkoHistoryProps> = ({ history }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mt-4">
      <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg overflow-x-auto no-scrollbar">
        {history.length === 0 && (
          <div className="text-center w-full text-sm text-text-muted py-2">
            Your recent plays will appear here.
          </div>
        )}
        {history.map((bet) => (
          <div
            key={bet.id}
            className={`flex-shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-transform hover:scale-105 ${getMultiplierColor(bet.multiplier)} bg-card border border-outline`}
          >
            {bet.multiplier.toFixed(2)}x
          </div>
        ))}
      </div>
    </div>
  );
};
