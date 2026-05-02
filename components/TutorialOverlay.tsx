'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export interface TutorialStepConfig {
  step: number;
  title: string;
  body: string;
  highlight?: 'waveform' | 'timeline' | 'confirm' | null;
  blockUntil?: 'placement' | 'confirm' | null;
  autoAdvance?: number; // ms
  showEndButton?: boolean;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    step: 0,
    title: '🎧 Bienvenido a Hitster App',
    body: 'Escuchá canciones y armá tu línea de tiempo.\n👉 El objetivo es ubicar cada canción en el año correcto.',
    highlight: null,
    autoAdvance: 3500,
  },
  {
    step: 1,
    title: '🎯 Cuando es tu turno...',
    body: 'Se reproduce una canción.\n👉 Tenés que decidir en qué año fue lanzada.',
    highlight: 'waveform',
    autoAdvance: 3500,
  },
  {
    step: 2,
    title: '📍 Ubicá la canción',
    body: 'Elegí dónde colocarla en tu línea de tiempo.\n👉 Tocá un botón "+"',
    highlight: 'timeline',
    blockUntil: 'placement',
  },
  {
    step: 3,
    title: '✅ Confirmá tu jugada',
    body: '👉 Tocá CONFIRMAR TURNO',
    highlight: 'confirm',
    blockUntil: 'confirm',
  },
  {
    step: 4,
    title: '🔍 Se revela la respuesta',
    body: '✔️ Si acertás → ganás el punto\n❌ Si fallás → perdés la oportunidad',
    highlight: null,
    autoAdvance: 2500,
  },
  {
    step: 5,
    title: '⚡ El rival puede robar',
    body: 'Si fallás:\n👉 El otro equipo puede intentar acertar',
    highlight: null,
    autoAdvance: 3000,
  },
  {
    step: 6,
    title: '⏱️ Tenés tiempo limitado',
    body: 'Si se acaba el tiempo:\n👉 perdés el turno',
    highlight: null,
    autoAdvance: 3000,
  },
  {
    step: 7,
    title: '🏆 ¡A ganar!',
    body: 'El primer equipo en llegar a 10 puntos gana',
    highlight: null,
    autoAdvance: 2500,
  },
  {
    step: 8,
    title: '🚀 ¡Listo! Ya podés jugar',
    body: '',
    highlight: null,
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

  // Auto-advance
  if (config.autoAdvance && typeof window !== 'undefined') {
    // Handled via useEffect in consumer — we just expose config
  }

  const canAdvance = () => {
    if (config.blockUntil === 'placement') return currentPlacementIndex !== null;
    if (config.blockUntil === 'confirm') return false; // confirm button handles it
    return !config.showEndButton;
  };

  const positionMap: Record<string, React.CSSProperties> = {
    waveform: { bottom: '52%', left: '50%', transform: 'translateX(-50%)' },
    timeline: { bottom: '34%', left: '50%', transform: 'translateX(-50%)' },
    confirm:  { bottom: '12%', left: '50%', transform: 'translateX(-50%)' },
    default:  { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
  };

  const cardPos = config.highlight
    ? positionMap[config.highlight]
    : positionMap.default;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tutorial-step-${tutorialStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          pointerEvents: 'none',
        }}
      >
        {/* Dark overlay — leave a spotlight if highlight exists */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.72)',
          pointerEvents: 'all',
        }} />

        {/* Floating card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'absolute',
            ...cardPos,
            width: 'calc(100% - 48px)',
            maxWidth: 380,
            background: '#111827',
            border: '1.5px solid #1e2d45',
            borderRadius: 20,
            padding: '22px 20px',
            pointerEvents: 'all',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Step indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === tutorialStep ? 16 : 6,
                  height: 6,
                  borderRadius: 9999,
                  background: i === tutorialStep ? '#e8197d' : i < tutorialStep ? '#3db8f5' : '#2a3347',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
            <span style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#8892a4',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {tutorialStep + 1} / {TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 900,
            fontSize: '1.05rem',
            color: 'white',
            marginBottom: 8,
            lineHeight: 1.3,
          }}>
            {config.title}
          </h3>

          {/* Body */}
          {config.body && (
            <p style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.88rem',
              color: '#8892a4',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              marginBottom: config.showEndButton ? 20 : 0,
            }}>
              {config.body}
            </p>
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
              JUGAR AHORA
            </motion.button>
          )}

          {/* Manual advance button for auto-advance steps */}
          {!config.showEndButton && !config.blockUntil && (
            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <button
                onClick={nextTutorialStep}
                style={{
                  background: 'transparent',
                  border: '1px solid #2a3347',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#8892a4',
                  cursor: 'pointer',
                }}
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Blocked hint */}
          {config.blockUntil === 'placement' && currentPlacementIndex === null && (
            <p style={{
              marginTop: 12,
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.75rem',
              color: '#f5c842',
              textAlign: 'center',
            }}>
              ⬆ Seleccioná una posición en la línea de tiempo para continuar
            </p>
          )}
          {config.blockUntil === 'placement' && currentPlacementIndex !== null && (
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button
                onClick={nextTutorialStep}
                style={{
                  background: '#e8197d',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '6px 16px',
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                ¡Listo! →
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
