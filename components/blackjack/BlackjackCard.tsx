import React from 'react';
import { Card } from '../../pages/BlackjackGamePage';

interface SuitIconsProps {
    suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
    className?: string;
}

const SuitIcon: React.FC<SuitIconsProps> = ({ suit, className }) => {
    const color = (suit === 'Hearts' || suit === 'Diamonds') ? 'text-red-600' : 'text-black';
    const icons = {
        Hearts: '♥',
        Diamonds: '♦',
        Clubs: '♣',
        Spades: '♠',
    };
    return <span className={`${color} ${className}`}>{icons[suit]}</span>;
};

interface BlackjackCardProps {
    card: Card | null;
    isFaceDown: boolean;
    style?: React.CSSProperties;
    highlight: 'win' | 'lose' | 'push' | null;
}

export const BlackjackCard: React.FC<BlackjackCardProps> = ({ card, isFaceDown, style, highlight }) => {
    
    let highlightClasses = '';
    switch(highlight) {
        case 'win': highlightClasses = 'highlight-win'; break;
        case 'lose': highlightClasses = 'highlight-lose'; break;
        case 'push': highlightClasses = 'highlight-push'; break;
    }

    return (
        <div className="w-32 h-48 perspective-1000" style={style}>
            <div className={`card-inner ${isFaceDown ? 'is-flipped' : ''} ${highlightClasses}`}>
                {/* Face Up */}
                <div className="card-face card-front">
                    {card && (
                        <>
                            <div className="absolute top-1 left-2 text-center">
                                <p className="text-2xl font-bold">{card.rank}</p>
                                <SuitIcon suit={card.suit} className="text-xl" />
                            </div>
                            <div className="absolute bottom-1 right-2 text-center transform rotate-180">
                                <p className="text-2xl font-bold">{card.rank}</p>
                                <SuitIcon suit={card.suit} className="text-xl" />
                            </div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                <SuitIcon suit={card.suit} className="text-6xl opacity-80" />
                            </div>
                        </>
                    )}
                </div>
                {/* Face Down */}
                <div className="card-face card-back bg-[#f8f8f8] flex items-center justify-center">
                    <span className="text-gray-400 text-8xl font-bold select-none">?</span>
                </div>
            </div>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s, box-shadow 0.3s;
                    transform-style: preserve-3d;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                .card-inner.is-flipped {
                    transform: rotateY(180deg);
                }
                .card-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .card-front {
                    background-color: #f8f8f8;
                    color: black;
                }
                .card-back {
                    transform: rotateY(180deg);
                }
                .highlight-win .card-face {
                    border: 2px solid #22c55e;
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.7);
                }
                .highlight-lose .card-face {
                    border: 2px solid #ef4444;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
                }
                .highlight-push .card-face {
                    border: 2px solid #f97316;
                    box-shadow: 0 0 15px rgba(249, 115, 22, 0.7);
                }
            `}</style>
        </div>
    );
};