import React, { useState, useEffect } from 'react';
import { SectionShell } from './shared/SectionShell';
import { supabase } from '../../lib/supabaseClient';
import { Profile } from '../../types';

interface TransactionsSectionProps {
    profile: Profile | null;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState('All');
    const tabs = ['All', 'Deposits', 'Withdraws', 'Tips'];
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!profile) return;
            setLoading(true);
            setFetchError(null);
            
            const { data, error } = await supabase
                .from('transactions')
                .select('*, sender:sender_id(username), recipient:recipient_id(username)')
                .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) {
                console.error("Error fetching transactions:", error);
                if (error.code === 'PGRST205') {
                    setFetchError("The transaction history table seems to be missing. Please ensure your database schema is correctly set up.");
                } else {
                    setFetchError("An error occurred while fetching your transactions.");
                }
            } else if (data) {
                setTransactions(data);
            }
            setLoading(false);
        };
        fetchTransactions();
    }, [profile]);
    
    const filteredTransactions = transactions.filter(tx => {
        if (activeTab === 'All') return tx.type === 'tip'; // Only show tips for now
        if (activeTab === 'Tips') return tx.type === 'tip';
        return false;
    });

    const getTransactionDetails = (tx: any) => {
        if (tx.type === 'tip') {
            if (tx.sender_id === profile?.id) {
                return {
                    description: `Tip Sent to ${tx.recipient.username}`,
                    amount: `-$${tx.amount.toFixed(2)}`,
                    color: 'text-red-500'
                };
            } else {
                return {
                    description: `Tip Received from ${tx.sender.username}`,
                    amount: `+$${tx.amount.toFixed(2)}`,
                    color: 'text-accent-green'
                };
            }
        }
        return { description: tx.type || 'Transaction', amount: `$${tx.amount.toFixed(2)}`, color: 'text-white' };
    };

    return (
        <SectionShell title="Transactions">
            <div className="flex items-center border-b border-outline mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-accent-green' : 'text-text-muted hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            {loading && <div className="text-center p-8 text-text-muted">Loading transactions...</div>}

            {fetchError && (
                 <div className="text-center p-8 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="font-bold text-lg">Could Not Load Transactions</p>
                    <p className="mt-2 text-sm">{fetchError}</p>
                </div>
            )}

            {!loading && !fetchError && filteredTransactions.length === 0 && (
                <div className="text-center p-8 text-text-muted">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} transactions found.</div>
            )}

            {!loading && !fetchError && filteredTransactions.length > 0 && (
                <div className="space-y-2">
                    {filteredTransactions.map((tx) => {
                        const details = getTransactionDetails(tx);
                        return (
                            <div key={tx.id} className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                                <div className="col-span-2">
                                    <p className="font-semibold text-white">{details.description}</p>
                                    <p className="text-xs text-text-muted">{new Date(tx.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-2 justify-self-end">
                                    <span className={`text-sm font-semibold ${details.color}`}>{details.amount}</span>
                                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </SectionShell>
    );
};