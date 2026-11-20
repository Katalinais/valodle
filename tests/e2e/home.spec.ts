import { expect, test } from "@playwright/test";

test("la página de inicio carga con el aviso legal", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.getByText("no está respaldado por Riot Games")).toBeVisible();
  await page.getByRole("link", { name: /English/ }).click();
  await expect(page.getByText("isn't endorsed by Riot Games")).toBeVisible();
});
