import React from 'react';
import { PROFILE_LINKS } from '../constants';
import { Profile, ProfileLink } from '../types';
import { calculateLevelInfo } from '../lib/leveling';
import { ShieldExclamationIcon } from './icons';

interface ProfileDropdownProps {
    profile: Profile | null;
    onNavigate: (page: ProfileLink['name']) => void;
    onLogout: () => void;
    onOpenAdminPanel: () => void;
}

// Check for admin/owner role based on the profile data from the database
const isAdmin = (profile: Profile | null) => {
    return !!profile?.is_admin;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ profile, onNavigate, onLogout, onOpenAdminPanel }) => {
    const levelInfo = profile ? calculateLevelInfo(profile.wagered || 0) : { level: 0, progress: 0 };
    const showAdminButton = isAdmin(profile);

    return (
        <div className="relative group">
            <button className="flex items-center space-x-2" aria-label={`User profile for ${profile?.username}`} onClick={() => onNavigate('Profile')}>
                <img src={profile?.avatar_url || 'https://picsum.photos/seed/avatar-main/40/40'} alt="User Avatar" className="w-8 h-8 rounded-full" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-outline rounded-lg shadow-2xl z-40 p-4 transition-all duration-200 origin-top-right scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 invisible group-hover:visible">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={profile?.avatar_url || 'https://picsum.photos/seed/avatar-main/40/40'} alt="User Avatar" className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-semibold text-white">{profile?.username}</p>
                        <p className="text-xs text-text-muted">ID: 18510805</p>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center text-xs text-text-muted mb-1">
                        <span>{levelInfo.progress.toFixed(2)}%</span>
                        <span>Level {levelInfo.level}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5">
                        <div className="bg-accent-green h-1.5 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-1">
                    {PROFILE_LINKS.map(link => {
                         const Icon = link.icon;
                         return (
                             <button
                                key={link.name}
                                onClick={() => link.name === 'Log out' ? onLogout() : onNavigate(link.name)}
                                className="w-full flex items-center space-x-3 p-2 rounded-md text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors"
                             >
                                <Icon className="w-5 h-5" />
                                <span>{link.name}</span>
                             </button>
                         );
                    })}
                     {showAdminButton && (
                         <>
                            <hr className="border-t border-border-color my-1" />
                            <button
                                onClick={onOpenAdminPanel}
                                className="w-full flex items-center space-x-3 p-2 rounded-md text-sm text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                             >
                                <ShieldExclamationIcon className="w-5 h-5" />
                                <span>Admin Panel</span>
                             </button>
                         </>
                    )}
                </div>
            </div>
        </div>
    );
}