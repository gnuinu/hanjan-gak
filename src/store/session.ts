import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { PartyMode, Penalty, Player, RoundResult, Settings } from '../domain/types';

const COLORS = [
  'var(--p1)',
  'var(--p2)',
  'var(--p3)',
  'var(--p4)',
  'var(--p5)',
  'var(--p6)',
  'var(--p7)',
  'var(--p8)',
  'var(--p9)',
  'var(--p10)',
  'var(--p11)',
  'var(--p12)',
];

const EMOJIS = ['🐰', '🐻', '🦊', '🐼', '🐯', '🐸', '🐵', '🦄', '🐧', '🐨', '🦁', '🐹'];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;

export function makePlayer(index: number, name?: string): Player {
  return {
    id: nanoid(8),
    name: name ?? `${index + 1}번`,
    color: COLORS[index % COLORS.length],
    emoji: EMOJIS[index % EMOJIS.length],
  };
}

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => makePlayer(i));
}

/** 커플 모드로 바꾸면 2명으로 맞춘다. 이름도 기본값이면 갈아끼운다. */
function coupleDefaults(players: Player[]): Player[] {
  const next = players.slice(0, 2);
  while (next.length < 2) next.push(makePlayer(next.length));
  const labels = ['나', '너'];
  const emojis = ['💛', '💙'];
  return next.map((p, i) =>
    /^\d+번$/.test(p.name) ? { ...p, name: labels[i], emoji: emojis[i] } : p,
  );
}

const DEFAULT_SETTINGS: Settings = {
  penaltyLevel: 2,
  drinkFreeMode: false,
  partyMode: 'friends',
  targetMode: false,
  sound: true,
  haptics: true,
  keepScreenAwake: true,
};

interface SessionState {
  players: Player[];
  history: RoundResult[];
  settings: Settings;
  customPenalties: Penalty[];
  seenIntro: boolean;

  setPlayerCount: (count: number) => void;
  renamePlayer: (id: string, name: string) => void;
  cyclePlayerEmoji: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setPartyMode: (mode: PartyMode) => void;

  addRound: (round: RoundResult) => void;
  replaceLastPenalty: (penalty: Penalty) => void;
  recentPenaltyIds: (n?: number) => string[];
  newParty: () => void;

  addCustomPenalty: (input: Omit<Penalty, 'id'>) => void;
  removeCustomPenalty: (id: string) => void;

  markIntroSeen: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      players: makePlayers(4),
      history: [],
      settings: DEFAULT_SETTINGS,
      customPenalties: [],
      seenIntro: false,

      setPlayerCount: (count) =>
        set((s) => {
          const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));
          if (n === s.players.length) return s;
          if (n < s.players.length) return { players: s.players.slice(0, n) };
          const added = Array.from({ length: n - s.players.length }, (_, i) =>
            makePlayer(s.players.length + i),
          );
          return { players: [...s.players, ...added] };
        }),

      renamePlayer: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name: name.slice(0, 8) } : p)),
        })),

      cyclePlayerEmoji: (id) =>
        set((s) => ({
          players: s.players.map((p) => {
            if (p.id !== id) return p;
            const i = EMOJIS.indexOf(p.emoji);
            return { ...p, emoji: EMOJIS[(i + 1) % EMOJIS.length] };
          }),
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      setPartyMode: (mode) =>
        set((s) => ({
          settings: { ...s.settings, partyMode: mode },
          players: mode === 'couple' ? coupleDefaults(s.players) : s.players,
        })),

      addRound: (round) => set((s) => ({ history: [...s.history, round] })),

      replaceLastPenalty: (penalty) =>
        set((s) => {
          if (s.history.length === 0) return s;
          const history = s.history.slice();
          history[history.length - 1] = { ...history[history.length - 1], penalty };
          return { history };
        }),

      recentPenaltyIds: (n = 12) =>
        get()
          .history.slice(-n)
          .map((r) => r.penalty.id),

      newParty: () => set({ history: [] }),

      addCustomPenalty: (input) =>
        set((s) => ({
          customPenalties: [...s.customPenalties, { ...input, id: `custom-${nanoid(6)}` }],
        })),

      removeCustomPenalty: (id) =>
        set((s) => ({ customPenalties: s.customPenalties.filter((p) => p.id !== id) })),

      markIntroSeen: () => set({ seenIntro: true }),
    }),
    {
      name: 'hanjankak/session',
      version: 1,
      // history 는 이번 자리 한정. 저장하지 않는다.
      partialize: (s) => ({
        players: s.players,
        settings: s.settings,
        customPenalties: s.customPenalties,
        seenIntro: s.seenIntro,
      }),
    },
  ),
);
