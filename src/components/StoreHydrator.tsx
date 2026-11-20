"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/** Carga el progreso de localStorage tras montar y aplica el modo de alto contraste. */
export function StoreHydrator() {
  const highContrast = useGameStore((s) => s.settings.highContrast);
  useEffect(() => {
    void useGameStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  }, [highContrast]);
  return null;
}
