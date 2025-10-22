import React, { useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { PlinkoControls, Risk, Rows } from '../components/plinko/PlinkoControls';
import { PlinkoBoard } from '../components/plinko/PlinkoBoard';
import { PlinkoHistory } from '../components/plinko/PlinkoHistory';
import { MULTIPLIERS } from '../components/plinko/plinkoData';

export interface PlinkoBet {
  id: string;
  multiplier: number;
  profit: number;
}

export interface Ball {
  id: number;
  path: { x: number; y: number }[];
  outcome: { multiplier: number; profit: number };
}

interface PlinkoGamePageProps {
  profile: Profile | null;
  session: Session | null;
  onProfileUpdate: () => void;
}

const PlinkoGamePage: React.FC<PlinkoGamePageProps> = ({ profile, session, onProfileUpdate }) => {
  const [betAmount, setBetAmount] = useState(1.00);
  const [risk, setRisk] = useState<Risk>('low');
  const [rows, setRows] = useState<Rows>(8);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [history, setHistory] = useState<PlinkoBet[]>([]);

  const handleSendBall = useCallback(async () => {
    if (!session || !profile || betAmount > (profile.balance ?? 0) || betAmount <= 0) {
      // Could show an error toast here
      return;
    }

    // --- 1. Deduct Bet Amount ---
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
            balance: (profile.balance ?? 0) - betAmount,
            wagered: (profile.wagered ?? 0) + betAmount
        })
        .eq('id', session.user.id);
      if (error) throw error;
      onProfileUpdate(); // Update UI
    } catch (e) {
      console.error("Error placing bet:", e);
      return;
    }

    // --- 2. Generate Path (Provably Fair Simulation) ---
    // In a real app, this would use a server seed hash
    let pathIndex = 0;
    const path: number[] = [0]; // -1 for left, 1 for right
    for (let i = 0; i < rows; i++) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      path.push(direction);
      pathIndex += direction;
    }

    // --- 3. Determine Outcome ---
    const multipliers = MULTIPLIERS[risk][rows];
    const finalBucketIndex = (pathIndex + rows) / 2;
    const multiplier = multipliers[finalBucketIndex];
    const profit = betAmount * multiplier;
    
    // --- 4. Create Ball for Animation ---
    const newBall: Ball = {
      id: Date.now(),
      path: [], // Path will be calculated by the board
      outcome: { multiplier, profit },
    };
    (newBall as any).directions = path; // Pass directions to board

    setBalls(prev => [...prev, newBall]);

  }, [betAmount, risk, rows, session, profile, onProfileUpdate]);

  const handleBallAnimationEnd = useCallback(async (ball: Ball) => {
    // --- 5. Add Payout to Balance ---
    if (ball.outcome.profit > 0 && session) {
      try {
        const { error } = await supabase.rpc('add_to_balance', { amount_to_add: ball.outcome.profit });
        if (error) throw error;
        onProfileUpdate();
      } catch (e) {
        console.error("Error adding payout:", e);
      }
    }
    
    // --- 6. Log Game Bet ---
    if(session) {
      supabase.from('game_bets').insert({
        user_id: session.user.id,
        game_name: 'Plinko',
        bet_amount: betAmount,
        payout: ball.outcome.profit,
        multiplier: ball.outcome.multiplier,
      }).then(({ error }) => {
        if (error) console.error("Error logging Plinko bet:", error.message);
      });
    }

    // --- 7. Update History & Remove Ball ---
    const newHistoryItem: PlinkoBet = { id: ball.id.toString(), multiplier: ball.outcome.multiplier, profit: ball.outcome.profit };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    setBalls(prev => prev.filter(b => b.id !== ball.id));

  }, [session, onProfileUpdate, betAmount]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto bg-[#1f2343] rounded-2xl shadow-lg border border-[#3b4371] p-6 flex flex-col md:flex-row gap-6">
        <PlinkoControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          risk={risk}
          setRisk={setRisk}
          rows={rows}
          setRows={setRows}
          onSendBall={handleSendBall}
          gameState={gameState}
          balance={profile?.balance ?? 0}
        />
        <PlinkoBoard
          rows={rows}
          risk={risk}
          balls={balls}
          onAnimationEnd={handleBallAnimationEnd}
        />
      </div>
      <PlinkoHistory history={history} />
    </div>
  );
};

export default PlinkoGamePage;
