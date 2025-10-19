import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface TipUserModalProps {
  show: boolean;
  onClose: () => void;
  recipient: { id: string; username: string } | null;
  onTipped: () => void; // To refresh balance
}

export const TipUserModal: React.FC<TipUserModalProps> = ({ show, onClose, recipient, onTipped }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when the recipient changes (modal opens for a new user)
  useEffect(() => {
    if (recipient) {
        setAmount('');
        setError(null);
        setLoading(false);
    }
  }, [recipient]);

  if (!show || !recipient) return null;

  const handleTip = async () => {
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('tip_user', {
      recipient_id_in: recipient.id,
      tip_amount_in: tipAmount,
    });

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message || 'An unexpected error occurred.');
    } else if (data && !data.success) {
      setError(data.message);
    } else {
      onTipped(); // Refresh balance in parent
      onClose(); // Close modal on success
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
        <div className="bg-[#1A222D] w-full max-w-sm rounded-2xl shadow-2xl border border-outline p-6 modal-content" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Tip User</h2>
                <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:text-white hover:bg-white/10" aria-label="Close">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Body */}
            <div className="text-center mb-6">
                <p className="text-text-muted">You are about to tip</p>
                <p className="text-2xl font-bold text-accent-green">{recipient.username}</p>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
                <label htmlFor="tip-amount" className="text-sm font-medium text-text-muted mb-1 block">Tip Amount</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="w-6 h-6 bg-accent-green rounded-full flex items-center justify-center text-white font-bold text-sm">$</span>
                    </div>
                    <input
                        id="tip-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-12 bg-[#0D1316] border border-outline rounded-lg py-2.5 pl-12 pr-24 text-white font-semibold text-lg focus:ring-1 focus:ring-accent-green focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <button onClick={() => setAmount('')} className="px-3 py-1.5 text-sm font-semibold rounded-md text-text-muted bg-[#2A3341] hover:bg-gray-700 transition-colors">Clear</button>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-900/20 border border-red-500/30 mb-6">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                <p className="text-sm text-red-300">Please remember, tips are not refundable</p>
            </div>
            
            {error && <p className="text-center text-red-400 text-sm mb-4">{error}</p>}

            {/* Action Button */}
            <button
                onClick={handleTip}
                disabled={loading}
                className="w-full bg-accent-green text-white font-semibold py-3 rounded-lg text-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Sending...' : 'Tip'}
            </button>
        </div>
    </div>
  );
};