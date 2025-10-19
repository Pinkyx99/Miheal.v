import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { MuteBanRecord } from '../types';
import { ShieldExclamationIcon } from './icons';

interface BannedOverlayProps {
    banDetails: MuteBanRecord;
}

export const BannedOverlay: React.FC<BannedOverlayProps> = ({ banDetails }) => {
    
    const expiry = banDetails.expires_at ? new Date(banDetails.expires_at).toLocaleString() : 'Permanent';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <ShieldExclamationIcon className="w-20 h-20 text-red-500 mx-auto animate-pulse" />

                <h1 className="mt-6 text-4xl font-bold text-white">You have been banned</h1>
                
                <div className="mt-6 bg-card border border-border-color p-6 rounded-lg text-left space-y-3 text-text-muted">
                    <div>
                        <p className="text-xs font-semibold uppercase">Reason:</p>
                        <p className="text-base text-white">{banDetails.reason || 'No reason provided.'}</p>
                    </div>
                     <div>
                        <p className="text-xs font-semibold uppercase">Banned By:</p>
                        <p className="text-base text-white">{banDetails.moderator?.username || 'System'}</p>
                    </div>
                     <div>
                        <p className="text-xs font-semibold uppercase">Expires:</p>
                        <p className="text-base text-white">{expiry}</p>
                    </div>
                </div>

                <p className="mt-6 text-sm text-text-muted">
                    If you believe this is a mistake, please contact support.
                </p>

                <button
                    onClick={handleLogout}
                    className="mt-8 w-full bg-primary hover:bg-primary-light text-background font-bold py-3 rounded-lg transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};