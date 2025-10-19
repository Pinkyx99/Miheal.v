import React from 'react';

interface SectionShellProps {
    title: string;
    children: React.ReactNode;
}

export const SectionShell: React.FC<SectionShellProps> = ({ title, children }) => {
    return (
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-outline">
            <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-outline">{title}</h2>
            <div>{children}</div>
        </div>
    );
};