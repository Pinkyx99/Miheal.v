import React, { useState, useEffect, useCallback } from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';
import { Button } from '../shared/Button';
import { Input, Select, Textarea } from '../shared/Input';
import { supabase } from '../../../lib/supabaseClient';
import { calculateExpiryDate } from '../../../lib/utils';

interface Announcement {
    id: number;
    title: string;
    type: 'banner' | 'modal' | 'toast';
    status: 'Active' | 'Scheduled' | 'Expired';
    starts_at: string;
    expires_at: string | null;
}

export const AnnouncementsSection: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'banner' | 'modal' | 'toast'>('banner');
    const [targetGroup, setTargetGroup] = useState('all_users');
    const [schedule, setSchedule] = useState('');
    const [duration, setDuration] = useState('7d');

    const fetchAnnouncements = useCallback(async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching announcements:", error);
            setError("Could not load announcements.");
        } else if (data) {
            const now = new Date();
            const mappedData = data.map((ann: any) => {
                const startsAt = new Date(ann.starts_at);
                const expiresAt = ann.expires_at ? new Date(ann.expires_at) : null;
                let status: 'Active' | 'Scheduled' | 'Expired' = 'Scheduled';
                if (expiresAt && now > expiresAt) {
                    status = 'Expired';
                } else if (now >= startsAt) {
                    status = 'Active';
                }
                return { ...ann, status };
            });
            setAnnouncements(mappedData);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handlePublish = async () => {
        setLoading(true);
        setError(null);
        if (!title || !content) {
            setError("Title and content are required.");
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to create an announcement.");
            setLoading(false);
            return;
        }
        
        const expires_at = calculateExpiryDate(duration);

        const { error: insertError } = await supabase
            .from('announcements')
            .insert([{
                title,
                content,
                type,
                target_group: targetGroup,
                starts_at: schedule ? new Date(schedule).toISOString() : new Date().toISOString(),
                expires_at,
                created_by: user.id
            }]);

        if (insertError) {
            setError(insertError.message);
        } else {
            // Reset form and refresh list
            setTitle('');
            setContent('');
            setSchedule('');
            setDuration('7d');
            await fetchAnnouncements();
        }
        setLoading(false);
    };

    return (
        <SectionShell title="Announcements">
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Announcement */}
                <div className="bg-card p-6 rounded-lg border border-border-color space-y-4">
                    <h3 className="font-semibold text-white">Create New Announcement</h3>
                    <div>
                        <label className="text-xs font-semibold text-text-muted">Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Weekend Bonus" />
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-text-muted">Content</label>
                        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the announcement for the users..." rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-text-muted">Type</label>
                            <Select value={type} onChange={e => setType(e.target.value as any)}>
                                <option value="banner">Banner</option>
                                <option value="modal">Modal</option>
                                <option value="toast">Toast</option>
                            </Select>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-text-muted">Target Group</label>
                            <Select value={targetGroup} onChange={e => setTargetGroup(e.target.value)}>
                                <option value="all_users">All Users</option>
                                <option value="vips_only">VIPs Only</option>
                                <option value="new_users">New Users (First 7 days)</option>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-text-muted">Schedule (Optional)</label>
                            <Input type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} />
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-text-muted">Duration</label>
                            <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 7d, 12h, perm" />
                        </div>
                    </div>
                    <Button onClick={handlePublish} disabled={loading} className="w-full">
                        {loading ? 'Publishing...' : 'Publish Announcement'}
                    </Button>
                </div>

                {/* View Announcements */}
                <div>
                    <div>
                        <h3 className="font-semibold text-white mb-2">Active & Scheduled</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {announcements.filter(a => a.status !== 'Expired').map(ann => (
                                <div key={ann.id} className="bg-card p-3 rounded-md border border-border-color flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{ann.title}</p>
                                        <p className="text-xs text-text-muted">{ann.type} - Starts: {new Date(ann.starts_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ann.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {ann.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-semibold text-white mb-2">Past Announcements</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                           {announcements.filter(a => a.status === 'Expired').map(ann => (
                                <div key={ann.id} className="bg-card p-3 rounded-md border border-border-color opacity-60">
                                    <p className="text-white font-medium">{ann.title}</p>
                                    <p className="text-xs text-text-muted">{ann.type} - Expired: {ann.expires_at ? new Date(ann.expires_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
};
