import { expect, test, type Page } from "@playwright/test";
import agents from "../../src/data/generated/agents.json";
import abilities from "../../src/data/generated/abilities.json";
import quotes from "../../src/data/manual/quotes.json";
import abilityRegistry from "../../src/data/generated/registry/ability.json";
import emojiRegistry from "../../src/data/generated/registry/emoji.json";
import quoteRegistry from "../../src/data/generated/registry/quote.json";
import { quoteId } from "../../src/data/pools";
import { freezeClock, guess, todaysAnswer } from "./helpers";

const nameOf = (id: string) => agents.find((a) => a.id === id)!.name.es;
const wrongAgents = (answer: string, n: number) =>
  agents.filter((a) => a.id !== answer).slice(0, n);

async function missTimes(page: Page, answer: string, n: number) {
  for (const a of wrongAgents(answer, n)) await guess(page, a.name.es);
}

test("Habilidad: pista de tecla a los 4 fallos, victoria y bonus", async ({ page }) => {
  await freezeClock(page);
  const ability = abilities.find((a) => a.id === todaysAnswer("ability", abilityRegistry))!;
  await page.goto("/es/habilidad/");
  await expect(page.getByTestId("ability-icon")).toBeVisible();
  await expect(page.getByTestId("hint-key")).toHaveAttribute("data-unlocked", "false");

  await missTimes(page, ability.agentId, 4);
  await expect(page.getByTestId("hint-key")).toContainText(`habilidad ${ability.key}`);

  await guess(page, nameOf(ability.agentId));
  await expect(page.getByTestId("win-panel")).toBeVisible();
  await page.getByTestId("bonus").getByRole("button", { name: ability.name.es }).click();
  await expect(page.getByTestId("bonus")).toContainText("¡Bien!");
});

test("Emoji: se revela un emoji por fallo y se gana", async ({ page }) => {
  await freezeClock(page);
  const answer = todaysAnswer("emoji", emojiRegistry);
  await page.goto("/es/emoji/");
  const revealed = page.locator('[data-testid="emoji-list"] li[data-revealed="true"]');
  await expect(revealed).toHaveCount(1);
  await missTimes(page, answer, 2);
  await expect(revealed).toHaveCount(3);
  await guess(page, nameOf(answer));
  await expect(page.getByTestId("win-panel")).toContainText(nameOf(answer));
  await expect(revealed).toHaveCount(5);
});

test("Frase: pista de rol a los 4 fallos y se gana", async ({ page }) => {
  await freezeClock(page);
  const qid = todaysAnswer("quote", quoteRegistry);
  const quote = quotes.find((q) => quoteId(q) === qid)!;
  await page.goto("/es/frase/");
  await expect(page.getByTestId("quote-text")).toContainText(quote.text.en);
  await missTimes(page, quote.agentId, 4);
  await expect(page.getByTestId("hint-role")).toHaveAttribute("data-unlocked", "true");
  await guess(page, nameOf(quote.agentId));
  await expect(page.getByTestId("win-panel")).toContainText(nameOf(quote.agentId));
});
