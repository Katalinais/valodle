/** Dificultad visual del modo Habilidad según los fallos. */
export const ROTATIONS = [90, 180, 270] as const;
export const KEY_HINT_AT = 4;

export function abilityStyle(
  baseRotation: number,
  misses: number,
  opts: { rotation: boolean; grayscale: boolean },
) {
  // La rotación desaparece en 3 fallos; el gris en 5.
  const rotation = opts.rotation ? Math.round(baseRotation * Math.max(0, 1 - misses / 3)) : 0;
  const gray = opts.grayscale ? Math.max(0, 1 - misses / 5) : 0;
  return { rotation, gray };
}
