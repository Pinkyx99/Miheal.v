import React from 'react';

// Updated Logo to use the new image
export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => (
    <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo" className={className} />
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img src="https://res.cloudinary.com/ddgmnys0o/image/upload/v1762960433/4922972_clmfsu.png" alt="Instagram" className={className} />
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img src="https://res.cloudinary.com/ddgmnys0o/image/upload/v1762960383/1946552_vxnaev.png" alt="TikTok" className={className} />
);

export const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img src="https://res.cloudinary.com/ddgmnys0o/image/upload/v1762960413/4945914_r44wht.png" alt="Discord" className={className} />
);