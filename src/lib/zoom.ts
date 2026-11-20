/**
 * Geometría del zoom de skins. Todo en fracciones del contenedor / de la imagen (0..1),
 * así el componente puede posicionar con porcentajes sin medir el DOM.
 */

export const ZOOM_STEPS = [4, 3, 2.3, 1.7, 1.3, 1] as const;
export const CONTAINER_ASPECT = 2; // ancho / alto del visor

export function zoomForMisses(misses: number, won: boolean): number {
  if (won) return 1;
  return ZOOM_STEPS[Math.min(misses, ZOOM_STEPS.length - 1)];
}

export type Layout = {
  /** tamaño de la imagen en fracciones del contenedor */
  width: number;
  height: number;
  /** desplazamiento de la esquina superior izquierda, en fracciones del contenedor */
  left: number;
  top: number;
};

function place(size: number, center: number): number {
  if (size <= 1) return (1 - size) / 2; // la imagen cabe: centrada
  const ideal = 0.5 - center * size;
  return Math.min(0, Math.max(1 - size, ideal)); // sin dejar huecos a los lados
}

/** Posición de la imagen para centrar `poi` con zoom `z` (imagen ajustada tipo "contain" a z=1). */
export function zoomLayout(
  poi: { x: number; y: number },
  z: number,
  imageAspect: number,
  containerAspect = CONTAINER_ASPECT,
): Layout {
  const baseW = imageAspect >= containerAspect ? 1 : imageAspect / containerAspect;
  const baseH = imageAspect >= containerAspect ? containerAspect / imageAspect : 1;
  const width = baseW * z;
  const height = baseH * z;
  return { width, height, left: place(width, poi.x), top: place(height, poi.y) };
}

/** Rectángulo visible de la imagen, en coordenadas normalizadas de la imagen. */
export function visibleRect(layout: Layout) {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    x0: clamp(-layout.left / layout.width),
    x1: clamp((1 - layout.left) / layout.width),
    y0: clamp(-layout.top / layout.height),
    y1: clamp((1 - layout.top) / layout.height),
  };
}
