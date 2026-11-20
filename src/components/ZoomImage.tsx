"use client";

import { zoomLayout, CONTAINER_ASPECT } from "@/lib/zoom";

type Props = {
  src: string;
  alt: string;
  aspect: number;
  poi: { x: number; y: number };
  zoom: number;
  grayscale?: boolean;
  testId?: string;
};

/** Imagen ampliada alrededor de un punto de interés dentro de un visor con overflow oculto. */
export function ZoomImage({ src, alt, aspect, poi, zoom, grayscale, testId }: Props) {
  const l = zoomLayout(poi, zoom, aspect);
  return (
    <div
      className="panel corners relative w-full overflow-hidden bg-[radial-gradient(circle,_#2a3948_0%,_#0f1923_80%)]"
      style={{ aspectRatio: String(CONTAINER_ASPECT) }}
      data-testid={testId}
      data-zoom={zoom}
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
          filter: grayscale ? "grayscale(1)" : undefined,
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
