'use client';
import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d', naranja: '#f47c3c', amarillo: '#f5c842', celeste: '#3db8f5',
};

const CONFETTI_COLORS = ['#e8197d', '#f47c3c', '#f5c842', '#3db8f5', 'white'];

export default function WinnerScreen() {
  const { teams, resetGame } = useGameStore();
  const winner = teams[0].score >= 10 ? teams[0] : teams[1];
  const bg = COLOR_HEX[winner.color];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti particles */}
      {CONFETTI_COLORS.flatMap((c, ci) =>
        Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={`${ci}-${i}`}
            initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 1, rotate: 0 }}
            animate={{
              y: 900,
              x: (Math.random() * 400 - 200),
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              delay: Math.random() * 1.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
            style={{
              position: 'absolute',
              top: 0,
              width: 8,
              height: 8,
              background: c,
              borderRadius: Math.random() > 0.5 ? '50%' : 2,
              pointerEvents: 'none',
            }}
          />
        ))
      )}

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{ fontSize: '5rem', marginBottom: 24 }}
      >
        🏆
      </motion.div>

      {/* Winner label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p style={{
          fontFamily: 'Figtree',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#8892a4',
          marginBottom: 12,
        }}>
          ¡GANADOR!
        </p>
        <div style={{
          background: bg,
          borderRadius: 16,
          padding: '14px 32px',
          marginBottom: 24,
        }}>
          <p style={{
            fontFamily: 'Figtree',
            fontWeight: 900,
            fontSize: '1.8rem',
            color: winner.color === 'amarillo' ? '#1a1a1a' : 'white',
          }}>
            {winner.name}
          </p>
        </div>
        <p style={{
          fontFamily: 'Figtree',
          fontSize: '1rem',
          color: '#8892a4',
          marginBottom: 8,
        }}>
          ¡10 canciones acertadas!
        </p>
      </motion.div>

      {/* Scores */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 48,
          marginTop: 16,
        }}
      >
        {teams.map((team, i) => (
          <div key={i} style={{
            background: '#1a2035',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center',
            border: team.name === winner.name ? `2px solid ${COLOR_HEX[team.color]}` : '2px solid transparent',
          }}>
            <p style={{ fontFamily: 'Figtree', fontSize: '0.75rem', color: '#8892a4', marginBottom: 6 }}>{team.name}</p>
            <p style={{ fontFamily: 'Figtree', fontWeight: 900, fontSize: '2rem', color: COLOR_HEX[team.color] }}>
              {team.score}
            </p>
            <p style={{ fontFamily: 'Figtree', fontSize: '0.7rem', color: '#8892a4' }}>puntos</p>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={resetGame}
        style={{ width: '100%', maxWidth: 300 }}
      >
        VOLVER A JUGAR
      </motion.button>
    </motion.div>
  );
}
