
import React, { useState } from 'react';
import { getWinningNumber } from '../../lib/rouletteUtils';

interface ProvablyFairProps {
    clientSeed: string;
    setClientSeed: (seed: string) => void;
    serverSeed: string | null;
    nonce: number;
    lastWinningNumber: number | null;
}

const KeyIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1.258a1 1 0 01-.97-1.243l1.258-7.5a1 1 0 01.97-1.243H7V5a2 2 0 012-2h3.172a2 2 0 011.414.586l.828.828A2 2 0 0015 5.586V7z" /></svg>;
const UserIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const NumberIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;

export const ProvablyFair: React.FC<ProvablyFairProps> = ({ clientSeed, setClientSeed, serverSeed, nonce, lastWinningNumber }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ message: string; success: boolean } | null>(null);

    const handleVerify = async () => {
        if (!serverSeed || lastWinningNumber === null) {
            setVerificationResult({ message: "No previous round data to verify.", success: false });
            return;
        }
        const calculatedNumber = await getWinningNumber(serverSeed, clientSeed, nonce - 1);
        if (calculatedNumber === lastWinningNumber) {
            setVerificationResult({ message: `Success! Calculated number ${calculatedNumber} matches last winning number ${lastWinningNumber}.`, success: true });
        } else {
            setVerificationResult({ message: `Verification failed. Calculated: ${calculatedNumber}, Actual: ${lastWinningNumber}.`, success: false });
        }
    };

    return (
        <div className="bg-[#1A222D] rounded-xl border border-outline p-3 my-4 text-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center" aria-expanded={isOpen} aria-controls="provably-fair-details">
                <span className="font-semibold text-white">Provably Fair</span>
                <svg className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div id="provably-fair-details" className="mt-4 space-y-3 animate-fade-in">
                    <div>
                        <label htmlFor="client-seed" className="text-xs font-semibold text-text-muted block mb-1">Client Seed</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted"><UserIcon /></div>
                            <input
                                id="client-seed"
                                type="text"
                                value={clientSeed}
                                onChange={(e) => setClientSeed(e.target.value)}
                                className="w-full bg-[#0D1316] border border-outline rounded-md p-2 pl-9 text-white text-xs"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="server-seed" className="text-xs font-semibold text-text-muted block mb-1">Server Seed (Revealed after spin)</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted"><KeyIcon /></div>
                            <input
                                id="server-seed"
                                type="text"
                                readOnly
                                value={serverSeed || "Hidden until round ends"}
                                className="w-full bg-[#0D1316] border border-outline rounded-md p-2 pl-9 text-text-muted text-xs"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="nonce" className="text-xs font-semibold text-text-muted block mb-1">Nonce</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted"><NumberIcon /></div>
                            <input
                                id="nonce"
                                type="number"
                                readOnly
                                value={nonce}
                                className="w-full bg-[#0D1316] border border-outline rounded-md p-2 pl-9 text-text-muted text-xs"
                            />
                        </div>
                    </div>
                    <button onClick={handleVerify} disabled={!serverSeed} className="w-full bg-accent-green/20 text-accent-green font-bold py-2 rounded-md text-xs hover:bg-accent-green/40 disabled:opacity-50 transition-colors">
                        Verify Last Spin
                    </button>
                    {verificationResult && <p className={`text-xs text-center font-semibold mt-2 ${verificationResult.success ? 'text-green-400' : 'text-red-400'}`}>{verificationResult.message}</p>}
                </div>
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};
