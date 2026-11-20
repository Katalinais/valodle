import { expect, test } from "@playwright/test";
import skins from "../../src/data/generated/skins.json";
import registry from "../../src/data/generated/registry/skin.json";
import { freezeClock, guess, todaysAnswer } from "./helpers";

test("Skin: el zoom se aleja con los fallos, aparecen pistas y se gana", async ({ page }) => {
  await freezeClock(page);
  const answer = skins.find((s) => s.id === todaysAnswer("skin", registry))!;
  const wrong = skins.filter((s) => s.id !== answer.id && s.weapon !== answer.weapon).slice(0, 3);

  await page.goto("/es/skin/");
  const zoom = page.getByTestId("skin-zoom");
  await expect(zoom).toHaveAttribute("data-zoom", "4");

  for (const s of wrong) await guess(page, s.name.es);
  await expect(zoom).toHaveAttribute("data-zoom", "1.7");
  await expect(page.getByTestId("hint-weapon")).toContainText(answer.weaponName.es);
  await expect(page.getByTestId("hint-tier")).toHaveAttribute("data-unlocked", "false");

  await guess(page, answer.name.es);
  await expect(page.getByTestId("win-panel")).toContainText(answer.name.es);
  await expect(zoom).toHaveAttribute("data-zoom", "1");
});
