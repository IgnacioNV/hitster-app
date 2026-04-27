import { create } from 'zustand';
import { enrichSongWithItunes } from '@/lib/itunes';

export type TeamColor = 'rosa' | 'naranja' | 'amarillo' | 'celeste';

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  previewUrl: string | null;
  albumArt: string | null;
}

export interface Team {
  name: string;
  color: TeamColor;
  timeline: Song[];
  robberyTokens: number;
  score: number;
}

export type GamePhase =
  | 'setup'
  | 'turn_active'
  | 'opponent_response'
  | 'opponent_change'
  | 'reveal'
  | 'winner';

interface GameState {
  teams: [Team, Team];
  currentTeamIndex: 0 | 1;
  phase: GamePhase;
  currentSong: Song | null;
  currentPlacementIndex: number | null;
  opponentPlacementIndex: number | null;
  timeLeft: number;
  allSongs: Song[];
  usedSongIds: Set<string>;
  revealResult:
    | 'team_correct'
    | 'opponent_correct'
    | 'both_wrong'
    | null;
  opponentChoseChange: boolean;

  setTeams: (teams: [Team, Team]) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentPlacement: (index: number) => void;
  setOpponentPlacement: (index: number) => void;
  setAllSongs: (songs: Song[]) => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;

  confirmTurn: () => void;
  opponentConfirm: () => void;
  opponentChange: () => void;
  confirmOpponentChange: () => void;
  nextTurn: () => Promise<void>;
  resetGame: () => void;
}

const initialTeams: [Team, Team] = [
  {
    name: 'Equipo 1',
    color: 'rosa',
    timeline: [],
    robberyTokens: 4,
    score: 0,
  },
  {
    name: 'Equipo 2',
    color: 'celeste',
    timeline: [],
    robberyTokens: 4,
    score: 0,
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  teams: initialTeams,
  currentTeamIndex: 0,
  phase: 'setup',
  currentSong: null,
  currentPlacementIndex: null,
  opponentPlacementIndex: null,
  timeLeft: 90,
  allSongs: [],
  usedSongIds: new Set(),
  revealResult: null,
  opponentChoseChange: false,

  setTeams: (teams) => set({ teams }),

  setPhase: (phase) => set({ phase }),

  setCurrentPlacement: (index) =>
    set({
      currentPlacementIndex: index,
    }),

  setOpponentPlacement: (index) =>
    set({
      opponentPlacementIndex: index,
    }),

  setAllSongs: (songs) =>
    set({
      allSongs: songs,
    }),

  setTimeLeft: (time) =>
    set({
      timeLeft: time,
    }),

  decrementTime: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  confirmTurn: () => {
    set({
      phase: 'opponent_response',
    });
  },

  opponentConfirm: () => {
    set({
      revealResult: 'team_correct',
      phase: 'reveal',
      opponentChoseChange: false,
    });
  },

  opponentChange: () => {
    set({
      phase: 'opponent_change',
      opponentChoseChange: true,
    });
  },

  confirmOpponentChange: () => {
    set({
      revealResult: 'opponent_correct',
      phase: 'reveal',
    });
  },

  nextTurn: async () => {
    const {
      currentTeamIndex,
      allSongs,
      usedSongIds,
    } = get();

    const nextIndex =
      currentTeamIndex === 0 ? 1 : 0;

    const availableSongs = allSongs.filter(
      (song) => !usedSongIds.has(song.id)
    );

    const baseSong =
      availableSongs.length > 0
        ? availableSongs[
            Math.floor(
              Math.random() * availableSongs.length
            )
          ]
        : allSongs[
            Math.floor(
              Math.random() * allSongs.length
            )
          ];

    if (!baseSong) {
      console.log('No hay canciones disponibles');
      return;
    }

    console.log(
      'Buscando preview para:',
      baseSong.artist,
      '-',
      baseSong.title
    );

    const enriched =
      await enrichSongWithItunes(
        baseSong.artist,
        baseSong.title
      );

    const nextSong: Song = {
      ...baseSong,
      previewUrl: enriched?.previewUrl ?? null,
      albumArt: enriched?.artwork ?? null,
    };

    console.log('Canción cargada:', nextSong);
    console.log(
      'Preview URL:',
      nextSong.previewUrl
    );

    const newUsed = new Set(usedSongIds);
    newUsed.add(nextSong.id);

    set({
      currentTeamIndex: nextIndex as 0 | 1,
      phase: 'turn_active',
      currentSong: nextSong,
      currentPlacementIndex: null,
      opponentPlacementIndex: null,
      timeLeft: 90,
      revealResult: null,
      opponentChoseChange: false,
      usedSongIds: newUsed,
    });
  },

  resetGame: () =>
    set({
      teams: initialTeams,
      currentTeamIndex: 0,
      phase: 'setup',
      currentSong: null,
      currentPlacementIndex: null,
      opponentPlacementIndex: null,
      timeLeft: 90,
      allSongs: [],
      usedSongIds: new Set(),
      revealResult: null,
      opponentChoseChange: false,
    }),
}));