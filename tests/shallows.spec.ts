import { test, expect } from "@playwright/test";

test.use({
  launchOptions: {
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  },
});

test("浅海观察 can render, be controlled, and throw a creature", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("Failed to load resource")
    )
      errors.push(message.text());
  });

  await page.goto("./ocean-shallows.html");
  await expect(page).toHaveTitle(/浅海/);
  await expect(page.locator("#loading")).toHaveClass(/done/, {
    timeout: 40000,
  });
  await expect(page.locator(".card")).toHaveCount(5);
  await expect(page.locator("#ray-count")).toHaveText("4");
  await expect(page.locator("#jelly-count")).toHaveText("5");
  await expect(page.locator("#creature-total")).toHaveText("9");

  const cardRects = await page.locator(".card").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
      };
    }),
  );
  if (testInfo.project.name === "mobile") {
    for (const rect of cardRects) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(390.5);
      expect(rect.width).toBeGreaterThan(50);
    }
    const viewport = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scrollWidth).toBe(viewport.width);
  }

  await page.locator('.card[data-species="manta"]').click();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as unknown as { __shallows: { flights: unknown[] } })
              .__shallows.flights.length,
        ),
      { timeout: 10000 },
    )
    .toBeGreaterThan(0);

  await page.keyboard.press("r");
  await expect(page.locator('[data-action="rain"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("w");
  await expect(page.locator('[data-action="whirl"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("c");
  await expect(page.locator('[data-action="calm"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("m");
  await expect(page.locator('[data-action="clear"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.keyboard.press("h");
  await expect(page.locator("body")).toHaveClass(/ui-hidden/);
  await page.waitForTimeout(650);
  await expect(page.locator("#show-ui")).toBeVisible();
  await page.locator("#show-ui").click();
  await expect(page.locator("body")).not.toHaveClass(/ui-hidden/);

  expect(errors).toEqual([]);
});

test("the shallows cap at 48 residents and refuse another card", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "capacity is independent of layout");
  await page.goto("./ocean-shallows.html");
  await expect(page.locator("#loading")).toHaveClass(/done/, {
    timeout: 40000,
  });
  const total = await page.evaluate(() => {
    const app = (
      window as unknown as {
        __shallows: {
          spawn: (species: string, x: number, z: number) => unknown;
          total: () => number;
        };
      }
    ).__shallows;
    for (let index = 0; index < 60; index++) {
      app.spawn(index % 2 === 0 ? "moon" : "manta", -10 + (index % 7), -4 + (index % 6));
    }
    return app.total();
  });
  expect(total).toBe(48);
  await page.locator('.card[data-species="nettle"]').click();
  await expect(page.locator("#toast")).toContainText("住满 48");
  await expect(page.locator("#creature-total")).toHaveText("48");
});
