'use client';
import { Song, TeamColor } from '@/lib/store';
import { motion } from 'framer-motion';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};
const TEXT_COLOR: Record<TeamColor, string> = {
  rosa: 'white', naranja: 'white', amarillo: '#1a1a1a', celeste: 'white',
};

interface TimelineProps {
  timeline: Song[];
  color: TeamColor;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  blockedIndex?: number | null; // cannot select this index (opponent_change)
  showInsertZones?: boolean;
  newSong?: Song | null; // the card being placed (shown in timeline when selected)
}

export default function Timeline({
  timeline,
  color,
  selectedIndex,
  onSelect,
  blockedIndex = null,
  showInsertZones = true,
  newSong = null,
}: TimelineProps) {
  const bg = COLOR_HEX[color];
  const textColor = TEXT_COLOR[color];

  const totalSlots = timeline.length + 1; // n+1 possible insertion points

  return (
    <div style={{
      background: '#1a1020',
      border: `1.5px solid ${bg}40`,
      borderRadius: 12,
      padding: '8px',
      overflowY: 'auto',
      maxHeight: '320px',
    }}>
      {/* Slot 0: before first */}
      {showInsertZones && (
        <InsertZone
          index={0}
          selected={selectedIndex === 0}
          blocked={blockedIndex === 0}
          onSelect={onSelect}
          color={color}
        />
      )}

      {timeline.map((song, i) => (
        <div key={song.id}>
          <TimelineCard song={song} color={color} />

          {showInsertZones && (
            <InsertZone
              index={i + 1}
              selected={selectedIndex === i + 1}
              blocked={blockedIndex === i + 1}
              onSelect={onSelect}
              color={color}
            />
          )}
        </div>
      ))}

      {/* If selected and newSong, show preview of where card goes */}
      {selectedIndex !== null && newSong && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: bg,
            borderRadius: 10,
            padding: '12px 16px',
            border: '2px solid white',
            boxShadow: '0 0 0 3px rgba(255,255,255,0.2)',
            margin: '0 4px 8px',
            textAlign: 'center',
          }}
        >
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '0.7rem',
            color: textColor,
            opacity: 0.85,
            marginBottom: 2,
          }}>
            ♪ Colocando aquí
          </p>
        </motion.div>
      )}

      {timeline.length === 0 && !showInsertZones && (
        <p style={{
          textAlign: 'center',
          color: '#8892a4',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.8rem',
          padding: '16px',
        }}>
          Sin cartas aún
        </p>
      )}
    </div>
  );
}

function TimelineCard({ song, color }: { song: Song; color: TeamColor }) {
  const bg = COLOR_HEX[color];
  const textColor = TEXT_COLOR[color];

  return (
    <div style={{
      background: bg,
      borderRadius: 10,
      padding: '12px 16px',
      margin: '0 0 0 0',
    }}>
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: textColor,
        opacity: 0.85,
        marginBottom: 2,
      }}>
        {song.artist}
      </p>
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontSize: '1.6rem',
        fontWeight: 900,
        color: textColor,
        lineHeight: 1.1,
        marginBottom: 2,
      }}>
        {song.year}
      </p>
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: textColor,
        opacity: 0.85,
      }}>
        {song.title}
      </p>
    </div>
  );
}

function InsertZone({
  index, selected, blocked, onSelect, color,
}: {
  index: number;
  selected: boolean;
  blocked: boolean;
  onSelect: (i: number) => void;
  color: TeamColor;
}) {
  const bg = COLOR_HEX[color];

  if (blocked) {
    return (
      <div style={{
        border: '1.5px dashed #3a4560',
        borderRadius: 6,
        padding: '6px 12px',
        margin: '4px 0',
        textAlign: 'center',
        opacity: 0.4,
        cursor: 'not-allowed',
      }}>
        <span style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.7rem',
          color: '#8892a4',
        }}>
          ✗ Posición bloqueada
        </span>
      </div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(index)}
      style={{
        border: selected ? `1.5px solid ${bg}` : '1.5px dashed #3a4560',
        borderRadius: 6,
        padding: '6px 12px',
        margin: '4px 0',
        textAlign: 'center',
        cursor: 'pointer',
        background: selected ? `${bg}20` : 'transparent',
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        fontFamily: 'Figtree, sans-serif',
        fontSize: '0.7rem',
        color: selected ? bg : '#8892a4',
        fontWeight: selected ? 700 : 400,
      }}>
        {selected ? '✓ Colocar aquí' : '+ Insertar aquí'}
      </span>
    </motion.div>
  );
}
