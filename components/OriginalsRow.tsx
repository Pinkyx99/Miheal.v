import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { ORIGINAL_GAMES } from '../constants';
import ProfileCard from './ProfileCard';

const ArrowButton: React.FC<{ direction: 'left' | 'right', onClick: () => void, visible: boolean }> = ({ direction, onClick, visible }) => (
    <button
        onClick={onClick}
        className={`absolute top-0 bottom-0 z-10 w-16 flex items-center justify-center text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-default
            ${direction === 'left' ? 'left-0 bg-gradient-to-r from-background' : 'right-0 bg-gradient-to-l from-background'}`
        }
        disabled={!visible}
        aria-label={`Scroll ${direction}`}
    >
        {direction === 'left' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        )}
    </button>
);


export const OriginalsRow: React.FC<{ onGameSelect: (name: string) => void }> = ({ onGameSelect }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);

    const updateScrollLimits = useCallback(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (container && content) {
            const containerWidth = container.offsetWidth;
            const contentWidth = content.scrollWidth;
            setMaxScroll(Math.max(0, contentWidth - containerWidth));
        }
    }, []);

    useLayoutEffect(() => {
        updateScrollLimits();
        const resizeObserver = new ResizeObserver(updateScrollLimits);
        const container = containerRef.current;
        if (container) {
            resizeObserver.observe(container);
            return () => resizeObserver.disconnect();
        }
    }, [updateScrollLimits]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth * 0.8;
            setScrollPosition(currentPosition => {
                if (direction === 'left') {
                    return Math.max(0, currentPosition - scrollAmount);
                } else {
                    return Math.min(maxScroll, currentPosition + scrollAmount);
                }
            });
        }
    };
    
    const showLeftArrow = scrollPosition > 0;
    const showRightArrow = scrollPosition < maxScroll - 1;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Mihael Originals</h2>
                <button className="text-sm font-semibold text-primary hover:text-primary-light">View All</button>
            </div>
            <div className="relative group">
                <div ref={containerRef} className="overflow-hidden">
                    <div
                        ref={contentRef}
                        className="flex space-x-4 pb-2"
                        style={{
                            transform: `translateX(-${scrollPosition}px)`,
                            transition: 'transform 0.5s ease-in-out',
                        }}
                    >
                        {ORIGINAL_GAMES.map(game => (
                             <div
                                key={game.name}
                                className="flex-shrink-0"
                                onClick={() => {
                                    if (game.comingSoon) {
                                        alert('Coming Soon!');
                                    } else {
                                        onGameSelect(game.name);
                                    }
                                }}
                            >
                                <ProfileCard
                                    avatarUrl={game.image}
                                    name={game.name}
                                    comingSoon={game.comingSoon}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                <ArrowButton direction="left" onClick={() => handleScroll('left')} visible={showLeftArrow} />
                <ArrowButton direction="right" onClick={() => handleScroll('right')} visible={showRightArrow} />
            </div>
        </div>
    );
};