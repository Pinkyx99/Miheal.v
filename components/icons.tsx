import React from 'react';

// Updated Logo to use the new image
export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => (
    <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo" className={className} />
);
