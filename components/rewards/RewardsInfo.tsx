import React from 'react';

export const RewardsInfo: React.FC = () => {
  return (
    <div className="bg-card-bg border border-outline rounded-xl p-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold font-display text-white mb-4">
          Welcome to Rewards 2.0 <span className="text-accent-green">+</span>
        </h2>
        <div className="space-y-4 text-text-muted">
          <p>
            The latest iteration of the Gamdom Royalty Club, Rewards 2.0, a next-level loyalty program, is designed to make every moment of your gameplay more rewarding. With personalised bonuses, dynamic rank progression, and seamless reward claims, this new system ensures every player feels valued and in control.
          </p>
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-white mb-2">A Journey Through Royalty</h3>
            <p>
              Progress through 24 levels across 8 tiers, including Bronze, Silver, Gold, Emerald, Sapphire, Ruby, Diamond, and the ultimate Opal rank. Each tier features three levels, with increasingly valuable rewards as you climb the ranks.
            </p>
          </div>
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-white mb-2">What's New in Rewards 2.0?</h3>
            <p>
              Personalised Rewards: Rewards are now tailored to your activity, rank, and gameplay style, offering incentives that provide real value. Whether you're a casual player or a seasoned pro, expect bonuses that match your interests.
            </p>
          </div>
        </div>
        <button className="mt-6 bg-accent-green text-white font-semibold px-6 py-2.5 rounded-md text-sm transition-transform duration-200 hover:scale-105">
          Read More
        </button>
      </div>
    </div>
  );
};