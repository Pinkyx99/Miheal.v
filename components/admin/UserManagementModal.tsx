import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminUser } from '../../types';
import { calculateLevelInfo } from '../../lib/leveling';
import { Input, Select } from './shared/Input';

interface UserManagementModalProps {
    user: AdminUser;
    onClose: () => void;
    onUpdate: () => void;
}

const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className="px-4 py-2 bg-primary text-white font-semibold rounded-md text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
    </button>
);

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('account');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Account state
    const [adjustmentAmount, setAdjustmentAmount] = useState('0.00');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [newRole, setNewRole] = useState(user.role || 'User');
    const isOwner = user.role === 'Owner';

    // Stats & Rewards state
    const [wagered, setWagered] = useState(user.wagered.toString());
    const [gamesPlayed, setGamesPlayed] = useState(user.games_played.toString());
    const levelInfo = calculateLevelInfo(Number(wagered));

    // Moderation state
    const [muteDuration, setMuteDuration] = useState('');
    const [muteReason, setMuteReason] = useState('');
    const [banDuration, setBanDuration] = useState('');
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000); // Auto-clear error after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [error]);
    
    const handleBalanceUpdate = async () => {
        setLoading(true);
        setError(null);
        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount) || !adjustmentReason) {
            setError("Valid amount and reason are required.");
            setLoading(false);
            return;
        }
        const { error: rpcError } = await supabase.rpc('adjust_user_balance', { target_user_id: user.id, amount_in: amount, reason_in: adjustmentReason });
        if (rpcError) setError(rpcError.message);
        else { onUpdate(); onClose(); }
        setLoading(false);
    }

    const handleRoleUpdate = async () => {
        setLoading(true);
        setError(null);
        const { error: rpcError } = await supabase.rpc('update_user_role_as_admin', { target_user_id: user.id, new_role: newRole });
        if (rpcError) setError(rpcError.message);
        else { onUpdate(); onClose(); }
        setLoading(false);
    }

    const handleStatsUpdate = async (clearRanks = false) => {
        setLoading(true);
        setError(null);
        const { error: rpcError } = await supabase.rpc('update_user_stats_as_admin', { target_user_id: user.id, new_wagered: Number(wagered), new_games_played: Number(gamesPlayed), new_claimed_ranks: clearRanks ? [] : (user.claimed_ranks || []) });
        if (rpcError) setError(rpcError.message);
        else { onUpdate(); onClose(); }
        setLoading(false);
    }

    const handleModerationAction = async (action: 'mute' | 'ban' | 'unmute' | 'unban') => {
        setLoading(true);
        setError(null);
        
        let duration: string | null = null;
        let reason: string | null = null;
    
        if (action === 'mute') {
            duration = muteDuration;
            reason = muteReason;
        } else if (action === 'ban') {
            duration = banDuration;
            reason = banReason;
        }
    
        const { data, error: rpcError } = await supabase.rpc('moderate_user', {
            target_username_in: user.username,
            action_type_in: action,
            duration_in: duration,
            reason_in: reason,
        });
        
        if (rpcError) {
            setError(rpcError.message);
        } else if (data && !data.success) {
            setError(data.message);
        } else {
            onUpdate(); // Refresh user list
            onClose(); // Close modal on success
        }
        setLoading(false);
    };

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
                     <button onClick={onClose} className="p-2 text-text-muted hover:text-white" aria-label="Close"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </header>
                <div className="border-b border-border-color flex">
                    <button onClick={() => setActiveTab('account')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'account' ? 'text-white border-b-2 border-primary' : 'text-text-muted'}`}>Account</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'stats' ? 'text-white border-b-2 border-primary' : 'text-text-muted'}`}>Stats & Rewards</button>
                    <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'moderation' ? 'text-white border-b-2 border-primary' : 'text-text-muted'}`}>Moderation</button>
                </div>
                
                <main className="p-6 overflow-y-auto space-y-6">
                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{error}</div>}
                    
                    {activeTab === 'account' && ( 
                        <div className="space-y-6"> 
                            <div>
                                <h4 className="font-semibold text-white mb-2">Change Role</h4>
                                {isOwner ? (
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Role</label>
                                        <div className="w-full bg-background border border-border-color rounded-md p-2 mt-1 text-sm text-text-muted italic">
                                            Owner (Cannot be changed)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-text-muted">Role</label>
                                            <Select value={newRole} onChange={e => setNewRole(e.target.value)}>
                                                <option value="User">User</option>
                                                <option value="Moderator">Moderator</option>
                                                <option value="Admin">Admin</option>
                                            </Select>
                                        </div>
                                        <Button onClick={handleRoleUpdate} disabled={loading || newRole === user.role} className="self-end">Update Role</Button>
                                    </div>
                                )}
                            </div>
                            <hr className="border-border-color" />
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

                    {activeTab === 'stats' && ( <div className="space-y-6"> <div> <h4 className="font-semibold text-white mb-2">Progression</h4> <div className="bg-background p-3 rounded-lg border border-border-color"> <div className="flex justify-between items-center text-sm text-text-muted mb-1"> <span>Level {levelInfo.level}</span> <span>{levelInfo.progress.toFixed(2)}%</span> </div> <div className="w-full bg-sidebar rounded-full h-2"> <div className="bg-primary h-2 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div> </div> </div> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="text-xs font-semibold text-text-muted">Wagered Amount ($)</label> <Input type="number" step="0.01" value={wagered} onChange={e => setWagered(e.target.value)} /> </div> <div> <label className="text-xs font-semibold text-text-muted">Games Played</label> <Input type="number" value={gamesPlayed} onChange={e => setGamesPlayed(e.target.value)} /> </div> </div> <div> <h4 className="font-semibold text-white mb-2">Claimed Ranks</h4> <div className="bg-background p-3 rounded-lg border border-border-color min-h-[60px]"> {user.claimed_ranks && user.claimed_ranks.length > 0 ? ( <div className="flex flex-wrap gap-2"> {user.claimed_ranks.map(rank => ( <span key={rank} className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">{rank}</span> ))} </div> ) : ( <p className="text-text-muted text-sm">No ranks claimed yet.</p> )} </div> <Button onClick={() => handleStatsUpdate(true)} disabled={loading} className="mt-2 !bg-red-600 hover:!opacity-90"> Clear All Ranks </Button> </div> <Button onClick={() => handleStatsUpdate(false)} disabled={loading} className="w-full"> Save Stats </Button> </div> )}

                    {activeTab === 'moderation' && (
                        <div className="space-y-6">
                            {/* Mute Section */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Mute User</h4>
                                <p className="text-xs text-text-muted mb-2">Temporarily or permanently restrict the user from chatting.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Duration</label>
                                        <Input value={muteDuration} onChange={e => setMuteDuration(e.target.value)} placeholder="e.g., 30m, 12h, 7d, perm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Reason</label>
                                        <Input value={muteReason} onChange={e => setMuteReason(e.target.value)} placeholder="Optional" />
                                    </div>
                                </div>
                                <Button onClick={() => handleModerationAction('mute')} disabled={loading || !muteDuration} className="mt-2">Apply Mute</Button>
                            </div>
                            <hr className="border-border-color" />
                            {/* Ban Section */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Ban User</h4>
                                <p className="text-xs text-text-muted mb-2">Temporarily or permanently restrict the user from accessing the platform.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Duration</label>
                                        <Input value={banDuration} onChange={e => setBanDuration(e.target.value)} placeholder="e.g., 1d, 7d, perm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-text-muted">Reason</label>
                                        <Input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Optional" />
                                    </div>
                                </div>
                                <Button onClick={() => handleModerationAction('ban')} disabled={loading || !banDuration} className="mt-2 !bg-red-600 hover:!opacity-90">Apply Ban</Button>
                            </div>
                            <hr className="border-border-color" />
                            {/* Un-actions Section */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Remove Restrictions</h4>
                                <div className="flex items-center gap-4">
                                    <Button onClick={() => handleModerationAction('unmute')} disabled={loading} className="!bg-yellow-500 hover:!opacity-90">Unmute</Button>
                                    <Button onClick={() => handleModerationAction('unban')} disabled={loading} className="!bg-green-500 hover:!opacity-90">Unban</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
