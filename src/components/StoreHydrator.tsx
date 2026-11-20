"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/** Carga el progreso de localStorage tras montar y aplica el modo de alto contraste. */
export function StoreHydrator() {
  const highContrast = useGameStore((s) => s.settings.highContrast);
  useEffect(() => {
    void useGameStore.persist.rehydrate();
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  }, [highContrast]);
  return null;
}
