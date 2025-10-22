import React, { useState } from 'react';
import { SoundIcon } from '../icons';

export type Risk = 'low' | 'medium' | 'high';
export type Rows = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

interface PlinkoControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    risk: Risk;
    setRisk: (risk: Risk) => void;
    rows: Rows;
    setRows: (rows: Rows) => void;
    onSendBall: () => void;
    gameState: 'idle' | 'playing';
    balance: number;
}

const ControlButton: React.FC<{ onClick: () => void, disabled?: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled} className="bg-[#191e38] text-gray-300 text-xs font-bold rounded hover:bg-[#2c325a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 h-8">
        {children}
    </button>
);

const CustomSelect: React.FC<{ label: string, value: string | number, onChange: (val: any) => void, options: {value: any, label: string}[], disabled?: boolean }> = ({ label, value, onChange, options, disabled }) => (
    <div>
        <label className="text-xs text-gray-400 font-semibold mb-1 block">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-[#191e38] border border-[#3b4371] rounded-md h-12 px-3 text-white font-semibold appearance-none focus:ring-1 focus:ring-purple-400 focus:outline-none"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    </div>
);


export const PlinkoControls: React.FC<PlinkoControlsProps> = ({ betAmount, setBetAmount, risk, setRisk, rows, setRows, onSendBall, gameState, balance }) => {
    const [activeTab, setActiveTab] = useState('Manual');

    const handleBetModifier = (modifier: '1/2' | 'x2' | 'max') => {
        switch(modifier) {
            case '1/2': setBetAmount(Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)))); break;
            case 'x2': setBetAmount(parseFloat((betAmount * 2).toFixed(2))); break;
            case 'max': setBetAmount(balance); break;
        }
    };
    
    const isIdle = gameState === 'idle';
    const insufficientFunds = balance < betAmount;

    return (
        <div className="w-full md:w-72 bg-[#141833] p-4 rounded-xl flex flex-col space-y-4 flex-shrink-0">
            <div className="flex bg-[#191e38] rounded-md p-1">
                <button onClick={() => setActiveTab('Manual')} className={`flex-1 py-1.5 text-sm font-semibold rounded ${activeTab === 'Manual' ? 'bg-[#3b4371] text-white' : 'text-gray-400'}`}>Manual</button>
                <button onClick={() => setActiveTab('Auto')} className={`flex-1 py-1.5 text-sm font-semibold rounded ${activeTab === 'Auto' ? 'bg-[#3b4371] text-white' : 'text-gray-400'}`}>Auto</button>
            </div>

            <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Bet amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-400">$</span>
                    <input
                        type="number"
                        value={betAmount.toFixed(2)}
                        onChange={e => setBetAmount(parseFloat(e.target.value) || 0)}
                        disabled={!isIdle}
                        className="w-full h-12 bg-[#191e38] text-white font-semibold py-2 pl-8 pr-4 rounded-md border border-[#3b4371] focus:ring-1 focus:ring-purple-400 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    <ControlButton onClick={() => handleBetModifier('1/2')} disabled={!isIdle}>x1/2</ControlButton>
                    <ControlButton onClick={() => handleBetModifier('x2')} disabled={!isIdle}>x2</ControlButton>
                    <ControlButton onClick={() => handleBetModifier('max')} disabled={!isIdle}>Max</ControlButton>
                </div>
            </div>
            
            <CustomSelect 
                label="Risk"
                value={risk}
                onChange={setRisk}
                options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                ]}
                disabled={!isIdle}
            />

            <CustomSelect
                label="Rows"
                value={rows}
                onChange={(val) => setRows(Number(val) as Rows)}
                options={Array.from({length: 9}, (_, i) => ({ value: i + 8, label: `${i + 8}`}))}
                disabled={!isIdle}
            />

            <button
                onClick={onSendBall}
                disabled={!isIdle || insufficientFunds || betAmount <= 0}
                className="w-full h-14 text-center rounded-lg text-base font-bold bg-purple-600 text-white transition-colors hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(147,51,234,0.3)]"
            >
                {insufficientFunds ? 'Insufficient Funds' : 'Send ball'}
            </button>
            
            <div className="flex-1"></div>

            <div className="flex items-center space-x-2">
                <SoundIcon className="w-5 h-5 text-gray-400" />
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
            </div>
        </div>
    );
};
