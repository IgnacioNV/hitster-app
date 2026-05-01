import { create } from 'zustand';
import { enrichSongWithItunes } from '@/lib/itunes';

export type TeamColor = 'rosa' | 'naranja' | 'amarillo' | 'celeste';

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
  | 'timeout_steal'
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
  timerActive: boolean;

  allSongs: Song[];
  usedSongIds: Set<string>;

  revealResult: RevealResult;
  opponentChoseChange: boolean;
  robberyMessage: string | null;

  timeoutStealIndex: number | null;

  setTeams: (teams: [Team, Team]) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentPlacement: (index: number) => void;
  setOpponentPlacement: (index: number) => void;
  setTimeoutStealIndex: (index: number) => void;
  setTimeLeft: (time: number) => void;
  setTimerActive: (active: boolean) => void;
  decrementTime: () => void;
  setAllSongs: (songs: Song[]) => void;

  triggerTimeout: () => void;
  confirmTimeoutSteal: () => void;

  confirmTurn: () => void;
  opponentConfirm: () => void;
  opponentChange: () => void;
  confirmOpponentChange: () => void;

  nextTurn: () => Promise<void>;
  resetGame: () => void;
}

// TEMP: testing winner flow
const initialTeams: [Team, Team] = [
  { name: 'Equipo 1', color: 'rosa',    timeline: [], robberyTokens: 4, score: 8 },
  { name: 'Equipo 2', color: 'celeste', timeline: [], robberyTokens: 4, score: 8 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function isCorrectPlacement(timeline: Song[], song: Song, index: number): boolean {
  const test = [...timeline];
  test.splice(index, 0, song);
  for (let i = 1; i < test.length; i++) {
    if (test[i].year < test[i - 1].year) return false;
  }
  return true;
}

function insertSongSorted(timeline: Song[], song: Song, index: number): Song[] {
  const updated = [...timeline];
  updated.splice(index, 0, song);
  return updated.sort((a, b) => a.year - b.year);
}

// Centralized winner check — returns 'winner' if any team has reached 10, else null.
function checkWinner(teams: [Team, Team]): GamePhase | null {
  if (teams[0].score >= 10 || teams[1].score >= 10) return 'winner';
  return null;
}

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  teams: initialTeams,
  currentTeamIndex: 0,
  phase: 'setup',

  currentSong: null,
  currentPlacementIndex: null,
  opponentPlacementIndex: null,
  timeoutStealIndex: null,

  timeLeft: 45,
  timerActive: false,

  allSongs: [],
  usedSongIds: new Set(),

  revealResult: null,
  opponentChoseChange: false,
  robberyMessage: null,

  setTeams: (teams) => set({ teams }),
  setPhase: (phase) => set({ phase }),
  setCurrentPlacement: (index) => set({ currentPlacementIndex: index }),
  setOpponentPlacement: (index) => set({ opponentPlacementIndex: index }),
  setTimeoutStealIndex: (index) => set({ timeoutStealIndex: index }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setTimerActive: (active) => set({ timerActive: active }),
  decrementTime: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),
  setAllSongs: (songs) => set({ allSongs: songs }),

  // ─── TIMEOUT ─────────────────────────────────────────────────
  triggerTimeout: () => {
    if (get().phase !== 'turn_active') return;
    set({
      phase: 'timeout_steal',
      timerActive: true,
      timeLeft: 30,
      currentPlacementIndex: null,
      timeoutStealIndex: null,
    });
  },

  confirmTimeoutSteal: () => {
    const { teams, currentTeamIndex, currentSong, timeoutStealIndex } = get();
    if (!currentSong || timeoutStealIndex === null) return;

    const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
    const opponentTeam = teams[opponentIndex];
    const updatedTeams = [...teams] as [Team, Team];

    const correct = isCorrectPlacement(opponentTeam.timeline, currentSong, timeoutStealIndex);

    if (correct) {
      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        timeline: insertSongSorted(opponentTeam.timeline, currentSong, timeoutStealIndex),
        score: opponentTeam.score + 1,
      };
      set({
        teams: updatedTeams,
        revealResult: 'opponent_correct',
        phase: checkWinner(updatedTeams) ?? 'reveal',
        robberyMessage: `¡Tiempo agotado! ${opponentTeam.name} acertó y se lleva el punto.`,
      });
    } else {
      set({
        revealResult: 'both_wrong',
        phase: 'reveal',
        robberyMessage: `¡Tiempo agotado! ${opponentTeam.name} no acertó. Nadie gana el punto.`,
      });
    }
  },

  // ─── NORMAL TURN FLOW ────────────────────────────────────────
  confirmTurn: () => set({ phase: 'opponent_response', timerActive: false }),

  opponentConfirm: () => {
    const { teams, currentTeamIndex, currentSong, currentPlacementIndex } = get();
    if (!currentSong || currentPlacementIndex === null) return;

    const currentTeam = teams[currentTeamIndex];
    const correct = isCorrectPlacement(currentTeam.timeline, currentSong, currentPlacementIndex);
    const updatedTeams = [...teams] as [Team, Team];

    if (correct) {
      updatedTeams[currentTeamIndex] = {
        ...currentTeam,
        timeline: insertSongSorted(currentTeam.timeline, currentSong, currentPlacementIndex),
        score: currentTeam.score + 1,
      };
      set({
        teams: updatedTeams,
        revealResult: 'team_correct',
        phase: checkWinner(updatedTeams) ?? 'reveal',
        opponentChoseChange: false,
        robberyMessage: null,
      });
    } else {
      set({ revealResult: 'both_wrong', phase: 'reveal', opponentChoseChange: false, robberyMessage: null });
    }
  },

  opponentChange: () => set({ phase: 'opponent_change', opponentChoseChange: true }),

  confirmOpponentChange: () => {
    const { teams, currentTeamIndex, currentSong, currentPlacementIndex, opponentPlacementIndex } = get();
    if (!currentSong || currentPlacementIndex === null || opponentPlacementIndex === null) return;

    const currentTeam = teams[currentTeamIndex];
    const opponentIndex = currentTeamIndex === 0 ? 1 : 0;
    const opponentTeam = teams[opponentIndex];
    const updatedTeams = [...teams] as [Team, Team];

    const currentCorrect  = isCorrectPlacement(currentTeam.timeline, currentSong, currentPlacementIndex);
    const opponentCorrect = isCorrectPlacement(currentTeam.timeline, currentSong, opponentPlacementIndex);

    if (!currentCorrect && opponentCorrect) {
      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        timeline: insertSongSorted(opponentTeam.timeline, currentSong, opponentPlacementIndex),
        score: opponentTeam.score + 1,
        robberyTokens: Math.max(0, opponentTeam.robberyTokens - 1),
      };
      set({
        teams: updatedTeams,
        revealResult: 'opponent_correct',
        phase: checkWinner(updatedTeams) ?? 'reveal',
        robberyMessage: `${opponentTeam.name} robó la carta. ${updatedTeams[opponentIndex].robberyTokens} fichas restantes.`,
      });
      return;
    }

    if (currentCorrect) {
      updatedTeams[currentTeamIndex] = {
        ...currentTeam,
        timeline: insertSongSorted(currentTeam.timeline, currentSong, currentPlacementIndex),
        score: currentTeam.score + 1,
      };
      updatedTeams[opponentIndex] = {
        ...opponentTeam,
        robberyTokens: Math.max(0, opponentTeam.robberyTokens - 1),
      };
      set({
        teams: updatedTeams,
        revealResult: 'team_correct',
        phase: checkWinner(updatedTeams) ?? 'reveal',
        robberyMessage: `${opponentTeam.name} perdió una ficha de robo. ${updatedTeams[opponentIndex].robberyTokens} fichas restantes.`,
      });
      return;
    }

    // Both wrong
    updatedTeams[opponentIndex] = {
      ...opponentTeam,
      robberyTokens: Math.max(0, opponentTeam.robberyTokens - 1),
    };
    set({
      teams: updatedTeams,
      revealResult: 'both_wrong',
      phase: 'reveal',
      robberyMessage: `${opponentTeam.name} perdió una ficha de robo. ${updatedTeams[opponentIndex].robberyTokens} fichas restantes.`,
    });
  },

  // ─── NEXT TURN ───────────────────────────────────────────────
  nextTurn: async () => {
    // Guard: never advance if game is already won
    if (get().phase === 'winner') return;

    const { allSongs, usedSongIds, currentTeamIndex, teams } = get();

    // Double-check winner (covers edge case where reveal didn't redirect)
    if (checkWinner(teams)) {
      set({ phase: 'winner' });
      return;
    }

    const available = allSongs.filter((s) => !usedSongIds.has(s.id));
    if (!available.length) return;

    const baseSong = available[Math.floor(Math.random() * available.length)];
    const updatedUsed = new Set(usedSongIds);
    updatedUsed.add(baseSong.id);

    let finalSong: Song = { ...baseSong };

    try {
      const enriched = await enrichSongWithItunes(baseSong.artist, baseSong.title);
      if (enriched?.previewUrl) finalSong.previewUrl = enriched.previewUrl;
    } catch {
      // enrichment failure is non-fatal
    }

    set({
      currentTeamIndex: currentTeamIndex === 0 ? 1 : 0,
      currentSong: finalSong,
      currentPlacementIndex: null,
      opponentPlacementIndex: null,
      timeoutStealIndex: null,
      phase: 'turn_active',
      timeLeft: 45,
      timerActive: true,
      revealResult: null,
      opponentChoseChange: false,
      robberyMessage: null,
      usedSongIds: updatedUsed,
    });
  },

  resetGame: () => set({
    teams: initialTeams,
    currentTeamIndex: 0,
    phase: 'setup',
    currentSong: null,
    currentPlacementIndex: null,
    opponentPlacementIndex: null,
    timeoutStealIndex: null,
    timeLeft: 45,
    timerActive: false,
    allSongs: [],
    usedSongIds: new Set(),
    revealResult: null,
    opponentChoseChange: false,
    robberyMessage: null,
  }),
}));
