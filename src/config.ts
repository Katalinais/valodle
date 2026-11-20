/**
 * Configuración global del sitio. Todo lo "tuneable" vive aquí.
 */
export const config = {
  /** Nombre visible del sitio (no usar junto al logo oficial). */
  siteName: "Valorantdle",
  /** URL pública, usada para el enlace al compartir y en metadatos OG. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://valorantdle.vercel.app",
  /** Zona horaria en la que se reinicia el reto diario (medianoche local). */
  timeZone: "America/Bogota",
  /** Día 0 de todas las barajas. No cambiar una vez publicado. */
  epoch: "2026-12-01",
  /** Sal del PRNG. Cambiarla rompe el historial: no tocar tras publicar. */
  salt: "valorantdle-v1",
  locales: ["es", "en"] as const,
  defaultLocale: "es" as const,
} as const;

export type Locale = (typeof config.locales)[number];

export function isLocale(value: string): value is Locale {
  return (config.locales as readonly string[]).includes(value);
}
