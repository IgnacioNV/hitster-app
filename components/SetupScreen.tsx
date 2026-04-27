'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, TeamColor } from '@/lib/store';
import { SONG_CATALOG } from '@/lib/songs';

const COLORS: { id: TeamColor; label: string; hex: string }[] = [
  { id: 'rosa', label: 'Rosa', hex: '#e8197d' },
  { id: 'naranja', label: 'Naranja', hex: '#f47c3c' },
  { id: 'amarillo', label: 'Amarillo', hex: '#f5c842' },
  { id: 'celeste', label: 'Celeste', hex: '#3db8f5' },
];

export default function SetupScreen() {
  const { setTeams, setPhase, setAllSongs, setCurrentSong } = useGameStore();
  const [team1Name, setTeam1Name] = useState('Los pianistas');
  const [team2Name, setTeam2Name] = useState('Los guitarristas');
  const [team1Color, setTeam1Color] = useState<TeamColor>('rosa');
  const [team2Color, setTeam2Color] = useState<TeamColor>('celeste');

  const handleStart = () => {
    // Shuffle and set songs
    const shuffled = [...SONG_CATALOG].sort(() => Math.random() - 0.5);
    setAllSongs(shuffled);

    // Initial song for each team (already placed, revealed)
    const initSong1 = shuffled[0];
    const initSong2 = shuffled[1];
    const usedSet = new Set([initSong1.id, initSong2.id]);

    // First song to play (third song)
    const firstPlaySong = shuffled.find(s => !usedSet.has(s.id)) || shuffled[2];

    const teams: [any, any] = [
      {
        name: team1Name || 'Equipo 1',
        color: team1Color,
        timeline: [initSong1],
        robberyTokens: 4,
        score: 1,
      },
      {
        name: team2Name || 'Equipo 2',
        color: team2Color,
        timeline: [initSong2],
        robberyTokens: 4,
        score: 1,
      },
    ];

    setTeams(teams);
    setCurrentSong(firstPlaySong);
    setPhase('turn_active');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 800,
        fontSize: '1.1rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'white',
        marginBottom: 32,
        marginTop: 16,
      }}>
        NOMBRE DE EQUIPOS
      </h1>

      {/* Team 1 */}
      <TeamSetup
        label="Nombre Equipo1:"
        name={team1Name}
        setName={setTeam1Name}
        color={team1Color}
        setColor={setTeam1Color}
        excludeColor={team2Color}
      />

      <div style={{ height: 24 }} />

      {/* Team 2 */}
      <TeamSetup
        label="Nombre Equipo2:"
        name={team2Name}
        setName={setTeam2Name}
        color={team2Color}
        setColor={setTeam2Color}
        excludeColor={team1Color}
      />

      <div style={{ flex: 1 }} />

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={handleStart}
      >
        EMPEZAR!
      </motion.button>
    </motion.div>
  );
}

function TeamSetup({
  label, name, setName, color, setColor, excludeColor,
}: {
  label: string;
  name: string;
  setName: (v: string) => void;
  color: TeamColor;
  setColor: (v: TeamColor) => void;
  excludeColor: TeamColor;
}) {
  return (
    <div>
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: 'white',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1.5px solid #3a4560',
          borderRadius: 8,
          padding: '10px 14px',
          color: 'white',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.9rem',
          outline: 'none',
          marginBottom: 14,
        }}
      />
      <p style={{
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: 'white',
        marginBottom: 10,
      }}>
        Color del equipo:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COLORS.map(c => (
          <label
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: c.id === excludeColor ? 'not-allowed' : 'pointer',
              opacity: c.id === excludeColor ? 0.4 : 1,
            }}
          >
            <div
              onClick={() => c.id !== excludeColor && setColor(c.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: c.hex,
                border: color === c.id ? '3px solid white' : '3px solid transparent',
                cursor: c.id === excludeColor ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontFamily: 'Figtree, sans-serif',
              fontSize: '0.95rem',
              color: 'white',
            }}>
              {c.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
