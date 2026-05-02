'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export interface TutorialStepConfig {
  step: number;
  title: string;
  body: string;
  highlight?: 'waveform' | 'timeline' | 'confirm' | null;
  blockUntil?: 'placement' | 'confirm' | null;
  autoAdvanceMs?: number;
  showEndButton?: boolean;
  // Card position: 'top' when the relevant UI element is in the lower half, 'bottom' otherwise
  cardPosition: 'top' | 'bottom';
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    step: 0,
    title: '🎧 Bienvenido a Hitster App',
    body: 'Escuchá canciones y armá tu línea de tiempo.\nEl objetivo es ubicar cada canción en el año correcto.',
    cardPosition: 'bottom',
    autoAdvanceMs: 4500,
  },
  {
    step: 1,
    title: '🎯 Escuchá la canción',
    body: 'Se reproduce una canción sin mostrar el año.\nTenés que adivinar cuándo fue lanzada.',
    highlight: 'waveform',
    cardPosition: 'bottom',
    autoAdvanceMs: 4500,
  },
  {
    step: 2,
    title: '📍 Ubicá la canción',
    body: 'Tocá uno de los botones "+" en la línea de tiempo para elegir dónde colocarla.',
    highlight: 'timeline',
    blockUntil: 'placement',
    cardPosition: 'top',
  },
  {
    step: 3,
    title: '✅ Confirmá tu jugada',
    body: 'Tocá CONFIRMAR TURNO para enviar tu respuesta.',
    highlight: 'confirm',
    blockUntil: 'confirm',
    cardPosition: 'top',
  },
  {
    step: 4,
    title: '🔍 Se revela la respuesta',
    body: 'Si acertás la posición → ganás el punto.\nSi fallás → el rival puede intentar robar.',
    cardPosition: 'bottom',
    autoAdvanceMs: 3500,
  },
  {
    step: 5,
    title: '⚡ Robo del rival',
    body: 'Si fallás, el otro equipo puede intentar acertar y llevarse el punto.',
    cardPosition: 'bottom',
    autoAdvanceMs: 3500,
  },
  {
    step: 6,
    title: '⏱️ Tiempo limitado',
    body: 'Tenés 45 segundos por turno.\nSi se acaba el tiempo, perdés el turno.',
    cardPosition: 'bottom',
    autoAdvanceMs: 3500,
  },
  {
    step: 7,
    title: '🏆 ¿Cómo ganar?',
    body: 'El primer equipo en colocar 10 canciones correctamente en su línea de tiempo gana.',
    cardPosition: 'bottom',
    autoAdvanceMs: 3500,
  },
  {
    step: 8,
    title: '🚀 ¡Listo para jugar!',
    body: '¡Ya sabés todo lo que necesitás. Buena suerte!',
    cardPosition: 'bottom',
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
  const isInteractionStep = !!config.blockUntil;

  // Auto-advance informational steps
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!config.autoAdvanceMs || config.blockUntil) return;
    const t = setTimeout(() => nextTutorialStep(), config.autoAdvanceMs);
    return () => clearTimeout(t);
  }, [tutorialStep]); // eslint-disable-line

  // Advance when user selects a placement position (step 2)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (config.blockUntil === 'placement' && currentPlacementIndex !== null) {
      // Small delay so user sees the selection before advancing
      const t = setTimeout(() => nextTutorialStep(), 400);
      return () => clearTimeout(t);
    }
  }, [currentPlacementIndex]); // eslint-disable-line

  const cardPosition: React.CSSProperties = config.cardPosition === 'top'
    ? { top: 76, left: 16, right: 16 }   // below header, above gameplay area
    : { bottom: 96, left: 16, right: 16 }; // above confirm button

  const cardAnim = config.cardPosition === 'top'
    ? { initial: { y: -16, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -8, opacity: 0 } }
    : { initial: { y: 16, opacity: 0 },  animate: { y: 0, opacity: 1 }, exit: { y: 8, opacity: 0 } };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tut-bg-${tutorialStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed',
          inset: 0,
          // zIndex BELOW the glow elements (which are z-index:201) but above normal UI
          zIndex: 250,
          // The entire overlay never blocks pointer events
          // This lets the user tap glow-highlighted elements directly
          pointerEvents: 'none',
        }}
      >
        {/* Dim layer — purely visual, never intercepts clicks */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isInteractionStep
            ? 'rgba(4, 8, 18, 0.35)'
            : 'rgba(4, 8, 18, 0.55)',
          pointerEvents: 'none',
        }} />

        {/* Tutorial card — re-enables pointer events for its own buttons */}
        <motion.div
          key={`tut-card-${tutorialStep}`}
          {...cardAnim}
          transition={{ type: 'spring', stiffness: 340, damping: 32, delay: 0.07 }}
          style={{
            position: 'absolute',
            ...cardPosition,
            background: 'rgba(8, 14, 26, 0.97)',
            border: '1.5px solid #1a2d4a',
            borderRadius: 16,
            padding: '13px 15px',
            // Card is interactive
            pointerEvents: 'all',
            boxShadow: '0 4px 28px rgba(0,0,0,0.75), 0 0 0 1px rgba(232,25,125,0.1)',
          }}
        >
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 9 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} style={{
                height: 3,
                flex: i === tutorialStep ? 3 : 1,
                borderRadius: 9999,
                background: i === tutorialStep ? '#e8197d' : i < tutorialStep ? 'rgba(61,184,245,0.45)' : 'rgba(30,48,80,0.7)',
                transition: 'flex 0.3s ease',
              }} />
            ))}
          </div>

          <h3 style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 900,
            fontSize: '0.88rem',
            color: 'white',
            lineHeight: 1.25,
            marginBottom: 5,
          }}>
            {config.title}
          </h3>

          {config.body && (
            <p style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.78rem',
              color: '#8892a4',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              marginBottom: (config.showEndButton || isInteractionStep) ? 10 : 0,
            }}>
              {config.body}
            </p>
          )}

          {/* Placement cue */}
          {config.blockUntil === 'placement' && currentPlacementIndex === null && (
            <Cue color="#f5c842" bg="rgba(245,200,66,0.07)" border="rgba(245,200,66,0.2)">
              👇 Tocá un "+" en la línea de tiempo
            </Cue>
          )}
          {config.blockUntil === 'placement' && currentPlacementIndex !== null && (
            <Cue color="#22c55e" bg="rgba(34,197,94,0.07)" border="rgba(34,197,94,0.2)">
              ✓ Posición seleccionada
            </Cue>
          )}

          {/* Confirm cue */}
          {config.blockUntil === 'confirm' && (
            <Cue color="#e8197d" bg="rgba(232,25,125,0.07)" border="rgba(232,25,125,0.2)">
              👇 Tocá CONFIRMAR TURNO
            </Cue>
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
                padding: '11px',
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              JUGAR AHORA
            </motion.button>
          )}

          {/* "Entendido" for informational steps only */}
          {!config.showEndButton && !isInteractionStep && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 7 }}>
              <button
                onClick={nextTutorialStep}
                style={{
                  background: 'transparent',
                  border: '1px solid #1a2d4a',
                  borderRadius: 9999,
                  padding: '3px 13px',
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#4a6080',
                  cursor: 'pointer',
                  lineHeight: 1.8,
                }}
              >
                Entendido →
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Cue({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 9,
      padding: '6px 10px',
    }}>
      <span style={{
        fontFamily: 'Figtree, sans-serif',
        fontSize: '0.74rem',
        color,
        fontWeight: 700,
        lineHeight: 1.35,
      }}>
        {children}
      </span>
    </div>
  );
}
