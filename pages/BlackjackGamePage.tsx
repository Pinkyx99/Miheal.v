import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { BlackjackControls } from '../components/blackjack/BlackjackControls';
import { BlackjackHand } from '../components/blackjack/BlackjackHand';
import { ChipSelector } from '../components/blackjack/ChipSelector';
import { soundManager, SOUNDS } from '../lib/sound';
import usePrevious from '../hooks/usePrevious';

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export interface Card {
  suit: Suit;
  rank: Rank;
}
type GameState = 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'finished';
type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | null;

const createDeck = (numDecks: number = 6): Card[] => {
  const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ suit, rank });
      });
    });
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getCardValue = (card: Card): number => {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
};

const calculateHandValue = (hand: Card[]): number => {
  let value = hand.reduce((sum, card) => sum + getCardValue(card), 0);
  let aceCount = hand.filter(card => card.rank === 'A').length;
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return value;
};

interface BlackjackGamePageProps {
  profile: Profile | null;
  session: Session | null;
  onProfileUpdate: () => void;
  onGameRoundCompleted: () => void;
}

const BlackjackGamePage: React.FC<BlackjackGamePageProps> = ({ profile, session, onProfileUpdate, onGameRoundCompleted }) => {
  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState('1.00');
  const [roundBetAmount, setRoundBetAmount] = useState(0);
  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [payoutProcessed, setPayoutProcessed] = useState(false);

  const currentBet = useMemo(() => parseFloat(betAmount) || 0, [betAmount]);
  const playerScore = calculateHandValue(playerHand);
  const dealerScore = calculateHandValue(dealerHand);

  const prevPlayerHandLength = usePrevious(playerHand.length);
  const prevDealerHandLength = usePrevious(dealerHand.length);
  const prevGameResult = usePrevious(gameResult);

  useEffect(() => {
      if (prevPlayerHandLength !== undefined && playerHand.length > prevPlayerHandLength) {
          soundManager.play(SOUNDS.CARD_DEAL, { volume: 0.6, duration: 1000 });
      }
  }, [playerHand.length, prevPlayerHandLength]);

  useEffect(() => {
      if (prevDealerHandLength !== undefined && dealerHand.length > prevDealerHandLength) {
          soundManager.play(SOUNDS.CARD_DEAL, { volume: 0.6, duration: 1000 });
      }
  }, [dealerHand.length, prevDealerHandLength]);

  useEffect(() => {
      if (gameResult && prevGameResult !== gameResult) {
          if (gameResult === 'win' || gameResult === 'blackjack') {
              soundManager.play(SOUNDS.BLACKJACK_WIN);
          } else if (gameResult === 'lose' || gameResult === 'bust') {
              soundManager.play(SOUNDS.MINE_REVEAL, { volume: 0.5 });
          }
      }
  }, [gameResult, prevGameResult]);
  
  const handleAddChipAmount = (value: number) => {
    if (gameState !== 'betting') return;
    soundManager.play(SOUNDS.CHIP_PLACE, { volume: 0.8 });
    setBetAmount(prev => (parseFloat(prev || '0') + value).toFixed(2));
  };
  
  const handleClearBet = () => {
    if (gameState !== 'betting') return;
    setBetAmount('0.00');
  };

  const handleNewRound = () => {
    setGameState('betting');
    setGameResult(null);
    setPlayerHand([]);
    setDealerHand([]);
    setBetAmount('0.00');
  };
  
  const handleRebet = () => {
    setGameState('betting');
    setGameResult(null);
    setPlayerHand([]);
    setDealerHand([]);
    setBetAmount(lastBetAmount.toFixed(2));
  };


  const handleBet = async () => {
    if (!session || !profile || currentBet <= 0 || currentBet > Number(profile.balance ?? 0)) {
      alert("Invalid bet amount or insufficient funds.");
      return;
    }

    try {
        soundManager.play(SOUNDS.CHIP_PLACE, { volume: 0.8 });
        onGameRoundCompleted();
        setRoundBetAmount(currentBet);
        setLastBetAmount(currentBet);
        setGameResult(null);
        setPlayerHand([]);
        setDealerHand([]);
        setPayoutProcessed(false);
        
        const { error } = await supabase.from('profiles').update({ balance: Number(profile.balance ?? 0) - currentBet }).eq('id', session.user.id);
        if (error) throw error;
        onProfileUpdate();
        
        setGameState('dealing');
    } catch (e) {
        console.error("Error placing bet:", e);
    }
  };
  
  useEffect(() => {
    if (gameState === 'dealing') {
      const newDeck = shuffleDeck(createDeck());
      const pHand: Card[] = [];
      const dHand: Card[] = [];

      setTimeout(() => { pHand.push(newDeck.pop()!); setPlayerHand([...pHand]); }, 300);
      setTimeout(() => { dHand.push(newDeck.pop()!); setDealerHand([...dHand]); }, 600);
      setTimeout(() => { pHand.push(newDeck.pop()!); setPlayerHand([...pHand]); }, 900);
      setTimeout(() => { dHand.push(newDeck.pop()!); setDealerHand([...dHand]); setDeck(newDeck); }, 1200);
      
      setTimeout(() => {
        const initialPlayerScore = calculateHandValue(pHand);
        if (initialPlayerScore === 21) {
            setGameState('finished');
        } else {
            setGameState('player_turn');
        }
      }, 1500);
    }
  }, [gameState]);

  const handleHit = () => {
    if (gameState !== 'player_turn' || deck.length === 0) return;
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.pop()!];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (calculateHandValue(newHand) > 21) {
      setGameState('finished');
    }
  };

  const handleStand = () => {
    if (gameState !== 'player_turn') return;
    setGameState('dealer_turn');
  };

  const handleDouble = async () => {
     if (gameState !== 'player_turn' || playerHand.length !== 2 || !session || !profile || currentBet > Number(profile.balance ?? 0)) return;
     
     try {
        soundManager.play(SOUNDS.CHIP_PLACE, { volume: 0.8 });
        const { error } = await supabase.from('profiles').update({ balance: Number(profile.balance ?? 0) - currentBet }).eq('id', session.user.id);
        if (error) throw error;
        onProfileUpdate();
        
        setRoundBetAmount(prev => prev * 2);
        
        const newDeck = [...deck];
        const newHand = [...playerHand, newDeck.pop()!];
        setPlayerHand(newHand);
        setDeck(newDeck);
        
        setTimeout(() => {
            if (calculateHandValue(newHand) > 21) {
                setGameState('finished');
            } else {
                setGameState('dealer_turn');
            }
        }, 800);
     } catch (e) {
         console.error("Error doubling down:", e);
         onProfileUpdate();
     }
  };

  useEffect(() => {
    if (gameState === 'dealer_turn') {
      const dealerTurnAction = () => {
        const currentDealerScore = calculateHandValue(dealerHand);

        if (currentDealerScore < 17) {
          const newDeck = [...deck];
          if (newDeck.length === 0) {
            setGameState('finished');
            return;
          }
          
          const newHand = [...dealerHand, newDeck.pop()!];
          setDealerHand(newHand);
          setDeck(newDeck);
        } else {
          setGameState('finished');
        }
      };

      const timer = setTimeout(dealerTurnAction, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, dealerHand, deck]);
  
  useEffect(() => {
    if (gameState !== 'finished' || !session || !profile || payoutProcessed) {
      return;
    }
    
    setPayoutProcessed(true);

    const determineWinnerAndPayout = async () => {
        let payout = 0;
        let result: GameResult = null;
  
        const finalPlayerScore = calculateHandValue(playerHand);
        const finalDealerScore = calculateHandValue(dealerHand);
        const isPlayerBlackjack = playerHand.length === 2 && finalPlayerScore === 21;
        
        if (finalPlayerScore > 21) {
          result = 'bust';
          payout = 0;
        } else if (isPlayerBlackjack) {
            result = 'blackjack';
            payout = roundBetAmount * 2.5;
        } else if (finalDealerScore > 21) {
          result = 'win';
          payout = roundBetAmount * 2;
        } else if (finalPlayerScore > finalDealerScore) {
          result = 'win';
          payout = roundBetAmount * 2;
        } else if (finalPlayerScore < finalDealerScore) {
          result = 'lose';
          payout = 0;
        } else {
          result = 'push';
          payout = roundBetAmount;
        }
  
        setGameResult(result);

        try {
            await supabase.from('game_bets').insert({
                user_id: session.user.id,
                game_name: 'Blackjack',
                bet_amount: roundBetAmount,
                payout: payout,
                multiplier: payout > 0 ? payout / roundBetAmount : 0,
            });
        } catch (logError) { console.error("Error logging blackjack bet:", (logError as Error).message); }
  
        if (payout > 0) {
          try {
              const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
              if (fetchError || !currentProfile) throw new Error(fetchError?.message || "Profile not found");
              
              // FIX: Safely convert balance to a number to handle potential 'unknown' type from Supabase query.
              const newBalance = (Number(currentProfile.balance) || 0) + payout;
  
              const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
              if (updateError) throw updateError;
              onProfileUpdate();
            } catch (error) {
              console.error("Blackjack payout error:", error);
              onProfileUpdate();
            }
        }
    };
    determineWinnerAndPayout();
  }, [gameState, session, profile, playerHand, dealerHand, roundBetAmount, onProfileUpdate, payoutProcessed]);

  return (
    <div className="flex w-full h-full" style={{
      backgroundImage: `url(https://i.imgur.com/ObnqvQZ.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="flex flex-col justify-between items-center w-full h-full max-w-[1920px] mx-auto p-2 sm:p-4 relative">
        
        {/* Dealer's Hand */}
        <BlackjackHand
            hand={dealerHand}
            score={dealerScore}
            isDealer={true}
            hideHoleCard={gameState !== 'dealer_turn' && gameState !== 'finished'}
        />

        {/* Game Result Notification */}
        {gameState === 'finished' && gameResult && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 p-4 bg-black/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wider" style={{textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>
                    {gameResult === 'blackjack' && 'Blackjack!'}
                    {gameResult === 'win' && 'You Win!'}
                    {gameResult === 'lose' && 'Dealer Wins'}
                    {gameResult === 'bust' && 'Bust!'}
                    {gameResult === 'push' && 'Push'}
                </div>
            </div>
        )}

        {/* Player's Area */}
        <div className="flex flex-col items-center gap-2 sm:gap-4">
            <BlackjackHand
                hand={playerHand}
                score={playerScore}
                isDealer={false}
                isTurn={gameState === 'player_turn'}
                result={gameResult}
            />
            <div className="flex flex-col items-center gap-2 sm:gap-4">
                 {gameState === 'betting' ? (
                    <ChipSelector
                        onChipSelect={handleAddChipAmount}
                        onClearBet={handleClearBet}
                        disabled={gameState !== 'betting'}
                    />
                ) : (
                    <div className="h-[60px] sm:h-[100px] flex items-center justify-center">
                         {roundBetAmount > 0 && (
                            <div className="bg-black/50 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-bold text-white border-2 border-gray-600">
                                Bet: ${roundBetAmount.toFixed(2)}
                            </div>
                         )}
                    </div>
                )}
                <BlackjackControls
                    gameState={gameState}
                    betAmount={betAmount}
                    onBetAmountChange={setBetAmount}
                    balance={Number(profile?.balance ?? 0)}
                    onBet={handleBet}
                    onHit={handleHit}
                    onStand={handleStand}
                    onDouble={handleDouble}
                    onNewRound={handleNewRound}
                    onRebet={handleRebet}
                    canRebet={lastBetAmount > 0}
                    canDouble={playerHand.length === 2 && Number(profile?.balance ?? 0) >= currentBet}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default BlackjackGamePage;