import React from 'react';
import { Card } from '../../pages/BlackjackGamePage';
import { BlackjackCard } from './BlackjackCard';

interface BlackjackHandProps {
    hand: Card[];
    scoreDisplay: string;
    isDealer: boolean;
    isTurn: boolean;
    hideHoleCard?: boolean;
    result?: 'win' | 'lose' | 'push' | null;
    dealerUpCardScore?: string;
}

export const BlackjackHand: React.FC<BlackjackHandProps> = ({ hand, scoreDisplay, isDealer, isTurn, hideHoleCard, result, dealerUpCardScore }) => {
    return (
        <div className="relative flex flex-col items-center w-full min-h-[220px]">
            <div className={`flex justify-center transition-transform duration-300 ${isTurn ? 'scale-105' : ''}`}>
                {hand.map((card, index) => (
                    <div
                        key={index}
                        className="absolute"
                        style={{
                            // Fan cards out
                            transform: `translateX(${(index - (hand.length - 1) / 2) * 65}px)`,
                            transition: 'transform 0.3s ease-out'
                        }}
                    >
                        <div
                            className="transition-transform duration-500 ease-out"
                            style={{
                                animation: `deal-in 0.3s ease-out ${index * 0.2}s backwards`
                            }}
                        >
                            <BlackjackCard
                                card={card}
                                isFaceDown={isDealer && index === 1 && !!hideHoleCard}
                                highlight={!isDealer ? (result ?? null) : null}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {(hand.length > 0) && (
                <div className={`absolute ${isDealer ? 'top-[200px]' : 'bottom-[200px]'} bg-[#1a1a1a]/80 text-white text-sm font-bold px-3 py-1 rounded-full border-2 border-gray-600 shadow-lg`}>
                   {isDealer && !!hideHoleCard ? dealerUpCardScore : scoreDisplay}
                </div>
            )}
            
            <style>{`
                @keyframes deal-in {
                    from {
                        opacity: 0;
                        transform: translateY(${isDealer ? '-50px' : '50px'}) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};