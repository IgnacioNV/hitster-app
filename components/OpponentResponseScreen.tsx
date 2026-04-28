'use client';

import { motion } from 'framer-motion';
import {
  useGameStore,
  TeamColor,
} from '@/lib/store';
import TeamScores from './TeamScores';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function OpponentResponseScreen() {
  const {
    teams,
    currentTeamIndex,
    currentSong,
    currentPlacementIndex,
    timeLeft,
    opponentConfirm,
    opponentChange,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex =
    currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];

  const bg = COLOR_HEX[opponentTeam.color];
  const currentBg = COLOR_HEX[currentTeam.color];

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');

  const secs = (timeLeft % 60)
    .toString()
    .padStart(2, '0');

  if (!currentSong) return null;

  const previewTimeline = [...currentTeam.timeline];

  if (currentPlacementIndex !== null) {
    previewTimeline.splice(
      currentPlacementIndex,
      0,
      currentSong
    );
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
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'Figtree',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: '#8892a4',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            TURNO (ROBO)
          </p>

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: bg,
                borderRadius: 8,
                padding: '4px 10px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Figtree',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color:
                    opponentTeam.color ===
                    'amarillo'
                      ? '#111'
                      : 'white',
                }}
              >
                {opponentTeam.name}
              </span>
            </div>

            <div
              style={{
                background: bg,
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Figtree',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color:
                    opponentTeam.color ===
                    'amarillo'
                      ? '#111'
                      : 'white',
                }}
              >
                {opponentTeam.robberyTokens}
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'Figtree',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: '#8892a4',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            TIEMPO
          </p>

          <span
            style={{
              fontFamily: 'Figtree',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'white',
            }}
          >
            {mins}:{secs}
          </span>
        </div>
      </div>

      <TeamScores />

      {/* Preview */}
      <p
        style={{
          fontFamily: 'Figtree',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: 'white',
          marginBottom: 8,
        }}
      >
        Línea propuesta por rival
      </p>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 20,
          background: '#161b27',
          borderRadius: 16,
          padding: 10,
          border: `1px solid ${currentBg}30`,
        }}
      >
        {previewTimeline.map((song, i) => {
          const isNew =
            currentPlacementIndex !== null &&
            i === currentPlacementIndex;

          return (
            <div
              key={`${song.id}-${i}`}
              style={{
                background: currentBg,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 6,
                border: isNew
                  ? '2px solid white'
                  : 'none',
                opacity: isNew ? 1 : 0.7,
              }}
            >
              <p
                style={{
                  fontFamily: 'Figtree',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  marginBottom: 2,
                  color:
                    currentTeam.color ===
                    'amarillo'
                      ? '#111'
                      : 'white',
                }}
              >
                {song.artist}
              </p>

              <p
                style={{
                  fontFamily: 'Figtree',
                  fontSize: '1.7rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 2,
                  color:
                    currentTeam.color ===
                    'amarillo'
                      ? '#111'
                      : 'white',
                }}
              >
                {isNew ? '????' : song.year}
              </p>

              <p
                style={{
                  fontFamily: 'Figtree',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color:
                    currentTeam.color ===
                    'amarillo'
                      ? '#111'
                      : 'white',
                }}
              >
                {song.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-secondary"
          onClick={opponentChange}
          disabled={
            opponentTeam.robberyTokens <= 0
          }
          style={{
            opacity:
              opponentTeam.robberyTokens <= 0
                ? 0.4
                : 1,
          }}
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