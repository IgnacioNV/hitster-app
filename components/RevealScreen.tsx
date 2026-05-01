'use client';
import { useEffect } from 'react';
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

  if (!currentSong) return null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { stopGlobalAudio(); }, []);

  // If a winner exists, redirect immediately (covers edge cases)
  useEffect(() => {
    if (teams[0].score >= 10 || teams[1].score >= 10) {
      setPhase('winner');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const gameWon = teams[0].score >= 10 || teams[1].score >= 10;

  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;

  const getResultConfig = () => {
    if (revealResult === 'team_correct') {
      return {
        title: '¡CORRECTO!',
        subtitle: `Punto para ${teams[currentTeamIndex].name}`,
        border: '1px solid rgba(34, 197, 94, 0.35)',
        glow: '0 0 0 1px rgba(34,197,94,0.12)',
        titleColor: '#22c55e',
      };
    }

    if (revealResult === 'opponent_correct') {
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

        <p
          style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: '#8f9bb3',
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          {result.subtitle}
        </p>

        {robberyMessage && (
          <p
            style={{
              marginTop: 14,
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#7f8aa3',
              lineHeight: 1.6,
            }}
          >
            {robberyMessage}
          </p>
        )}
      </div>
      {/* CARD DE LA CANCIÓN */}
      <div
        style={{
          marginTop: 40,
          background: '#46B5F0',
          borderRadius: 28,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
        }}
      >
        <p
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: 18,
            textAlign: 'center',
          }}
        >
          {currentSong.artist}
        </p>

        <h1
          style={{
            fontSize: '5.2rem',
            fontWeight: 900,
            lineHeight: 1,
            color: 'white',
            marginBottom: 24,
          }}
        >
          {currentSong.year}
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'white',
            textAlign: 'center',
          }}
        >
          {currentSong.title}
        </p>
      </div>

      {/* RESULTADO */}

      {/* BOTÓN */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 32,
        }}
      >
        {!gameWon && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            onClick={nextTurn}
          >
            SIGUIENTE TURNO
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}