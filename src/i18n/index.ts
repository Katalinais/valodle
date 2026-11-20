import es from "./es.json";
import en from "./en.json";
import type { Locale } from "@/config";

export type Messages = typeof es;

export const dictionaries: Record<Locale, Messages> = { es, en };

export type TranslateVars = Record<string, string | number>;

/** Busca una clave con puntos ("home.tagline") y sustituye {variables}. */
export function translate(messages: Messages, key: string, vars?: TranslateVars): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
      messages,
    );
  if (typeof value !== "string") {
    if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
