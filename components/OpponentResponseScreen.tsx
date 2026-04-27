'use client';
import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';
import Waveform from './Waveform';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d', naranja: '#f47c3c', amarillo: '#f5c842', celeste: '#3db8f5',
};

export default function OpponentResponseScreen() {
  const {
    teams, currentTeamIndex, currentSong,
    currentPlacementIndex, timeLeft,
    opponentConfirm, opponentChange,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];
  const bg = COLOR_HEX[opponentTeam.color];
  const currentBg = COLOR_HEX[currentTeam.color];

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  if (!currentSong) return null;

  // Build preview of current team's timeline with card placed
  const previewTimeline = [...currentTeam.timeline];
  if (currentPlacementIndex !== null) {
    previewTimeline.splice(currentPlacementIndex, 0, currentSong);
  }

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 6 }}>
            TURNO (robo):
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: bg, borderRadius: 6, padding: '4px 10px', display: 'inline-block' }}>
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

      {/* Audio */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Sonando ahora...
      </p>
      <div style={{
        background: '#2d1e3e',
        border: '1.5px solid #4a2d6b',
        borderRadius: 14,
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        minHeight: 140,
      }}>
        <Waveform color="#e8197d" />
      </div>

      {/* Timeline label */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Línea de tiempo
      </p>

      {/* Timeline preview - showing where team placed the card */}
      <div style={{
        background: '#1a1020',
        border: `1.5px solid ${currentBg}40`,
        borderRadius: 12,
        padding: '8px',
        overflowY: 'auto',
        maxHeight: 240,
        flex: 1,
        marginBottom: 16,
      }}>
        {previewTimeline.map((song, i) => {
          const isNewCard = currentPlacementIndex !== null && i === currentPlacementIndex;
          return (
            <div
              key={`${song.id}-${i}`}
              style={{
                background: currentBg,
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 4,
                border: isNewCard ? '2px solid white' : 'none',
                opacity: isNewCard ? 1 : 0.7,
              }}
            >
              <p style={{ fontFamily: 'Figtree', fontSize: '0.68rem', fontWeight: 600, color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white', opacity: 0.85, marginBottom: 2 }}>
                {song.artist}
              </p>
              <p style={{ fontFamily: 'Figtree', fontSize: '1.6rem', fontWeight: 900, color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white', lineHeight: 1.1, marginBottom: 2 }}>
                {isNewCard ? '????' : song.year}
              </p>
              <p style={{ fontFamily: 'Figtree', fontSize: '0.68rem', fontWeight: 600, color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white', opacity: 0.85 }}>
                {isNewCard ? currentSong.title : song.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-secondary"
          onClick={opponentChange}
        >
          REALIZAR CAMBIOS
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          onClick={opponentConfirm}
        >
          CONFIRMAR
        </motion.button>
      </div>
    </motion.div>
  );
}
