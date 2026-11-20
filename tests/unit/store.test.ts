import { beforeEach, describe, expect, it } from "vitest";
import { gameKey, useGameStore, visibleStreak } from "@/store/gameStore";

const store = () => useGameStore.getState();

describe("gameStore", () => {
  beforeEach(() => store().reset());

  it("registra intentos y victoria con estadísticas", () => {
    store().guess({
      mode: "classic",
      dateKey: "2026-12-01",
      dayIndex: 0,
      id: "sage",
      correct: false,
    });
    store().guess({
      mode: "classic",
      dateKey: "2026-12-01",
      dayIndex: 0,
      id: "jett",
      correct: true,
    });
    const g = store().games[gameKey("classic", "2026-12-01")];
    expect(g).toMatchObject({ guesses: ["sage", "jett"], won: true });
    expect(store().stats.classic).toMatchObject({
      played: 1,
      wins: 1,
      currentStreak: 1,
      histogram: { "2": 1 },
    });
  });

  it("ignora intentos repetidos y tras ganar", () => {
    const a = { mode: "emoji" as const, dateKey: "2026-12-01", dayIndex: 0 };
    store().guess({ ...a, id: "sage", correct: false });
    store().guess({ ...a, id: "sage", correct: false });
    store().guess({ ...a, id: "jett", correct: true });
    store().guess({ ...a, id: "omen", correct: false });
    expect(store().games[gameKey("emoji", "2026-12-01")].guesses).toEqual(["sage", "jett"]);
  });

  it("encadena rachas en días consecutivos y las reinicia tras un hueco", () => {
    const win = (dayIndex: number, dateKey: string) =>
      store().guess({ mode: "skin", dateKey, dayIndex, id: "x", correct: true });
    win(0, "2026-12-01");
    win(1, "2026-12-02");
    expect(store().stats.skin.currentStreak).toBe(2);
    expect(visibleStreak(store().stats.skin, 2)).toBe(2);
    expect(visibleStreak(store().stats.skin, 3)).toBe(0);
    win(3, "2026-12-04");
    expect(store().stats.skin).toMatchObject({ currentStreak: 1, maxStreak: 2 });
  });

  it("el modo difícil solo cuenta si todos los intentos fueron difíciles", () => {
    const a = { mode: "skin" as const, dateKey: "2026-12-01", dayIndex: 0 };
    store().guess({ ...a, id: "a", correct: false, hard: true });
    store().guess({ ...a, id: "b", correct: true, hard: false });
    expect(store().games[gameKey("skin", "2026-12-01")].hard).toBe(false);
  });
});
