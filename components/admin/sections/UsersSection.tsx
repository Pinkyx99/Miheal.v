import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SectionShell } from '../../profile/shared/SectionShell';
import { SearchIcon } from '../../icons';
import { supabase } from '../../../lib/supabaseClient';
import { AdminUser, UserStatus } from '../../../types';
import { UserManagementModal } from '../UserManagementModal';

export const UsersSection: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from('detailed_profiles')
            .select('*')
            .order('last_seen', { ascending: false, nullsFirst: false });

        if (fetchError) {
            console.error("Error fetching users:", fetchError);
            setError("Failed to load user data. This might be due to RLS permissions on the 'detailed_profiles' view.");
            setUsers([]);
        } else if (data) {
            const mappedUsers: AdminUser[] = data.map((user: any) => {
                let status: UserStatus = 'Offline';
                if (user.banned_until) {
                    if (user.banned_until === 'infinity' || new Date(user.banned_until) > new Date()) {
                        status = 'Banned';
                    }
                } 
                else if (user.last_seen && new Date(user.last_seen) > new Date(Date.now() - 5 * 60 * 1000)) {
                     status = 'Online';
                }

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email || 'N/A',
                    avatar_url: user.avatar_url,
                    role: user.role || 'User',
                    balance: user.balance || 0,
                    status: status,
                    last_seen: user.last_seen,
                };
            });
            setUsers(mappedUsers);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, users]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const getStatusColor = (status: 'Online' | 'Offline' | 'Banned') => {
        switch (status) {
            case 'Online': return 'bg-green-500';
            case 'Offline': return 'bg-gray-500';
            case 'Banned': return 'bg-red-500';
        }
    };

    return (
        <>
            {selectedUser && (
                <UserManagementModal 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    onUpdate={fetchUsers}
                />
            )}
            <SectionShell title="User Management">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-text-muted" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search by username or email"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-sidebar border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
                        />
                    </div>
                </div>

                <div className="bg-card border border-border-color rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-muted">
                            <thead className="text-xs uppercase bg-background">
                                <tr>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Balance</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Last Seen</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8">Loading users...</td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-red-400">{error}</td>
                                    </tr>
                                )}
                                {!loading && !error && paginatedUsers.map(user => (
                                    <tr key={user.id} className="border-b border-border-color hover:bg-sidebar">
                                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <img className="w-8 h-8 rounded-full" src={user.avatar_url} alt={`${user.username} avatar`} />
                                                <div>
                                                    <div>{user.username}</div>
                                                    <div className="text-xs text-text-muted">{user.email}</div>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{user.role}</td>
                                        <td className="px-6 py-4">${user.balance.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(user.status)}`}></div>
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedUser(user)} className="font-medium text-primary hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && paginatedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <nav className="flex justify-between items-center pt-4" aria-label="Table navigation">
                    <span className="text-sm font-normal text-text-muted">
                        Showing <span className="font-semibold text-white">{!loading && !error ? Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length) : 0}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-semibold text-white">{filteredUsers.length}</span>
                    </span>
                    <ul className="inline-flex items-center -space-x-px">
                        <li>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || totalPages === 0} className="px-3 py-2 ml-0 leading-tight text-text-muted bg-card border border-border-color rounded-l-lg hover:bg-sidebar disabled:opacity-50">
                                Previous
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-2 leading-tight text-text-muted bg-card border border-border-color rounded-r-lg hover:bg-sidebar disabled:opacity-50">
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </SectionShell>
        </>
    );
};