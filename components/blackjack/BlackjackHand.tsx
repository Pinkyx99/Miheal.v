import React from 'react';
import { Card, getCardValue } from '../../pages/BlackjackGamePage';
import { BlackjackCard } from './BlackjackCard';

interface BlackjackHandProps {
    hand: Card[];
    score: number;
    isDealer: boolean;
    isTurn?: boolean;
    hideHoleCard?: boolean;
    result?: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | null;
}

export const BlackjackHand: React.FC<BlackjackHandProps> = ({ hand, score, isDealer, isTurn, hideHoleCard, result }) => {
    const dealerVisibleScore = hideHoleCard && hand.length > 0 ? getCardValue(hand[0]) : score;
    const scoreLabel = isDealer ? `Dealer Total: ${dealerVisibleScore}` : `Player Total: ${score}`;
    
    // Determine highlight based on result
    let highlight: 'win' | 'lose' | 'push' | null = null;
    if (result) {
        if (result === 'win' || result === 'blackjack') highlight = 'win';
        else if (result === 'lose' || result === 'bust') highlight = 'lose';
        else if (result === 'push') highlight = 'push';
    }

    return (
        <div className="relative flex flex-col items-center w-full min-h-[180px] md:min-h-[220px]">
            <div className="flex justify-center h-36 md:h-48 items-center">
                {hand.map((card, index) => (
                    <div
                        key={index}
                        className="absolute"
                        style={{
                            // Final resting position
                            transform: `translateX(${(index - (hand.length - 1) / 2) * 24}px) rotateZ(${(index - (hand.length - 1) / 2) * 3}deg)`,
                            // Animation applied
                            animation: `deal-in 0.5s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.15}s both`
                        }}
                    >
                        <BlackjackCard
                            card={card}
                            isFaceDown={isDealer && index === 1 && !!hideHoleCard}
                            highlight={!isDealer ? highlight : null}
                        />
                    </div>
                ))}
            </div>

            {(hand.length > 0) && (
                <div className={`mt-2 md:mt-4 bg-black/50 backdrop-blur-sm text-white text-base md:text-lg font-bold px-4 py-2 rounded-full border-2 border-gray-600 shadow-lg`}>
                   {scoreLabel}
                </div>
            )}
            
            <style>{`
                @keyframes deal-in {
                    from {
                        transform: translate(0px, -250px) rotate(0deg) scale(0.8);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};