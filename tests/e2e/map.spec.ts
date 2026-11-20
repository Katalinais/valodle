import { expect, test } from "@playwright/test";
import maps from "../../src/data/generated/maps.json";
import registry from "../../src/data/generated/registry/map.json";
import { freezeClock, guess, todaysAnswer } from "./helpers";

test("Mapa: 'Próximamente' mientras no haya datos", async ({ page }) => {
  test.skip(maps.length > 0, "ya hay datos de mapas");
  await page.goto("/es/");
  await expect(page.getByTestId("mode-card-map")).toHaveAttribute("data-status", "soon");
  await page.goto("/es/mapa/");
  await expect(page.getByTestId("map-soon")).toBeVisible();
});

test("Mapa: el zoom se aleja con los fallos y se gana", async ({ page }) => {
  test.skip(maps.length === 0, "faltan datos: ejecuta `npm run data`");
  await freezeClock(page);
  const answer = (maps as { id: string; name: { es: string } }[]).find(
    (m) => m.id === todaysAnswer("map", registry as Record<string, string>),
  )!;
  const wrong = (maps as { id: string; name: { es: string } }[]).filter((m) => m.id !== answer.id);
  await page.goto("/es/mapa/");
  await expect(page.getByTestId("map-zoom")).toHaveAttribute("data-zoom", "4");
  for (const m of wrong.slice(0, 3)) await guess(page, m.name.es);
  await expect(page.getByTestId("hint-coords")).toHaveAttribute("data-unlocked", "true");
  await guess(page, answer.name.es);
  await expect(page.getByTestId("win-panel")).toContainText(answer.name.es);
});
