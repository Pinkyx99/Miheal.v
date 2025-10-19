import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';

export const FinancialsSection: React.FC = () => {
    return (
        <SectionShell title="Financials">
            <div className="text-text-muted">
                <p>This section will provide tools for managing platform financials.</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>View, search, and filter all transactions (deposits, withdrawals, tips, bets).</li>
                    <li>Manually adjust user balances with a required reason for audit purposes.</li>
                    <li>Initiate refunds or grant bonuses.</li>
                    <li>Export financial reports and summaries.</li>
                    <li>Monitor for suspicious transaction patterns.</li>
                </ul>
            </div>
        </SectionShell>
    );
};