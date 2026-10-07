import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  createStation,
  stationAction,
  stationActionReason,
  roomSpecs,
  stationTechs,
  stationMissions,
  stationEvents,
  encodeStation,
  type StationAction,
} from "../src/games/stationEngine";

async function fit(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function importSave(page: Page, save: unknown) {
  await page.getByLabel("选择游戏存档").setInputFiles({
    name: "save.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(save)),
  });
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
}
test("new real-photo species are searchable, readable and still on the depth axis", async ({
  page,
}) => {
  await page.goto("./#atlas");
  for (const [query, name, scientific] of [
    ["Alvinella", "庞贝虫", "Alvinella pompejana"],
    ["Chauliodus", "太平洋蝰鱼", "Chauliodus macouni"],
    ["Kiwa", "雪人蟹", "Kiwa hirsuta"],
  ]) {
    await page.getByRole("searchbox", { name: "搜索生物" }).fill(query);
    await page
      .getByRole("button", { name: `阅读${name}百科`, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(scientific);
    await expect
      .poll(() =>
        page
          .getByRole("dialog")
          .locator("img")
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.getByRole("button", { name: "关闭百科" }).click();
  }
  await page.goto("./#journey");
  await expect(page.locator(".dive-creature")).toHaveCount(49);
  await fit(page);
});
test("story plays through, opens real encyclopedia, restores choices and reaches the full ending", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".entrance-grid .entrance-card")).toHaveCount(4);
  await fit(page);
  await page.locator('.entrance-grid a[href="#games"]').click();
  await expect(page.locator(".game-entry")).toHaveCount(2);
  await page.getByRole("link", { name: "进入深渊来信 →" }).click();
  await expect(page.getByRole("checkbox", { name: /备用电池/ })).toBeDisabled();
  await page.getByRole("radio", { name: /标准航程/ }).check();
  await page.getByRole("button", { name: "登上潜器，开始调查 ↓" }).click();
  await page.getByRole("button", { name: /先和队员核对任务/ }).click();
  await expect(page.locator("#chapter-title")).toHaveText("像雪一样落下来");
  await page.getByRole("button", { name: "认识吸血鬼乌贼 ↗" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Vampyroteuthis infernalis",
  );
  await page.getByRole("dialog").press("Escape");
  await expect(
    page.locator('.story-dashboard meter[aria-label="氧气"]'),
  ).toHaveAttribute("value", "87");
  await page.reload();
  await expect(page.locator("#chapter-title")).toHaveText("像雪一样落下来");
  for (const choice of [
    "关掉推进器",
    "用成像声呐确认回波",
    "用机械臂松开缆线",
    "接收图像",
    "留下一段影像",
    "用声呐寻找",
    "悬停记录",
    "停靠充电",
    "做一次不接触",
    "用机械臂取回",
    "沿已知航线",
    "整理档案",
  ]) {
    await page
      .locator(".story-choices")
      .getByRole("button", { name: new RegExp(choice) })
      .click();
  }
  await expect(page.locator("#chapter-title")).toHaveText("暗海有回声");
  await expect(page.locator(".ending-stats")).toContainText("6/6");
  await page.getByRole("button", { name: /日志 13/ }).click();
  await expect(page.locator(".story-log li")).toHaveCount(13);
  await fit(page);
  await page.reload();
  await expect(page.locator("#chapter-title")).toHaveText("暗海有回声");
});
test("games retain independent saves; export, import, invalid file and restart preserve the correct progress", async ({
  page,
}) => {
  await page.goto("./#games/story");
  await page.getByRole("button", { name: "登上潜器，开始调查 ↓" }).click();
  await page.getByRole("button", { name: /先和队员核对任务/ }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出存档", exact: true }).click();
  const download = await downloadPromise;
  const save = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(save.actions).toEqual(["brief"]);
  await page.getByRole("link", { name: "← 游乐场" }).click();
  await expect(
    page.getByRole("link", { name: "继续深渊来信 →" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "进入深海前哨 →" }).click();
  await page.getByRole("button", { name: "开始经营 →" }).click();
  await expect(page.locator(".station-resources")).toBeInViewport();
  await page.getByRole("button", { name: "建造实验室", exact: true }).click();
  await page.getByRole("button", { name: "增加人员", exact: true }).click();
  await page.getByRole("button", { name: "推进一天 →" }).click();
  await expect(page.locator(".station-day")).toHaveText("第 2 天");
  const before = await page.locator('[data-resource="credits"]').innerText();
  await importSave(page, save);
  await expect(page.locator(".game-warning")).toContainText("当前进度已保留");
  await expect(page.locator('[data-resource="credits"]')).toHaveText(before);
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await page.goto("./#games/story");
  await expect(page.locator("#chapter-title")).toHaveText("像雪一样落下来");
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.locator("#chapter-title")).toHaveText("像雪一样落下来");
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await page.getByRole("button", { name: "确认重新开始", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "登上潜器，开始调查 ↓" }),
  ).toBeVisible();
  await importSave(page, save);
  await expect(page.locator("#chapter-title")).toHaveText("像雪一样落下来");
  await page.goto("./#games/station");
  await expect(page.locator(".station-day")).toHaveText("第 2 天");
  await expect(
    page.getByRole("button", { name: /7 号位置：实验室 1 级，1 人/ }),
  ).toBeVisible();
  await expect(page.getByRole("meter", { name: "站点结构" })).toBeVisible();
  await fit(page);
});

test("station builds, staffs, researches, completes all expeditions and continues beyond day 30", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("./#games/station");
  await page.getByRole("radio", { name: /标准预算/ }).check();
  await page.getByRole("button", { name: "开始经营 →" }).click();
  await expect(page.locator(".station-resources")).toBeInViewport();
  let state = createStation({ name: "蓝湾站", mode: "standard", seed: 0 });
  async function act(action: StationAction) {
    expect(stationActionReason(state, action)).toBeNull();
    const button = (name: string) =>
      page.getByRole("button", { name, exact: true });
    if ("slot" in action) {
      await page
        .getByRole("button", {
          name: new RegExp(`^${action.slot + 1} 号位置：`),
        })
        .click();
      if (action.type === "build")
        await button(`建造${roomSpecs[action.kind].name}`).click();
      if (action.type === "workers")
        await button(action.delta === 1 ? "增加人员" : "减少人员").click();
      if (action.type === "upgrade")
        await button(
          `升级到 ${state.rooms[action.slot]!.level + 1} 级`,
        ).click();
    } else if (action.type === "research") {
      await button("科研").click();
      await button(
        `研究${stationTechs.find((t) => t.id === action.id)!.name}`,
      ).click();
    } else if (action.type === "launch") {
      await button("考察").click();
      await button(
        `派出${stationMissions.find((m) => m.id === action.id)!.name}`,
      ).click();
    } else if (action.type === "resolve") {
      const event = stationEvents[state.event!];
      await expect(page.locator("#event-title")).toBeInViewport();
      await page
        .getByRole("button", {
          name: new RegExp(
            `^${action.choice === "pay" ? event.payLabel : event.adaptLabel}`,
          ),
        })
        .click();
    } else if (action.type === "trade" || action.type === "repair") {
      await button("站务").click();
      await button(
        action.type === "repair"
          ? "安排维修"
          : `购买${action.item === "alloy" ? "合金" : action.item === "food" ? "食物" : "氧气"}`,
      ).click();
    } else if (action.type === "advance") {
      await button("推进一天 →").click();
    } else if (action.type === "continue") await button("继续自由经营").click();
    state = stationAction(state, action);
    await expect(page.locator(".station-day")).toHaveText(`第 ${state.day} 天`);
    await expect(page.locator('[data-resource="credits"]')).toHaveText(
      String(state.resources.credits),
    );
  }
  async function attempt(action: StationAction) {
    if (stationActionReason(state, action)) return false;
    await act(action);
    return true;
  }
  await act({ type: "build", slot: 6, kind: "lab" });
  await act({ type: "workers", slot: 6, delta: 1 });
  await act({ type: "build", slot: 2, kind: "dock" });
  await act({ type: "workers", slot: 2, delta: 1 });
  await act({ type: "upgrade", slot: 4 });
  while (!state.outcome && state.day <= 30) {
    if (state.event && !(await attempt({ type: "resolve", choice: "pay" })))
      await act({ type: "resolve", choice: "adapt" });
    for (const id of ["sonar", "automation", "network"] as const)
      await attempt({ type: "research", id });
    if (!state.mission) {
      const id = ["snow", "vent", "map"].find(
        (id) => !state.completed.includes(id),
      );
      if (id) await attempt({ type: "launch", id });
    }
    if (state.techs.includes("network") && !state.rooms[10]) {
      if (state.resources.alloy < 50)
        await attempt({ type: "trade", item: "alloy" });
      if (await attempt({ type: "build", slot: 10, kind: "beacon" }))
        await act({ type: "workers", slot: 10, delta: 1 });
    }
    await act({ type: "advance" });
  }
  expect(state.outcome).toBe("won");
  await expect(page.locator("#station-ending-title")).toHaveText(
    "海底的灯，留了下来",
  );
  await page.reload();
  await expect(page.locator("#station-ending-title")).toHaveText(
    "海底的灯，留了下来",
  );
  await act({ type: "continue" });
  while (state.day < 31) {
    if (state.event) await act({ type: "resolve", choice: "adapt" });
    await act({ type: "advance" });
  }
  await expect(page.locator(".station-command")).toContainText("自由经营");
  await expect(page.locator(".station-ending")).toHaveCount(0);
  await fit(page);
});
test("supply failure, damaged saves and blocked storage leave recovery and export available", async ({
  page,
}) => {
  let state = createStation({ name: "撤离测试", mode: "relaxed", seed: 0 });
  state = stationAction(state, { type: "toggle", slot: 1 });
  state = stationAction(state, { type: "toggle", slot: 9 });
  while (state.day < 8) {
    if (state.event)
      state = stationAction(state, { type: "resolve", choice: "adapt" });
    state = stationAction(state, { type: "advance" });
  }
  await page.goto("./#games/station");
  await importSave(page, encodeStation(state));
  await expect(
    page.getByRole("status").filter({ hasText: "连续不足 2 天" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "推进一天 →" }).click();
  await expect(page.locator("#station-ending-title")).toHaveText(
    "这次先回到海面",
  );
  await expect(page.getByRole("button", { name: "推进一天 →" })).toBeDisabled();
  await page.evaluate(() =>
    localStorage.setItem("deepsea-game-story-v1", "{broken"),
  );
  await page.goto("./#games/story");
  await expect(page.locator(".game-tools .game-warning")).toContainText(
    "无法读取浏览器存档",
  );
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  await page.reload();
  await page.getByRole("button", { name: "登上潜器，开始调查 ↓" }).click();
  await page.getByRole("button", { name: /先和队员核对任务/ }).click();
  await expect(page.locator(".game-warning")).toContainText("不能保存进度");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出存档", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toContain("深渊来信");
  await page.goto("./#games/missing");
  await expect(page.locator("h1")).toHaveText("这个游戏暂时不存在");
});
