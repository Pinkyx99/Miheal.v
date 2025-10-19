


import React, { useState } from 'react';
import { PAYMENT_CATEGORIES } from '../constants';
import { LogoIcon } from './icons';

interface WalletModalProps {
  show: boolean;
  onClose: () => void;
}

const tabs = ['Deposit', 'Withdraw', 'Buy Crypto', 'Vault', 'Redeem'];

export const WalletModal: React.FC<WalletModalProps> = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState('Deposit');

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-4xl h-auto max-h-[90vh] rounded-2xl flex overflow-hidden shadow-2xl border border-outline modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Left Panel */}
        <div className="hidden md:block w-1/3 bg-background p-8 flex-col justify-between relative overflow-hidden">
            <LogoIcon className="h-8 w-8 mb-4 text-white" />
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-white">Crypto</h2>
                <p className="text-text-muted mt-2">& more than 10 Alternative payment methods</p>
            </div>
            {/* Background decorative image */}
            <img src="https://gamdom.com/build/coins-deposit.b28d68997a.svg" className="absolute -bottom-12 -right-12 w-64 h-64 opacity-20" alt="" />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col overflow-y-auto">
          {/* Header & Close Button */}
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center border-b border-outline">
                {tabs.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-accent-green' : 'text-text-muted hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
             </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white" aria-label="Close wallet">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
             {activeTab === 'Deposit' && (
                <div className="space-y-6">
                    {PAYMENT_CATEGORIES.map(category => (
                        <div key={category.title}>
                            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">{category.title}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {category.methods.map(method => (
                                    <div key={method.name} className="bg-background rounded-lg p-3 text-center cursor-pointer hover:bg-white/5 transition-colors relative">
                                        <div className="flex justify-center items-center mb-2 h-10">
                                            {method.icon}
                                        </div>
                                        <p className="text-xs font-semibold text-white truncate">{method.name}</p>
                                        {method.tag && (
                                            <span className={`absolute top-1 right-1 text-[9px] font-bold px-1 rounded ${method.tagColor}`}>
                                                {method.tag}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
             )}
             {activeTab !== 'Deposit' && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-text-muted">{activeTab} content goes here.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};