"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MODE_IDS, type ModeId } from "@/lib/modes";

export type GameState = {
  /** Ids intentados, en orden. El último es el correcto si `won`. */
  guesses: string[];
  won: boolean;
  /** Bonus del modo Habilidad: id de la habilidad elegida. */
  bonusPick?: string;
  bonusCorrect?: boolean;
  /** true si todos los intentos se hicieron en modo difícil (skin en gris). */
  hard?: boolean;
};

export type ModeStats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDay: number | null;
  /** intentos → nº de victorias. La clave "10" agrupa 10 o más. */
  histogram: Record<string, number>;
};

export type Settings = {
  highContrast: boolean;
  abilityRotation: boolean;
  abilityGrayscale: boolean;
  skinGrayscale: boolean;
};

export const HISTOGRAM_MAX = 10;
const KEEP_DAYS = 45;

export const emptyStats = (): ModeStats => ({
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDay: null,
  histogram: {},
});

export function gameKey(mode: ModeId, dateKey: string): string {
  return `${mode}:${dateKey}`;
}

/** Racha visible hoy: se pierde si ayer no se ganó. */
export function visibleStreak(stats: ModeStats, todayIndex: number): number {
  if (stats.lastWonDay === null) return 0;
  return stats.lastWonDay >= todayIndex - 1 ? stats.currentStreak : 0;
}

type GuessArgs = {
  mode: ModeId;
  dateKey: string;
  dayIndex: number;
  id: string;
  correct: boolean;
  hard?: boolean;
};

type Store = {
  games: Record<string, GameState>;
  stats: Record<ModeId, ModeStats>;
  settings: Settings;
  guess: (args: GuessArgs) => void;
  setBonus: (mode: ModeId, dateKey: string, pick: string, correct: boolean) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
};

const initial = () => ({
  games: {} as Record<string, GameState>,
  stats: Object.fromEntries(MODE_IDS.map((m) => [m, emptyStats()])) as Record<ModeId, ModeStats>,
  settings: {
    highContrast: false,
    abilityRotation: true,
    abilityGrayscale: true,
    skinGrayscale: false,
  } as Settings,
});

function prune(games: Record<string, GameState>, dateKey: string) {
  const cutoff = new Date(Date.parse(dateKey) - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  return Object.fromEntries(Object.entries(games).filter(([k]) => k.split(":")[1] >= cutoff));
}

export const useGameStore = create<Store>()(
  persist(
    (set) => ({
      ...initial(),

      guess: ({ mode, dateKey, dayIndex, id, correct, hard = false }) =>
        set((state) => {
          const key = gameKey(mode, dateKey);
          const prev = state.games[key] ?? { guesses: [], won: false };
          if (prev.won || prev.guesses.includes(id)) return state;

          const game: GameState = {
            ...prev,
            guesses: [...prev.guesses, id],
            won: correct,
            hard: (prev.guesses.length === 0 ? true : (prev.hard ?? false)) && hard,
          };
          const s = { ...(state.stats[mode] ?? emptyStats()) };
          if (prev.guesses.length === 0) s.played += 1;
          if (correct) {
            s.wins += 1;
            s.currentStreak = s.lastWonDay === dayIndex - 1 ? s.currentStreak + 1 : 1;
            s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
            s.lastWonDay = dayIndex;
            const bucket = String(Math.min(game.guesses.length, HISTOGRAM_MAX));
            s.histogram = { ...s.histogram, [bucket]: (s.histogram[bucket] ?? 0) + 1 };
          }
          return {
            games: prune({ ...state.games, [key]: game }, dateKey),
            stats: { ...state.stats, [mode]: s },
          };
        }),

      setBonus: (mode, dateKey, pick, correct) =>
        set((state) => {
          const key = gameKey(mode, dateKey);
          const game = state.games[key];
          if (!game?.won || game.bonusPick) return state;
          return {
            games: { ...state.games, [key]: { ...game, bonusPick: pick, bonusCorrect: correct } },
          };
        }),

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      reset: () => set(initial()),
    }),
    {
      name: "valorantdle",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Rehidratamos a mano tras el montaje para evitar desajustes de hidratación (export estático).
      skipHydration: true,
      partialize: (s) => ({ games: s.games, stats: s.stats, settings: s.settings }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return {
          ...current,
          ...p,
          stats: { ...current.stats, ...(p.stats ?? {}) },
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
    },
  ),
);
