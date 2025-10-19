import React from 'react';

const baseInputClasses = "w-full bg-background border border-border-color rounded-md p-2 mt-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={baseInputClasses} />
);

export const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className={baseInputClasses}>
        {children}
    </select>
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className={baseInputClasses} />
);
