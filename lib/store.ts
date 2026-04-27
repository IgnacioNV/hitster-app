import { create } from 'zustand';

export type TeamColor = 'rosa' | 'naranja' | 'amarillo' | 'celeste';

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  previewUrl: string | null;
  albumArt: string | null;
}

export interface TimelineCard {
  song: Song;
  position: number; // index in timeline
}

export interface Team {
  name: string;
  color: TeamColor;
  timeline: Song[]; // sorted by year
  robberyTokens: number;
  score: number;
}

export type GamePhase =
  | 'setup'
  | 'turn_active'       // current team placing card
  | 'opponent_response' // opponent decides confirm or change
  | 'opponent_change'   // opponent placing in rival timeline
  | 'reveal'
  | 'winner';

export type TurnPhase = 'placing' | 'confirming';

interface GameState {
  teams: [Team, Team];
  currentTeamIndex: 0 | 1;
  phase: GamePhase;
  currentSong: Song | null;
  currentPlacementIndex: number | null; // where current team placed
  opponentPlacementIndex: number | null; // where opponent placed
  timeLeft: number; // seconds
  allSongs: Song[];
  usedSongIds: Set<string>;
  revealResult: 'team_correct' | 'opponent_correct' | 'both_wrong' | null;
  opponentChoseChange: boolean;

  // actions
  setTeams: (teams: [Team, Team]) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentSong: (song: Song) => void;
  setCurrentPlacement: (index: number) => void;
  setOpponentPlacement: (index: number) => void;
  setTimeLeft: (t: number) => void;
  decrementTime: () => void;
  setAllSongs: (songs: Song[]) => void;
  setOpponentChoseChange: (v: boolean) => void;
  confirmTurn: () => void;
  opponentConfirm: () => void;
  opponentChange: () => void;
  confirmOpponentChange: () => void;
  nextTurn: () => void;
  resetGame: () => void;
}

const initialTeams: [Team, Team] = [
  { name: 'Equipo 1', color: 'rosa', timeline: [], robberyTokens: 4, score: 0 },
  { name: 'Equipo 2', color: 'celeste', timeline: [], robberyTokens: 4, score: 0 },
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
  setCurrentSong: (song) => set({ currentSong: song }),
  setCurrentPlacement: (index) => set({ currentPlacementIndex: index }),
  setOpponentPlacement: (index) => set({ opponentPlacementIndex: index }),
  setTimeLeft: (t) => set({ timeLeft: t }),
  decrementTime: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),
  setAllSongs: (songs) => set({ allSongs: songs }),
  setOpponentChoseChange: (v) => set({ opponentChoseChange: v }),

  confirmTurn: () => {
    set({ phase: 'opponent_response' });
  },

  opponentConfirm: () => {
    // Opponent thinks team 1 was correct → reveal
    set({ opponentChoseChange: false, phase: 'reveal' });
    get()._calculateResult(false);
  },

  opponentChange: () => {
    set({ opponentChoseChange: true, phase: 'opponent_change' });
  },

  confirmOpponentChange: () => {
    set({ phase: 'reveal' });
    get()._calculateResult(true);
  },

  _calculateResult: (opponentChanged: boolean) => {
    const { teams, currentTeamIndex, currentSong, currentPlacementIndex, opponentPlacementIndex } = get();
    if (!currentSong) return;

    const currentTeam = teams[currentTeamIndex];
    const otherIndex = currentTeamIndex === 0 ? 1 : 0;
    const otherTeam = teams[otherIndex];

    // Check if placement was correct
    const isCorrectPlacement = (timeline: Song[], placementIdx: number, song: Song): boolean => {
      const newTimeline = [...timeline];
      newTimeline.splice(placementIdx, 0, song);
      // Check if still sorted by year
      for (let i = 1; i < newTimeline.length; i++) {
        if (newTimeline[i].year < newTimeline[i - 1].year) return false;
      }
      return true;
    };

    const currentTeamCorrect = currentPlacementIndex !== null &&
      isCorrectPlacement(currentTeam.timeline, currentPlacementIndex, currentSong);

    if (!opponentChanged) {
      // Opponent confirmed = they agree team was correct
      const newTeams: [Team, Team] = [...teams] as [Team, Team];
      if (currentTeamCorrect) {
        // Team gets point
        const newTimeline = [...currentTeam.timeline];
        newTimeline.splice(currentPlacementIndex!, 0, currentSong);
        newTimeline.sort((a, b) => a.year - b.year);
        newTeams[currentTeamIndex] = { ...currentTeam, timeline: newTimeline, score: currentTeam.score + 1 };
        set({ teams: newTeams, revealResult: 'team_correct' });
      } else {
        set({ teams: newTeams, revealResult: 'both_wrong' });
      }
    } else {
      // Opponent changed
      const opponentCorrect = opponentPlacementIndex !== null &&
        isCorrectPlacement(currentTeam.timeline, opponentPlacementIndex, currentSong);

      const newTeams: [Team, Team] = [...teams] as [Team, Team];

      if (opponentCorrect && !currentTeamCorrect) {
        // Opponent gets point, loses token
        const newTimeline = [...currentTeam.timeline];
        newTimeline.splice(opponentPlacementIndex!, 0, currentSong);
        newTimeline.sort((a, b) => a.year - b.year);
        // Card goes to opponent's timeline? No - actually in HITSTER opponent steals the card
        // Opponent gains the card in THEIR timeline
        const opponentTimeline = [...otherTeam.timeline];
        opponentTimeline.push(currentSong);
        opponentTimeline.sort((a, b) => a.year - b.year);
        newTeams[otherIndex] = {
          ...otherTeam,
          timeline: opponentTimeline,
          score: otherTeam.score + 1,
          robberyTokens: Math.max(0, otherTeam.robberyTokens - 1)
        };
        set({ teams: newTeams, revealResult: 'opponent_correct' });
      } else if (currentTeamCorrect) {
        // Current team was right, opponent wasted a token
        const newTimeline = [...currentTeam.timeline];
        newTimeline.splice(currentPlacementIndex!, 0, currentSong);
        newTimeline.sort((a, b) => a.year - b.year);
        newTeams[currentTeamIndex] = { ...currentTeam, timeline: newTimeline, score: currentTeam.score + 1 };
        newTeams[otherIndex] = { ...otherTeam, robberyTokens: Math.max(0, otherTeam.robberyTokens - 1) };
        set({ teams: newTeams, revealResult: 'team_correct' });
      } else {
        // Both wrong, opponent loses token
        newTeams[otherIndex] = { ...otherTeam, robberyTokens: Math.max(0, otherTeam.robberyTokens - 1) };
        set({ teams: newTeams, revealResult: 'both_wrong' });
      }
    }

    // Check winner
    const updatedTeams = get().teams;
    if (updatedTeams[0].score >= 10 || updatedTeams[1].score >= 10) {
      set({ phase: 'winner' });
    }
  },

  nextTurn: () => {
    const { currentTeamIndex, allSongs, usedSongIds } = get();
    const nextIndex = currentTeamIndex === 0 ? 1 : 0;

    // Pick next song
    const available = allSongs.filter(s => !usedSongIds.has(s.id));
    const nextSong = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : allSongs[Math.floor(Math.random() * allSongs.length)];

    const newUsed = new Set(usedSongIds);
    if (nextSong) newUsed.add(nextSong.id);

    set({
      currentTeamIndex: nextIndex as 0 | 1,
      phase: 'turn_active',
      currentSong: nextSong || null,
      currentPlacementIndex: null,
      opponentPlacementIndex: null,
      timeLeft: 90,
      revealResult: null,
      opponentChoseChange: false,
      usedSongIds: newUsed,
    });
  },

  resetGame: () => set({
    teams: initialTeams,
    currentTeamIndex: 0,
    phase: 'setup',
    currentSong: null,
    currentPlacementIndex: null,
    opponentPlacementIndex: null,
    timeLeft: 90,
    revealResult: null,
    opponentChoseChange: false,
    usedSongIds: new Set(),
  }),
} as any));
