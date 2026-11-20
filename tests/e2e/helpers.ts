import type { Page } from "@playwright/test";
import { answerIdForDay, dateKeyIn, dayIndexOf, type Registry } from "../../src/lib/daily";

/** Mediodía en Bogotá del 5 de diciembre de 2026 (día 4 tras el EPOCH). */
export const FIXED_NOW = new Date("2026-12-05T17:00:00Z");
export const DAY_INDEX = dayIndexOf(dateKeyIn(FIXED_NOW, "America/Bogota"));

export async function freezeClock(page: Page) {
  await page.clock.setFixedTime(FIXED_NOW);
}

export function todaysAnswer(mode: string, registry: Registry): string {
  return answerIdForDay(mode, DAY_INDEX, registry);
}

/** Escribe en el autocompletado y elige la primera opción con Enter. */
export async function guess(page: Page, text: string) {
  const input = page.getByRole("combobox");
  await input.fill(text);
  await page.getByRole("option").first().waitFor();
  await input.press("Enter");
}
