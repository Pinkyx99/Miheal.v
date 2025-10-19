import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';

export const AnnouncementsSection: React.FC = () => {
    return (
        <SectionShell title="Announcements">
            <div className="text-text-muted">
                <p>This section will be used to create and manage announcements for users.</p>
                 <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Create new announcements (banners, modals, toasts).</li>
                    <li>Schedule announcements for specific times.</li>
                    <li>Target announcements to specific user groups (e.g., by role, country, or VIP level).</li>
                    <li>View history of past announcements.</li>
                </ul>
            </div>
        </SectionShell>
    );
};