'use client';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import SetupScreen from '@/components/SetupScreen';
import TurnActiveScreen from '@/components/TurnActiveScreen';
import TimeoutStealScreen from '@/components/TimeoutStealScreen';
import OpponentResponseScreen from '@/components/OpponentResponseScreen';
import OpponentChangeScreen from '@/components/OpponentChangeScreen';
import RevealScreen from '@/components/RevealScreen';
import WinnerScreen from '@/components/WinnerScreen';

export default function Home() {
  const { phase } = useGameStore();

  return (
    <main style={{ background: '#0d1117', minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        {phase === 'setup'             && <SetupScreen            key="setup" />}
        {phase === 'turn_active'       && <TurnActiveScreen       key="turn_active" />}
        {phase === 'timeout_steal'     && <TimeoutStealScreen     key="timeout_steal" />}
        {phase === 'opponent_response' && <OpponentResponseScreen key="opponent_response" />}
        {phase === 'opponent_change'   && <OpponentChangeScreen   key="opponent_change" />}
        {phase === 'reveal'            && <RevealScreen           key="reveal" />}
        {phase === 'winner'            && <WinnerScreen           key="winner" />}
      </AnimatePresence>
    </main>
  );
}
