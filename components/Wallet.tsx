import React, { useState, useRef, useEffect } from 'react';
import { WalletDropdown } from './WalletDropdown';
import { UsdIcon } from './icons';

interface WalletProps {
    onWalletButtonClick: () => void;
    balance: number;
}

export const Wallet: React.FC<WalletProps> = ({ onWalletButtonClick, balance }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center space-x-2" ref={dropdownRef}>
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="Select currency and view balance"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/10 transition-colors"
                >
                    <UsdIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm text-white">${(balance || 0).toFixed(2)}</span>
                    <svg className={`w-4 h-4 text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <WalletDropdown show={isDropdownOpen} balance={balance} />
            </div>

            <button
                onClick={onWalletButtonClick}
                className="bg-primary text-background font-semibold px-6 py-2 rounded-md text-sm transition-transform duration-200 hover:scale-105 active:scale-100"
            >
                Wallet
            </button>
        </div>
    );
};