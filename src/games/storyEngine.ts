import * as legacy from "./storyLegacy";
import {
  cargoSpecs,
  storyEncounters,
  storyGoals,
  storySites,
  travelStyles,
  type CargoId,
  type EvidenceId,
  type ExpeditionChoice,
  type StorySiteId,
  type TravelStyle,
} from "./storyExpedition";
export { STORY_KEY, storyEndings, storyRecords } from "./storyLegacy";
export const storyGear = legacy.storyGear.map((item) => ({
  ...item,
  description:
    item.id === "battery"
      ? "出发电量 +20，再带两块可用的电池；占用两个货位。"
      : item.id === "medkit"
        ? "修复救援接口，带一份修补材料；占用一个货位。"
        : item.description,
}));
export {
  cargoSpecs,
  evidenceSpecs,
  storyGoals,
  storySites,
  travelStyles,
} from "./storyExpedition";
export type { StoryGear, StoryMode, StoryEnding } from "./storyLegacy";
export type StorySetup = legacy.StorySetup & {
  seed?: number;
  goal?: (typeof storyGoals)[number]["id"];
};
export interface Expedition {
  turn: number;
  stress: number;
  visited: StorySiteId[];
  done: string[];
  evidence: EvidenceId[];
  cargo: CargoId[];
  encounter: keyof typeof storyEncounters | null;
  attempts: number;
}
export type StoryState = Omit<legacy.StoryState, "setup"> & {
  setup: StorySetup;
  expedition?: Expedition;
};
export type StoryChoice = ExpeditionChoice;
export type StoryNode = Omit<legacy.StoryNode, "choices"> & {
  choices: ExpeditionChoice[];
};
const capacities = { hull: 100, oxygen: 125, battery: 125, trust: 100 };
const labels = { hull: "船体", oxygen: "氧气", battery: "电量", trust: "信任" };
function clamp(value: number, max = 100) {
  return Math.max(0, Math.min(max, value));
}
// Committed action history fixes every roll, including after reload/import.
function roll(state: StoryState, salt: string) {
  let value = (state.setup.seed ?? 0) + 101;
  for (const c of `${state.actions.join("/")}/${salt}`)
    value = Math.imul(value ^ c.charCodeAt(0), 16777619) >>> 0;
  return value % 100;
}
export function createStory(setup: StorySetup): StoryState {
  return {
    ...legacy.createStory(setup),
    setup: {
      ...setup,
      name: setup.name.trim().slice(0, 18) || "远舟",
      seed: setup.seed ?? 0,
      goal: setup.goal ?? "truth",
      gear: [...setup.gear],
    },
    expedition: {
      turn: 0,
      stress: 8,
      visited: [],
      done: [],
      evidence: [],
      cargo: [
        "oxygen",
        ...(setup.gear.includes("battery")
          ? (["battery", "battery"] as CargoId[])
          : []),
        ...(setup.gear.includes("medkit") ? (["plate"] as CargoId[]) : []),
      ],
      encounter: null,
      attempts: 0,
    },
  };
}
export function storyNode(state: StoryState): StoryNode {
  if (!state.expedition) return legacy.storyNode(state);
  if (state.expedition.encounter) {
    const encounter = storyEncounters[state.expedition.encounter];
    const site = storySites.find((item) => item.id === state.node);
    return {
      id: state.node,
      chapter: site?.chapter ?? 1,
      depth: site?.depth ?? 0,
      title: encounter.title,
      speaker: "航行途中 · 临时情况",
      paragraphs: [encounter.text],
      choices: encounter.choices,
    };
  }
  const site = storySites.find((item) => item.id === state.node);
  if (site) {
    if (
      site.id === "refuge" &&
      (state.flags.includes("rescued") ||
        state.flags.includes("relay") ||
        state.flags.includes("rescue-expired"))
    )
      return {
        ...site,
        speaker: "救援通报 · 已完成交接",
        paragraphs: [
          state.flags.includes("rescued")
            ? "林岑已经脱离系留，正沿自己的航线返回海面。她把主井图像和最后一段证词留给了你。岩壁下只剩一根断开的旧缆。"
            : "母船已经接走林岑。她的呼号从应急频道里消失了，人是安全的。你们的调查还能继续，但这次亲自救援的机会已经过去。",
        ],
        choices: site.choices,
      };
    return { ...site, choices: site.choices };
  }
  const node = legacy.storyNodes.find((item) => item.id === state.node)!;
  return state.node === "launch"
    ? {
        ...node,
        choices: node.choices.map((choice) =>
          choice.id === "rush"
            ? { ...choice, hint: "不消耗资源 · 信任保持不变" }
            : choice,
        ),
      }
    : node;
}
export function storyChoiceChance(state: StoryState, choice: ExpeditionChoice) {
  if (!choice.chance || !state.expedition) return null;
  return clamp(
    choice.chance +
      Math.floor((state.trust - 50) / 5) -
      Math.floor(state.expedition.stress / 12),
    95,
  );
}
export function storyChoiceReason(
  state: StoryState,
  choice: StoryChoice,
): string | null {
  if (!state.expedition) return legacy.storyChoiceReason(state, choice);
  const e = state.expedition;
  if (state.ending) return "本次航程已经结束";
  if (e.done.includes(`${state.node}:${choice.id}`) && !e.encounter)
    return "已经完成，不能重复领取";
  if (choice.gear && !state.setup.gear.includes(choice.gear))
    return `未携带${legacy.storyGear.find((item) => item.id === choice.gear)!.name}`;
  if (choice.needs && !state.flags.includes(choice.needs))
    return "先在证据页核实失联原因";
  if (choice.cargo && e.cargo.length >= 4)
    return "四个货位已满，请先使用或放弃一件物资";
  if (
    state.node === "refuge" &&
    ["arm", "repair", "tow", "relay"].includes(choice.id)
  ) {
    if (state.flags.includes("rescued") || state.flags.includes("relay"))
      return "救援已经完成或交接";
    if (e.turn >= 20) return "林岑已由母船接走；这次无法亲自完成救援";
  }
  if (
    (choice.record === "archive" || choice.flag === "basic-archive") &&
    (state.records.includes("archive") || state.flags.includes("basic-archive"))
  )
    return "记录器档案已经取得";
  for (const [key, amount] of Object.entries(choice.cost || {}))
    if (state[key as keyof typeof capacities] < amount)
      return `${labels[key as keyof typeof capacities]}不足`;
  return null;
}
export function storyTravel(
  state: StoryState,
  target: StorySiteId,
  style: TravelStyle,
) {
  const e = state.expedition;
  const site = storySites.find((item) => item.id === state.node);
  const destination = storySites.find((item) => item.id === target);
  const pace = travelStyles.find((item) => item.id === style);
  const oxygen = pace?.oxygen ?? 0;
  const battery = Math.max(
    1,
    (pace?.battery ?? 0) - (state.flags.includes("charted") ? 1 : 0),
  );
  const known = e?.visited.includes(target) ?? false;
  const risk = known
    ? 0
    : Math.min(
        55,
        (pace?.risk ?? 0) +
          (e && e.turn >= 22 ? 10 : 0) +
          (e && e.stress >= 60 ? 10 : 0),
      );
  let reason: string | null = null;
  if (
    !e ||
    state.ending ||
    e.encounter ||
    !site ||
    !destination ||
    !pace ||
    !site.links.includes(target)
  )
    reason = "当前不能走这条航线";
  else if (target === "refuge" && !state.flags.includes("located"))
    reason = "先用声呐、灯光或应急录音定位";
  else if (target === "well" && !state.flags.includes("well-known"))
    reason = "先在鲸骨斜坡或热液区标记主井";
  else if (state.oxygen < oxygen || state.battery < battery)
    reason = "储备不足以完成这段航行";
  return { oxygen, battery, risk, known, reason, destination };
}
export function storyReturnCost(state: StoryState) {
  const depth = storyNode(state).depth;
  return {
    oxygen: Math.max(
      3,
      3 + Math.ceil(depth / 500) - (state.flags.includes("shortcut") ? 4 : 0),
    ),
    battery:
      3 +
      Math.ceil(depth / 700) +
      ((state.expedition?.turn ?? 0) >= 22 ? 5 : 0),
  };
}
export function storyObjectives(state: StoryState) {
  const list = [
    { text: "亲自完成林岑的救援", done: state.flags.includes("rescued") },
    {
      text: "至少三类观察记录",
      done:
        state.records.filter((id) => id !== "archive" && id !== "signal")
          .length >= 3,
    },
    {
      text: "带回主井档案",
      done:
        state.records.includes("archive") ||
        state.flags.includes("basic-archive"),
    },
    { text: "核实失联原因", done: state.flags.includes("theory") },
    {
      text: "完成热液观测并保持信任 ≥70",
      done: state.records.includes("vent") && state.trust >= 70,
    },
  ];
  return state.setup.goal === "rescue"
    ? [list[0]]
    : state.setup.goal === "research"
      ? [list[1], list[2]]
      : [list[0], list[2], list[3], list[4]];
}
function conclusion(state: StoryState): legacy.StoryEnding {
  if (
    state.flags.includes("rescued") &&
    state.flags.includes("theory") &&
    state.records.includes("archive") &&
    state.records.includes("vent") &&
    state.trust >= 70
  )
    return "truth";
  if (
    (state.records.includes("archive") ||
      state.flags.includes("basic-archive")) &&
    state.records.includes("vent")
  )
    return "discovery";
  return state.flags.includes("rescued") ? "rescue" : "home";
}
export function storyActionReason(
  state: StoryState,
  id: string,
): string | null {
  const e = state.expedition;
  if (!e) return "旧存档沿用原航程规则";
  if (state.ending || state.actions.length >= 200) return "航程已经结束";
  if (
    e.encounter &&
    !id.startsWith("use:") &&
    !id.startsWith("drop:") &&
    id !== "evacuate"
  ) {
    const c = storyNode(state).choices.find((item) => item.id === id);
    return c ? storyChoiceReason(state, c) : "先处理航行途中发生的情况";
  }
  if (id.startsWith("travel:")) {
    const [, target, style] = id.split(":");
    return id.split(":").length !== 3
      ? "无效航线"
      : storyTravel(state, target as StorySiteId, style as TravelStyle).reason;
  }
  if (id.startsWith("use:") || id.startsWith("drop:")) {
    const cargo = id.split(":")[1] as CargoId;
    if (
      id.split(":").length !== 2 ||
      !Object.prototype.hasOwnProperty.call(cargoSpecs, cargo) ||
      !e.cargo.includes(cargo)
    )
      return "没有这件物资";
    if (
      id.startsWith("use:") &&
      Object.entries(cargoSpecs[cargo].gain).every(
        ([key]) =>
          state[key as keyof typeof capacities] >=
          capacities[key as keyof typeof capacities],
      )
    )
      return "储备已满，暂时无需使用";
    return null;
  }
  if (id.startsWith("compare:")) {
    const [, first, second, theory] = id.split(":");
    if (state.node !== "station") return "需要在回声站的检修屏提交判断";
    if (state.flags.includes("theory")) return "失联原因已核实";
    if (
      id.split(":").length !== 4 ||
      first === second ||
      !e.evidence.includes(first as EvidenceId) ||
      !e.evidence.includes(second as EvidenceId) ||
      !["electrical", "animal", "quake"].includes(theory)
    )
      return "选择两份不同证据和一个解释";
    return state.oxygen < 2 || state.battery < 2
      ? "比对需要 2 氧气和 2 电量"
      : null;
  }
  if (id === "abort") {
    const cost = storyReturnCost(state);
    return state.oxygen < cost.oxygen || state.battery < cost.battery
      ? "正常返航储备不足，可使用物资或选择应急接应"
      : null;
  }
  if (id === "evacuate") return null;
  const choice = storyNode(state).choices.find((item) => item.id === id);
  return choice ? storyChoiceReason(state, choice) : "当前没有这个选项";
}
export function chooseStory(state: StoryState, id: string): StoryState {
  if (!state.expedition) return legacy.chooseStory(state, id);
  if (storyActionReason(state, id)) return state;
  const next: StoryState = {
    ...state,
    setup: { ...state.setup, gear: [...state.setup.gear] },
    flags: [...state.flags],
    records: [...state.records],
    actions: [...state.actions, id],
    log: [...state.log],
    expedition: {
      ...state.expedition,
      visited: [...state.expedition.visited],
      done: [...state.expedition.done],
      evidence: [...state.expedition.evidence],
      cargo: [...state.expedition.cargo],
    },
  };
  const e = next.expedition!;
  const node = storyNode(state);
  function change(
    cost: legacy.StoryChoice["cost"] = {},
    gain: legacy.StoryChoice["gain"] = {},
    stress = 0,
  ) {
    for (const key of Object.keys(capacities) as (keyof typeof capacities)[])
      next[key] = clamp(
        next[key] - (key === "trust" ? 0 : (cost[key] ?? 0)) + (gain[key] ?? 0),
        capacities[key],
      );
    e.stress = clamp(e.stress + stress);
  }
  function note(choice: string, result: string) {
    next.log.push({ title: node.title, choice, result });
  }
  if (id.startsWith("travel:")) {
    const [, target, style] = id.split(":");
    const route = storyTravel(
      state,
      target as StorySiteId,
      style as TravelStyle,
    );
    change(
      { oxygen: route.oxygen, battery: route.battery },
      {},
      style === "fast" ? 7 : -2,
    );
    next.node = target;
    const hit = roll(state, id) < route.risk;
    if (hit) change({ hull: 8 }, {}, 8);
    note(
      `前往${route.destination!.title}`,
      hit
        ? "航行时擦到了岩壁，船体受损 8 点。目的地已经到达。"
        : "你们沿选定的通道抵达目的地。已走过的路，折返时不再有碰撞判定。",
    );
    if (!e.visited.includes(target as StorySiteId)) {
      e.visited.push(target as StorySiteId);
      if (e.visited.length % 3 === 0)
        e.encounter = (
          Object.keys(storyEncounters) as (keyof typeof storyEncounters)[]
        )[roll(state, "encounter") % 3];
    }
    e.turn++;
  } else if (id.startsWith("use:") || id.startsWith("drop:")) {
    const cargo = id.split(":")[1] as CargoId;
    e.cargo.splice(e.cargo.indexOf(cargo), 1);
    if (id.startsWith("use:")) change({}, cargoSpecs[cargo].gain);
    note(
      id.startsWith("use:")
        ? `使用${cargoSpecs[cargo].name}`
        : `放弃${cargoSpecs[cargo].name}`,
      id.startsWith("use:")
        ? "物资已经使用，货架腾出了一个位置。不额外推进航行时刻。"
        : "物资已卸入标记好的旧设施接口，本次航行无法再取回。货架腾出了一个位置。",
    );
  } else if (id.startsWith("compare:")) {
    const [, first, second, theory] = id.split(":");
    const correct =
      theory === "electrical" &&
      [first, second].includes("sensor") &&
      ([first, second].includes("maintenance") ||
        [first, second].includes("wear"));
    change(
      { oxygen: 2, battery: 2 },
      { trust: correct ? 8 : -5 },
      correct ? -8 : 8,
    );
    e.attempts++;
    if (correct) next.flags.push("theory");
    note(
      "比对证据，提交失联解释",
      correct
        ? "复位周期、断电测试和脉冲相互印证。信号来自电气故障，校验锁已解除。"
        : "这个解释还无法说明固定周期与断电期间的安静。阿澈请你回到原始记录，再找一组能相互印证的证据。",
    );
    e.turn++;
  } else if (id === "abort" || id === "evacuate") {
    change(id === "abort" ? storyReturnCost(state) : {});
    e.encounter = null;
    next.ending =
      id === "abort"
        ? conclusion(next)
        : next.records.includes("archive")
          ? "archive"
          : "home";
    if (id === "evacuate") {
      e.cargo = [];
      next.flags.push("evacuated");
    }
    note(
      id === "abort" ? "沿已知路线返航" : "放弃潜器，发信标等待母船接应",
      id === "abort"
        ? "回程储备已结算。母船完成回收，航行报告保留了每一条已取得的资料。"
        : "独立供电的应急信标启动。人员被接回了母船，潜器留在海底，救援报告记录了这次接应的代价。",
    );
    next.node = "surface";
    e.turn++;
  } else {
    const choice = node.choices.find((item) => item.id === id)!;
    const chance = storyChoiceChance(state, choice);
    const success = chance === null || roll(state, `choice:${id}`) < chance;
    change(choice.cost, success ? choice.gain : {}, choice.stress ?? 0);
    if (success) {
      if (choice.flag && !next.flags.includes(choice.flag))
        next.flags.push(choice.flag);
      if (choice.record && !next.records.includes(choice.record))
        next.records.push(choice.record);
      if (choice.evidence && !e.evidence.includes(choice.evidence))
        e.evidence.push(choice.evidence);
      if (choice.cargo) e.cargo.push(choice.cargo);
      if (!e.encounter) e.done.push(`${state.node}:${id}`);
      if (state.node === "launch") {
        next.node = "buoy";
        e.visited.push("buoy");
      }
    } else
      change(
        { hull: choice.failureCost?.hull ?? 0 },
        { trust: -(choice.failureCost?.trust ?? 0) },
        choice.failureCost?.stress ?? 0,
      );
    note(choice.label, success ? choice.result : choice.failure!);
    e.encounter = null;
    e.turn++;
  }
  if (
    e.turn >= 20 &&
    !next.flags.includes("rescued") &&
    !next.flags.includes("relay") &&
    !next.flags.includes("rescue-expired")
  ) {
    next.flags.push("rescue-expired");
    note(
      "母船救援通报",
      "林岑已由母船的第二艘潜器接走。人安全了，这次亲自救援的机会也过去了。",
    );
  }
  if (
    next.hull <= 0 ||
    next.oxygen <= 0 ||
    next.battery <= 0 ||
    e.stress >= 100
  ) {
    next.ending = "lost";
    note(
      "航行中止",
      e.stress >= 100
        ? "报警与疲劳已经影响驾驶，母船接管了应急回收。下次给停靠和休息留一些储备。"
        : "一项关键储备已经用尽。母船收到应急信标，航行被迫中止。",
    );
  }
  return next;
}
export function storyScore(state: StoryState) {
  return (
    legacy.storyScore(state) +
    (state.expedition
      ? state.expedition.evidence.length * 60 +
        (storyObjectives(state).every((item) => item.done) ? 300 : 0) -
        state.expedition.attempts * 10
      : 0)
  );
}
export function encodeStory(state: StoryState) {
  return {
    version: state.expedition ? 2 : 1,
    setup: state.setup,
    actions: state.actions,
  };
}
export function decodeStory(raw: unknown): StoryState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as {
    version?: number;
    setup?: StorySetup;
    actions?: unknown[];
  };
  if (value.version === 1) return legacy.decodeStory(raw);
  if (
    value.version !== 2 ||
    !value.setup ||
    typeof value.setup.name !== "string" ||
    value.setup.name.length > 18 ||
    !["gentle", "standard"].includes(value.setup.mode) ||
    !storyGoals.some((item) => item.id === value.setup!.goal) ||
    !Number.isInteger(value.setup.seed) ||
    value.setup.seed! < 0 ||
    value.setup.seed! > 1000000 ||
    !Array.isArray(value.setup.gear) ||
    value.setup.gear.length !== 2 ||
    new Set(value.setup.gear).size !== 2 ||
    value.setup.gear.some(
      (gear) => !legacy.storyGear.some((item) => item.id === gear),
    ) ||
    !Array.isArray(value.actions) ||
    value.actions.length > 200
  )
    return null;
  let state = createStory(value.setup);
  for (const id of value.actions) {
    if (typeof id !== "string") return null;
    const next = chooseStory(state, id);
    if (next === state) return null;
    state = next;
  }
  return state;
}
