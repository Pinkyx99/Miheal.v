import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { BellIcon } from '../icons';

export const NotificationsSection: React.FC = () => {
    const notifications = [
        {
            title: 'Welcome Bonus',
            date: '9/19/2025',
            time: '7:02:50 PM',
            text: 'A 15% rakeback welcome bonus has been activated on your account for 7 days. This will expire on 9/26/2025, 7:02:50 PM.'
        }
    ];

    return (
        <SectionShell title="Notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Notifications */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">New Notifications</h3>
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-card-bg/50 rounded-lg border border-outline h-64">
                        <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mb-4">
                           <BellIcon className="w-8 h-8 text-accent-green" />
                        </div>
                        <p className="text-lg font-semibold text-white">Perfect!</p>
                        <p className="text-text-muted">You Dont have any pending notifications.</p>
                    </div>
                </div>

                {/* Notifications History */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Notifications History</h3>
                    <div className="space-y-4">
                        {notifications.map((item, index) => (
                            <div key={index} className="bg-card-bg/50 rounded-lg p-4 border border-outline">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-white">{item.title}</p>
                                    <p className="text-xs text-text-muted">{item.date} {item.time}</p>
                                </div>
                                <p className="text-sm text-text-muted">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SectionShell>
    );
};
