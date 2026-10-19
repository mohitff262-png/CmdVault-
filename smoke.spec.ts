import { expect, test } from "@playwright/test";

test("search, open, favorite, collection export", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: /search commands/i }).fill("clone");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/commands\?q=clone/);
  await page.getByRole("link", { name: /git clone/i }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "git clone" })).toBeVisible();

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  await page.getByRole("button", { name: /^copy$/i }).first().click();

  await page.getByRole("button", { name: "Favorite" }).click();
  await expect(page.getByRole("button", { name: "Favorited" })).toBeVisible();

  await page.goto("/collections");
  await page.getByPlaceholder("New collection name").fill("My set");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("heading", { name: /My set/ })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect((await download).suggestedFilename()).toBe("cmdvault-collections.json");

  await page.goto("/termux");
  await expect(page.getByRole("heading", { name: "Termux Command Center" })).toBeVisible();
  if (isMobile) {
    await page.getByTestId("mobile-menu-button").click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  }
});
