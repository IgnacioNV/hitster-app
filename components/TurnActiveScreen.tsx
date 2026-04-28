'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';
import Timeline from './Timeline';
import Waveform from './Waveform';

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
  } = useGameStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTeam = teams[currentTeamIndex];
  const bg = COLOR_HEX[currentTeam.color];

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');

  const secs = (timeLeft % 60)
    .toString()
    .padStart(2, '0');

  useEffect(() => {
    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [decrementTime]);

  useEffect(() => {
    if (!currentSong?.previewUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(currentSong.previewUrl);
    audio.volume = 1;
    audio.loop = true;

    audio
      .play()
      .then(() => {
        console.log('La canción está sonando');
      })
      .catch(() => {
        console.log('La canción NO está sonando');
      });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [currentSong]);

  const handleConfirm = () => {
    if (currentPlacementIndex === null) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

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
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px',
        paddingBottom:
          'max(20px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'Figtree',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8892a4',
              marginBottom: 6,
            }}
          >
            TURNO:
          </p>

          <div
            style={{
              background: bg,
              borderRadius: 6,
              padding: '4px 10px',
              display: 'inline-block',
            }}
          >
            <span
              style={{
                fontFamily: 'Figtree',
                fontWeight: 700,
                fontSize: '0.85rem',
                color:
                  currentTeam.color === 'amarillo'
                    ? '#111'
                    : 'white',
              }}
            >
              {currentTeam.name}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'Figtree',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8892a4',
              marginBottom: 6,
            }}
          >
            TIEMPO RESTANTE
          </p>

          <span
            style={{
              fontFamily: 'Figtree',
              fontWeight: 800,
              fontSize: '1.4rem',
              color:
                timeLeft <= 20
                  ? '#ff4d4d'
                  : 'white',
            }}
          >
            {mins}:{secs}
          </span>
        </div>
      </div>

      <TeamScores />

      {/* Audio visual */}
      <p
        style={{
          fontFamily: 'Figtree',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: 'white',
          marginBottom: 8,
        }}
      >
        Sonando ahora...
      </p>

      <motion.div
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [
            `0 0 0px ${bg}`,
            `0 0 30px ${bg}`,
            `0 0 0px ${bg}`,
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
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

      {/* Timeline */}
      <p
        style={{
          fontFamily: 'Figtree',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: 'white',
          marginBottom: 8,
        }}
      >
        Línea de tiempo
      </p>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 16,
        }}
      >
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
        style={{
          opacity:
            currentPlacementIndex === null
              ? 0.5
              : 1,
        }}
      >
        CONFIRMAR TURNO
      </motion.button>
    </motion.div>
  );
}