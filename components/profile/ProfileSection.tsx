import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { Switch } from './shared/Switch';
import { Profile } from '../../types';

interface ProfileSectionProps {
    profile: Profile | null;
}

const InfoRow: React.FC<{ label: string, value: string | undefined, buttonText?: string }> = ({ label, value, buttonText }) => (
    <div>
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>
        <div className="flex items-center justify-between mt-2">
            <p className="text-white truncate">{value || 'Not set'}</p>
            {buttonText && <button className="text-sm font-semibold text-primary hover:text-primary-light flex-shrink-0 ml-4">{buttonText}</button>}
        </div>
    </div>
);

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SectionShell title="Account Settings">
                <div className="space-y-6">
                    <InfoRow label="Username" value={profile?.username} buttonText="Change" />
                    <hr className="border-outline" />
                    <InfoRow label="Email" value={profile?.email} buttonText="Change" />
                    <hr className="border-outline" />

                    <div>
                        <h3 className="text-lg font-semibold text-white">Change Password</h3>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-text-muted">Current Password</label>
                                <input type="password" placeholder="••••••••" className="form-input"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-muted">New Password</label>
                                <input type="password" placeholder="••••••••" className="form-input"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-muted">Confirm New Password</label>
                                <input type="password" placeholder="••••••••" className="form-input"/>
                            </div>
                        </div>
                         <button className="w-full mt-6 bg-primary text-white font-semibold py-3 rounded-lg transition-colors hover:bg-primary-light">Update Password</button>
                    </div>
                </div>
            </SectionShell>

            <SectionShell title="Privacy">
                 <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">Private Profile</p>
                            <p className="text-sm text-text-muted">Hide your profile from other users.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">Anonymous Bets</p>
                            <p className="text-sm text-text-muted">Hide your username in the live bet feed.</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                </div>
            </SectionShell>
        </div>
    );
};