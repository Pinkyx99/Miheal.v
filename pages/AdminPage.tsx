import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Profile } from '../types';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { DashboardSection } from '../components/admin/sections/DashboardSection';
import { UsersSection } from '../components/admin/sections/UsersSection';
import { GamesSection } from '../components/admin/sections/GamesSection';
import { FinancialsSection } from '../components/admin/sections/FinancialsSection';
import { SettingsSection } from '../components/admin/sections/SettingsSection';
import { AnnouncementsSection } from '../components/admin/sections/AnnouncementsSection';
import { AuditLogSection } from '../components/admin/sections/AuditLogSection';

interface AdminPageProps {
    profile: Profile | null;
    show: boolean;
    onClose: () => void;
}

type AdminView = 'dashboard' | 'users' | 'games' | 'financials' | 'settings' | 'announcements' | 'audit_log';

const AdminPage: React.FC<AdminPageProps> = ({ profile, show, onClose }) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    
    // State for draggable modal
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const hasCentered = useRef(false);

    useEffect(() => {
        if (show && modalRef.current && !hasCentered.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = modalRef.current;
            setPosition({
                x: (innerWidth - offsetWidth) / 2,
                y: (innerHeight - offsetHeight) / 2,
            });
            hasCentered.current = true;
        }
        if (!show) {
            hasCentered.current = false;
        }
    }, [show]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (modalRef.current) {
            setIsDragging(true);
            const modalRect = modalRef.current.getBoundingClientRect();
            setOffset({
                x: e.clientX - modalRect.left,
                y: e.clientY - modalRect.top
            });
            // Bring modal to front
            modalRef.current.style.zIndex = '51';
        }
    }, []);

    const handlePointerMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
    }, [isDragging, offset]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        } else {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, handlePointerMove, handlePointerUp]);

    if (!show) {
        return null;
    }

    const renderActiveSection = () => {
        switch(activeView) {
            case 'dashboard': return <DashboardSection />;
            case 'users': return <UsersSection />;
            case 'games': return <GamesSection />;
            case 'financials': return <FinancialsSection />;
            case 'settings': return <SettingsSection />;
            case 'announcements': return <AnnouncementsSection />;
            case 'audit_log': return <AuditLogSection />;
            default: return <DashboardSection />;
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" 
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={modalRef}
                className="bg-sidebar w-full max-w-7xl h-[90vh] rounded-2xl flex overflow-hidden shadow-2xl border border-outline absolute"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
                <div className="flex-1 flex flex-col min-w-0">
                    <header 
                        className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border-color cursor-move"
                        onPointerDown={handlePointerDown}
                    >
                        <h2 className="text-lg font-bold text-white capitalize">{activeView.replace('_', ' ')}</h2>
                        <button onClick={onClose} className="p-2 text-text-muted hover:text-white cursor-pointer" aria-label="Close Admin Panel">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        {renderActiveSection()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;