'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, TeamColor, Team } from '@/lib/store';
import { songs } from '@/lib/songs';

const COLORS: {
  id: TeamColor;
  label: string;
  hex: string;
}[] = [
  {
    id: 'rosa',
    label: 'Rosa',
    hex: '#e8197d',
  },
  {
    id: 'naranja',
    label: 'Naranja',
    hex: '#f47c3c',
  },
  {
    id: 'amarillo',
    label: 'Amarillo',
    hex: '#f5c842',
  },
  {
    id: 'celeste',
    label: 'Celeste',
    hex: '#3db8f5',
  },
];

export default function SetupScreen() {
  const {
    setTeams,
    setAllSongs,
    setPhase,
    nextTurn,
  } = useGameStore();

  const [team1Name, setTeam1Name] =
    useState('Equipo 1');

  const [team2Name, setTeam2Name] =
    useState('Equipo 2');

  const [team1Color, setTeam1Color] =
    useState<TeamColor>('rosa');

  const [team2Color, setTeam2Color] =
    useState<TeamColor>('celeste');

  const handleStartGame = async () => {
    const shuffledSongs = [...songs].sort(
      () => Math.random() - 0.5
    );

    const initialSongTeam1 =
      shuffledSongs[0];

    const initialSongTeam2 =
      shuffledSongs[1];

    const configuredTeams: [Team, Team] = [
      {
        name: team1Name || 'Equipo 1',
        color: team1Color,
        timeline: [initialSongTeam1],
        robberyTokens: 4,
        score: 1,
      },
      {
        name: team2Name || 'Equipo 2',
        color: team2Color,
        timeline: [initialSongTeam2],
        robberyTokens: 4,
        score: 1,
      },
    ];

    setTeams(configuredTeams);
    setAllSongs(songs);
    setPhase('turn_active');

    await nextTurn();
  };

  const renderColorPicker = (
    selectedColor: TeamColor,
    setColor: (color: TeamColor) => void
  ) => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {COLORS.map((color) => {
          const isSelected =
            selectedColor === color.id;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() =>
                setColor(color.id)
              }
              style={{
                background: isSelected
                  ? color.hex
                  : '#161b27',
                border: isSelected
                  ? '2px solid white'
                  : '1px solid #2a3347',
                borderRadius: 14,
                padding: '14px',
                cursor: 'pointer',
                fontFamily: 'Figtree',
                fontWeight: 700,
                fontSize: '0.95rem',
                color:
                  color.id === 'amarillo' &&
                  isSelected
                    ? '#111'
                    : 'white',
                transition: '0.2s',
              }}
            >
              {color.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        padding: '32px 20px',
        maxWidth: 430,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontFamily: 'Figtree',
          fontSize: '2.2rem',
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        HITSTER
      </h1>

      <p
        style={{
          textAlign: 'center',
          color: '#8892a4',
          marginBottom: 32,
          fontFamily: 'Figtree',
          fontSize: '0.95rem',
        }}
      >
        Configurá los equipos
      </p>

      {/* EQUIPO 1 */}
      <div
        style={{
          marginBottom: 28,
        }}
      >
        <p
          style={{
            color: 'white',
            fontFamily: 'Figtree',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: 10,
          }}
        >
          Equipo 1
        </p>

        <input
          value={team1Name}
          onChange={(e) =>
            setTeam1Name(
              e.target.value
            )
          }
          placeholder="Nombre del equipo"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border:
              '1px solid #2a3347',
            background: '#161b27',
            color: 'white',
            fontFamily: 'Figtree',
            fontSize: '0.95rem',
            outline: 'none',
            marginBottom: 14,
          }}
        />

        {renderColorPicker(
          team1Color,
          setTeam1Color
        )}
      </div>

      {/* EQUIPO 2 */}
      <div
        style={{
          marginBottom: 36,
        }}
      >
        <p
          style={{
            color: 'white',
            fontFamily: 'Figtree',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: 10,
          }}
        >
          Equipo 2
        </p>

        <input
          value={team2Name}
          onChange={(e) =>
            setTeam2Name(
              e.target.value
            )
          }
          placeholder="Nombre del equipo"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border:
              '1px solid #2a3347',
            background: '#161b27',
            color: 'white',
            fontFamily: 'Figtree',
            fontSize: '0.95rem',
            outline: 'none',
            marginBottom: 14,
          }}
        />

        {renderColorPicker(
          team2Color,
          setTeam2Color
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        className="btn-primary"
        onClick={handleStartGame}
      >
        COMENZAR PARTIDA
      </motion.button>
    </motion.div>
  );
}