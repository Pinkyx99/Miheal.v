import React, { useRef } from 'react';
import { ROYALTY_RANKS } from '../../constants';
import { RankCard } from './RankCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { Profile, RoyaltyRank } from '../../types';

interface RoyaltyUpProps {
  profile: Profile | null;
  onClaimRank: (rank: RoyaltyRank) => void;
  claimingRank: string | null;
}

export const RoyaltyUp: React.FC<RoyaltyUpProps> = ({ profile, onClaimRank, claimingRank }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold font-display text-white">Royalty Up</h2>
                <p className="text-sm text-text-muted mt-1">Level up and increase your rewards</p>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => handleScroll('left')} className="h-9 w-9 rounded-md bg-card flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition-colors border border-outline"><ChevronLeftIcon className="w-5 h-5" /></button>
                <button onClick={() => handleScroll('right')} className="h-9 w-9 rounded-md bg-card flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-white transition-colors border border-outline"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
      </div>
       <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory', scrollPaddingLeft: '1rem' }}>
            {ROYALTY_RANKS.map(rank => (
                <div key={rank.name} className="flex-shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                    <RankCard rank={rank} profile={profile} onClaim={onClaimRank} isClaiming={claimingRank === rank.name} />
                </div>
            ))}
        </div>
    </div>
  );
};