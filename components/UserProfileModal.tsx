import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { ChartBarIcon } from './icons';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onTipUser: (recipient: { id: string; username: string }) => void;
}

type UserProfile = Pick<Profile, 'id' | 'username' | 'avatar_url' | 'games_played' | 'wagered'>;

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose, onTipUser }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
        setUserProfile(null);
        return;
    };

    const fetchUserProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, games_played, wagered')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setUserProfile(data);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  if (!userId) return null;

  const handleTip = () => {
    if (userProfile) {
        onTipUser({ id: userProfile.id, username: userProfile.username });
        onClose();
    }
  }
  
  // Mock net profit based on a simulated 1.3% house edge
  const netProfit = userProfile ? (userProfile.wagered || 0) * -0.013 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-outline p-6 relative modal-content"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:text-white hover:bg-white/10" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        {loading && <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
        
        {!loading && userProfile && (
            <div className="flex flex-col items-center">
                <img src={userProfile.avatar_url} alt={userProfile.username} className="w-20 h-20 rounded-full mb-2 border-2 border-primary" />
                <h2 className="text-2xl font-bold text-white">{userProfile.username}</h2>
                <p className="text-sm text-text-muted">ID: {userProfile.id.substring(0,8)}</p>

                <div className="w-full my-6">
                    <h3 className="text-lg font-semibold text-white mb-3 text-center">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-text-muted">Games Played</p>
                            <p className="text-xl font-bold text-white">{(userProfile.games_played || 0).toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-xs text-text-muted">Wagered</p>
                            <p className="text-xl font-bold text-white">${(userProfile.wagered || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                         <div>
                            <p className="text-xs text-text-muted">Net Profit</p>
                            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-accent-green' : 'text-red-500'}`}>{netProfit < 0 ? '-' : ''}${Math.abs(netProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-background/50 border border-outline rounded-lg p-4 mb-6">
                     <h4 className="font-semibold text-white text-sm mb-2 text-center">Cumulative Net Profit</h4>
                     <div className="h-48 bg-background rounded-lg flex items-center justify-center text-text-muted">
                        <ChartBarIcon className="w-10 h-10 text-text-muted/50" />
                        <p className="ml-3 text-sm">Chart Data Unavailable</p>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <button onClick={handleTip} className="w-full bg-accent-green text-white font-semibold py-3 rounded-md transition-opacity hover:opacity-90">
                        Tip user
                    </button>
                    <button className="w-full bg-card border border-outline text-text-muted font-semibold py-3 rounded-md hover:bg-white/5 transition-colors">
                        Ignore
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};