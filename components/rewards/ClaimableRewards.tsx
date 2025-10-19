import React from 'react';
import { CLAIMABLE_REWARDS } from '../../constants';

export const ClaimableRewards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CLAIMABLE_REWARDS.map((reward) => (
        <div key={reward.title} className="bg-card-bg border border-outline rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">{reward.title}</h3>
              <p className="text-sm text-text-muted">Reward</p>
            </div>
            {reward.timeLeft && (
              <div className="bg-background px-3 py-1 rounded-full text-xs font-semibold text-text-muted flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{reward.timeLeft}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center my-6">
             <img src={reward.imageUrl} alt={`${reward.title} Reward`} className="w-48 h-auto" />
          </div>

          <div className="h-12">
            {reward.reward && (
              <div className="bg-background rounded-md h-full flex items-center justify-center text-accent-green font-bold text-lg mb-4">
                {reward.reward}
              </div>
            )}
          </div>
          
          <button
            disabled={!reward.claimable}
            className="w-full py-3 rounded-md font-semibold text-white transition-colors disabled:bg-[#2A3341] disabled:text-text-muted/60 disabled:cursor-not-allowed bg-accent-green hover:bg-secondary-green"
          >
            Claim Reward
          </button>
        </div>
      ))}
    </div>
  );
};