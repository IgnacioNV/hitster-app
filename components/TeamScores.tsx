'use client';
import { useGameStore, TeamColor } from '@/lib/store';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function TeamScores() {
  const { teams } = useGameStore();

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {teams.map((team, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: '#1a2035',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <p style={{
            fontFamily: 'Figtree, sans-serif',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#8892a4',
            marginBottom: 4,
          }}>
            {team.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: COLOR_HEX[team.color],
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'white',
            }}>
              {team.score}/10
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
