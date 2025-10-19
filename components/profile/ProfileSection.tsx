import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { Switch } from './shared/Switch';
import { Profile } from '../../types';

interface ProfileSectionProps {
    profile: Profile | null;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {

    const renderVerificationLevel = (level: number, status: 'Completed' | 'Please fill in' | 'Locked', progress: number) => (
        <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${status === 'Completed' ? 'bg-accent-green text-white' : 'bg-background text-text-muted border-2 border-outline'}`}>{level}</div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-white">Level {level}</p>
                    <p className={`text-sm font-medium ${status === 'Completed' ? 'text-accent-green' : 'text-text-muted'}`}>{status}</p>
                </div>
                <div className="w-full bg-background rounded-full h-1.5">
                    <div className="bg-accent-green h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );

    return (
        <SectionShell title="Profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">User Info</h3>
                    <div>
                        <label className="text-sm text-text-muted">Username</label>
                        <div className="flex items-center justify-between mt-1 bg-background p-3 rounded-lg border border-outline">
                            <span className="text-white">{profile?.username}</span>
                            <button className="text-sm font-semibold text-accent-green hover:underline">Change</button>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm text-text-muted">Email</label>
                        <div className="flex items-center justify-between mt-1 bg-background p-3 rounded-lg border border-outline">
                            <span className="text-white">{profile?.email}</span>
                            <button className="text-sm font-semibold text-accent-green hover:underline">Change</button>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm text-text-muted">Phone number</label>
                        <div className="flex items-center justify-between mt-1 bg-background p-3 rounded-lg border border-outline">
                            <span className="text-text-muted/50 italic">Enter phone number</span>
                            <button className="text-sm font-semibold text-accent-green hover:underline">Change</button>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold text-white">Hidden options</h3>
                         <div className="flex items-center justify-between mt-4">
                            <p className="text-white">Hide details from other users</p>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-white">Hide statistics from other users</p>
                            <Switch checked={true} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-white">Verification</h3>
                     <div className="space-y-4">
                        {renderVerificationLevel(1, 'Completed', 100)}
                        {renderVerificationLevel(2, 'Please fill in', 0)}
                     </div>
                     <p className="text-sm text-text-muted">In order to increase your deposit and withdrawal limit, we first need to learn more about you due to anti money laundering laws.</p>
                     <button className="w-full bg-accent-green text-white font-semibold py-3 rounded-md transition-opacity hover:opacity-90">Complete level</button>
                      <div className="pt-4">
                        {renderVerificationLevel(3, 'Locked', 0)}
                     </div>
                </div>
            </div>
        </SectionShell>
    );
};