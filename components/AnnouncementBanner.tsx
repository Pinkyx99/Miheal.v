import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Announcement {
    id: number;
    title: string;
    content: string;
}

export const AnnouncementBanner: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const fetchActiveAnnouncement = useCallback(async () => {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('announcements')
            .select('id, title, content')
            .eq('type', 'banner')
            .lte('starts_at', now)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows found"
            console.error("Error fetching announcement:", error);
            return;
        }

        if (data) {
            const dismissedId = sessionStorage.getItem('dismissedAnnouncementId');
            if (String(data.id) !== dismissedId) {
                setAnnouncement(data);
                setIsVisible(true);
            } else {
                setAnnouncement(null);
                setIsVisible(false);
            }
        } else {
            setAnnouncement(null);
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        // Fetch on initial component mount
        fetchActiveAnnouncement();

        // Listen for real-time changes to announcements
        const channel = supabase
            .channel('announcements-banner-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'announcements' },
                () => {
                    // When any announcement changes, re-fetch the active one.
                    // This handles new, updated, or deleted announcements.
                    fetchActiveAnnouncement();
                }
            )
            .subscribe();

        // Cleanup subscription when the component unmounts
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchActiveAnnouncement]);

    const handleDismiss = () => {
        if (announcement) {
            sessionStorage.setItem('dismissedAnnouncementId', String(announcement.id));
        }
        setIsVisible(false);
    };

    if (!announcement || !isVisible) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-primary to-secondary-green text-background p-3 relative text-center text-sm font-medium z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 px-8">
                <span className="font-bold flex-shrink-0">Owner Announcement:</span>
                <span className="truncate">{announcement.content}</span>
            </div>
            <button
                onClick={handleDismiss}
                className="absolute top-1/2 right-4 -translate-y-1/2 p-1 rounded-full text-background/70 hover:text-background hover:bg-white/20 transition-colors"
                aria-label="Dismiss announcement"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
