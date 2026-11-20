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
      className="relative w-full overflow-hidden rounded-lg border-2 border-val-ink-3 bg-[radial-gradient(circle,_#2a3948_0%,_#0f1923_80%)]"
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
    </div>
  );
}
