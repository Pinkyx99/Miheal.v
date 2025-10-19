import React, { useRef, useCallback, useEffect } from 'react';
import './ProfileCard.css';

interface ProfileCardProps {
  avatarUrl: string;
  name?: string;
  comingSoon?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  name,
  comingSoon
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Reduced sensitivity for a more subtle tilt
    const rotateX = (y - centerY) / 18;
    const rotateY = -(x - centerX) / 18;

    card.style.setProperty('--pointer-x', `${x}px`);
    card.style.setProperty('--pointer-y', `${y}px`);
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    // Reset rotation properties to allow for a smooth transition back
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const moveHandler = handlePointerMove as EventListener;
    const leaveHandler = handlePointerLeave as EventListener;
    
    card.addEventListener('pointermove', moveHandler);
    card.addEventListener('pointerleave', leaveHandler);

    return () => {
      card.removeEventListener('pointermove', moveHandler);
      card.removeEventListener('pointerleave', leaveHandler);
    };
  }, [handlePointerMove, handlePointerLeave]);


  return (
    <div
      ref={cardRef}
      className={`pc-card ${comingSoon ? 'pc-coming-soon' : ''}`}
    >
      {comingSoon && (
        <div className="pc-coming-soon-badge">Coming Soon</div>
      )}
      <div className="pc-image-wrapper">
        <img
          className="pc-avatar"
          src={avatarUrl}
          alt={`${name || 'Game'} image`}
          loading="lazy"
        />
      </div>
      <div className="pc-spotlight" />
    </div>
  );
};

export default ProfileCard;