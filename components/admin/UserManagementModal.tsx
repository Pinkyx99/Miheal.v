import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminUser, Role, MuteBanRecord } from '../../types';

interface UserManagementModalProps {
    user: AdminUser;
    onClose: () => void;
    onUpdate: () => void;
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full bg-background border border-border-color rounded-md p-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50" />
);

const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className="px-4 py-2 bg-primary text-white font-semibold rounded-md text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
    </button>
);

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('moderation');
    
    // Moderation state
    const [duration, setDuration] = useState('1h');
    const [reason, setReason] = useState('');
    const [moderationHistory, setModerationHistory] = useState<MuteBanRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Account state
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [adjustmentAmount, setAdjustmentAmount] = useState('0.00');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            const { data } = await supabase.rpc('get_all_roles');
            if (data) {
                setRoles(data);
                const userRole = data.find((r: Role) => r.name === user.role);
                if (userRole) setSelectedRoleId(userRole.id);
            }
        };

        const fetchHistory = async () => {
            const { data } = await supabase
                .from('mutes_bans')
                .select(`*, moderator:moderator_id(username)`)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (data) setModerationHistory(data as any);
        }

        fetchRoles();
        fetchHistory();
    }, [user.id, user.role]);

    const handleModerationAction = async (type: 'mute' | 'ban') => {
        setLoading(true);
        setError(null);
        const { error: rpcError } = await supabase.rpc('moderate_user', {
            target_user_id: user.id,
            type_in: type,
            duration_in: duration,
            reason_in: reason
        });
        if (rpcError) {
            setError(rpcError.message);
        } else {
            setReason('');
            onUpdate(); // Refresh user list
            onClose(); // Close modal
        }
        setLoading(false);
    };

    const handleRoleUpdate = async () => {
        setLoading(true);
        setError(null);
        const { error: rpcError } = await supabase.rpc('update_user_role', {
            target_user_id: user.id,
            new_role_id: selectedRoleId
        });
        if (rpcError) setError(rpcError.message);
        else {
            onUpdate();
            onClose();
        }
        setLoading(false);
    };

    const handleBalanceUpdate = async () => {
        setLoading(true);
        setError(null);
        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount) || !adjustmentReason) {
            setError("Valid amount and reason are required.");
            setLoading(false);
            return;
        }
        const { error: rpcError } = await supabase.rpc('adjust_user_balance', {
            target_user_id: user.id,
            amount_in: amount,
            reason_in: adjustmentReason,
        });
        if (rpcError) setError(rpcError.message);
        else {
            onUpdate();
            onClose();
        }
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-sidebar w-full max-w-2xl rounded-lg shadow-2xl border border-border-color flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full" />
                        <div>
                            <h3 className="text-lg font-bold text-white">{user.username}</h3>
                            <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                    </div>
                     <button onClick={onClose} className="p-2 text-text-muted hover:text-white" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div className="border-b border-border-color flex">
                    <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'moderation' ? 'text-white border-b-2 border-primary' : 'text-text-muted'}`}>Moderation</button>
                    <button onClick={() => setActiveTab('account')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'account' ? 'text-white border-b-2 border-primary' : 'text-text-muted'}`}>Account</button>
                </div>
                
                <main className="p-6 overflow-y-auto space-y-6">
                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{error}</div>}
                    
                    {activeTab === 'moderation' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-text-muted">Duration (e.g., 5m, 1h, 7d, perm)</label>
                                    <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="1h" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-text-muted">Reason</label>
                                    <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for action" />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <Button onClick={() => handleModerationAction('mute')} disabled={loading || !reason}>Mute</Button>
                                <Button onClick={() => handleModerationAction('ban')} disabled={loading || !reason} className="!bg-red-600 hover:!opacity-90">Ban</Button>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2">History</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {moderationHistory.length > 0 ? moderationHistory.map(record => (
                                        <div key={record.id} className="bg-background p-2 rounded-md text-xs">
                                            <span className={`font-bold ${record.type === 'ban' ? 'text-red-400' : 'text-yellow-400'}`}>{record.type.toUpperCase()}</span> by {record.moderator?.username || 'System'} for "{record.reason}" - Expires: {record.expires_at ? new Date(record.expires_at).toLocaleString() : 'Permanent'}
                                        </div>
                                    )) : <p className="text-text-muted text-sm">No moderation history found.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-semibold text-text-muted">Role</label>
                                <select value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)} className="w-full bg-background border border-border-color rounded-md p-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </select>
                                <Button onClick={handleRoleUpdate} disabled={loading} className="mt-2">Update Role</Button>
                            </div>
                             <div>
                                <h4 className="font-semibold text-white mb-2">Adjust Balance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Amount (+/-)</label>
                                        <Input type="number" step="0.01" value={adjustmentAmount} onChange={e => setAdjustmentAmount(e.target.value)} placeholder="10.00 or -5.00" />
                                    </div>
                                     <div>
                                        <label className="text-xs font-semibold text-text-muted">Reason</label>
                                        <Input value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} placeholder="e.g., Bonus or Correction" />
                                    </div>
                                </div>
                                <Button onClick={handleBalanceUpdate} disabled={loading} className="mt-2">Adjust Balance</Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
