import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const missingPage = readFileSync("dist/404.html", "utf8");

// Vite's preview rewrites missing paths to index.html; reproduce Pages' 404 here.
async function serveMissingPage(page: Page, path: string) {
  await page.route(
    (url) => url.pathname === path,
    (route) =>
      route.fulfill({
        status: 404,
        contentType: "text/html; charset=utf-8",
        body: missingPage,
      }),
  );
}

test("a direct game path recovers to its hash route without losing query parameters", async ({
  page,
}) => {
  await serveMissingPage(page, "/DeepSea/games/story");
  await page.goto("games/story?from=bookmark");
  await expect(page).toHaveURL(/\/DeepSea\/\?from=bookmark#games\/story$/);
  await expect(
    page.getByRole("heading", { name: "深渊来信", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "登上潜器，开始调查 ↓" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "深渊来信", exact: true }),
  ).toBeVisible();
});

test("an old atlas path keeps the requested species and restores its real photo", async ({
  page,
}) => {
  await serveMissingPage(page, "/DeepSea/atlas/index.html");
  await page.goto("atlas/index.html?creature=vampire-squid");
  await expect(page).toHaveURL(/\/DeepSea\/\?creature=vampire-squid#atlas$/);
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "吸血鬼乌贼", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("img", { name: "蒙特雷湾海中的幼年吸血鬼乌贼" }),
  ).toBeVisible();
});

test("an unknown path offers working recovery links without a redirect loop", async ({
  page,
}) => {
  await serveMissingPage(page, "/DeepSea/no-such-page");
  const response = await page.goto("no-such-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "这页没有找到", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/DeepSea\/no-such-page$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "深海游乐场", exact: true }).click();
  await expect(page).toHaveURL(/\/DeepSea\/#games$/);
  await expect(
    page.getByRole("heading", { name: "深海游乐场", exact: true }),
  ).toBeVisible();
});
