'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export default function HomeScreen() {
  const router = useRouter();
  const { startQuickGame, matchHistory, phase } = useGameStore();

  const gameInProgress = phase !== 'setup' && phase !== 'winner';

  const handleQuickPlay = async () => {
    await startQuickGame();
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
        padding: '48px 24px 32px',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 900,
          fontSize: '2.4rem',
          color: 'white',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          Hitster App
        </h1>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '1rem',
          color: '#8892a4',
          fontWeight: 500,
        }}>
          Elegí cómo querés jugar
        </p>
      </div>

      {/* JUGAR AHORA — primary CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleQuickPlay}
        style={{
          background: 'linear-gradient(135deg, #e8197d, #c4105f)',
          border: 'none',
          borderRadius: 18,
          padding: '22px 24px',
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: 16,
          boxShadow: '0 0 40px rgba(232,25,125,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 6,
        }}>
          Inicio rápido
        </p>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 900,
          fontSize: '1.6rem',
          color: 'white',
          letterSpacing: '-0.01em',
        }}>
          JUGAR AHORA ▶
        </p>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
          marginTop: 6,
        }}>
          Modo offline · Configuración por defecto
        </p>
      </motion.button>

      {/* PERSONALIZAR */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push('/customize')}
        style={{
          background: '#161b27',
          border: '1.5px solid #2a3347',
          borderRadius: 16,
          padding: '18px 20px',
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'white',
            marginBottom: 3,
          }}>
            ⚙️  Personalizar partida
          </p>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '0.8rem',
            color: '#8892a4',
          }}>
            Playlist, dificultad y más
          </p>
        </div>
        <span style={{ color: '#8892a4', fontSize: '1.2rem' }}>›</span>
      </motion.button>

      {/* MODOS */}
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#8892a4',
        marginBottom: 12,
      }}>
        Modo de juego
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          { label: 'Modo Offline', icon: '🎮', desc: 'Local, sin conexión', active: true, onClick: handleQuickPlay },
          { label: 'Jugar Online',  icon: '🌐', desc: 'Próximamente', active: false, onClick: null },
          { label: 'Modo Asincrónico', icon: '⏳', desc: 'Próximamente', active: false, onClick: null },
        ].map((mode) => (
          <motion.button
            key={mode.label}
            whileTap={mode.active ? { scale: 0.98 } : {}}
            onClick={mode.active && mode.onClick ? mode.onClick : undefined}
            style={{
              background: '#161b27',
              border: `1.5px solid ${mode.active ? '#2a3347' : '#1a2035'}`,
              borderRadius: 14,
              padding: '14px 18px',
              cursor: mode.active ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: mode.active ? 1 : 0.45,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{mode.icon}</span>
            <div>
              <p style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'white',
                marginBottom: 2,
              }}>
                {mode.label}
              </p>
              <p style={{
                fontFamily: 'Figtree, sans-serif',
                fontSize: '0.75rem',
                color: '#8892a4',
              }}>
                {mode.desc}
              </p>
            </div>
            {!mode.active && (
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'Figtree, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#3db8f5',
                background: 'rgba(61,184,245,0.1)',
                border: '1px solid rgba(61,184,245,0.2)',
                borderRadius: 9999,
                padding: '3px 8px',
              }}>
                Pronto
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* HISTORIAL */}
      {matchHistory.length > 0 && (
        <div style={{
          background: '#161b27',
          border: '1.5px solid #1a2035',
          borderRadius: 14,
          padding: '14px 18px',
          opacity: 0.7,
        }}>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'white',
            marginBottom: 2,
          }}>
            📋 Historial de partidas
          </p>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '0.75rem',
            color: '#8892a4',
          }}>
            {matchHistory.length} {matchHistory.length === 1 ? 'partida jugada' : 'partidas jugadas'}
          </p>
        </div>
      )}

      {/* CONTINUAR */}
      {gameInProgress && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {/* game is already in state, page.tsx will route it */}}
          style={{
            marginTop: 16,
            background: 'rgba(245,200,66,0.1)',
            border: '1.5px solid rgba(245,200,66,0.3)',
            borderRadius: 14,
            padding: '14px 18px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#f5c842',
          }}>
            ↩ Continuar partida
          </p>
        </motion.button>
      )}
    </motion.div>
  );
}
