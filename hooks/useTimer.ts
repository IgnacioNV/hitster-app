import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';

export function useTimer() {
  const { timeLeft, timerActive, phase, isTutorial, decrementTime, triggerTimeout } = useGameStore();
  const timeoutFiredRef = useRef(false);

  useEffect(() => {
    if (isTutorial) return;
    if (!timerActive) return;
    if (phase !== 'turn_active' && phase !== 'timeout_steal') return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, phase, timeLeft, isTutorial, decrementTime]);

  useEffect(() => {
    if (isTutorial) return;
    if (timeLeft <= 0 && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      if (phase === 'turn_active') {
        triggerTimeout();
      }
    }
  }, [timeLeft, phase, isTutorial, triggerTimeout]);
}
