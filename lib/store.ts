import { create } from 'zustand';
import { enrichSongWithItunes } from '@/lib/itunes';

export type TeamColor =
  | 'rosa'
  | 'naranja'
  | 'amarillo'
  | 'celeste';

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  previewUrl: string | null;
  albumArt?: string | null;
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

type RevealResult =
  | 'team_correct'
  | 'opponent_correct'
  | 'both_wrong'
  | null;

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

  revealResult: RevealResult;
  opponentChoseChange: boolean;

  setTeams: (teams: [Team, Team]) => void;
  setAllSongs: (songs: Song[]) => void;
  setPhase: (phase: GamePhase) => void;

  setCurrentPlacement: (index: number) => void;
  setOpponentPlacement: (index: number) => void;

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

function isCorrectPlacement(
  timeline: Song[],
  insertIndex: number,
  song: Song
) {
  const simulated = [...timeline];
  simulated.splice(insertIndex, 0, song);

  for (let i = 1; i < simulated.length; i++) {
    if (simulated[i].year < simulated[i - 1].year) {
      return false;
    }
  }

  return true;
}

export const useGameStore =
  create<GameState>((set, get) => ({
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

    setTeams: (teams) => {
      const allSongs = get().allSongs;

      if (!allSongs.length) {
        set({ teams });
        return;
      }

      const used = new Set<string>();

      const firstSong1 =
        allSongs[
          Math.floor(
            Math.random() * allSongs.length
          )
        ];

      used.add(firstSong1.id);

      const remainingSongs = allSongs.filter(
        (song) => !used.has(song.id)
      );

      const firstSong2 =
        remainingSongs[
          Math.floor(
            Math.random() *
              remainingSongs.length
          )
        ];

      used.add(firstSong2.id);

      const configuredTeams: [Team, Team] = [
        {
          ...teams[0],
          timeline: [firstSong1],
          score: 1,
        },
        {
          ...teams[1],
          timeline: [firstSong2],
          score: 1,
        },
      ];

      set({
        teams: configuredTeams,
        usedSongIds: used,
      });
    },

    setAllSongs: (songs) =>
      set({
        allSongs: songs,
      }),

    setPhase: (phase) =>
      set({
        phase,
      }),

    setCurrentPlacement: (index) =>
      set({
        currentPlacementIndex: index,
      }),

    setOpponentPlacement: (index) =>
      set({
        opponentPlacementIndex: index,
      }),

    setTimeLeft: (time) =>
      set({
        timeLeft: time,
      }),

    decrementTime: () =>
      set((state) => ({
        timeLeft: Math.max(
          0,
          state.timeLeft - 1
        ),
      })),

    confirmTurn: () => {
      set({
        phase: 'opponent_response',
      });
    },

    opponentConfirm: () => {
      const {
        teams,
        currentTeamIndex,
        currentSong,
        currentPlacementIndex,
      } = get();

      if (
        !currentSong ||
        currentPlacementIndex === null
      ) {
        return;
      }

      const currentTeam =
        teams[currentTeamIndex];

      const correct =
        isCorrectPlacement(
          currentTeam.timeline,
          currentPlacementIndex,
          currentSong
        );

      const updatedTeams = [
        ...teams,
      ] as [Team, Team];

      if (correct) {
        const newTimeline = [
          ...currentTeam.timeline,
        ];

        newTimeline.splice(
          currentPlacementIndex,
          0,
          currentSong
        );

        updatedTeams[currentTeamIndex] = {
          ...currentTeam,
          timeline: newTimeline,
          score: currentTeam.score + 1,
        };

        set({
          teams: updatedTeams,
          revealResult: 'team_correct',
          phase: 'reveal',
          currentSong: {
            ...currentSong,
            previewUrl: null,
          },
        });
      } else {
        set({
          revealResult: 'both_wrong',
          phase: 'reveal',
          currentSong: {
            ...currentSong,
            previewUrl: null,
          },
        });
      }
    },

    opponentChange: () => {
      set({
        opponentChoseChange: true,
        phase: 'opponent_change',
      });
    },

    confirmOpponentChange: () => {
      const {
        teams,
        currentTeamIndex,
        currentSong,
        currentPlacementIndex,
        opponentPlacementIndex,
      } = get();

      if (
        !currentSong ||
        currentPlacementIndex === null ||
        opponentPlacementIndex === null
      ) {
        return;
      }

      const teamIndex =
        currentTeamIndex;

      const opponentIndex =
        currentTeamIndex === 0 ? 1 : 0;

      const currentTeam =
        teams[teamIndex];

      const opponentTeam =
        teams[opponentIndex];

      const currentCorrect =
        isCorrectPlacement(
          currentTeam.timeline,
          currentPlacementIndex,
          currentSong
        );

      const opponentCorrect =
        isCorrectPlacement(
          currentTeam.timeline,
          opponentPlacementIndex,
          currentSong
        );

      const updatedTeams = [
        ...teams,
      ] as [Team, Team];

      if (
        !currentCorrect &&
        opponentCorrect
      ) {
        updatedTeams[opponentIndex] = {
          ...opponentTeam,
          score:
            opponentTeam.score + 1,
          robberyTokens:
            Math.max(
              0,
              opponentTeam.robberyTokens -
                1
            ),
          timeline: [
            ...opponentTeam.timeline,
            currentSong,
          ].sort(
            (a, b) =>
              a.year - b.year
          ),
        };

        set({
          teams: updatedTeams,
          revealResult:
            'opponent_correct',
          phase: 'reveal',
          currentSong: {
            ...currentSong,
            previewUrl: null,
          },
        });

        return;
      }

      if (currentCorrect) {
        const newTimeline = [
          ...currentTeam.timeline,
        ];

        newTimeline.splice(
          currentPlacementIndex,
          0,
          currentSong
        );

        updatedTeams[teamIndex] = {
          ...currentTeam,
          timeline: newTimeline,
          score:
            currentTeam.score + 1,
        };

        updatedTeams[opponentIndex] = {
          ...opponentTeam,
          robberyTokens:
            Math.max(
              0,
              opponentTeam.robberyTokens -
                1
            ),
        };

        set({
          teams: updatedTeams,
          revealResult: 'team_correct',
          phase: 'reveal',
          currentSong: {
            ...currentSong,
            previewUrl: null,
          },
        });

        return;
      }

      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        robberyTokens: Math.max(
          0,
          opponentTeam.robberyTokens -
            1
        ),
      };

      set({
        teams: updatedTeams,
        revealResult: 'both_wrong',
        phase: 'reveal',
        currentSong: {
          ...currentSong,
          previewUrl: null,
        },
      });
    },

    nextTurn: async () => {
      const {
        allSongs,
        usedSongIds,
        currentTeamIndex,
      } = get();

      if (!allSongs.length) {
        console.log(
          'No hay canciones cargadas'
        );
        return;
      }

      const nextTeamIndex =
        currentTeamIndex === 0 ? 1 : 0;

      const availableSongs =
        allSongs.filter(
          (song) =>
            !usedSongIds.has(song.id)
        );

      const pool =
        availableSongs.length > 0
          ? availableSongs
          : allSongs;

      const baseSong =
        pool[
          Math.floor(
            Math.random() * pool.length
          )
        ];

      if (!baseSong) {
        console.log(
          'No se pudo obtener una canción'
        );
        return;
      }

      const updatedUsedSongs =
        new Set(usedSongIds);

      updatedUsedSongs.add(
        baseSong.id
      );

      const enriched =
        await enrichSongWithItunes(
          baseSong.artist,
          baseSong.title
        );

      const playableSong: Song = {
        ...baseSong,
        previewUrl:
          enriched?.previewUrl ||
          baseSong.previewUrl ||
          null,
        albumArt:
          enriched?.artwork ||
          baseSong.albumArt ||
          null,
      };

      console.log(
        'Canción seleccionada:',
        playableSong
      );

      set({
        currentTeamIndex:
          nextTeamIndex as 0 | 1,
        currentSong: playableSong,
        currentPlacementIndex: null,
        opponentPlacementIndex: null,
        phase: 'turn_active',
        timeLeft: 90,
        revealResult: null,
        opponentChoseChange: false,
        usedSongIds:
          updatedUsedSongs,
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