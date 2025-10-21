import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, ProfileLink } from '../types';
import { UploadIcon, ChartBarIcon, BellIcon, CogIcon, ArrowsRightLeftIcon, UserCircleIcon } from '../components/icons';
import { calculateLevelInfo } from '../lib/leveling';

import { ProfileSection } from '../components/profile/ProfileSection';
import { NotificationsSection } from '../components/profile/NotificationsSection';
import { StatisticsSection } from '../components/profile/StatisticsSection';
import { SettingsSection } from '../components/profile/SettingsSection';
import { TransactionsSection } from '../components/profile/TransactionsSection';

interface ProfilePageProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
  activePage: ProfileLink['name'];
  setActivePage: (page: ProfileLink['name']) => void;
}

const ProfileHeader: React.FC<{ profile: Profile | null; onProfileUpdate: () => void; }> = ({ profile, onProfileUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const levelInfo = profile ? calculateLevelInfo(profile.wagered || 0) : { level: 0, progress: 0, currentLevelWager: 0, nextLevelWager: 100 };
    const wageredInLevel = profile ? profile.wagered - levelInfo.currentLevelWager : 0;
    const wagerForNextLevel = levelInfo.nextLevelWager - levelInfo.currentLevelWager;


    const handleAvatarClick = () => {
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');
            if (!profile) throw new Error('You must be logged in to upload an avatar.');

            const file = event.target.files[0];
            const filePath = `${profile.id}/avatar`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, cacheControl: '3600' });
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
            if (updateError) throw updateError;
            
            onProfileUpdate();
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-outline mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group flex-shrink-0">
                    <img
                        src={profile?.avatar_url || 'https://picsum.photos/seed/avatar-main/128/128'}
                        alt="User Avatar"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background"
                    />
                    <button
                        onClick={handleAvatarClick}
                        disabled={uploading}
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <UploadIcon className="w-8 h-8 text-white mb-1" />}
                        <span className="text-xs font-semibold text-white">{uploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                </div>

                 <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center sm:text-left">{profile?.username}</h1>
                        <p className="text-sm text-text-muted mt-1 sm:mt-0 text-center sm:text-left">ID: {profile?.id.substring(0, 8) || 'N/A'}</p>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between items-center text-xs text-text-muted mb-1 font-semibold">
                            <span>LEVEL {levelInfo.level}</span>
                            <span className="font-mono">${wageredInLevel.toFixed(2)} / ${wagerForNextLevel.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-3.5 relative overflow-hidden border border-border-color group">
                            <div className="absolute inset-0 bg-primary/20"></div>
                            <div className="bg-gradient-to-r from-primary-light to-primary h-full rounded-full transition-all duration-500" style={{ width: `${levelInfo.progress}%` }}></div>
                             <div className="absolute top-0 left-0 h-full w-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                                maskImage: 'linear-gradient(-75deg, transparent 30%, white 50%, transparent 70%)',
                                maskSize: '200% 100%',
                                animation: 'shine 2s infinite',
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-outline">
                <div className="text-center">
                    <p className="text-sm font-semibold text-text-muted">Total Wagered</p>
                    <p className="text-2xl font-bold text-white mt-1">${(profile?.wagered ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-text-muted">Games Played</p>
                    <p className="text-2xl font-bold text-white mt-1">{(profile?.games_played ?? 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-text-muted">Net Profit</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">-$11.54</p>
                </div>
            </div>
             <style>{`
                @keyframes shine {
                    from { mask-position: 150% 0; }
                    to { mask-position: -50% 0; }
                }
            `}</style>
        </div>
    );
};

const Navigation: React.FC<{ activePage: ProfileLink['name']; setActivePage: (page: ProfileLink['name']) => void; }> = ({ activePage, setActivePage }) => {
    const navItems: { name: ProfileLink['name']; icon: React.FC<{className?: string}> }[] = [
        { name: 'Profile', icon: UserCircleIcon },
        { name: 'Statistics', icon: ChartBarIcon },
        { name: 'Transactions', icon: ArrowsRightLeftIcon },
        { name: 'Settings', icon: CogIcon },
        { name: 'Notifications', icon: BellIcon },
    ];
    
    return (
        <div className="mb-8">
            <div className="border-b border-outline flex items-center space-x-1">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => setActivePage(item.name)}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 relative -mb-px ${
                            activePage === item.name
                                ? 'border-primary text-white'
                                : 'border-transparent text-text-muted hover:border-white/50 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="hidden sm:inline">{item.name}</span>
                        {activePage === item.name && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary blur-md"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onProfileUpdate, activePage, setActivePage }) => {
    
    const renderActiveSection = () => {
        switch(activePage) {
            case 'Profile': return <ProfileSection profile={profile} />;
            case 'Notifications': return <NotificationsSection />;
            case 'Statistics': return <StatisticsSection profile={profile} />;
            case 'Settings': return <SettingsSection />;
            case 'Transactions': return <TransactionsSection profile={profile} />;
            // Add cases for other sections like Affiliates, Privacy, etc.
            default: return <ProfileSection profile={profile} />;
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileHeader profile={profile} onProfileUpdate={onProfileUpdate} />
            <Navigation activePage={activePage} setActivePage={setActivePage} />
            <div>
                {renderActiveSection()}
            </div>
        </div>
    );
};

export default ProfilePage;