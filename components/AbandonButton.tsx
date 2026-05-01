'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { stopGlobalAudio } from '@/hooks/useMusicPlayer';

export default function AbandonButton() {
  const [showModal, setShowModal] = useState(false);
  const { resetGame } = useGameStore();

  const handleConfirm = () => {
    stopGlobalAudio();
    resetGame();
    setShowModal(false);
  };

  return (
    <>
      {/* Trigger — top-right corner */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          background: 'transparent',
          border: '1.5px solid #2a3347',
          borderRadius: 8,
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>✕</span>
        <span style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#8892a4',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Abandonar
        </span>
      </button>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="abandon-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(7, 11, 20, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#161b27',
                border: '1.5px solid #2a3347',
                borderRadius: 20,
                padding: '32px 24px',
                width: '100%',
                maxWidth: 360,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏳️</div>

              <h2 style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 900,
                fontSize: '1.3rem',
                color: 'white',
                marginBottom: 10,
              }}>
                ¿Abandonar la partida?
              </h2>

              <p style={{
                fontFamily: 'Figtree, sans-serif',
                fontSize: '0.85rem',
                color: '#8892a4',
                lineHeight: 1.5,
                marginBottom: 28,
              }}>
                Se perderá el progreso del turno actual. El historial de partidas anteriores se mantiene.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '13px',
                    fontFamily: 'Figtree, sans-serif',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Sí, abandonar
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid #2a3347',
                    borderRadius: 9999,
                    padding: '13px',
                    fontFamily: 'Figtree, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#8892a4',
                    cursor: 'pointer',
                  }}
                >
                  Seguir jugando
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
