'use client';

import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import TeamScores from './TeamScores';
import Waveform from './Waveform';
import Timeline from './Timeline';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function OpponentChangeScreen() {
  const {
    teams,
    currentTeamIndex,
    currentSong,
    timeLeft,
    currentPlacementIndex,
    opponentPlacementIndex,
    setOpponentPlacement,
    confirmOpponentChange,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];
  const bg = COLOR_HEX[opponentTeam.color];

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  // Keep audio playing; stop when we leave this screen (reveal will stop it)
  useMusicPlayer(currentSong?.previewUrl ?? null, { persistOnUnmount: true });

  if (!currentSong) return null;

  const handleSelect = (index: number) => {
    if (index === currentPlacementIndex) return;
    setOpponentPlacement(index);
  };

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
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 6 }}>
            TURNO (robo):
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: bg, borderRadius: 6, padding: '4px 10px' }}>
              <span style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: opponentTeam.color === 'amarillo' ? '#1a1a1a' : 'white' }}>
                {opponentTeam.name}
              </span>
            </div>
            <div style={{ background: bg, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '0.85rem', color: opponentTeam.color === 'amarillo' ? '#1a1a1a' : 'white' }}>
                {opponentTeam.robberyTokens}
              </span>
            </div>
            <span style={{ fontFamily: 'Figtree', fontSize: '0.75rem', color: '#8892a4' }}>Fichas de robo</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 6 }}>
            TIEMPO RESTANTE
          </p>
          <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.4rem', color: 'white' }}>
            {mins}:{secs}
          </span>
        </div>
      </div>

      <TeamScores />

      {/* AUDIO */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Sonando ahora...
      </p>
      <div style={{
        background: '#1a2035',
        border: `1.5px solid ${bg}40`,
        borderRadius: 14,
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        minHeight: 160,
        boxShadow: `0 0 30px ${bg}20`,
      }}>
        <Waveform color={bg} />
      </div>

      {/* TIMELINE */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Línea de tiempo
      </p>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <Timeline
          timeline={currentTeam.timeline}
          color={currentTeam.color}
          selectedIndex={opponentPlacementIndex}
          onSelect={handleSelect}
          blockedIndex={currentPlacementIndex}
          newSong={currentSong}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={() => {
          if (opponentPlacementIndex === null) return;
          confirmOpponentChange();
        }}
        style={{ opacity: opponentPlacementIndex === null ? 0.5 : 1 }}
      >
        CONFIRMAR
      </motion.button>
    </motion.div>
  );
}
