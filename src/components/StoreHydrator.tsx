"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/** Carga el progreso de localStorage tras montar y aplica el modo de alto contraste. */
export function StoreHydrator() {
  const highContrast = useGameStore((s) => s.settings.highContrast);
  useEffect(() => {
    void useGameStore.persist.rehydrate();
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    } else {
      // En desarrollo, quitar cualquier service worker de un build de producción previo en este
      // origen: serviría chunks viejos (en dev no llevan hash en el nombre).
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => void r.unregister());
        if (regs.length && "caches" in window) {
          void caches.keys().then((keys) => keys.forEach((k) => void caches.delete(k)));
        }
      });
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  }, [highContrast]);
  return null;
}
