import { test, expect } from "@playwright/test";

test("catalog search jumps to the right encounter; modal closes without moving the dive", async ({
  page,
}) => {
  await page.goto("./#atlas");
  await page.getByRole("searchbox", { name: "搜索生物" }).fill("Mitsukurina");
  await expect(page.locator(".creature-grid .creature-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "在深度轴查看哥布林鲨", exact: true })
    .click();
  await expect(
    page.locator("#encounter-goblin-shark .dive-creature"),
  ).toBeInViewport();
  const before = await page.evaluate(() => window.scrollY);
  await page
    .getByRole("button", { name: "在深度轴上认识哥布林鲨", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("270–960 m");
  await expect(
    page.getByRole("dialog").locator(".entry-sources a"),
  ).toHaveCount(1);
  await page.getByRole("dialog").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - before),
  ).toBeLessThan(3);
  await expect(
    page.getByRole("button", { name: "在深度轴上认识哥布林鲨", exact: true }),
  ).toBeFocused();
});

test("collections, reading and last depth survive reload; invalid links are harmless", async ({
  page,
}) => {
  await page.goto("./#atlas");
  await page.getByRole("searchbox", { name: "搜索生物" }).fill("管眼鱼");
  await page
    .getByRole("button", { name: "收藏管眼鱼", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "阅读管眼鱼百科", exact: true })
    .click();
  await page.getByRole("button", { name: "关闭百科" }).click();
  await page
    .getByRole("button", { name: "在深度轴查看管眼鱼", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => Number(localStorage.getItem("deepsea-depth"))),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: /继续上次下潜/ }),
  ).toBeAttached();
  await expect(page.locator(".reading-progress")).toContainText("1");
  await page.getByRole("button", { name: /我的收藏/ }).click();
  await expect(page.locator(".creature-grid .creature-card")).toHaveCount(1);
  await page.goto("./?creature=does-not-exist");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("permalink opens the correct entry; both experiments respond", async ({
  page,
}) => {
  await page.goto("./?creature=snailfish");
  await expect(page.getByRole("dialog")).toContainText("8,336 m · 2023");
  await expect(page.getByRole("textbox", { name: "条目链接" })).toHaveValue(
    /creature=snailfish/,
  );
  await page.getByRole("button", { name: "关闭百科" }).click();
  await page.locator("#gas-depth").fill("100");
  await expect(page.locator(".experiment-readout")).toContainText("9.2%");
  await page.getByRole("button", { name: "匹配背景亮度" }).click();
  await expect(page.locator(".light-result")).toContainText("亮度差：0");
  await expect(page.locator("#belly-light")).toBeEnabled();
  await page.getByRole("button", { name: "关闭腹部发光" }).click();
  await expect(page.locator("#belly-light")).toBeDisabled();
});

test("all cards and topic stops fit the axis; no horizontal overflow", async ({
  page,
}) => {
  await page.goto("./");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const encounters = await page
    .locator(".dive-encounter")
    .evaluateAll((elements) =>
      elements.map((el) => {
        const r = el.getBoundingClientRect();
        const cards = el
          .querySelector(".dive-encounter-cards")!
          .getBoundingClientRect();
        return { top: r.top, bottom: cards.bottom };
      }),
    );
  for (let i = 1; i < encounters.length; i++)
    expect(encounters[i].top).toBeGreaterThanOrEqual(encounters[i - 1].bottom);
  const topics = await page.locator(".dive-topic").evaluateAll((elements) =>
    elements.map((el) => ({
      height: el.getBoundingClientRect().height,
      scroll: el.scrollHeight,
      client: el.clientHeight,
    })),
  );
  expect(topics).toHaveLength(6);
  const overflowing = await page
    .locator(".dive-creature")
    .evaluateAll((elements) =>
      elements
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const read = el.querySelector(".dive-read")!.getBoundingClientRect();
          return read.bottom > r.bottom - 5;
        })
        .map((el) => el.textContent),
    );
  expect(overflowing).toEqual([]);
  topics.forEach((t) => {
    expect(t.height).toBeLessThanOrEqual(340);
    expect(t.scroll).toBeLessThanOrEqual(t.client + 1);
  });
  await page.getByRole("button", { name: "抵达海底 ↓" }).click();
  await expect(page.locator(".dive-finish")).toBeInViewport();
});

test("blocked browser storage and a failed photo preserve the reading controls", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  await page.route("**/images/reviewed/**", (route) => route.abort());
  await page.goto("./#atlas");
  await page.getByRole("searchbox", { name: "搜索生物" }).fill("蓝鲸");
  await expect(page.locator(".creature-grid .art-label")).toContainText(
    "形态示意",
  );
  await page
    .getByRole("button", { name: "收藏蓝鲸", exact: true })
    .last()
    .click();
  await expect(page.locator('#atlas [role="status"]')).toContainText(
    "收藏暂时无法保存",
  );
  await page.getByRole("button", { name: "阅读蓝鲸百科" }).click();
  await expect(page.getByRole("dialog")).toContainText("Balaenoptera musculus");
});
