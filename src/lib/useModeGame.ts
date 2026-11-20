"use client";

import { useCallback, useMemo } from "react";
import { answerIdForDay, type Registry } from "./daily";
import { useStoreHydrated, useToday } from "./hooks";
import type { ModeId } from "./modes";
import { gameKey, useGameStore, type GameState } from "@/store/gameStore";

const EMPTY: GameState = { guesses: [], won: false };

/**
 * Estado del reto de hoy para un modo.
 * @param toGuessId convierte el id de la respuesta (p. ej. "jett-Q" o una frase) en el id que
 *   el jugador debe adivinar (el agente). Por defecto, la identidad.
 */
export function useModeGame(
  mode: ModeId,
  registry: Registry,
  toGuessId: (answerId: string) => string = (id) => id,
) {
  const rawToday = useToday();
  const hydrated = useStoreHydrated();
  const today = hydrated ? rawToday : null;

  // Pool vacío (p. ej. datos aún no generados): el modo queda como "próximamente".
  const available = Object.keys(registry).length > 0;
  const answerId = useMemo(
    () => (today && available ? answerIdForDay(mode, today.dayIndex, registry) : null),
    [available, mode, registry, today],
  );
  const yesterdayId = useMemo(
    () =>
      today && available && today.dayIndex >= 1
        ? answerIdForDay(mode, today.dayIndex - 1, registry)
        : null,
    [available, mode, registry, today],
  );

  const game =
    useGameStore((s) => (today ? s.games[gameKey(mode, today.dateKey)] : undefined)) ?? EMPTY;
  const guessAction = useGameStore((s) => s.guess);
  const setBonusAction = useGameStore((s) => s.setBonus);

  const target = answerId ? toGuessId(answerId) : null;

  const submit = useCallback(
    (id: string, opts: { hard?: boolean } = {}) => {
      if (!today || !target) return;
      guessAction({
        mode,
        dateKey: today.dateKey,
        dayIndex: today.dayIndex,
        id,
        correct: id === target,
        hard: opts.hard,
      });
    },
    [guessAction, mode, target, today],
  );

  const setBonus = useCallback(
    (pick: string, correct: boolean) => today && setBonusAction(mode, today.dateKey, pick, correct),
    [mode, setBonusAction, today],
  );

  return { today, available, answerId, target, yesterdayId, game, submit, setBonus };
}
