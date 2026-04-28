'use client';

import { motion } from 'framer-motion';
import { Song, TeamColor } from '@/lib/store';

interface TimelineProps {
  timeline: Song[];
  color: TeamColor;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  blockedIndex?: number | null;
  newSong?: Song | null;
}

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function Timeline({
  timeline,
  color,
  selectedIndex,
  onSelect,
  blockedIndex = null,
  newSong = null,
}: TimelineProps) {
  const bg = COLOR_HEX[color];
  const textColor = color === 'amarillo' ? '#111' : '#fff';

  const renderSlots = () => {
    const slots = [];

    // cantidad de posiciones posibles:
    // si hay 1 carta => 2 posiciones
    // si hay 2 cartas => 3 posiciones
    for (let i = 0; i <= timeline.length; i++) {
      const isSelected = selectedIndex === i;
      const isBlocked = blockedIndex === i;

      // SLOT DE INSERCIÓN
      slots.push(
        <motion.button
          key={`slot-${i}`}
          whileTap={!isBlocked ? { scale: 0.96 } : undefined}
          onClick={() => {
            if (isBlocked) return;
            onSelect(i);
          }}
          style={{
            minWidth: 80,
            height: 140,
            borderRadius: 14,
            border: isSelected
              ? `2px solid ${bg}`
              : isBlocked
              ? '2px dashed #666'
              : '2px dashed #3a4560',
            background: isSelected
              ? `${bg}15`
              : isBlocked
              ? '#161b27'
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isBlocked ? 'not-allowed' : 'pointer',
            opacity: isBlocked ? 0.45 : 1,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Figtree',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: isSelected ? bg : '#8892a4',
            }}
          >
            +
          </span>
        </motion.button>
      );

      // CARTA EXISTENTE
      if (i < timeline.length) {
        const song = timeline[i];

        slots.push(
          <div
            key={`card-${song.id}-${i}`}
            style={{
              minWidth: 160,
              background: bg,
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0,
              minHeight: 140,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'Figtree',
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.85,
                color: textColor,
              }}
            >
              {song.artist}
            </p>

            <p
              style={{
                margin: '8px 0',
                fontFamily: 'Figtree',
                fontSize: '2rem',
                fontWeight: 900,
                lineHeight: 1,
                color: textColor,
              }}
            >
              {song.year}
            </p>

            <p
              style={{
                margin: 0,
                fontFamily: 'Figtree',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: textColor,
              }}
            >
              {song.title}
            </p>
          </div>
        );
      }
    }

    return slots;
  };

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        paddingBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          minWidth: 'max-content',
          padding: '4px 2px',
        }}
      >
        {renderSlots()}
      </div>

      <p
        style={{
          marginTop: 10,
          fontFamily: 'Figtree',
          fontSize: '0.72rem',
          color: '#8892a4',
        }}
      >
        ← más antiguas | más nuevas →
      </p>
    </div>
  );
}