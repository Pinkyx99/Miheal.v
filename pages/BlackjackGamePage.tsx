import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { BlackjackControls } from '../components/blackjack/BlackjackControls';
import { BlackjackHand } from '../components/blackjack/BlackjackHand';

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export interface Card {
  suit: Suit;
  rank: Rank;
}
type GameState = 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'finished';
type GameResult = 'win' | 'lose' | 'push' | null;

const createDeck = (): Card[] => {
  const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
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

const getScoreDisplay = (hand: Card[]): string => {
    let value = 0;
    let aceCount = 0;
    hand.forEach(card => {
        value += getCardValue(card);
        if (card.rank === 'A') aceCount++;
    });

    let finalValue = value;
    let tempAces = aceCount;
    while(finalValue > 21 && tempAces > 0) {
        finalValue -= 10;
        tempAces--;
    }
    
    if (aceCount > 0 && finalValue + 10 <= 21 && (finalValue + 10) !== 21) {
         return `${finalValue}/${finalValue + 10}`;
    }

    if (aceCount > 0 && finalValue + 10 <= 21) {
        return `${finalValue + 10}`;
    }


    return `${finalValue}`;
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
}

const BlackjackGamePage: React.FC<BlackjackGamePageProps> = ({ profile, session, onProfileUpdate }) => {
  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState(0.10);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);

  const playerScore = getScoreDisplay(playerHand);
  const dealerScore = getScoreDisplay(dealerHand);
  const dealerUpCardScore = dealerHand.length > 0 ? getScoreDisplay([dealerHand[0]]) : '0';

  const resetGame = useCallback(() => {
    setGameResult(null);
    setPlayerHand([]);
    setDealerHand([]);
    setDeck(shuffleDeck(createDeck()));
    setGameState('betting');
  }, []);

  const handleBet = async () => {
    if (!session || !profile || betAmount <= 0 || betAmount > profile.balance) {
      alert("Invalid bet amount or insufficient funds.");
      return;
    }

    try {
        const { error } = await supabase.from('profiles').update({ balance: profile.balance - betAmount }).eq('id', session.user.id);
        if (error) throw error;
        onProfileUpdate();
        
        setGameState('dealing');
    } catch (e) {
        console.error("Error placing bet:", e);
    }
  };
  
  // Dealing logic
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
        // Check for immediate blackjacks after dealing
        const initialPlayerScore = calculateHandValue(pHand);
        const initialDealerScore = calculateHandValue(dHand);
        
        if ((pHand.length === 2 && initialPlayerScore === 21) || (dHand.length === 2 && initialDealerScore === 21)) {
            // If either has blackjack, the round ends immediately. Player can't hit.
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
     if (gameState !== 'player_turn' || playerHand.length !== 2 || !session || !profile || betAmount > profile.balance) return;
     
     try {
        const newBet = betAmount * 2;
        const { error } = await supabase.from('profiles').update({ balance: profile.balance - betAmount }).eq('id', session.user.id);
        if (error) throw error;
        onProfileUpdate();
        setBetAmount(newBet);
        
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
        }, 500);
     } catch (e) {
         console.error("Error doubling down:", e);
     }
  };

  // Dealer's turn logic (standard rules, no advantage)
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
          
          const cardToDraw = newDeck.pop()!;
          const newHand = [...dealerHand, cardToDraw];
          
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
  
  // Determine winner and handle payouts
  useEffect(() => {
    if (gameState !== 'finished' || !session || !profile) {
      return;
    }
    
    let resetTimer: number;

    const determineWinnerAndPayout = async () => {
        let payout = 0; // This is the TOTAL amount to be returned to the user
        let result: GameResult = null;
  
        const finalPlayerScore = calculateHandValue(playerHand);
        const finalDealerScore = calculateHandValue(dealerHand);
        const isPlayerBlackjack = playerHand.length === 2 && finalPlayerScore === 21;
        const isDealerBlackjack = dealerHand.length === 2 && finalDealerScore === 21;
  
        if (finalPlayerScore > 21) {
          result = 'lose';
          payout = 0; // Player busts
        } else if (isPlayerBlackjack) {
            if (isDealerBlackjack) {
              result = 'push'; // Both have blackjack
              payout = betAmount;
            } else {
              result = 'win'; // Player has blackjack, dealer does not
              payout = betAmount * 2.5; // Blackjack pays 3:2
            }
        } else if (isDealerBlackjack) {
            result = 'lose'; // Dealer has blackjack, player does not
            payout = 0;
        } else if (finalDealerScore > 21) {
          result = 'win'; // Dealer busts
          payout = betAmount * 2;
        } else if (finalPlayerScore > finalDealerScore) {
          result = 'win'; // Player has higher score
          payout = betAmount * 2;
        } else if (finalPlayerScore < finalDealerScore) {
          result = 'lose'; // Dealer has higher score
          payout = 0;
        } else { // Scores are equal, no one has blackjack
          result = 'push';
          payout = betAmount;
        }
  
        setGameResult(result);
  
        if (payout > 0) {
          try {
              // Fetch the latest balance to prevent updates based on stale state.
              const { data: currentProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', session.user.id)
                .single();
  
              if (fetchError) throw fetchError;
              if (!currentProfile) throw new Error("Could not find user profile for payout.");
  
              const currentBalance = Number(currentProfile.balance) || 0;
              const newBalance = currentBalance + payout;
  
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', session.user.id);
  
              if (updateError) throw updateError;
  
              onProfileUpdate();
            } catch (error) {
              console.error("Blackjack payout error:", error);
              onProfileUpdate(); // Attempt to re-sync balance on error
            }
        }
  
        // Wait for animations/user to see result, then reset for next round.
        resetTimer = window.setTimeout(() => {
          resetGame();
        }, 4000);
    };

    determineWinnerAndPayout();
    
    return () => {
        if (resetTimer) clearTimeout(resetTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  return (
    <div className="flex w-full h-full justify-center items-center p-4" style={{
      backgroundImage: `url(https://i.imgur.com/pTjDOZG.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 w-full h-full max-w-7xl max-h-[700px]">
        <BlackjackControls
          gameState={gameState}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          onBet={handleBet}
          onHit={handleHit}
          onStand={handleStand}
          onDouble={handleDouble}
          canDouble={playerHand.length === 2 && (profile?.balance ?? 0) >= betAmount}
          balance={profile?.balance ?? 0}
        />
        <div className="relative rounded-lg flex flex-col justify-between items-center p-8">
            
            {/* Dealer's Hand */}
            <BlackjackHand
                hand={dealerHand}
                scoreDisplay={dealerScore}
                dealerUpCardScore={dealerUpCardScore}
                isDealer={true}
                isTurn={gameState === 'dealer_turn'}
                hideHoleCard={gameState !== 'dealer_turn' && gameState !== 'finished'}
            />
            
            {/* Game Info */}
            <div className="text-center text-white/80 font-semibold space-y-1 my-4 bg-black/50 px-4 py-2 rounded-lg shadow-lg">
                <p className="text-xs tracking-wider uppercase">Blackjack pays 3 to 2</p>
                <p className="text-xs tracking-wider uppercase">Insurance pays 2 to 1</p>
            </div>

            {/* Player's Hand */}
            <BlackjackHand
                hand={playerHand}
                scoreDisplay={playerScore}
                isDealer={false}
                isTurn={gameState === 'player_turn'}
                result={gameResult}
            />
        </div>
      </div>
    </div>
  );
};

export default BlackjackGamePage;