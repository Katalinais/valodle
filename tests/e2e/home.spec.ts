import { expect, test } from "@playwright/test";
import agents from "../../src/data/generated/agents.json";
import registry from "../../src/data/generated/registry/emoji.json";
import { freezeClock, guess, todaysAnswer } from "./helpers";

test("la página de inicio carga con el aviso legal y cambia de idioma", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.getByText("no está respaldado por Riot Games")).toBeVisible();
  await page.getByRole("link", { name: /English/ }).click();
  await expect(page.getByText("isn't endorsed by Riot Games")).toBeVisible();
});

test("el estado del modo y las estadísticas reflejan la victoria", async ({ page }) => {
  await freezeClock(page);
  await page.goto("/es/");
  await expect(page.getByTestId("mode-card-emoji")).toHaveAttribute("data-status", "new");

  const answer = agents.find((a) => a.id === todaysAnswer("emoji", registry))!;
  await page.getByTestId("mode-card-emoji").click();
  await guess(page, answer.name.es);
  await expect(page.getByTestId("win-panel")).toBeVisible();

  await page.goto("/es/");
  await expect(page.getByTestId("mode-card-emoji")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("mode-card-emoji")).toContainText("Racha: 1");

  await page.getByRole("button", { name: "Estadísticas" }).click();
  await page.getByRole("tab", { name: "Emoji" }).click();
  await expect(page.getByTestId("stats-summary")).toContainText("100");
});

test("el modo alto contraste se aplica al documento", async ({ page }) => {
  await page.goto("/es/");
  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("switch", { name: "Alto contraste" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
});
