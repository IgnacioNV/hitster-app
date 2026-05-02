'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';
import Timeline from './Timeline';
import Waveform from './Waveform';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import AbandonButton from './AbandonButton';
import TutorialOverlay, { TUTORIAL_STEPS } from './TutorialOverlay';

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
    isTutorial,
    tutorialStep,
    nextTutorialStep,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];
  const bg = COLOR_HEX[currentTeam.color];

  const [showTimeoutBanner, setShowTimeoutBanner] = useState(false);
  const timeoutFiredRef = useRef(false);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  useMusicPlayer(currentSong?.previewUrl ?? null, { persistOnUnmount: true });

  // Timer — disabled in tutorial
  useEffect(() => {
    if (isTutorial) return;
    if (showTimeoutBanner || timeLeft <= 0) return;
    const interval = setInterval(() => decrementTime(), 1000);
    return () => clearInterval(interval);
  }, [decrementTime, showTimeoutBanner, timeLeft, isTutorial]);

  useEffect(() => {
    if (isTutorial) return;
    if (timeLeft <= 0 && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      setShowTimeoutBanner(true);
      setTimeout(() => triggerTimeout(), 3000);
    }
  }, [timeLeft, triggerTimeout, isTutorial]);

  // Auto-advance tutorial steps that have autoAdvance
  useEffect(() => {
    if (!isTutorial) return;
    const config = TUTORIAL_STEPS[tutorialStep];
    if (!config?.autoAdvance) return;
    const t = setTimeout(() => nextTutorialStep(), config.autoAdvance);
    return () => clearTimeout(t);
  }, [isTutorial, tutorialStep, nextTutorialStep]);

  const handleConfirm = () => {
    if (currentPlacementIndex === null) return;
    if (isTutorial && tutorialStep === 3) {
      // Step 3: user pressed confirm — advance tutorial then proceed
      nextTutorialStep(); // → step 4 (reveal)
    }
    confirmTurn();
  };

  if (!currentSong) return null;

  // Tutorial highlight styles
  const waveformHighlight = isTutorial && tutorialStep === 1
    ? { boxShadow: '0 0 0 3px #e8197d, 0 0 30px rgba(232,25,125,0.5)', zIndex: 201, position: 'relative' as const }
    : {};
  const timelineHighlight = isTutorial && (tutorialStep === 2 || tutorialStep === 3)
    ? { boxShadow: '0 0 0 2px #f5c842, 0 0 20px rgba(245,200,66,0.3)', borderRadius: 12, zIndex: 201, position: 'relative' as const }
    : {};
  const confirmHighlight = isTutorial && tutorialStep === 3
    ? { boxShadow: '0 0 0 3px #e8197d, 0 0 20px rgba(232,25,125,0.4)', zIndex: 201, position: 'relative' as const, borderRadius: 9999 }
    : {};

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
      {/* TUTORIAL OVERLAY */}
      <TutorialOverlay currentPlacementIndex={currentPlacementIndex} />

      {/* TIMEOUT BANNER */}
      <AnimatePresence>
        {showTimeoutBanner && (
          <motion.div
            key="timeout-banner"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              background: 'rgba(13, 17, 23, 0.93)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 32, textAlign: 'center',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ fontSize: '3.5rem', marginBottom: 20 }}
            >
              ⏱️
            </motion.div>
            <p style={{ fontFamily: 'Figtree', fontWeight: 900, fontSize: '1.4rem', color: '#ff4d4d', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 16 }}>
              ¡SE TERMINÓ EL TIEMPO!
            </p>
            <div style={{ background: `${COLOR_HEX[opponentTeam.color]}20`, border: `2px solid ${COLOR_HEX[opponentTeam.color]}`, borderRadius: 14, padding: '14px 24px' }}>
              <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1rem', color: COLOR_HEX[opponentTeam.color] }}>
                ¡{opponentTeam.name} puede robar la carta!
              </span>
            </div>
            <p style={{ fontFamily: 'Figtree', fontSize: '0.8rem', color: '#8892a4', marginTop: 20 }}>
              La canción sigue sonando...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <AbandonButton />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 4 }}>
            {isTutorial ? 'TUTORIAL' : 'TURNO'}
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
          <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.3rem', color: isTutorial ? '#8892a4' : timeLeft <= 20 ? '#ff4d4d' : 'white' }}>
            {isTutorial ? '—:——' : `${mins}:${secs}`}
          </span>
        </div>
      </div>

      <TeamScores />

      {/* AUDIO */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Sonando ahora...
      </p>

      <motion.div
        animate={{ scale: [1, 1.03, 1], boxShadow: [`0 0 0px ${bg}`, `0 0 30px ${bg}`, `0 0 0px ${bg}`] }}
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
          ...waveformHighlight,
        }}
      >
        <Waveform color={bg} />
      </motion.div>

      {/* TIMELINE */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Línea de tiempo
      </p>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, ...timelineHighlight }}>
        <Timeline
          timeline={currentTeam.timeline}
          color={currentTeam.color}
          selectedIndex={currentPlacementIndex}
          onSelect={setCurrentPlacement}
          newSong={currentSong}
        />
      </div>

      <div style={confirmHighlight}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          onClick={handleConfirm}
          style={{ opacity: currentPlacementIndex === null ? 0.5 : 1 }}
        >
          CONFIRMAR TURNO
        </motion.button>
      </div>
    </motion.div>
  );
}
