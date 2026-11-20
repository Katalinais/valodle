"use client";

import { zoomLayout, CONTAINER_ASPECT } from "@/lib/zoom";

type Props = {
  src: string;
  alt: string;
  aspect: number;
  poi: { x: number; y: number };
  zoom: number;
  grayscale?: boolean;
  /** Muestra solo la forma (píxeles opacos en un color plano). */
  silhouette?: boolean;
  testId?: string;
  /** ancho/alto del visor (2 para skins, 16/9 para mapas) */
  containerAspect?: number;
};

/** Imagen ampliada alrededor de un punto de interés dentro de un visor con overflow oculto. */
export function ZoomImage({
  src,
  alt,
  aspect,
  poi,
  zoom,
  grayscale,
  silhouette,
  testId,
  containerAspect = CONTAINER_ASPECT,
}: Props) {
  const l = zoomLayout(poi, zoom, aspect, containerAspect);
  return (
    <div
      className="panel corners relative w-full overflow-hidden bg-[radial-gradient(circle,_#2a3948_0%,_#0f1923_80%)]"
      style={{ aspectRatio: String(containerAspect) }}
      data-testid={testId}
      data-zoom={zoom}
      data-silhouette={silhouette ? "true" : "false"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute max-w-none select-none transition-all duration-700 ease-out"
        style={{
          width: `${l.width * 100}%`,
          height: `${l.height * 100}%`,
          left: `${l.left * 100}%`,
          top: `${l.top * 100}%`,
          filter: silhouette
            ? "brightness(0) invert(0.9) drop-shadow(0 0 6px rgb(255 70 85 / 0.55))"
            : grayscale
              ? "grayscale(1)"
              : undefined,
        }}
      />
      {/* Retícula decorativa */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="h-10 w-10 rounded-full border border-white/20" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
    </div>
  );
}
