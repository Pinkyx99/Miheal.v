import React from 'react';
import { RoyaltyRank, Profile } from '../../types';
import { LockIcon } from '../icons';
import { calculateLevelInfo } from '../../lib/leveling';

interface RankCardProps {
    rank: RoyaltyRank;
    profile: Profile | null;
    onClaim: (rank: RoyaltyRank) => void;
    isClaiming: boolean;
}

export const RankCard: React.FC<RankCardProps> = ({ rank, profile, onClaim, isClaiming }) => {
    const levelInfo = profile ? calculateLevelInfo(profile.wagered || 0) : { level: 0 };
    
    const isClaimed = profile?.claimed_ranks?.includes(rank.name) ?? false;
    const isUnlocked = !isClaimed && levelInfo.level >= rank.levelRequirement;
    const isLocked = !isClaimed && !isUnlocked;

    const getButtonText = () => {
        if (isClaiming) return 'Claiming...';
        if (isClaimed) return 'Claimed';
        return 'Claim Reward';
    };

    return (
        <div className={`bg-card border border-outline rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 h-full ${isLocked ? 'opacity-60 grayscale-[50%]' : ''}`}>
            <div className="relative mb-3">
                <img src={rank.image} alt={rank.name} className="w-28 h-28 object-contain drop-shadow-lg" />
                {isLocked && (
                    <div className="absolute top-1 right-1 bg-background/60 backdrop-blur-sm rounded-full p-1 border border-outline">
                        <LockIcon className="w-4 h-4 text-text-muted" />
                    </div>
                )}
            </div>
            
            <div className="flex-grow flex flex-col justify-center items-center my-3">
                <h4 className={`font-bold text-accent-green text-base leading-tight`}>{rank.name}</h4>
                <p className="text-xs text-text-muted mt-1">Level {rank.levelRequirement}</p>
                {isLocked ? (
                  <p className="text-lg font-bold text-text-muted mt-1" title="Unlock to reveal reward">???</p>
                ) : (
                  <p className="text-lg font-bold text-white mt-1">${rank.rewardAmount.toLocaleString()}</p>
                )}
            </div>

            <button
                onClick={() => onClaim(rank)}
                disabled={!isUnlocked || isClaiming}
                className="w-full mt-4 py-2.5 rounded-md font-semibold text-sm transition-colors text-white disabled:bg-[#2A3341] disabled:text-text-muted/60 disabled:cursor-not-allowed bg-accent-green hover:bg-secondary-green"
            >
                {getButtonText()}
            </button>
        </div>
    );
};