'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';
import Timeline from './Timeline';
import Waveform from './Waveform';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import AbandonButton from './AbandonButton';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function TurnActiveScreen() {
  const {
    teams,
    currentTeamIndex,
    currentSong,
    currentPlacementIndex,
    setCurrentPlacement,
    confirmTurn,
    timeLeft,
    decrementTime,
    triggerTimeout,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];
  const bg = COLOR_HEX[currentTeam.color];

  // Show timeout banner for 3s before transitioning
  const [showTimeoutBanner, setShowTimeoutBanner] = useState(false);
  const timeoutFiredRef = useRef(false);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  // Audio persists on unmount so it keeps playing into timeout_steal screen
  useMusicPlayer(currentSong?.previewUrl ?? null, { persistOnUnmount: true });

  // Countdown timer
  useEffect(() => {
    if (showTimeoutBanner) return; // freeze timer while banner is visible
    if (timeLeft <= 0) return;

    const interval = setInterval(() => decrementTime(), 1000);
    return () => clearInterval(interval);
  }, [decrementTime, showTimeoutBanner, timeLeft]);

  // When time hits 0, show banner then transition
  useEffect(() => {
    if (timeLeft <= 0 && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      setShowTimeoutBanner(true);

      setTimeout(() => {
        triggerTimeout(); // transitions phase → timeout_steal
      }, 3000);
    }
  }, [timeLeft, triggerTimeout]);

  const handleConfirm = () => {
    if (currentPlacementIndex === null) return;
    // Audio will keep playing — next screen picks it up via persistOnUnmount
    confirmTurn();
  };

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* TIMEOUT BANNER — full-screen overlay for 3 seconds */}
      <AnimatePresence>
        {showTimeoutBanner && (
          <motion.div
            key="timeout-banner"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              background: 'rgba(13, 17, 23, 0.93)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              borderRadius: 0,
              textAlign: 'center',
            }}
          >
            {/* Pulsing clock icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ fontSize: '3.5rem', marginBottom: 20 }}
            >
              ⏱️
            </motion.div>

            <p style={{
              fontFamily: 'Figtree, sans-serif',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#ff4d4d',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              marginBottom: 16,
            }}>
              ¡SE TERMINÓ EL TIEMPO!
            </p>

            <div style={{
              background: `${COLOR_HEX[opponentTeam.color]}20`,
              border: `2px solid ${COLOR_HEX[opponentTeam.color]}`,
              borderRadius: 14,
              padding: '14px 24px',
            }}>
              <span style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 800,
                fontSize: '1rem',
                color: COLOR_HEX[opponentTeam.color],
              }}>
                ¡{opponentTeam.name} puede robar la carta!
              </span>
            </div>

            <p style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.8rem',
              color: '#8892a4',
              marginTop: 20,
            }}>
              La canción sigue sonando...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <AbandonButton />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 4 }}>
            TURNO
          </p>
          <div style={{ background: bg, borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: currentTeam.color === 'amarillo' ? '#111' : 'white' }}>
              {currentTeam.name}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 4 }}>
            TIEMPO
          </p>
          <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.3rem', color: timeLeft <= 20 ? '#ff4d4d' : 'white' }}>
            {mins}:{secs}
          </span>
        </div>
      </div>


      <TeamScores />

      {/* ── AUDIO VISUAL ── */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Sonando ahora...
      </p>

      <motion.div
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [`0 0 0px ${bg}`, `0 0 30px ${bg}`, `0 0 0px ${bg}`],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          background: '#161b27',
          border: `1.5px solid ${bg}50`,
          borderRadius: 16,
          padding: '28px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          minHeight: 150,
        }}
      >
        <Waveform color={bg} />
      </motion.div>

      {/* ── TIMELINE ── */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Línea de tiempo
      </p>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <Timeline
          timeline={currentTeam.timeline}
          color={currentTeam.color}
          selectedIndex={currentPlacementIndex}
          onSelect={setCurrentPlacement}
          newSong={currentSong}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={handleConfirm}
        style={{ opacity: currentPlacementIndex === null ? 0.5 : 1 }}
      >
        CONFIRMAR TURNO
      </motion.button>
    </motion.div>
  );
}
