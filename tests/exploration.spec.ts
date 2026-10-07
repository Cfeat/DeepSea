import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "网站导航 ≡" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name, exact: true })
    .click();
}

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
  await expect(page.getByRole("dialog").locator(".art-label")).toHaveText(
    "标本照片",
  );
  await expect(
    page.getByRole("dialog").locator(".photo-caption"),
  ).toContainText("Mitsukurina owstoni");
  await expect
    .poll(() =>
      page
        .getByRole("dialog")
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
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
  await expect(
    page.getByRole("dialog").locator(".photo-caption"),
  ).toContainText("透明头罩已不完整");
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
  await navigate(page, "生物图鉴");
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
  await expect(page.getByRole("dialog").locator(".art-label")).toHaveText(
    "野外照片",
  );
  await expect(
    page.getByRole("dialog").locator(".photo-caption"),
  ).toContainText("Pseudoliparis swirei");
  await expect(page.getByRole("dialog").locator("img")).toHaveCSS(
    "object-fit",
    "contain",
  );
  await expect(page.getByRole("textbox", { name: "条目链接" })).toHaveValue(
    /creature=snailfish/,
  );
  await page.getByRole("button", { name: "关闭百科" }).click();
  await navigate(page, "深海实验室");
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
  await page.goto("./#journey");
  await expect(page.locator(".dive-topic")).toHaveCount(6);
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

test("pages render independently; navigation, pagination, filters and browser history work", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".hero")).toBeVisible();
  await expect(page.locator(".dive-stage, #atlas, #lab")).toHaveCount(0);
  await navigate(page, "生物图鉴");
  await expect(page.locator(".creature-card")).toHaveCount(12);
  await expect(
    page.locator(".site-navigation [aria-current='page']"),
  ).toHaveText("生物图鉴");
  await page.getByRole("button", { name: "图鉴第 4 页", exact: true }).click();
  await expect(page.locator(".creature-card")).toHaveCount(1);
  await expect(page.locator(".pagination [aria-current='page']")).toHaveText(
    "4",
  );
  await page.getByRole("searchbox", { name: "搜索生物" }).fill("vampire");
  await expect(page.locator(".creature-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "阅读吸血鬼乌贼百科", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("searchbox")).toHaveValue("vampire");
  await navigate(page, "深海实验室");
  await expect(page.locator("#gas-depth")).toBeVisible();
  await expect(page.locator(".creature-card, .dive-stage")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("vampire");
  await expect(page.locator(".pagination")).toHaveCount(0);
  await page.getByRole("searchbox").fill("nothing-matches");
  await page.getByRole("button", { name: "弱光层", exact: true }).click();
  await page.getByRole("button", { name: "清除筛选" }).click();
  await expect(page.locator(".creature-card")).toHaveCount(12);
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "全部海层", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  if (await page.getByRole("button", { name: "网站导航 ≡" }).isVisible()) {
    await page.getByRole("button", { name: "网站导航 ≡" }).click();
    await expect(page.locator("#site-navigation")).toBeVisible();
    await page.locator("#site-navigation").press("Escape");
    await expect(page.locator("#site-navigation")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "网站导航 ≡" }),
    ).toBeFocused();
  }
});

test("topic links survive reload; real imagery, credit and data-map context are readable", async ({
  page,
}) => {
  await page.goto("./#topics");
  await expect(page.locator(".topic-card")).toHaveCount(6);
  await page.locator('.topic-card[href="#topics/vents"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "没有阳光，也能有食物网。",
  );
  await expect(page.locator(".scene-photo figcaption")).toContainText(
    "2016 年马里亚纳",
  );
  await expect(
    page.getByRole("link", { name: "影像出处 ↗", exact: true }),
  ).toHaveAttribute("href", /oceanexplorer.noaa.gov/);
  await expect
    .poll(() =>
      page
        .locator(".topic-article .scene-photo img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator(".article-body > section")).toHaveCount(3);
  await page.goBack();
  await expect(page.locator(".topic-card")).toHaveCount(6);
  await page.locator('.topic-card[href="#topics/trenches"]').click();
  await expect(page.locator(".scene-kind")).toHaveText("测深数据图");
  await expect(page.locator(".scene-photo figcaption")).toContainText(
    "不是海底的自然颜色",
  );
  await page
    .getByRole("button", { name: "海沟狮子鱼 ↗", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭百科" }).click();
  await expect(page.locator(".topic-article")).toBeVisible();
  await navigate(page, "参考资料");
  await page
    .getByText("查看环境影像的全部出处与使用说明", { exact: true })
    .click();
  await expect(page.locator(".credit-register article")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("./#topics/does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "暂时不存在",
  );
});

test("failed lazy page or topic image leaves navigation and source links available", async ({
  page,
}) => {
  await page.route("**/DepthLab-*.js", (route) => route.abort());
  await page.route("**/images/topics/whale-fall.webp*", (route) =>
    route.abort(),
  );
  await page.goto("./#atlas");
  await expect(page.locator(".creature-card")).toHaveCount(12);
  await navigate(page, "深海实验室");
  await expect(page.getByRole("alert")).toContainText("页面暂时没能打开");
  await navigate(page, "海洋专题");
  await expect(page.locator(".topic-card")).toHaveCount(6);
  await page.locator('.topic-card[href="#topics/whale-fall"]').click();
  await expect(page.locator(".topic-article .photo-placeholder")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "影像出处 ↗", exact: true }),
  ).toHaveAttribute("href", /Whale_fall/);
  await expect(page.locator(".article-body > section")).toHaveCount(3);
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
    "图片暂不可用",
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
