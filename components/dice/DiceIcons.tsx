
import React from 'react';

// A simplified version of the castle/fortress logo from the image background.
export const FortressIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 90 V70 H20 V50 H40 V30 H60 V50 H80 V70 H60 V90 H40 Z M45 25 H55 V15 H45 V25 Z" />
    </svg>
);
