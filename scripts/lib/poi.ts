/**
 * Cálculo del punto de interés (POI) del zoom de una skin a partir de una máscara de opacidad.
 * Pura: recibe la máscara como matriz de booleanos (grid x grid).
 */

export const MASK_GRID = 16;
export const MAX_ZOOM = 4;

/** Hash FNV-1a de 32 bits (determinista y estable). */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function windowCoverage(mask: boolean[][], sx: number, sy: number, size: number): number {
  let opaque = 0;
  for (let y = sy; y < sy + size; y++)
    for (let x = sx; x < sx + size; x++) if (mask[y][x]) opaque++;
  return opaque / (size * size);
}

/**
 * Elige de forma determinista (por id) una ventana de zoom MAX_ZOOM con buena cobertura
 * de píxeles opacos y devuelve su centro normalizado.
 */
export function computePoi(mask: boolean[][], id: string): { x: number; y: number } {
  const grid = mask.length;
  const size = grid / MAX_ZOOM;
  const windows: { sx: number; sy: number; cov: number }[] = [];
  for (let sy = 0; sy <= grid - size; sy++)
    for (let sx = 0; sx <= grid - size; sx++)
      windows.push({ sx, sy, cov: windowCoverage(mask, sx, sy, size) });
  const best = Math.max(...windows.map((w) => w.cov));
  const threshold = Math.min(0.6, best);
  const candidates = windows.filter((w) => w.cov >= threshold && w.cov > 0);
  const pool = candidates.length ? candidates : windows;
  const chosen = pool[fnv1a(id) % pool.length];
  return { x: (chosen.sx + size / 2) / grid, y: (chosen.sy + size / 2) / grid };
}
