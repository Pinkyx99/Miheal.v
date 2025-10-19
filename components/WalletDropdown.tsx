import React, { useState } from 'react';
import { WALLET_CURRENCIES, WALLET_BET_CURRENCIES } from '../constants';

interface WalletDropdownProps {
  show: boolean;
  balance: number;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({ show, balance }) => {
    const [selectedBetCurrency, setSelectedBetCurrency] = useState('USD');
    
    if (!show) {
        return null;
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-outline rounded-lg shadow-2xl z-40 p-1">
            <div className="p-3">
                {WALLET_CURRENCIES.map(currency => (
                    <div key={currency.code} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-white/5">
                        <div className="flex items-center space-x-3">
                            {currency.icon}
                            <span className="text-sm font-medium text-white">{currency.code}</span>
                        </div>
                        <span className="text-sm text-text-muted">
                            ${currency.code === 'USD' ? balance.toFixed(2) : currency.balance}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="border-t border-outline p-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-3">Bet Currency</h4>
                <div className="grid grid-cols-4 gap-2">
                    {WALLET_BET_CURRENCIES.map(currency => (
                        <label key={currency} className="flex items-center space-x-2 cursor-pointer p-1">
                            <input
                                type="radio"
                                name="bet-currency"
                                value={currency}
                                checked={selectedBetCurrency === currency}
                                onChange={() => setSelectedBetCurrency(currency)}
                                className="sr-only peer"
                            />
                            <div className="w-4 h-4 rounded-full border-2 border-text-muted flex items-center justify-center transition-all peer-checked:border-primary peer-checked:bg-primary">
                                <div className="w-1.5 h-1.5 bg-card rounded-full"></div>
                            </div>
                            <span className={`text-sm font-medium text-text-muted peer-checked:text-white`}>{currency}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};