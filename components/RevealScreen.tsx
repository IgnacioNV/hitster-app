'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import TeamScores from './TeamScores';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d', naranja: '#f47c3c', amarillo: '#f5c842', celeste: '#3db8f5',
};

export default function RevealScreen() {
  const {
    teams, currentTeamIndex, currentSong, revealResult,
    nextTurn, phase,
  } = useGameStore();

  const [revealed, setRevealed] = useState(false);

  const currentTeam = teams[currentTeamIndex];
  const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
  const opponentTeam = teams[opponentIndex];

  if (!currentSong) return null;

  const resultLabel = () => {
    switch (revealResult) {
      case 'team_correct': return { text: '¡CORRECTO!', color: '#22c55e', by: currentTeam.name };
      case 'opponent_correct': return { text: '¡ROBO EXITOSO!', color: COLOR_HEX[opponentTeam.color], by: opponentTeam.name };
      case 'both_wrong': return { text: 'INCORRECTO', color: '#ef4444', by: null };
      default: return null;
    }
  };

  const result = resultLabel();

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
        alignItems: 'center',
      }}
    >
      <TeamScores />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 24 }}>

        {/* Card flip area */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="hidden"
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setRevealed(true)}
              style={{
                background: '#2d1e3e',
                border: '1.5px solid #4a2d6b',
                borderRadius: 20,
                padding: '40px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎵</div>
              <p style={{ fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Toca para revelar
              </p>
              <p style={{ fontFamily: 'Figtree', fontSize: '0.8rem', color: '#8892a4', marginTop: 8 }}>
                ¿Quién acertó?
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              {/* Song reveal card */}
              <div style={{
                background: COLOR_HEX[currentTeam.color],
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                <p style={{
                  fontFamily: 'Figtree',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white',
                  opacity: 0.9,
                  marginBottom: 8,
                }}>
                  {currentSong.artist}
                </p>
                <p style={{
                  fontFamily: 'Figtree',
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white',
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {currentSong.year}
                </p>
                <p style={{
                  fontFamily: 'Figtree',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white',
                  opacity: 0.9,
                }}>
                  {currentSong.title}
                </p>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  style={{
                    background: '#1a2035',
                    borderRadius: 14,
                    padding: '20px',
                    textAlign: 'center',
                    border: `2px solid ${result.color}40`,
                  }}
                >
                  <p style={{
                    fontFamily: 'Figtree',
                    fontWeight: 900,
                    fontSize: '1.8rem',
                    color: result.color,
                    letterSpacing: '0.05em',
                    marginBottom: result.by ? 6 : 0,
                  }}>
                    {result.text}
                  </p>
                  {result.by && (
                    <p style={{ fontFamily: 'Figtree', fontSize: '0.85rem', color: '#8892a4' }}>
                      Punto para {result.by}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {revealed && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          onClick={nextTurn}
          style={{ width: '100%' }}
        >
          SIGUIENTE TURNO
        </motion.button>
      )}
    </motion.div>
  );
}
