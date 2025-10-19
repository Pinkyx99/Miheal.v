import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PROFILE_LINKS } from '../constants';
import { Profile, ProfileLink } from '../types';
import { UploadIcon } from './icons';
import { calculateLevelInfo } from '../lib/leveling';

interface ProfileSidebarProps {
    profile: Profile | null;
    onProfileUpdate: () => void;
    activePage: ProfileLink['name'];
    setActivePage: (page: ProfileLink['name']) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile, onProfileUpdate, activePage, setActivePage }) => {
    const levelInfo = profile ? calculateLevelInfo(profile.wagered || 0) : { level: 0, progress: 0 };
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }
            if (!profile) {
                 throw new Error('You must be logged in to upload an avatar.');
            }

            const file = event.target.files[0];
            const filePath = `${profile.id}/avatar`; // Use a consistent path inside a user-specific folder

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true, cacheControl: '3600' });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL and update profile
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`; // Add timestamp to bust cache

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);
            
            if (updateError) {
                throw updateError;
            }
            
            onProfileUpdate(); // Re-fetch profile data in App.tsx

        } catch (error) {
            alert((error as Error).message);
        } finally {
            setUploading(false);
        }
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // The App component will handle navigation to 'home'
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-card p-6 rounded-xl border border-outline">
                <div className="flex flex-col items-center">
                    <div className="relative group mb-3">
                        <img
                            src={profile?.avatar_url || 'https://picsum.photos/seed/avatar-main/96/96'}
                            alt="User Avatar"
                            className="w-24 h-24 rounded-full"
                        />
                        <button
                            onClick={handleAvatarClick}
                            disabled={uploading}
                            className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <UploadIcon className="w-8 h-8 text-white mb-1" />}
                            <span className="text-xs font-semibold text-white">{uploading ? 'Uploading...' : 'Upload Avatar'}</span>
                        </button>
                         <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={uploadAvatar}
                            disabled={uploading}
                            className="hidden"
                        />
                    </div>
                    <h2 className="text-xl font-bold text-white">{profile?.username}</h2>
                    <p className="text-sm text-text-muted">ID: {profile?.id.substring(0, 8) || '18510805'}</p>
                </div>
                
                <div className="my-6">
                    <div className="flex justify-between items-center text-xs text-text-muted mb-1">
                        <span>{levelInfo.progress.toFixed(2)}%</span>
                        <span>Level {levelInfo.level}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5">
                        <div className="bg-accent-green h-1.5 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                    </div>
                </div>

                <nav className="space-y-1">
                     {PROFILE_LINKS.slice(0, -1).map(link => {
                        const Icon = link.icon;
                        return (
                         <button
                            key={link.name}
                            onClick={() => setActivePage(link.name)}
                            className={`w-full flex items-center space-x-3 p-2.5 rounded-md text-sm transition-colors ${activePage === link.name ? 'bg-accent-green text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                         >
                            <Icon className="w-5 h-5" />
                            <span>{link.name}</span>
                         </button>
                         );
                    })}
                </nav>
                 <hr className="border-outline my-4" />
                 {(() => {
                    const LogoutIcon = PROFILE_LINKS[PROFILE_LINKS.length - 1].icon;
                    return (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-2.5 rounded-md text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors"
                        >
                            {/* FIX: Corrected JSX syntax to render the logout icon. */}
                            <LogoutIcon className="w-5 h-5" />
                            <span>Log out</span>
                        </button>
                    );
                 })()}
            </div>
        </aside>
    );
};