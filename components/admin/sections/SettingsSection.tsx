import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';

export const SettingsSection: React.FC = () => {
    return (
        <SectionShell title="Global Settings">
            <div className="text-text-muted">
                <p>This section will allow high-level administrators to configure platform-wide settings.</p>
                 <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Manage level thresholds and XP rates.</li>
                    <li>Configure passive income and rewards for VIP tiers.</li>
                    <li>Enable or disable sitewide promotions and events.</li>
                    <li>Manage roles and permissions for the admin team.</li>
                    <li>Toggle maintenance mode.</li>
                </ul>
            </div>
        </SectionShell>
    );
};