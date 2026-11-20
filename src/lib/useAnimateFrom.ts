"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Número de intentos que ya existían al cargar la página: solo los posteriores se animan.
 * También indica si la victoria ocurrió en esta sesión (para retrasar el panel).
 */
export function useAnimateFrom(ready: boolean, count: number) {
  const ref = useRef<number | null>(null);
  if (ready && ref.current === null) ref.current = count;
  return ref.current ?? Number.MAX_SAFE_INTEGER;
}

/** Devuelve `value` tras `delayMs` cuando pasa a true (para esperar a una animación). */
export function useDelayedTrue(value: boolean, delayMs: number, immediate: boolean) {
  const [shown, setShown] = useState(value && immediate);
  useEffect(() => {
    if (!value) {
      setShown(false);
      return;
    }
    if (immediate) {
      setShown(true);
      return;
    }
    const id = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs, immediate]);
  return shown;
}
