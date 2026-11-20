"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { dateKeyIn, dayIndexOf, msUntilNextDay } from "./daily";

export type Today = { dateKey: string; dayIndex: number };

function computeToday(): Today {
  const dateKey = dateKeyIn(new Date());
  return { dateKey, dayIndex: dayIndexOf(dateKey) };
}

/**
 * Día actual en la zona del reto. `null` durante el prerender/primer render: la fecha
 * solo se calcula en el cliente (el HTML estático no debe "congelar" el día del build).
 * Se actualiza sola a medianoche.
 */
export function useToday(): Today | null {
  const [today, setToday] = useState<Today | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setToday((prev) => {
        const next = computeToday();
        return prev?.dateKey === next.dateKey ? prev : next;
      });
      timer = setTimeout(tick, Math.min(msUntilNextDay() + 500, 60 * 60 * 1000));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return today;
}

/** true cuando el store ya se ha cargado desde localStorage. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    if (useGameStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
