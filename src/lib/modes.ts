import type { Locale } from "@/config";

export const MODES = [
  { id: "classic", slug: "clasico", icon: "🎯" },
  { id: "ability", slug: "habilidad", icon: "✨" },
  { id: "quote", slug: "frase", icon: "💬" },
  { id: "emoji", slug: "emoji", icon: "😶" },
  { id: "skin", slug: "skin", icon: "🔫" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];
export const MODE_IDS = MODES.map((m) => m.id) as ModeId[];

export function modeHref(locale: Locale, mode: ModeId): string {
  const m = MODES.find((x) => x.id === mode)!;
  return `/${locale}/${m.slug}/`;
}

/** Siguiente modo en el flujo encadenado (null tras el último). */
export function nextMode(mode: ModeId): ModeId | null {
  const i = MODE_IDS.indexOf(mode);
  return i >= 0 && i < MODE_IDS.length - 1 ? MODE_IDS[i + 1] : null;
}
