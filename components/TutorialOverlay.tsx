'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export interface TutorialStepConfig {
  step: number;
  title: string;
  body: string;
  // Which UI element is highlighted (allows interaction through overlay)
  highlight?: 'waveform' | 'timeline' | 'confirm' | null;
  // If set, the step only advances when the user performs that action in the real UI
  // (the overlay lets clicks through to the highlighted element)
  blockUntil?: 'placement' | 'confirm' | null;
  // Auto-advance after N ms (only for informational steps with no blockUntil)
  autoAdvanceMs?: number;
  showEndButton?: boolean;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    step: 0,
    title: '🎧 Bienvenido a Hitster App',
    body: 'Escuchá canciones y armá tu línea de tiempo.\nEl objetivo es ubicar cada canción en el año correcto.',
    autoAdvanceMs: 4000,
  },
  {
    step: 1,
    title: '🎯 Escuchá la canción',
    body: 'Se reproduce una canción sin mostrar el año.\nTenés que adivinar cuándo fue lanzada.',
    highlight: 'waveform',
    autoAdvanceMs: 4000,
  },
  {
    step: 2,
    title: '📍 Ubicá la canción en tu línea de tiempo',
    body: 'Tocá uno de los botones "+" para elegir dónde colocarla.',
    highlight: 'timeline',
    blockUntil: 'placement',
  },
  {
    step: 3,
    title: '✅ Confirmá tu jugada',
    body: 'Tocá el botón CONFIRMAR TURNO para enviar tu respuesta.',
    highlight: 'confirm',
    blockUntil: 'confirm',
  },
  {
    step: 4,
    title: '🔍 Se revela la respuesta',
    body: 'Si acertás la posición → ganás el punto.\nSi fallás → el rival puede robar.',
    autoAdvanceMs: 3500,
  },
  {
    step: 5,
    title: '⚡ Robo del rival',
    body: 'Si fallás, el otro equipo puede intentar acertar y llevarse el punto.',
    autoAdvanceMs: 3500,
  },
  {
    step: 6,
    title: '⏱️ Tiempo limitado',
    body: 'Tenés 45 segundos por turno. Si se acaba el tiempo, perdés el turno.',
    autoAdvanceMs: 3500,
  },
  {
    step: 7,
    title: '🏆 ¿Cómo ganar?',
    body: 'El primer equipo en colocar 10 canciones correctamente en su línea de tiempo gana.',
    autoAdvanceMs: 3500,
  },
  {
    step: 8,
    title: '🚀 ¡Listo para jugar!',
    body: 'Ya conocés todo lo necesario. ¡Buena suerte!',
    showEndButton: true,
  },
];

interface TutorialOverlayProps {
  currentPlacementIndex: number | null;
}

export default function TutorialOverlay({ currentPlacementIndex }: TutorialOverlayProps) {
  const { isTutorial, tutorialStep, nextTutorialStep, endTutorial } = useGameStore();

  if (!isTutorial) return null;

  const config = TUTORIAL_STEPS[tutorialStep] ?? TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1];

  // Auto-advance for informational steps
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!config.autoAdvanceMs || config.blockUntil) return;
    const t = setTimeout(() => nextTutorialStep(), config.autoAdvanceMs);
    return () => clearTimeout(t);
  }, [tutorialStep]); // eslint-disable-line

  // For steps 2+: when placement is selected, auto-advance to next step
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (config.blockUntil === 'placement' && currentPlacementIndex !== null) {
      nextTutorialStep();
    }
  }, [currentPlacementIndex]); // eslint-disable-line

  // The overlay blocks ALL clicks EXCEPT on the highlighted element.
  // We achieve this by NOT rendering a full-screen pointer-events blocker
  // when the user needs to interact with a specific element.
  // Instead: overlay is pointer-events:none, card is pointer-events:all.
  const needsRealInteraction = config.blockUntil === 'placement' || config.blockUntil === 'confirm';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tut-${tutorialStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          // Don't block clicks during interaction steps
          pointerEvents: needsRealInteraction ? 'none' : 'none',
        }}
      >
        {/* Dim background — only visible, not interactive */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: needsRealInteraction
            ? 'rgba(5, 10, 20, 0.45)' // lighter so UI beneath is readable
            : 'rgba(5, 10, 20, 0.65)',
          pointerEvents: needsRealInteraction ? 'none' : 'all',
        }} />

        {/* Card — always at BOTTOM of screen, never covering the highlighted area */}
        <motion.div
          key={`card-${tutorialStep}`}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
          style={{
            position: 'absolute',
            bottom: 'max(20px, env(safe-area-inset-bottom))',
            left: 16,
            right: 16,
            background: '#0e1521',
            border: '1.5px solid #1e3050',
            borderRadius: 18,
            padding: '16px 18px',
            pointerEvents: 'all',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,25,125,0.15)',
            maxHeight: '38vh',
            overflow: 'hidden',
          }}
        >
          {/* Progress dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} style={{
                height: 4,
                width: i === tutorialStep ? 20 : 4,
                borderRadius: 9999,
                background: i === tutorialStep ? '#e8197d' : i < tutorialStep ? '#3db8f560' : '#1e3050',
                transition: 'all 0.25s',
                flexShrink: 0,
              }} />
            ))}
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#4a5568',
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}>
              {tutorialStep + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h3 style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 900,
            fontSize: '0.95rem',
            color: 'white',
            lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {config.title}
          </h3>

          {config.body && (
            <p style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.82rem',
              color: '#8892a4',
              lineHeight: 1.55,
              whiteSpace: 'pre-line',
              marginBottom: config.showEndButton || needsRealInteraction ? 14 : 0,
            }}>
              {config.body}
            </p>
          )}

          {/* Interaction hint for blockUntil steps */}
          {config.blockUntil === 'placement' && currentPlacementIndex === null && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(245,200,66,0.08)',
              border: '1px solid rgba(245,200,66,0.25)',
              borderRadius: 10,
              padding: '8px 12px',
            }}>
              <span style={{ fontSize: '0.9rem' }}>👆</span>
              <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '0.78rem', color: '#f5c842', fontWeight: 600 }}>
                Tocá un "+" en la línea de tiempo de arriba
              </span>
            </div>
          )}

          {config.blockUntil === 'confirm' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(232,25,125,0.08)',
              border: '1px solid rgba(232,25,125,0.25)',
              borderRadius: 10,
              padding: '8px 12px',
            }}>
              <span style={{ fontSize: '0.9rem' }}>👆</span>
              <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '0.78rem', color: '#e8197d', fontWeight: 600 }}>
                Tocá el botón CONFIRMAR TURNO de arriba
              </span>
            </div>
          )}

          {/* End button */}
          {config.showEndButton && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={endTutorial}
              style={{
                width: '100%',
                background: '#e8197d',
                border: 'none',
                borderRadius: 9999,
                padding: '12px',
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              JUGAR AHORA
            </motion.button>
          )}

          {/* Skip / Next for auto-advance steps */}
          {!config.showEndButton && !config.blockUntil && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={nextTutorialStep}
                style={{
                  background: 'transparent',
                  border: '1px solid #1e3050',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#4a6080',
                  cursor: 'pointer',
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
