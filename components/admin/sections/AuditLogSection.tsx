import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';

export const AuditLogSection: React.FC = () => {
    return (
        <SectionShell title="Audit Log">
            <div className="text-text-muted">
                <p>This section will display an immutable log of all administrative actions for security and accountability.</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Filter actions by administrator, action type, target user, or date range.</li>
                    <li>View detailed payloads for each action.</li>
                    <li>Export logs for external review.</li>
                    <li>See pending actions that require owner approval.</li>
                </ul>
            </div>
        </SectionShell>
    );
};