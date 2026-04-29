'use client';

import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';
import Waveform from './Waveform';
import Timeline from './Timeline';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function TimeoutStealScreen() {
  const {
    teams,
    currentTeamIndex,
    currentSong,
    timeoutStealIndex,
    setTimeoutStealIndex,
    confirmTimeoutSteal,
  } = useGameStore();

  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];
  const bg = COLOR_HEX[opponentTeam.color];

  // Audio continues from the previous screen — same URL = no restart
  useMusicPlayer(currentSong?.previewUrl ?? null, { persistOnUnmount: false });

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
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
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{
            fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.7rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8892a4', marginBottom: 6,
          }}>
            ROBO POR TIMEOUT:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: bg, borderRadius: 6, padding: '4px 10px' }}>
              <span style={{
                fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem',
                color: opponentTeam.color === 'amarillo' ? '#111' : 'white',
              }}>
                {opponentTeam.name}
              </span>
            </div>
            {/* Timeout steals are FREE — no token shown */}
            <span style={{ fontFamily: 'Figtree', fontSize: '0.72rem', color: '#8892a4' }}>
              turno gratis
            </span>
          </div>
        </div>

        {/* No timer — timeout already fired */}
        <div style={{
          background: '#2a1a1a',
          border: '1.5px solid #5a2020',
          borderRadius: 8,
          padding: '6px 12px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Figtree', fontSize: '0.6rem', color: '#e87272', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TIEMPO
          </p>
          <span style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.1rem', color: '#ff4d4d' }}>
            00:00
          </span>
        </div>
      </div>

      <TeamScores />

      {/* ── CONTEXT BANNER ── */}
      <div style={{
        background: `${bg}15`,
        border: `1.5px solid ${bg}50`,
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: '1.1rem' }}>⏱️</span>
        <p style={{
          fontFamily: 'Figtree', fontSize: '0.8rem', fontWeight: 600,
          color: 'white', lineHeight: 1.4,
        }}>
          El rival perdió el tiempo. Podés ubicar la canción en{' '}
          <span style={{ color: bg, fontWeight: 800 }}>tu propia línea de tiempo</span>.
          {' '}Sin costo de fichas.
        </p>
      </div>

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
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          minHeight: 140,
        }}
      >
        <Waveform color={bg} />
      </motion.div>

      {/* ── OPPONENT'S OWN TIMELINE ── */}
      <p style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: 8 }}>
        Tu línea de tiempo
      </p>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <Timeline
          timeline={opponentTeam.timeline}   // rival's OWN timeline
          color={opponentTeam.color}
          selectedIndex={timeoutStealIndex}
          onSelect={setTimeoutStealIndex}
          blockedIndex={null}                 // no blocked positions
          newSong={currentSong}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={() => {
          if (timeoutStealIndex === null) return;
          confirmTimeoutSteal();
        }}
        style={{ opacity: timeoutStealIndex === null ? 0.5 : 1 }}
      >
        CONFIRMAR POSICIÓN
      </motion.button>
    </motion.div>
  );
}
