import React from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile, ProfileLink } from '../types';

import { ProfileSidebar } from '../components/ProfileSidebar';
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
            <div className="flex flex-col lg:flex-row gap-8">
                <ProfileSidebar
                    profile={profile}
                    onProfileUpdate={onProfileUpdate}
                    activePage={activePage}
                    setActivePage={setActivePage}
                />
                <div className="flex-1">
                    {renderActiveSection()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;