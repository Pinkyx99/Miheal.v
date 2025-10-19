import React, { useCallback, useState } from 'react';
import { RoyaltyUp } from '../components/rewards/RoyaltyUp';
import { Profile, RoyaltyRank } from '../types';
import { supabase } from '../lib/supabaseClient';

interface RewardsPageProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

const RewardsPage: React.FC<RewardsPageProps> = ({ profile, onProfileUpdate }) => {
  const [claimingRank, setClaimingRank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaimRank = useCallback(async (rank: RoyaltyRank) => {
    if (!profile || !profile.id) {
        setError("You must be logged in to claim a reward.");
        return;
    }
    if (claimingRank) return;

    setClaimingRank(rank.name);
    setError(null);

    try {
        const newBalance = (profile.balance || 0) + rank.rewardAmount;
        const newClaimedRanks = [...(profile.claimed_ranks || []), rank.name];

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                balance: newBalance,
                claimed_ranks: newClaimedRanks,
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;
        
        onProfileUpdate();
    } catch (e: any) {
        setError(e.message || "An error occurred while claiming the reward.");
    } finally {
        setClaimingRank(null);
    }
  }, [profile, onProfileUpdate, claimingRank]);

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {error && <div className="bg-red-500/20 text-red-400 text-center p-3 rounded-md mb-6">{error}</div>}
      <RoyaltyUp profile={profile} onClaimRank={handleClaimRank} claimingRank={claimingRank} />
    </main>
  );
};

export default RewardsPage;