import React, { useState } from 'react';
import { getWinningNumber } from '../../lib/rouletteUtils';

interface ProvablyFairProps {
    clientSeed: string;
    setClientSeed: (seed: string) => void;
    serverSeed: string | null;
    nonce: number;
    lastWinningNumber: number | null;
}

export const ProvablyFair: React.FC<ProvablyFairProps> = ({ clientSeed, setClientSeed, serverSeed, nonce, lastWinningNumber }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ message: string; success: boolean } | null>(null);

    /**
     * Verifies the result of the previous spin by re-calculating the winning number
     * using the now-revealed server seed, the client seed, and the nonce of that round.
     */
    const handleVerify = async () => {
        if (!serverSeed || lastWinningNumber === null) {
            setVerificationResult({ message: "No previous round data to verify.", success: false });
            return;
        }
        // We verify the previous round, so we use nonce - 1
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
                        <input
                            id="client-seed"
                            type="text"
                            value={clientSeed}
                            onChange={(e) => setClientSeed(e.target.value)}
                            className="w-full bg-[#0D1316] border border-outline rounded-md p-2 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label htmlFor="server-seed" className="text-xs font-semibold text-text-muted block mb-1">Server Seed (Revealed after spin)</label>
                        <input
                            id="server-seed"
                            type="text"
                            readOnly
                            value={serverSeed || "Hidden until round ends"}
                            className="w-full bg-[#0D1316] border border-outline rounded-md p-2 text-text-muted text-xs"
                        />
                    </div>
                     <div>
                        <label htmlFor="nonce" className="text-xs font-semibold text-text-muted block mb-1">Nonce</label>
                        <input
                            id="nonce"
                            type="number"
                            readOnly
                            value={nonce}
                            className="w-full bg-[#0D1316] border border-outline rounded-md p-2 text-text-muted text-xs"
                        />
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