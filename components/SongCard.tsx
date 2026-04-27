'use client';
import { Song, TeamColor } from '@/lib/store';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

const TEXT_COLOR: Record<TeamColor, string> = {
  rosa: 'white',
  naranja: 'white',
  amarillo: '#1a1a1a',
  celeste: 'white',
};

interface SongCardProps {
  song: Song;
  color: TeamColor;
  revealed?: boolean;
  compact?: boolean;
  isPlacing?: boolean; // the new card being placed (highlighted)
}

export default function SongCard({
  song,
  color,
  revealed = true,
  compact = false,
  isPlacing = false,
}: SongCardProps) {
  const bg = COLOR_HEX[color];
  const textColor = TEXT_COLOR[color];

  if (compact) {
    return (
      <div style={{
        background: bg,
        borderRadius: 10,
        padding: '12px 16px',
        border: isPlacing ? '2px solid white' : 'none',
        boxShadow: isPlacing ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
      }}>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: textColor,
          opacity: 0.85,
          marginBottom: 2,
        }}>
          {revealed ? song.artist : '???'}
        </p>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: textColor,
          lineHeight: 1.1,
          marginBottom: 2,
        }}>
          {revealed ? song.year : '????'}
        </p>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: textColor,
          opacity: 0.85,
        }}>
          {revealed ? song.title : '???'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: bg,
      borderRadius: 14,
      padding: '24px 20px',
      textAlign: 'center',
      border: isPlacing ? '2px solid white' : 'none',
    }}>
      {revealed ? (
        <>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: textColor,
            opacity: 0.9,
            marginBottom: 8,
          }}>
            {song.artist}
          </p>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '3.5rem',
            fontWeight: 900,
            color: textColor,
            lineHeight: 1,
            marginBottom: 8,
          }}>
            {song.year}
          </p>
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: textColor,
            opacity: 0.9,
          }}>
            {song.title}
          </p>
        </>
      ) : (
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '1rem',
          fontWeight: 600,
          color: textColor,
          opacity: 0.7,
        }}>
          ?
        </p>
      )}
    </div>
  );
}
