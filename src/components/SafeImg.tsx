"use client";

import { useState } from "react";

/**
 * <img> con respaldo: si la imagen no carga (CDN bloqueado, sin red…), muestra las iniciales
 * de `fallback` en una ficha con el mismo tamaño en lugar del icono roto.
 */
export function SafeImg({
  src,
  alt,
  fallback,
  className = "",
  loading,
  style,
  testId,
}: {
  style?: React.CSSProperties;
  testId?: string;
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) {
    const initials = fallback
      .split(/[\s/]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        data-testid={testId}
        className={`${className} grid place-items-center bg-gradient-to-br from-val-red/40 to-val-ink-3 font-display text-white`}
      >
        <span className="text-[1.1em] leading-none tracking-wide">{initials}</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      data-testid={testId}
      onError={() => setFailed(src)}
    />
  );
}
