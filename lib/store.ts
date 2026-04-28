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

export type RevealResult =
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
  robberyMessage: string | null;

  setTeams: (teams: [Team, Team]) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentPlacement: (index: number) => void;
  setOpponentPlacement: (index: number) => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  setAllSongs: (songs: Song[]) => void;

  confirmTurn: () => void;
  opponentConfirm: () => void;
  opponentChange: () => void;
  confirmOpponentChange: () => void;
  timeoutAutoReveal: () => void;

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
  song: Song,
  index: number
) {
  const test = [...timeline];
  test.splice(index, 0, song);

  for (let i = 1; i < test.length; i++) {
    if (test[i].year < test[i - 1].year) {
      return false;
    }
  }

  return true;
}

function insertSongSorted(
  timeline: Song[],
  song: Song,
  index: number
) {
  const updated = [...timeline];
  updated.splice(index, 0, song);

  return updated.sort((a, b) => a.year - b.year);
}

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
  robberyMessage: null,

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

  setTimeLeft: (time) =>
    set({
      timeLeft: time,
    }),

  decrementTime: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  setAllSongs: (songs) =>
    set({
      allSongs: songs,
    }),

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

    if (!currentSong || currentPlacementIndex === null) {
      return;
    }

    const currentTeam = teams[currentTeamIndex];

    const correct = isCorrectPlacement(
      currentTeam.timeline,
      currentSong,
      currentPlacementIndex
    );

    const updatedTeams = [...teams] as [Team, Team];

    if (correct) {
      updatedTeams[currentTeamIndex] = {
        ...currentTeam,
        timeline: insertSongSorted(
          currentTeam.timeline,
          currentSong,
          currentPlacementIndex
        ),
        score: currentTeam.score + 1,
      };

      set({
        teams: updatedTeams,
        revealResult: 'team_correct',
        phase: 'reveal',
        opponentChoseChange: false,
        robberyMessage: null,
      });

      return;
    }

    set({
      revealResult: 'both_wrong',
      phase: 'reveal',
      opponentChoseChange: false,
      robberyMessage: null,
    });
  },

  opponentChange: () => {
    set({
      phase: 'opponent_change',
      opponentChoseChange: true,
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

    const currentTeam = teams[currentTeamIndex];
    const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
    const opponentTeam = teams[opponentIndex];

    const currentCorrect = isCorrectPlacement(
      currentTeam.timeline,
      currentSong,
      currentPlacementIndex
    );

    const opponentCorrect = isCorrectPlacement(
      currentTeam.timeline,
      currentSong,
      opponentPlacementIndex
    );

    const updatedTeams = [...teams] as [Team, Team];

    /**
     * ROBO EXITOSO
     */
    if (!currentCorrect && opponentCorrect) {
      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        timeline: insertSongSorted(
          opponentTeam.timeline,
          currentSong,
          opponentPlacementIndex
        ),
        score: opponentTeam.score + 1,
        robberyTokens: Math.max(
          0,
          opponentTeam.robberyTokens - 1
        ),
      };

      set({
        teams: updatedTeams,
        revealResult: 'opponent_correct',
        phase: 'reveal',
        robberyMessage: `${opponentTeam.name} ha usado una ficha de robo. ${updatedTeams[opponentIndex].robberyTokens} fichas de robo restantes`,
      });

      return;
    }

    /**
     * EL EQUIPO ORIGINAL ESTABA BIEN
     */
    if (currentCorrect) {
      updatedTeams[currentTeamIndex] = {
        ...currentTeam,
        timeline: insertSongSorted(
          currentTeam.timeline,
          currentSong,
          currentPlacementIndex
        ),
        score: currentTeam.score + 1,
      };

      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        robberyTokens: Math.max(
          0,
          opponentTeam.robberyTokens - 1
        ),
      };

      set({
        teams: updatedTeams,
        revealResult: 'team_correct',
        phase: 'reveal',
        robberyMessage: `${opponentTeam.name} ha perdido una ficha de robo. ${updatedTeams[opponentIndex].robberyTokens} fichas de robo restantes`,
      });

      return;
    }

    /**
     * AMBOS INCORRECTOS
     */
    updatedTeams[opponentIndex] = {
      ...opponentTeam,
      robberyTokens: Math.max(
        0,
        opponentTeam.robberyTokens - 1
      ),
    };

    set({
      teams: updatedTeams,
      revealResult: 'both_wrong',
      phase: 'reveal',
      robberyMessage: `${opponentTeam.name} ha perdido una ficha de robo. ${updatedTeams[opponentIndex].robberyTokens} fichas de robo restantes`,
    });
  },

  timeoutAutoReveal: () => {
    const {
      teams,
      currentTeamIndex,
      currentSong,
    } = get();

    if (!currentSong) return;

    const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
    const opponentTeam = teams[opponentIndex];

    const updatedTeams = [...teams] as [Team, Team];

    const insertIndex = opponentTeam.timeline.findIndex(
      (song) => currentSong.year < song.year
    );

    const finalIndex =
      insertIndex === -1
        ? opponentTeam.timeline.length
        : insertIndex;

    updatedTeams[opponentIndex] = {
      ...opponentTeam,
      timeline: insertSongSorted(
        opponentTeam.timeline,
        currentSong,
        finalIndex
      ),
      score: opponentTeam.score + 1,
    };

    set({
      teams: updatedTeams,
      revealResult: 'opponent_correct',
      phase: 'reveal',
      robberyMessage: `Se terminó el tiempo. ${opponentTeam.name} recibe automáticamente la carta.`,
    });
  },

  nextTurn: async () => {
    const {
      allSongs,
      usedSongIds,
      currentTeamIndex,
    } = get();

    const availableSongs = allSongs.filter(
      (song) => !usedSongIds.has(song.id)
    );

    if (!availableSongs.length) return;

    const baseSong =
      availableSongs[
        Math.floor(Math.random() * availableSongs.length)
      ];

    const updatedUsed = new Set(usedSongIds);
    updatedUsed.add(baseSong.id);

    let finalSong: Song = {
      ...baseSong,
    };

    const enriched = await enrichSongWithItunes(
      baseSong.artist,
      baseSong.title
    );

    if (enriched?.previewUrl) {
      finalSong.previewUrl = enriched.previewUrl;
    }

    set({
      currentTeamIndex:
        currentTeamIndex === 0 ? 1 : 0,

      currentSong: finalSong,
      currentPlacementIndex: null,
      opponentPlacementIndex: null,

      phase: 'turn_active',
      timeLeft: 90,

      revealResult: null,
      opponentChoseChange: false,
      robberyMessage: null,

      usedSongIds: updatedUsed,
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
      robberyMessage: null,
    }),
}));