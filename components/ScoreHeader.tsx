'use client';
import { useGameStore, TeamColor } from '@/lib/store';

const COLOR_HEX: Record<TeamColor, string> = {
  rosa: '#e8197d',
  naranja: '#f47c3c',
  amarillo: '#f5c842',
  celeste: '#3db8f5',
};

export default function ScoreHeader({
  showRobbery = false,
  robberyCount = 0,
}: {
  showRobbery?: boolean;
  robberyCount?: number;
}) {
  const { teams, currentTeamIndex } = useGameStore();
  const currentTeam = teams[currentTeamIndex];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
    }}>
      {/* Left: Turn info */}
      <div>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8892a4',
          marginBottom: 6,
        }}>
          {showRobbery ? 'TURNO (robo):' : 'TURNO:'}
        </p>
        <div style={{
          background: COLOR_HEX[currentTeam.color],
          borderRadius: 6,
          padding: '4px 10px',
          display: 'inline-block',
        }}>
          <span style={{
            fontFamily: 'Figtree, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white',
          }}>
            {currentTeam.name}
          </span>
        </div>

        {showRobbery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{
              background: COLOR_HEX[currentTeam.color],
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: currentTeam.color === 'amarillo' ? '#1a1a1a' : 'white',
              }}>
                {robberyCount}
              </span>
            </div>
            <span style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.75rem',
              color: '#8892a4',
            }}>
              Fichas de robo
            </span>
          </div>
        )}
      </div>

      {/* Right: Timer placeholder — handled by parent */}
      <div style={{ textAlign: 'right' }}>
        <p style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8892a4',
          marginBottom: 6,
        }}>
          TIEMPO RESTANTE
        </p>
        <TimerDisplay />
      </div>
    </div>
  );
}

function TimerDisplay() {
  const { timeLeft } = useGameStore();
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <span style={{
      fontFamily: 'Figtree, sans-serif',
      fontWeight: 800,
      fontSize: '1.4rem',
      color: timeLeft < 20 ? '#e8197d' : 'white',
      letterSpacing: '0.05em',
    }}>
      {mins}:{secs}
    </span>
  );
}
