import React from 'react';

export const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
    <button 
        {...props} 
        className={`px-4 py-2 bg-primary text-background font-semibold rounded-md text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);
