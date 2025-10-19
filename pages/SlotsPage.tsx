import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { GameLauncher } from '../components/GameLauncher';
import { supabase } from '../lib/supabaseClient';

interface SlotsPageProps {
    session: Session | null;
    onSignInClick: () => void;
}

const SlotsPage: React.FC<SlotsPageProps> = ({ session, onSignInClick }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [loadingGameId, setLoadingGameId] = useState<string | null>(null);
    const [activeGame, setActiveGame] = useState<{ name: string; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            setLoadingGames(true);
            setError(null);
            try {
                const { data, error: funcError } = await supabase.functions.invoke('get-game-list');
                
                if (funcError) throw funcError;
                if (data.error) throw new Error(data.error);
                if (!data.games) throw new Error("No games found in API response.");

                setGames(data.games);
            } catch (err: any) {
                setError(err.message || 'Failed to load games. Please try again later.');
            } finally {
                setLoadingGames(false);
            }
        };

        fetchGames();
    }, []);

    const handlePlay = async (game: Game) => {
        if (!session) {
            onSignInClick();
            return;
        }
        if (!game.gameId) {
            setError('This game is not available right now.');
            return;
        }
        
        setLoadingGameId(game.id);
        setError(null);

        try {
            const { data, error: funcError } = await supabase.functions.invoke('get-game-url', {
                body: { gameId: game.gameId },
            });

            if (funcError) throw funcError;
            if (data.error) throw new Error(data.error);
            if (!data.url) throw new Error('Could not retrieve game URL.');

            setActiveGame({ name: game.name, url: data.url });

        } catch (err: any) {
            setError(err.message || 'An error occurred while launching the game.');
        } finally {
            setLoadingGameId(null);
        }
    };
    
    const renderContent = () => {
        if (loadingGames) {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="aspect-[3/4] bg-card rounded-xl animate-pulse"></div>
                    ))}
                </div>
            );
        }

        if (error) {
            return <div className="bg-red-500/20 text-red-400 p-4 rounded-md text-center">{error}</div>;
        }

        return (
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {games.map((game, index) => (
                    <div 
                        key={game.id || index} 
                        className="game-grid-item" 
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        <GameCard 
                            game={game} 
                            onPlay={handlePlay}
                            isLoading={loadingGameId === game.id}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {activeGame && (
                <GameLauncher 
                    game={activeGame}
                    onClose={() => setActiveGame(null)}
                />
            )}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white">All Slots</h1>
                    {/* Placeholder for filters/search */}
                </div>
                {renderContent()}
            </div>
        </>
    );
};

export default SlotsPage;
