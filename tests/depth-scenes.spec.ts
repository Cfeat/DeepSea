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

test("海层剧场 renders five scenes and the available resident cards", async ({
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

  await page.goto("./depth-scenes.html");
  await expect(page).toHaveTitle(/海层剧场/);
  await expect(page.locator(".card")).toHaveCount(5, { timeout: 40000 });
  await expect(page.locator(".zone-title h2")).toHaveText("透光层");

  await page.locator(".zone-nav button").nth(1).click();
  await expect(page.locator(".zone-title h2")).toHaveText("弱光层");
  await expect(page.locator(".card")).toHaveCount(5);
  await page.locator(".zone-nav button").nth(3).click();
  await expect(page.locator(".zone-title h2")).toHaveText("深渊层");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".zone-nav button").nth(4).click();
  await expect(page.locator(".zone-title h2")).toHaveText("超深渊层");
  await expect(page.locator(".card")).toHaveCount(2);

  if (testInfo.project.name === "mobile") {
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      cards: [...document.querySelectorAll(".card")].map((card) => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }),
    }));
    expect(layout.scrollWidth).toBe(layout.width);
    for (const card of layout.cards) {
      expect(card.left).toBeGreaterThanOrEqual(0);
      expect(card.right).toBeLessThanOrEqual(layout.width + 0.5);
    }
  }

  expect(errors).toEqual([]);
});

test("海层剧场 opens from the depth axis and hands card clicks to the encyclopedia", async ({
  page,
}) => {
  await page.goto("./#journey");
  await expect(page.locator(".scenes-launch")).toBeVisible({ timeout: 30000 });
  await page.locator(".scenes-launch").click();

  const frame = page.frameLocator(".scenes-overlay iframe");
  await expect(frame.locator(".card")).toHaveCount(5, { timeout: 40000 });
  await expect(frame.locator(".zone-title h2")).toHaveText("透光层");
  await frame.locator('.card[aria-label*="大洋蝠鲼"]').click();
  await expect(page.locator("dialog.modal")).toBeVisible();
  await expect(page.locator("#modal-title")).toHaveText("大洋蝠鲼");

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.modal")).toHaveCount(0);
  await page.locator(".scenes-overlay-close").click();
  await expect(page.locator(".scenes-overlay")).toHaveCount(0);
});
