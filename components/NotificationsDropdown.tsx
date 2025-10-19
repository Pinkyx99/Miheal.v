import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BellIcon } from './icons';

interface NotificationsDropdownProps {
  show: boolean;
  onClose: () => void;
  hasUnclaimedBonus: boolean | undefined;
  onProfileUpdate: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ show, onClose, hasUnclaimedBonus, onProfileUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClaim = async () => {
        setIsLoading(true);
        setError(null);
        
        const { error: rpcError } = await supabase.rpc('claim_welcome_bonus');
        
        if (rpcError) {
            setError(rpcError.message || "Failed to claim bonus. Please try again.");
        } else {
            onProfileUpdate();
            onClose();
        }
        setIsLoading(false);
    };

    if (!show) {
        return null;
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-outline rounded-lg shadow-2xl z-40 p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">Notifications</h3>
            </div>
            {hasUnclaimedBonus ? (
                <div>
                    <div className="p-3 bg-background/50 rounded-lg">
                        <p className="font-semibold text-white">Welcome to Punt!</p>
                        <p className="text-sm text-text-muted mt-1">Claim your <span className="font-bold text-green-400">$100.00</span> demo balance to get started.</p>
                        <button 
                            onClick={handleClaim}
                            disabled={isLoading}
                            className="w-full mt-3 bg-primary hover:bg-primary-light text-white font-semibold py-2 rounded-md text-sm transition disabled:opacity-50"
                        >
                            {isLoading ? 'Claiming...' : 'Claim Bonus'}
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center mx-auto mb-3">
                        <BellIcon className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-sm text-text-muted">No new notifications</p>
                </div>
            )}
        </div>
    );
};
