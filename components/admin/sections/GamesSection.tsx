import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';

export const GamesSection: React.FC = () => {
    return (
        <SectionShell title="Game Management">
            <div className="text-text-muted">
                <p>This section will contain real-time controls and telemetry for live games like Roulette, Crash, and Dice.</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>View live bets and ongoing rounds.</li>
                    <li>Inspect round history and provably fair data.</li>
                    <li>Manually trigger payouts or rollback rounds (with approval).</li>
                    <li>Temporarily freeze or disable specific games.</li>
                    <li>Adjust game settings like house edge or bet limits.</li>
                </ul>
            </div>
        </SectionShell>
    );
};