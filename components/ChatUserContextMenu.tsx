import React, { useEffect, useRef } from 'react';

interface ChatUserContextMenuProps {
  user: { id: string; username: string };
  position: { x: number; y: number };
  onClose: () => void;
  onProfile: (userId: string) => void;
  onTip: (user: { id: string; username: string }) => void;
  onIgnore: (userId: string) => void;
}

export const ChatUserContextMenu: React.FC<ChatUserContextMenuProps> = ({ user, position, onClose, onProfile, onTip, onIgnore }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-36 bg-card border border-outline rounded-lg shadow-2xl p-2 animate-fade-in-fast"
      style={{ top: position.y, left: position.x }}
    >
      <ul className="space-y-1">
        <li><button onClick={() => handleAction(() => onProfile(user.id))} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors">Profile</button></li>
        <li><button onClick={() => handleAction(() => onTip(user))} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors">Tip User</button></li>
        <li><button onClick={() => handleAction(() => onIgnore(user.id))} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors">Ignore</button></li>
      </ul>
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.1s ease-out forwards; }
      `}</style>
    </div>
  );
};
