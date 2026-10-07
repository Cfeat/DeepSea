import { test, expect, type Page } from "@playwright/test";
import * as story from "../src/games/storyEngine";
import * as station from "../src/games/stationEngine";
import { storyVoyage, stationCampaign } from "./gameplayPaths";
import {
  shiftSpecs,
  rationSpecs,
  prioritySpecs,
  approachSpecs,
} from "../src/games/stationSystems";

async function fit(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function importSave(page: Page, data: unknown) {
  await page
    .getByLabel("选择游戏存档")
    .setInputFiles({
      name: "game.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
}
async function storyClick(page: Page, id: string) {
  const panel = page.locator(".expedition-panel");
  if (id.startsWith("travel:")) {
    const [, target, style] = id.split(":");
    await panel.getByRole("button", { name: "航线", exact: true }).click();
    await panel.getByLabel("航行方式").selectOption(style);
    await page
      .locator(".route-destinations")
      .getByRole("button", {
        name: story.storySites.find((item) => item.id === target)!.title,
        exact: true,
      })
      .click();
    await panel
      .getByRole("button", { name: "确认航行 →", exact: true })
      .click();
  } else if (id.startsWith("use:")) {
    await panel.getByRole("button", { name: /^物资 / }).click();
    await panel
      .getByRole("button", {
        name: `使用${story.cargoSpecs[id.split(":")[1] as keyof typeof story.cargoSpecs].name}`,
        exact: true,
      })
      .first()
      .click();
  } else if (id.startsWith("compare:")) {
    const [, a, b, theory] = id.split(":");
    await panel.getByRole("button", { name: /^证据 / }).click();
    for (const clue of [a, b])
      await panel
        .getByRole("checkbox", {
          name: new RegExp(
            story.evidenceSpecs[clue as keyof typeof story.evidenceSpecs].title,
          ),
        })
        .check();
    await panel.getByLabel("这些记录更支持哪种失联原因？").selectOption(theory);
    await panel
      .getByRole("button", { name: "提交失联判断", exact: true })
      .click();
  } else if (id === "abort" || id === "evacuate") {
    await page
      .getByRole("button", { name: "中止调查，返回海面", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: id === "abort" ? "确认返航" : "放弃潜器，等待接应",
        exact: true,
      })
      .click();
  } else await page.locator(`.story-choices [data-choice="${id}"]`).click();
}
test("new story explores, revisits, manages cargo, solves evidence and returns with the truth", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    Math.random = () => 0.000003;
  });
  await page.goto("./#games/story");
  await page.getByRole("radio", { name: /标准航程/ }).check();
  await page.getByRole("button", { name: "登上潜器，开始调查 ↓" }).click();
  const setup: story.StorySetup = {
    name: "远舟",
    mode: "standard",
    gear: ["sonar", "arm"],
    goal: "truth",
    seed: 3,
  };
  const route = storyVoyage(setup);
  let state = story.createStory(setup);
  for (const [index, id] of route.actions.entries()) {
    await storyClick(page, id);
    state = story.chooseStory(state, id);
    await expect(
      page.locator('.story-dashboard meter[aria-label="氧气"]'),
    ).toHaveAttribute("value", String(state.oxygen));
    if (index === 9) {
      await page.reload();
      await expect(page.locator("#chapter-title")).toHaveText(
        story.storyNode(state).title,
      );
    }
  }
  await expect(page.locator("#chapter-title")).toHaveText("暗海有回声");
  await expect(page.locator(".ending-stats")).toContainText(/航行目标\s*完成/);
  await fit(page);
  await page.reload();
  await expect(page.locator("#chapter-title")).toHaveText("暗海有回声");
});
test("evidence mistakes give feedback and allow a corrected explanation", async ({
  page,
}) => {
  const full = storyVoyage({
    name: "复核",
    mode: "gentle",
    gear: ["sonar", "arm"],
    goal: "truth",
    seed: 3,
  });
  const save = story.encodeStory(full);
  const untilCompare = {
    ...save,
    actions: save.actions.slice(
      0,
      save.actions.findIndex((id) => id.startsWith("compare:")),
    ),
  };
  await page.goto("./#games/story");
  await importSave(page, untilCompare);
  await storyClick(page, "compare:maintenance:sensor:animal");
  await expect(page.locator(".evidence-board .game-warning")).toContainText(
    "无法说明固定周期",
  );
  await page
    .getByLabel("这些记录更支持哪种失联原因？")
    .selectOption("electrical");
  await page.getByRole("button", { name: "提交失联判断", exact: true }).click();
  await expect(page.locator(".evidence-board [role=status]")).toContainText(
    "校验锁已解除",
  );
  await fit(page);
});
async function stationClick(
  page: Page,
  state: station.StationState,
  action: station.StationAction,
) {
  const button = (name: string) =>
    page.getByRole("button", { name, exact: true });
  if ("slot" in action) {
    await page
      .getByRole("button", { name: new RegExp(`^${action.slot + 1} 号位置：`) })
      .click();
    if (action.type === "build")
      await button(`建造${station.roomSpecs[action.kind].name}`).click();
    if (action.type === "workers")
      await button(action.delta === 1 ? "增加人员" : "减少人员").click();
    if (action.type === "upgrade")
      await button(`升级到 ${state.rooms[action.slot]!.level + 1} 级`).click();
    if (action.type === "toggle")
      await button(
        state.rooms[action.slot]!.enabled ? "暂停设备" : "恢复设备",
      ).click();
  } else if (action.type === "research") {
    await button("科研").click();
    await button(
      `研究${station.stationTechs.find((item) => item.id === action.id)!.name}`,
    ).click();
  } else if (action.type === "launch") {
    await button("考察").click();
    await button(
      `派出${station.stationMissions.find((item) => item.id === action.id)!.name}`,
    ).click();
  } else if (action.type === "resolve") {
    await expect(page.locator("#event-title")).toBeInViewport();
    const event = station.stationEvent(state)!;
    if (action.choice === "tech")
      await button(
        `用${station.stationTechs.find((item) => item.id === station.eventTech(state))!.name}处理`,
      ).click();
    else
      await page
        .getByRole("button", {
          name: new RegExp(
            `^${action.choice === "pay" ? event.payLabel : event.adaptLabel}`,
          ),
        })
        .click();
  } else if (["repair", "trade", "recruit"].includes(action.type)) {
    await button("站务").click();
    await button(
      action.type === "repair"
        ? "安排维修"
        : action.type === "trade"
          ? `购买${station.stationResourceNames[action.item]}`
          : "招募一名队员",
    ).click();
  } else if (action.type === "policy") {
    const specs = {
      shift: shiftSpecs,
      ration: rationSpecs,
      priority: prioritySpecs,
      approach: approachSpecs,
    };
    await button(action.field === "approach" ? "考察" : "排班").click();
    await page
      .locator(".policy-options")
      .getByRole("button", {
        name: new RegExp(
          `^${specs[action.field].find((item) => item.id === action.value)!.name}`,
        ),
      })
      .click();
  } else if (action.type === "accept" || action.type === "deliver") {
    await button("委托").click();
    await button(
      action.type === "deliver"
        ? "交付当前委托"
        : `接受${station.contractSpecs.find((item) => item.id === action.id)!.name}`,
    ).click();
  } else if (action.type === "advance") await button("推进一天 →").click();
  else if (action.type === "continue") await button("继续自由经营").click();
}
test("new station completes a project through staffing, forecasts, contracts and expeditions", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("./#games/station");
  await page.getByRole("radio", { name: /标准预算/ }).check();
  await page.getByRole("button", { name: "开始经营 →" }).click();
  await expect(page.locator(".station-resources")).toBeInViewport();
  const setup: station.StationSetup = {
    name: "蓝湾站",
    mode: "standard",
    seed: 0,
    scenario: "bay",
    goal: "network",
  };
  const route = stationCampaign(setup);
  let state = station.createStation(setup);
  for (const action of route.actions) {
    await stationClick(page, state, action);
    state = station.stationAction(state, action);
    await expect(page.locator(".station-day")).toHaveText(`第 ${state.day} 天`);
    await expect(page.locator('[data-resource="credits"]')).toHaveText(
      String(state.resources.credits),
    );
  }
  await expect(page.locator("#station-ending-title")).toHaveText(
    "海底的灯，留了下来",
  );
  await fit(page);
  await page.reload();
  await expect(page.locator("#station-ending-title")).toBeVisible();
  await stationClick(page, state, { type: "continue" });
  state = station.stationAction(state, { type: "continue" });
  while (state.day < 35) {
    expect(state.outcome).toBeNull();
    const actions: station.StationAction[] = [];
    if (state.event)
      actions.push({
        type: "resolve",
        choice: station.stationActionReason(state, {
          type: "resolve",
          choice: "pay",
        })
          ? "adapt"
          : "pay",
      });
    if (state.integrity < 75) actions.push({ type: "repair" });
    if (state.systems!.fatigue >= 35 && state.systems!.shift !== "rest")
      actions.push({ type: "policy", field: "shift", value: "rest" });
    if (state.systems!.fatigue < 10 && state.systems!.shift === "rest")
      actions.push({ type: "policy", field: "shift", value: "normal" });
    actions.push({ type: "advance" });
    for (const action of actions) {
      if (!station.stationActionReason(state, action)) {
        await stationClick(page, state, action);
        state = station.stationAction(state, action);
      }
    }
  }
  await expect(page.locator(".station-command")).toContainText("自由经营");
  await expect(page.locator(".station-ending")).toHaveCount(0);
  await fit(page);
});
test("overtime affects the forecast and contract cancellation needs an explicit choice", async ({
  page,
}) => {
  await page.goto("./#games/station");
  await page.getByRole("button", { name: "开始经营 →" }).click();
  let state = station.createStation({ name: "排班", mode: "relaxed", seed: 0 });
  await importSave(page, station.encodeStation(state));
  await stationClick(page, state, {
    type: "policy",
    field: "shift",
    value: "overtime",
  });
  state = station.stationAction(state, {
    type: "policy",
    field: "shift",
    value: "overtime",
  });
  const f = station.stationForecast(state);
  await stationClick(page, state, { type: "advance" });
  state = station.stationAction(state, { type: "advance" });
  await expect(
    page.getByRole("meter", { name: "疲劳", exact: true }),
  ).toHaveAttribute("value", "15");
  await expect(page.locator('[data-resource="energy"]')).toHaveText(
    `${80 + f.delta.energy}/200`,
  );
  await stationClick(page, state, { type: "accept", id: "materials" });
  state = station.stationAction(state, { type: "accept", id: "materials" });
  await page.getByRole("button", { name: "取消委托", exact: true }).click();
  await expect(page.locator(".active-contract")).toContainText("现在取消");
  await page.getByRole("button", { name: "继续执行", exact: true }).click();
  await expect(page.locator(".active-contract")).toContainText("观测架材料");
  await page.getByRole("button", { name: "取消委托", exact: true }).click();
  await page.getByRole("button", { name: "确认取消委托", exact: true }).click();
  await expect(page.locator(".active-contract")).toHaveCount(0);
  await expect(
    page.getByRole("meter", { name: "声誉", exact: true }),
  ).toHaveAttribute("value", "45");
  await fit(page);
});
