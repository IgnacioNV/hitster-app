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
    nextTurn,
  } = useGameStore();

  const [team1Name, setTeam1Name] =
    useState('');

  const [team2Name, setTeam2Name] =
    useState('');

  const [team1Color, setTeam1Color] =
    useState<TeamColor>('rosa');

  const [team2Color, setTeam2Color] =
    useState<TeamColor>('celeste');

  const getInitialSongForTeam = (
    excludedIds: Set<string>
  ) => {
    const availableSongs = songs.filter(
      (song) => !excludedIds.has(song.id)
    );

    if (!availableSongs.length) return null;

    const randomSong =
      availableSongs[
        Math.floor(
          Math.random() *
            availableSongs.length
        )
      ];

    excludedIds.add(randomSong.id);

    return {
      ...randomSong,
      previewUrl: null,
    };
  };

  const handleStartGame = async () => {
    const usedIds = new Set<string>();

    const initialSongTeam1 =
      getInitialSongForTeam(usedIds);

    const initialSongTeam2 =
      getInitialSongForTeam(usedIds);

    const configuredTeams: [Team, Team] = [
      {
        name:
          team1Name.trim() || 'Equipo 1',
        color: team1Color,
        timeline: initialSongTeam1
          ? [initialSongTeam1]
          : [],
        robberyTokens: 4,
        score: 0,
      },
      {
        name:
          team2Name.trim() || 'Equipo 2',
        color: team2Color,
        timeline: initialSongTeam2
          ? [initialSongTeam2]
          : [],
        robberyTokens: 4,
        score: 0,
      },
    ];

    setTeams(configuredTeams);

    const remainingSongs = songs.filter(
      (song) => !usedIds.has(song.id)
    );

    setAllSongs(remainingSongs);

    await nextTurn();
  };

  const isBlockedForTeam2 = (
    color: TeamColor
  ) => {
    return color === team1Color;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: '#0d1117',
        padding: '24px 20px',
        maxWidth: 430,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: 'white',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        HITSTER
      </h1>

      <p
        style={{
          fontSize: '0.95rem',
          color: '#8892a4',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        Configurá los equipos
      </p>

      {/* EQUIPO 1 */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'white',
            marginBottom: 10,
          }}
        >
          Equipo 1
        </p>

        <input
          value={team1Name}
          onChange={(e) =>
            setTeam1Name(e.target.value)
          }
          placeholder="Equipo 1"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid #2a3347',
            background: '#161b27',
            color: 'white',
            fontSize: '0.95rem',
            marginBottom: 14,
            outline: 'none',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          {COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() =>
                setTeam1Color(color.id)
              }
              style={{
                background:
                  team1Color === color.id
                    ? color.hex
                    : '#161b27',
                border:
                  team1Color === color.id
                    ? '2px solid white'
                    : '1px solid #2a3347',
                borderRadius: 14,
                padding: 12,
                color:
                  color.id === 'amarillo' &&
                  team1Color === color.id
                    ? '#111'
                    : 'white',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {color.label}
            </button>
          ))}
        </div>
      </div>

      {/* EQUIPO 2 */}
      <div style={{ marginBottom: 36 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'white',
            marginBottom: 10,
          }}
        >
          Equipo 2
        </p>

        <input
          value={team2Name}
          onChange={(e) =>
            setTeam2Name(e.target.value)
          }
          placeholder="Equipo 2"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid #2a3347',
            background: '#161b27',
            color: 'white',
            fontSize: '0.95rem',
            marginBottom: 14,
            outline: 'none',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          {COLORS.map((color) => {
            const blocked =
              isBlockedForTeam2(color.id);

            return (
              <button
                key={color.id}
                type="button"
                disabled={blocked}
                onClick={() => {
                  if (!blocked) {
                    setTeam2Color(color.id);
                  }
                }}
                style={{
                  background:
                    team2Color === color.id
                      ? color.hex
                      : '#161b27',
                  border:
                    team2Color === color.id
                      ? '2px solid white'
                      : '1px solid #2a3347',
                  borderRadius: 14,
                  padding: 12,
                  color:
                    color.id === 'amarillo' &&
                    team2Color === color.id
                      ? '#111'
                      : 'white',
                  fontWeight: 700,
                  cursor: blocked
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: blocked ? 0.35 : 1,
                }}
              >
                {color.label}
              </button>
            );
          })}
        </div>
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