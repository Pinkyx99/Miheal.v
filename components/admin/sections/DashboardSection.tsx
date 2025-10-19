import React from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';
import { UsersIcon, CurrencyDollarIcon, DiceIcon, ChatBubbleIcon } from '../../icons';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => {
    return (
        <div className="bg-card p-6 rounded-lg border border-border-color">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-muted">{title}</p>
                <div className="text-text-muted">{icon}</div>
            </div>
            <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-white">{value}</p>
                {change && (
                    <span className={`ml-2 text-sm font-medium ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
};

export const DashboardSection: React.FC = () => {
    return (
        <SectionShell title="Admin Dashboard">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Online Users" value="1,234" icon={<UsersIcon className="w-6 h-6" />} change="+5.4%" changeType="increase" />
                <StatCard title="Today's Wager" value="$125,430" icon={<CurrencyDollarIcon className="w-6 h-6" />} change="+12.1%" changeType="increase" />
                <StatCard title="Active Games" value="78" icon={<DiceIcon className="w-6 h-6" />} change="-2" changeType="decrease" />
                <StatCard title="Chat Messages" value="8,912" icon={<ChatBubbleIcon className="w-6 h-6" />} change="+8.2%" changeType="increase" />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-card p-6 rounded-lg border border-border-color">
                    <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                    <p className="text-text-muted text-sm">Activity feed will be implemented here.</p>
                </div>
                 <div className="bg-card p-6 rounded-lg border border-border-color">
                    <h3 className="font-semibold text-white mb-4">System Health</h3>
                    <p className="text-text-muted text-sm">System status indicators will be implemented here.</p>
                </div>
            </div>
        </SectionShell>
    );
};