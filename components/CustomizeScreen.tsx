'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore, GameConfig, GameDifficulty, GamePlaylist } from '@/lib/store';

const PLAYLISTS: { id: GamePlaylist; label: string; icon: string; ai?: boolean }[] = [
  { id: 'default',  label: 'Por defecto',     icon: '🎵' },
  { id: 'rock',     label: 'Rock',             icon: '🎸' },
  { id: 'pop',      label: 'Pop',              icon: '✨' },
  { id: 'ai',       label: 'Generada por IA',  icon: '🤖', ai: true },
];

const DIFFICULTIES: { id: GameDifficulty; label: string; desc: string }[] = [
  { id: 'easy',   label: 'Fácil',   desc: '90 segundos por turno' },
  { id: 'normal', label: 'Normal',  desc: '45 segundos por turno' },
  { id: 'hard',   label: 'Difícil', desc: '20 segundos por turno' },
];

export default function CustomizeScreen() {
  const router = useRouter();
  const { startCustomGame, setPhase } = useGameStore();

  const [playlist, setPlaylist]     = useState<GamePlaylist>('default');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [aiPrompt, setAiPrompt]     = useState('');

  const handleStart = async () => {
    const config: GameConfig = {
      mode: 'offline',
      difficulty,
      playlist,
      ...(playlist === 'ai' && aiPrompt ? { aiPrompt } : {}),
    };
    await startCustomGame(config);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 32px',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          style={{
            background: '#161b27',
            border: '1.5px solid #2a3347',
            borderRadius: 10,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <span style={{ color: 'white', fontSize: '1rem' }}>‹</span>
        </motion.button>
        <div>
          <h1 style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 900,
            fontSize: '1.4rem',
            color: 'white',
            letterSpacing: '-0.01em',
          }}>
            Personalizar partida
          </h1>
        </div>
      </div>

      {/* ── PLAYLIST ── */}
      <Section label="🎧 Playlist">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLAYLISTS.map((p) => (
            <OptionCard
              key={p.id}
              selected={playlist === p.id}
              onSelect={() => setPlaylist(p.id)}
              highlight={p.ai}
            >
              <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
              <span style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'white',
                flex: 1,
              }}>
                {p.label}
              </span>
              {p.ai && (
                <span style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#e8197d',
                  background: 'rgba(232,25,125,0.12)',
                  border: '1px solid rgba(232,25,125,0.25)',
                  borderRadius: 9999,
                  padding: '2px 8px',
                }}>
                  Nuevo
                </span>
              )}
            </OptionCard>
          ))}
        </div>

        {playlist === 'ai' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: 12, overflow: 'hidden' }}
          >
            <input
              type="text"
              placeholder="Ej: rock argentino de los 90..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{
                width: '100%',
                background: '#161b27',
                border: '1.5px solid #e8197d50',
                borderRadius: 12,
                padding: '12px 14px',
                fontFamily: 'Figtree, sans-serif',
                fontSize: '0.9rem',
                color: 'white',
                outline: 'none',
              }}
            />
          </motion.div>
        )}
      </Section>

      {/* ── DIFICULTAD ── */}
      <Section label="🧠 Dificultad">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DIFFICULTIES.map((d) => (
            <OptionCard
              key={d.id}
              selected={difficulty === d.id}
              onSelect={() => setDifficulty(d.id)}
            >
              <div>
                <p style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'white',
                  marginBottom: 2,
                }}>
                  {d.label}
                </p>
                <p style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.75rem',
                  color: '#8892a4',
                }}>
                  {d.desc}
                </p>
              </div>
            </OptionCard>
          ))}
        </div>
      </Section>

      {/* ── TIPO ── */}
      <Section label="👥 Tipo de partida">
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Local', active: true },
            { label: 'Online', active: false },
          ].map((t) => (
            <div
              key={t.label}
              style={{
                flex: 1,
                background: t.active ? '#161b27' : '#0f1520',
                border: `1.5px solid ${t.active ? '#e8197d50' : '#1a2035'}`,
                borderRadius: 12,
                padding: '12px',
                textAlign: 'center',
                opacity: t.active ? 1 : 0.4,
                cursor: t.active ? 'pointer' : 'not-allowed',
              }}
            >
              <p style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: t.active ? 'white' : '#8892a4',
              }}>
                {t.label}
              </p>
              {!t.active && (
                <p style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '0.65rem',
                  color: '#3db8f5',
                  marginTop: 2,
                }}>
                  Próximamente
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <div style={{ flex: 1 }} />

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={handleStart}
      >
        COMENZAR PARTIDA
      </motion.button>
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#8892a4',
        marginBottom: 12,
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function OptionCard({
  selected, onSelect, children, highlight,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      style={{
        background: selected ? 'rgba(232,25,125,0.08)' : '#161b27',
        border: `1.5px solid ${selected ? '#e8197d' : highlight ? '#e8197d30' : '#2a3347'}`,
        borderRadius: 12,
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: selected ? '0 0 16px rgba(232,25,125,0.15)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      {children}
      {selected && (
        <div style={{
          marginLeft: 'auto',
          width: 20, height: 20,
          borderRadius: '50%',
          background: '#e8197d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>
        </div>
      )}
    </motion.div>
  );
}
