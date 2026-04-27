'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import ScoreHeader from './ScoreHeader';
import TeamScores from './TeamScores';
import Waveform from './Waveform';
import Timeline from './Timeline';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

export default function TurnActiveScreen() {
  const {
    teams, currentTeamIndex, currentSong,
    currentPlacementIndex, setCurrentPlacement,
    timeLeft, decrementTime, setPhase, confirmTurn,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const { isPlaying, toggle } = useMusicPlayer(currentSong?.previewUrl ?? null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time's up → opponent can steal
      setPhase('opponent_response');
      return;
    }
    const t = setInterval(() => decrementTime(), 1000);
    return () => clearInterval(t);
  }, [timeLeft, decrementTime, setPhase]);

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      <ScoreHeader />
      <TeamScores />

      {/* Now Playing */}
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.85rem',
        color: 'white',
        marginBottom: 8,
      }}>
        Sonando ahora...
      </p>

      {/* Audio card - purple */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={toggle}
        style={{
          background: '#2d1e3e',
          border: '1.5px solid #4a2d6b',
          borderRadius: 14,
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          cursor: 'pointer',
          minHeight: 140,
        }}
      >
        {currentSong.albumArt ? (
          <img
            src={currentSong.albumArt}
            alt="Album art"
            style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover' }}
          />
        ) : (
          <Waveform color={isPlaying ? '#e8197d' : 'white'} />
        )}
      </motion.div>

      {/* Timeline label */}
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.85rem',
        color: 'white',
        marginBottom: 8,
      }}>
        Línea de tiempo
      </p>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <Timeline
          timeline={currentTeam.timeline}
          color={currentTeam.color}
          selectedIndex={currentPlacementIndex}
          onSelect={setCurrentPlacement}
          newSong={currentSong}
        />
      </div>

      {/* Confirm button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={() => {
          if (currentPlacementIndex === null) return;
          confirmTurn();
        }}
        style={{
          opacity: currentPlacementIndex === null ? 0.5 : 1,
        }}
      >
        CONFIRMAR
      </motion.button>
    </motion.div>
  );
}
