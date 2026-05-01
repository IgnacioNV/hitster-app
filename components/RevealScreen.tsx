'use client';
import { useEffect, useRef, useState } from 'react';
import { stopGlobalAudio } from '@/hooks/useMusicPlayer';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import TeamScores from './TeamScores';
import AbandonButton from './AbandonButton';

export default function RevealScreen() {
  const {
    revealResult,
    robberyMessage,
    nextTurn,
    currentSong,
    teams,
    currentTeamIndex,
    setPhase,
  } = useGameStore();

  const isDoubleTimeout = robberyMessage?.startsWith('Punto perdido');

  if (!currentSong) return null;

  const resultRef = useRef(revealResult);
  const [countdown, setCountdown] = useState(3); // freeze result at mount — never changes mid-reveal

  // Stop audio once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { stopGlobalAudio(); }, []);

  // Redirect to winner screen if applicable — but only AFTER audio stop has settled
  useEffect(() => {
    if (teams[0].score >= 10 || teams[1].score >= 10) {
      const t = setTimeout(() => setPhase('winner'), 100);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — scores won't change during reveal

  // Auto-advance after every result
  useEffect(() => {
    const t = setTimeout(() => nextTurn(), 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once — result is stable from mount

  // Live countdown display for all results
  useEffect(() => {
    if (gameWon) return;
    const interval = setInterval(() => {
      setCountdown((n) => (n > 1 ? n - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gameWon = teams[0].score >= 10 || teams[1].score >= 10;
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;

  // Use frozen ref so UI never flickers if store updates
  const frozenResult = resultRef.current;

  const getResultConfig = () => {
    if (frozenResult === 'team_correct') {
      return {
        title: '¡CORRECTO!',
        subtitle: `Punto para ${teams[currentTeamIndex].name}`,
        border: '1px solid rgba(34, 197, 94, 0.35)',
        glow: '0 0 0 1px rgba(34,197,94,0.12)',
        titleColor: '#22c55e',
      };
    }
    if (frozenResult === 'opponent_correct') {
      return {
        title: '¡ROBO EXITOSO!',
        subtitle: `Punto para ${teams[opponentIndex].name}`,
        border: '1px solid rgba(59, 130, 246, 0.35)',
        glow: '0 0 0 1px rgba(59,130,246,0.12)',
        titleColor: '#3b82f6',
      };
    }
    return {
      title: '¡INCORRECTO!',
      subtitle: 'El punto se pierde',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      glow: '0 0 0 1px rgba(239,68,68,0.12)',
      titleColor: '#ef4444',
    };
  };

  const result = getResultConfig();
  const isCorrect = frozenResult === 'team_correct' || frozenResult === 'opponent_correct';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#07111d',
        position: 'relative',
        padding: '24px 20px',
        maxWidth: 430,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <AbandonButton />
        <div style={{ width: 80 }} />
      </div>
      <TeamScores />

      {/* CARD DE LA CANCIÓN */}
      <div
        style={{
          marginTop: 40,
          background: '#46B5F0',
          borderRadius: 28,
          padding: '38px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
        }}
      >
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: 18, textAlign: 'center' }}>
          {currentSong.artist}
        </p>
        <h1 style={{ fontSize: '5.2rem', fontWeight: 900, lineHeight: 1, color: 'white', marginBottom: 24 }}>
          {currentSong.year}
        </h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', textAlign: 'center' }}>
          {currentSong.title}
        </p>
      </div>

      {/* RESULTADO */}
      <div
        style={{
          marginTop: 26,
          background: '#18223d',
          borderRadius: 24,
          padding: '34px 22px',
          border: result.border,
          boxShadow: result.glow,
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.4rem',
            fontWeight: 900,
            color: result.titleColor,
            marginBottom: 14,
            letterSpacing: '0.02em',
          }}
        >
          {result.title}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#8f9bb3', fontWeight: 500, lineHeight: 1.6 }}>
          {result.subtitle}
        </p>
        {robberyMessage && (
          <p style={{ marginTop: 14, textAlign: 'center', fontSize: '0.85rem', fontWeight: 500, color: '#7f8aa3', lineHeight: 1.6 }}>
            {robberyMessage}
          </p>
        )}

      </div>

      {/* BOTÓN / COUNTDOWN */}
      <div style={{ marginTop: 'auto', paddingTop: 32 }}>
        {!gameWon && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '0.82rem', color: '#6b7a99', textAlign: 'center', lineHeight: 1.6 }}>
              {isDoubleTimeout
                ? robberyMessage
                : frozenResult === 'opponent_correct'
                  ? 'El turno siguiente es tuyo — robaste la carta.'
                  : 'El turno siguiente es del otro equipo.'}
            </p>
            <div style={{
              width: '100%',
              background: '#0f1a2e',
              border: '1.5px solid #1e2d45',
              borderRadius: 9999,
              padding: '14px',
              textAlign: 'center',
            }}>
              <span style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f9bb3' }}>
                ⏱ Nueva ronda en {countdown}...
              </span>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
