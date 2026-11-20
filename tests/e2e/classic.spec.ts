import { expect, test } from "@playwright/test";
import agents from "../../src/data/generated/agents.json";
import registry from "../../src/data/generated/registry/classic.json";
import { DAY_INDEX, freezeClock, guess, todaysAnswer } from "./helpers";

test("Clásico: un fallo muestra la tabla y luego se gana la partida", async ({ page }) => {
  await freezeClock(page);
  const answerId = todaysAnswer("classic", registry);
  const answer = agents.find((a) => a.id === answerId)!;
  const wrong = agents.find((a) => a.id !== answerId)!;

  await page.goto("/es/clasico/");
  await expect(page.getByTestId("challenge-number")).toHaveText(`Reto #${DAY_INDEX + 1}`);

  await guess(page, wrong.name.es);
  await expect(page.getByTestId("classic-row")).toHaveCount(1);

  await guess(page, answer.name.es);
  await expect(page.getByTestId("classic-row")).toHaveCount(2);
  await expect(page.getByTestId("win-panel")).toBeVisible();
  await expect(page.getByTestId("win-panel")).toContainText(answer.name.es);
  await expect(page.getByTestId("win-panel")).toContainText("2 intento");

  // El progreso persiste al recargar.
  await page.reload();
  await expect(page.getByTestId("win-panel")).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
});
