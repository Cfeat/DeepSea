import * as legacy from "./stationLegacy";
import {
  approachSpecs,
  contractSpecs,
  prioritySpecs,
  rationSpecs,
  shiftSpecs,
  stationEvents,
  stationGoals,
  stationMissions,
  stationScenarios,
  weatherSpecs,
  type ApproachId,
  type GoalId,
  type PriorityId,
  type RationId,
  type ScenarioId,
  type ShiftId,
  type StationSystems,
  type WeatherId,
} from "./stationSystems";
export {
  STATION_KEY,
  roomSpecs,
  stationTechs,
  stationResourceNames,
  storageCap,
  upgradeCost,
} from "./stationLegacy";
export {
  approachSpecs,
  contractSpecs,
  prioritySpecs,
  rationSpecs,
  shiftSpecs,
  stationEvents,
  stationGoals,
  stationMissions,
  stationScenarios,
  weatherSpecs,
} from "./stationSystems";
export type { RoomKind, Room, StationResource, TechId } from "./stationLegacy";
export type StationSetup = legacy.StationSetup & {
  scenario?: ScenarioId;
  goal?: GoalId;
};
export type StationAction =
  | Exclude<legacy.StationAction, { type: "resolve" }>
  | { type: "resolve"; choice: "pay" | "adapt" | "tech" }
  | { type: "policy"; field: "shift"; value: ShiftId }
  | { type: "policy"; field: "ration"; value: RationId }
  | { type: "policy"; field: "priority"; value: PriorityId }
  | { type: "policy"; field: "approach"; value: ApproachId }
  | { type: "accept"; id: string }
  | { type: "deliver" | "cancelContract" };
export type StationState = Omit<legacy.StationState, "setup" | "actions"> & {
  setup: StationSetup;
  actions: StationAction[];
  systems?: StationSystems;
};
export function stationCapacity(state: StationState) {
  return legacy.stationCapacity(state as legacy.StationState);
}
export function assignedWorkers(state: StationState) {
  return legacy.assignedWorkers(state as legacy.StationState);
}
function clamp(n: number, max = 100) {
  return Math.max(0, Math.min(max, n));
}
function canPay(
  state: StationState,
  cost: Partial<Record<legacy.StationResource, number>>,
) {
  for (const [key, value] of Object.entries(cost))
    if (state.resources[key as legacy.StationResource] < value)
      return `${legacy.stationResourceNames[key as legacy.StationResource]}不足（需要 ${value}）`;
  return null;
}
function resources(
  state: StationState,
  delta: Partial<Record<legacy.StationResource, number>>,
  factor = 1,
) {
  for (const [key, amount] of Object.entries(delta))
    state.resources[key as legacy.StationResource] = clamp(
      state.resources[key as legacy.StationResource] +
        Math.floor(amount * factor),
      legacy.storageCap(key as legacy.StationResource),
    );
}
function note(state: StationState, text: string) {
  state.log = [...state.log, { day: state.day, text }].slice(-80);
}
function rng(state: StationState, salt: string) {
  let hash = state.setup.seed + 733;
  for (const c of `${state.day}/${state.actions.length}/${salt}`)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return hash % 100;
}
export function createStation(setup: StationSetup): StationState {
  return {
    ...legacy.createStation(setup),
    setup: {
      ...setup,
      name: setup.name.trim().slice(0, 18) || "蓝湾站",
      scenario: setup.scenario ?? "bay",
      goal: setup.goal ?? "network",
    },
    systems: {
      fatigue: 5,
      ecology: 90,
      reputation: 50,
      shift: "normal",
      ration: "normal",
      priority: "life",
      approach: "careful",
      stableDays: 0,
      beaconDays: 0,
      totalScience: 0,
      totalAlloy: 0,
      trips: {},
      milestones: [],
      missionPlan: null,
      report: null,
      contract: null,
      contracts: [],
      offersTaken: [],
    },
    log: [
      {
        day: 1,
        text: "站点已接收。先看明日供给，再选择科研、建设或考察。空闲队员会轮休，暂时不必把每个人都派出去。",
      },
    ],
  };
}
export function stationWeather(state: StationState, day = state.day + 1) {
  const cycle: WeatherId[] = [
    "calm",
    "calm",
    "current",
    "silt",
    "calm",
    "storm",
    "current",
  ];
  const id = cycle[(day - 1 + (state.setup.seed % 7)) % 7];
  return { id, ...weatherSpecs[id] };
}
function adjacent(a: number, b: number) {
  return (
    Math.abs(a - b) === 4 ||
    (Math.floor(a / 4) === Math.floor(b / 4) && Math.abs(a - b) === 1)
  );
}
export function stationRoomBonus(state: StationState, slot: number) {
  const room = state.rooms[slot];
  const neighbors = state.rooms.filter(
    (item, index) => item && item.enabled && adjacent(index, slot),
  );
  const thermal = [0, 8].includes(slot);
  const sheltered = [1, 2, 5, 6, 9, 10].includes(slot);
  let production = 1;
  let morale = 0;
  const notes = [thermal ? "热源接口" : sheltered ? "背流位置" : "迎流位置"];
  if (room?.kind === "reactor" && thermal) {
    production += state.setup.scenario === "vent" ? 0.35 : 0.15;
    notes.push(`发电 +${state.setup.scenario === "vent" ? 35 : 15}%`);
  }
  if (
    room?.kind === "workshop" &&
    neighbors.some((item) => item?.kind === "reactor")
  ) {
    production += 0.2;
    notes.push("邻接发电舱：加工 +20%");
  }
  if (
    room?.kind === "lab" &&
    neighbors.some((item) => item?.kind === "beacon")
  ) {
    production += 0.25;
    notes.push("邻接阵列：科研 +25%");
  }
  if (room?.kind === "quarters") {
    if (neighbors.some((item) => item?.kind === "farm")) {
      morale++;
      notes.push("邻接水培：士气 +1/天");
    }
    if (
      neighbors.some(
        (item) => item?.kind === "reactor" || item?.kind === "workshop",
      )
    ) {
      morale -= 2;
      notes.push("邻接噪声设备：士气 −2/天");
    }
  }
  return { production, morale, thermal, sheltered, text: notes.join(" · ") };
}
export interface ProductionRow {
  slot: number;
  name: string;
  status: "running" | "off" | "unpowered";
  power: number;
  output: number;
  resource?: legacy.StationResource;
  bonus: string;
}
export function stationForecast(state: StationState) {
  if (!state.systems)
    return {
      ...legacy.stationForecast(state as legacy.StationState),
      fatigue: 0,
      ecology: 0,
      rows: [] as ProductionRow[],
      shed: [] as number[],
      efficiency: 1,
    };
  const s = state.systems;
  const weather = stationWeather(state);
  const shift = s.shift === "overtime" ? 1.3 : s.shift === "rest" ? 0.8 : 1;
  const efficiency = Math.max(
    0.5,
    1 -
      Math.floor(s.fatigue / 25) * 0.1 -
      (state.morale < 40 ? 0.2 : state.morale < 65 ? 0.05 : 0),
  );
  const delta: Record<legacy.StationResource, number> = {
    credits: state.setup.mode === "relaxed" ? 36 : 30,
    alloy: 0,
    science: 0,
    food: -Math.ceil(
      state.crew *
        (s.ration === "limited" ? 1.4 : s.ration === "generous" ? 2.8 : 2),
    ),
    oxygen: -state.crew * 2,
    energy: -6,
  };
  delta.credits += s.reputation >= 70 ? 4 : s.reputation < 30 ? -4 : 0;
  let morale =
    -1 +
    (s.shift === "overtime" ? -2 : s.shift === "rest" ? 2 : 0) +
    (s.ration === "limited" ? -2 : s.ration === "generous" ? 2 : 0);
  let ecology = s.shift === "rest" ? 2 : 1;
  const idle = state.crew - assignedWorkers(state);
  const fatigue =
    (s.shift === "overtime" ? 10 : s.shift === "rest" ? -10 : 3 - idle * 2) +
    (s.ration === "limited" ? 2 : s.ration === "generous" ? -1 : 0);
  const rows: ProductionRow[] = state.rooms.flatMap((room, slot) => {
    if (!room || room.kind === "core") return [];
    delta.credits -= legacy.roomSpecs[room.kind].upkeep * room.level;
    return [
      {
        slot,
        name: legacy.roomSpecs[room.kind].name,
        status:
          room.enabled && room.workers
            ? ("running" as const)
            : ("off" as const),
        power: 0,
        output: 0,
        resource: legacy.roomSpecs[room.kind].output?.resource,
        bonus: stationRoomBonus(state, slot).text,
      },
    ];
  });
  for (const row of rows.filter(
    (item) =>
      state.rooms[item.slot]?.kind === "reactor" && item.status === "running",
  )) {
    const room = state.rooms[row.slot]!;
    row.output = Math.floor(
      18 *
        room.workers *
        room.level *
        shift *
        efficiency *
        weather.power *
        stationRoomBonus(state, row.slot).production,
    );
    delta.energy += row.output;
  }
  let available = state.resources.energy + delta.energy;
  const orders = {
    life: ["oxygen", "farm", "quarters", "lab", "dock", "workshop", "beacon"],
    research: [
      "oxygen",
      "farm",
      "lab",
      "beacon",
      "quarters",
      "dock",
      "workshop",
    ],
    industry: [
      "oxygen",
      "farm",
      "workshop",
      "dock",
      "quarters",
      "lab",
      "beacon",
    ],
  };
  const shed: number[] = [];
  const powered = rows
    .filter(
      (item) =>
        state.rooms[item.slot]?.kind !== "reactor" && item.status === "running",
    )
    .sort(
      (a, b) =>
        orders[s.priority].indexOf(state.rooms[a.slot]!.kind) -
        orders[s.priority].indexOf(state.rooms[b.slot]!.kind),
    );
  for (const row of powered) {
    const room = state.rooms[row.slot]!;
    const spec = legacy.roomSpecs[room.kind];
    row.power = Math.ceil(
      spec.power *
        room.workers *
        room.level *
        (state.techs.includes("automation") ? 0.75 : 1),
    );
    if (available < row.power) {
      row.status = "unpowered";
      row.power = 0;
      shed.push(row.slot);
      continue;
    }
    available -= row.power;
    delta.energy -= row.power;
    if (spec.output) {
      const recycling =
        state.techs.includes("recycling") &&
        ["oxygen", "farm"].includes(room.kind)
          ? 1.25
          : 1;
      const factor =
        stationRoomBonus(state, row.slot).production *
        recycling *
        (room.kind === "farm" ? weather.food : 1) *
        (room.kind === "lab" && state.setup.scenario === "ridge" ? 1.2 : 1) *
        (room.kind === "lab" && s.ecology < 40 ? 0.75 : 1);
      row.output = Math.floor(
        spec.output.amount *
          room.workers *
          room.level *
          shift *
          efficiency *
          factor,
      );
      delta[spec.output.resource] += row.output;
    }
    if (room.kind === "quarters")
      morale += 2 * room.workers + stationRoomBonus(state, row.slot).morale;
    if (room.kind === "workshop") ecology -= room.workers;
  }
  const shortPower = available < 0;
  if (shortPower) morale -= 8;
  const activeExposed = rows.filter(
    (row) =>
      row.status === "running" && !stationRoomBonus(state, row.slot).sheltered,
  ).length;
  const wear =
    (state.setup.mode === "standard" && !state.techs.includes("pressure")
      ? 1
      : 0) +
    Math.ceil(
      (weather.wear +
        (state.setup.scenario === "vent" ? 1 : 0) +
        (state.setup.scenario === "ridge" && weather.wear ? 1 : 0) +
        (weather.wear && activeExposed >= 3 ? 1 : 0)) *
        (state.techs.includes("pressure") ? 0.5 : 1),
    );
  return {
    delta,
    morale,
    shortPower,
    wear,
    fatigue,
    ecology,
    rows,
    shed,
    efficiency,
  };
}
export function stationMissionPlan(state: StationState, id: string) {
  const mission = stationMissions.find((item) => item.id === id);
  const approach = state.systems?.approach ?? "normal";
  const risk = mission
    ? clamp(
        mission.risk +
          stationWeather(state).risk +
          (approach === "careful" ? -15 : approach === "salvage" ? 18 : 0) +
          Math.floor((state.systems?.fatigue ?? 0) / 10) -
          (state.techs.includes("sonar") ? 6 : 0),
        85,
      )
    : 0;
  const days = Math.max(
    1,
    (mission?.days ?? 0) +
      (approach === "careful" ? 1 : approach === "salvage" ? -1 : 0),
  );
  const repetitions = state.systems?.trips[id] ?? 0;
  const factor = Math.max(0.4, 1 - repetitions * 0.2);
  return { risk, days, factor, approach };
}
export function stationObjectives(state: StationState) {
  if (!state.systems) return [];
  const s = state.systems;
  const common = [
    {
      text: "供给正常，结构 ≥65，士气 ≥50",
      done:
        state.shortageDays === 0 && state.integrity >= 65 && state.morale >= 50,
    },
    {
      text: "食物、氧气 ≥30，电能 ≥20",
      done:
        state.resources.food >= 30 &&
        state.resources.oxygen >= 30 &&
        state.resources.energy >= 20,
    },
  ];
  const base = ["snow", "vent", "map"].filter((id) =>
    state.completed.includes(id),
  ).length;
  if (state.setup.goal === "habitat")
    return [
      { text: `接纳九名队员（${state.crew}/9）`, done: state.crew >= 9 },
      {
        text: "二级居住舱有人值守",
        done: state.rooms.some(
          (room) =>
            room?.kind === "quarters" &&
            room.level >= 2 &&
            room.enabled &&
            room.workers > 0,
        ),
      },
      {
        text: `累计八天供给稳定（${s.stableDays}/8）`,
        done: s.stableDays >= 8,
      },
      {
        text: `完成两处考察（${state.completed.length}/2），士气 ≥80`,
        done: state.completed.length >= 2 && state.morale >= 80,
      },
      ...common,
    ];
  return [
    {
      text:
        state.setup.goal === "conservation"
          ? `五处海域调查（${state.completed.length}/5）`
          : `三项基础考察（${base}/3）`,
      done:
        state.setup.goal === "conservation"
          ? state.completed.length >= 5
          : base === 3,
    },
    { text: `阵列连续运行三天（${s.beaconDays}/3）`, done: s.beaconDays >= 3 },
    {
      text: `生态状态 ≥${state.setup.goal === "conservation" ? 75 : 40}（当前 ${s.ecology}）`,
      done: s.ecology >= (state.setup.goal === "conservation" ? 75 : 40),
    },
    ...common,
  ];
}
export function offeredContracts(state: StationState) {
  const cycle = Math.floor((state.day - 1) / 6);
  return contractSpecs
    .filter((_, index) => (index + cycle + state.setup.seed) % 2 === 0)
    .filter(
      (item) => !state.systems?.offersTaken.includes(`${cycle}:${item.id}`),
    );
}
export function stationEvent(state: StationState) {
  if (state.event === "voyage")
    return {
      title: "考察艇请求接应",
      text: "回收架受损，完整资料暂时卡在设备内。可以追加备件带回全部资料，也可以保住现有成果，让队员直接返站。",
      payLabel: "送出备件，完整回收",
      payCost: { alloy: 8, energy: 10 },
      payResult: "全部成果已回收。",
      adaptLabel: "让队员先回来",
      adaptResult: "获得 60% 成果；士气 −2，人员安全返回。",
      adapt: {},
    };
  return state.event
    ? stationEvents[state.event as keyof typeof stationEvents]
    : null;
}
export function eventTech(state: StationState) {
  const mapping: Record<string, legacy.TechId> = {
    seal: "pressure",
    flow: "pressure",
    heat: "automation",
    supply: "recycling",
    visitors: "network",
    survey: "sonar",
  };
  return state.event ? mapping[state.event] : undefined;
}
export function stationActionReason(
  state: StationState,
  action: StationAction,
): string | null {
  if (!state.systems)
    return legacy.stationActionReason(
      state as legacy.StationState,
      action as legacy.StationAction,
    );
  if (state.actions.length >= 4000) return "本局操作已达上限，请导出后新建站点";
  if (state.outcome === "won" && action.type === "continue") return null;
  if (state.outcome) return "本局已经结束";
  if (state.event && action.type !== "resolve") return "先处理待办事件";
  if (action.type === "policy") {
    const choices = {
      shift: shiftSpecs,
      ration: rationSpecs,
      priority: prioritySpecs,
      approach: approachSpecs,
    };
    if (
      !Object.prototype.hasOwnProperty.call(choices, action.field) ||
      !choices[action.field].some((item) => item.id === action.value)
    )
      return "无效安排";
    return state.systems[action.field] === action.value
      ? "当前已经采用这项安排"
      : null;
  }
  if (action.type === "accept") {
    if (state.systems.contract) return "先完成或取消当前委托";
    return offeredContracts(state).some((item) => item.id === action.id)
      ? null
      : "委托已结束或当前不在报价中";
  }
  if (action.type === "deliver" || action.type === "cancelContract") {
    const contract = contractSpecs.find(
      (item) => item.id === state.systems!.contract?.id,
    );
    return !contract
      ? "没有进行中的委托"
      : action.type === "deliver"
        ? canPay(state, contract.cost)
        : null;
  }
  if (action.type === "launch") {
    const mission = stationMissions.find((item) => item.id === action.id);
    if (!mission) return "不存在这项考察";
    if (state.mission) return "考察艇尚未返回";
    if (mission.tech && !state.techs.includes(mission.tech))
      return `先研究${legacy.stationTechs.find((item) => item.id === mission.tech)!.name}`;
    const forecast = stationForecast(state);
    if (
      !state.rooms.some(
        (room, index) =>
          room?.kind === "dock" &&
          room.enabled &&
          room.workers &&
          room.level >= mission.dock &&
          forecast.rows.some(
            (row) => row.slot === index && row.status === "running",
          ),
      )
    )
      return `需要供电正常、有人值守的 ${mission.dock} 级考察坞`;
    if (
      state.integrity < 35 ||
      state.morale < 25 ||
      state.systems.fatigue >= 85
    )
      return "先恢复站体、士气或安排轮休（疲劳需低于 85）";
    return canPay(state, { credits: mission.credits, energy: mission.energy });
  }
  if (action.type === "resolve") {
    const event = stationEvent(state);
    if (!event || !["pay", "adapt", "tech"].includes(action.choice))
      return "没有待办事件";
    if (action.choice === "tech")
      return eventTech(state) && state.techs.includes(eventTech(state)!)
        ? null
        : "尚无对应技术，或本事件无法用技术处理";
    return action.choice === "pay" ? canPay(state, event.payCost) : null;
  }
  if (action.type === "trade") {
    if (!["food", "oxygen", "alloy"].includes(action.item)) return "补给不存在";
    if (state.resources[action.item] >= legacy.storageCap(action.item))
      return "储备已满";
    return canPay(state, {
      credits: Math.ceil(
        (action.item === "alloy" ? 35 : 25) *
          stationWeather(state, state.day).price,
      ),
    });
  }
  if (action.type === "advance") return null;
  return legacy.stationActionReason(
    state as legacy.StationState,
    action as legacy.StationAction,
  );
}
function copy(state: StationState, action: StationAction): StationState {
  return {
    ...state,
    resources: { ...state.resources },
    rooms: state.rooms.map((room) => (room ? { ...room } : null)),
    techs: [...state.techs],
    completed: [...state.completed],
    actions: [...state.actions, { ...action }],
    log: [...state.log],
    mission: state.mission ? { ...state.mission } : null,
    systems: state.systems
      ? {
          ...state.systems,
          trips: { ...state.systems.trips },
          milestones: [...state.systems.milestones],
          contracts: [...state.systems.contracts],
          offersTaken: [...state.systems.offersTaken],
          missionPlan: state.systems.missionPlan
            ? { ...state.systems.missionPlan }
            : null,
          report: state.systems.report ? { ...state.systems.report } : null,
          contract: state.systems.contract
            ? { ...state.systems.contract }
            : null,
        }
      : undefined,
  };
}
function rewardMission(
  state: StationState,
  id: string,
  approach: ApproachId,
  recovery = 1,
) {
  const s = state.systems!;
  const mission = stationMissions.find((item) => item.id === id)!;
  const factor = Math.max(0.4, 1 - (s.trips[id] ?? 0) * 0.2) * recovery;
  const rewards = {
    ...mission.reward,
    ...(approach === "salvage"
      ? { alloy: (mission.reward.alloy ?? 0) + 18 }
      : {}),
    ...(approach === "careful"
      ? { science: (mission.reward.science ?? 0) + 4 }
      : {}),
  };
  resources(state, rewards, factor);
  s.totalScience += Math.floor((rewards.science ?? 0) * factor);
  s.totalAlloy += Math.floor((rewards.alloy ?? 0) * factor);
  s.trips[id] = (s.trips[id] ?? 0) + 1;
  if (!state.completed.includes(id)) state.completed.push(id);
  s.ecology = clamp(
    s.ecology + (approach === "salvage" ? -6 : approach === "careful" ? 1 : -1),
  );
  state.morale = clamp(state.morale + (recovery === 1 ? 3 : -2));
  note(
    state,
    `${mission.name}返回，获得 ${Math.round(factor * 100)}% 本次计划成果。重复任务的奖励逐次降低，最低为 40%。`,
  );
  state.mission = null;
  s.missionPlan = null;
  s.report = null;
}
export function stationAction(
  state: StationState,
  action: StationAction,
): StationState {
  if (!state.systems)
    return legacy.stationAction(
      state as legacy.StationState,
      action as legacy.StationAction,
    );
  if (stationActionReason(state, action)) return state;
  const next = copy(state, action);
  const s = next.systems!;
  if (action.type === "policy") {
    Object.assign(s, { [action.field]: action.value });
    note(next, "新的排班与设备安排已记录，下次日结算开始采用。");
  } else if (action.type === "accept") {
    const spec = contractSpecs.find((item) => item.id === action.id)!;
    s.contract = {
      id: action.id,
      deadline: state.day + spec.days,
      cycle: Math.floor((state.day - 1) / 6),
    };
    s.offersTaken.push(`${s.contract.cycle}:${action.id}`);
    note(
      next,
      `接下委托：${spec.name}，请在第 ${s.contract.deadline} 天前交付。逾期声誉 −8。`,
    );
  } else if (action.type === "deliver" || action.type === "cancelContract") {
    const spec = contractSpecs.find((item) => item.id === s.contract!.id)!;
    if (action.type === "deliver") {
      resources(next, spec.cost, -1);
      resources(next, spec.reward);
      s.reputation = clamp(s.reputation + spec.reputation);
      s.totalScience += "science" in spec.reward ? spec.reward.science : 0;
      s.contracts.push(`${s.contract!.cycle}:${spec.id}`);
      note(next, `${spec.name}已交付，报酬入账，声誉 +${spec.reputation}。`);
    } else {
      s.reputation = clamp(s.reputation - 5);
      note(next, "委托已取消，声誉 −5。已收集的材料仍留在站内。");
    }
    s.contract = null;
  } else if (action.type === "launch") {
    const mission = stationMissions.find((item) => item.id === action.id)!;
    const plan = stationMissionPlan(state, action.id);
    resources(next, { credits: mission.credits, energy: mission.energy }, -1);
    next.mission = { id: action.id, remaining: plan.days };
    s.missionPlan = {
      approach: plan.approach,
      risk: plan.risk,
      roll: rng(state, action.id),
    };
    note(
      next,
      `${mission.name}出发，${plan.days} 天航程，途中需要接应的概率 ${plan.risk}%。`,
    );
  } else if (action.type === "resolve") {
    const event = stationEvent(state)!;
    if (action.choice === "pay") resources(next, event.payCost, -1);
    if (state.event === "voyage")
      rewardMission(
        next,
        s.report!.id,
        s.report!.approach,
        action.choice === "pay" ? 1 : 0.6,
      );
    else {
      if (action.choice === "adapt") {
        resources(next, event.adapt.resources ?? {});
        next.integrity = clamp(next.integrity + (event.adapt.integrity ?? 0));
        next.morale = clamp(next.morale + (event.adapt.morale ?? 0));
        if (state.event === "heat") s.fatigue = clamp(s.fatigue + 8);
        if (state.event === "survey") s.reputation = clamp(s.reputation + 2);
      } else {
        if (state.event === "visitors") {
          resources(next, { science: 12 });
          s.totalScience += 12;
          next.morale = clamp(next.morale + 4);
        }
        if (state.event === "survey") {
          resources(next, { science: 16 });
          s.totalScience += 16;
          s.reputation = clamp(s.reputation + 8);
        }
        if (state.event === "heat") s.fatigue = clamp(s.fatigue - 5);
      }
      note(
        next,
        action.choice === "tech"
          ? "已有技术处理了这次问题，无需额外消耗备件。"
          : action.choice === "pay"
            ? event.payResult
            : event.adaptResult,
      );
    }
    next.event = null;
  } else if (action.type === "trade") {
    const price = Math.ceil(
      (action.item === "alloy" ? 35 : 25) *
        stationWeather(state, state.day).price,
    );
    resources(next, { credits: price }, -1);
    resources(next, { [action.item]: action.item === "alloy" ? 20 : 30 });
    note(
      next,
      `${legacy.stationResourceNames[action.item]}补给入库，花费 ${price} 经费。`,
    );
  } else if (action.type === "advance") {
    const f = stationForecast(state);
    next.day++;
    resources(next, f.delta);
    next.integrity = clamp(next.integrity - f.wear - (f.shortPower ? 4 : 0));
    next.morale = clamp(next.morale + f.morale);
    s.fatigue = clamp(s.fatigue + f.fatigue);
    s.ecology = clamp(s.ecology + f.ecology);
    s.totalScience += f.delta.science;
    s.totalAlloy += f.delta.alloy;
    const shortage =
      next.resources.food <= 0 || next.resources.oxygen <= 0 || f.shortPower;
    next.shortageDays = shortage ? state.shortageDays + 1 : 0;
    if (shortage) {
      next.morale = clamp(next.morale - 8);
      next.integrity = clamp(next.integrity - 5);
      note(
        next,
        `生活供给连续不足 ${next.shortageDays} 天。补给或重新分配人员；连续三天需要撤离。`,
      );
    } else s.stableDays++;
    if (f.shed.length)
      note(
        next,
        `供电优先级自动停下了 ${f.shed.length} 座设备。制氧和水培优先获得电能，停产详情在每日结算表。`,
      );
    s.beaconDays =
      !shortage &&
      f.rows.some(
        (row) =>
          state.rooms[row.slot]?.kind === "beacon" && row.status === "running",
      )
        ? s.beaconDays + 1
        : 0;
    if (next.mission) {
      next.mission.remaining--;
      if (next.mission.remaining <= 0) {
        const plan = s.missionPlan!;
        if (plan.roll < plan.risk) {
          s.report = { id: next.mission.id, approach: plan.approach };
          next.event = "voyage";
          note(next, "考察艇请求接应，请决定是否追加备件回收完整成果。");
        } else rewardMission(next, next.mission.id, plan.approach);
      }
    }
    if (s.contract && next.day > s.contract.deadline) {
      s.reputation = clamp(s.reputation - 8);
      note(next, "委托逾期，声誉 −8。材料保留，委托已关闭。");
      s.contract = null;
    }
    const milestones = [
      {
        id: "science",
        done: s.totalScience >= 12,
        credits: 40,
        text: "首份科研成果通过复核，奖励 40 经费。",
      },
      {
        id: "expedition",
        done: next.completed.length >= 1,
        credits: 45,
        text: "首航资料已入库，奖励 45 经费。",
      },
      {
        id: "stable",
        done: s.stableDays >= 5,
        credits: 45,
        text: "生活保障稳定运行五天，奖励 45 经费。",
      },
    ];
    for (const m of milestones)
      if (m.done && !s.milestones.includes(m.id)) {
        s.milestones.push(m.id);
        resources(next, { credits: m.credits });
        note(next, m.text);
      }
    if (next.day % 5 === 0 && !next.event) {
      const ids = Object.keys(stationEvents);
      next.event =
        ids[(Math.floor(next.day / 5) - 1 + next.setup.seed) % ids.length];
      note(next, "站点有一项待办事件，请先作决定。");
    }
    if (
      !next.endless &&
      next.day >= 10 &&
      next.day <= 30 &&
      stationObjectives(next).every((item) => item.done) &&
      !shortage &&
      !next.event
    ) {
      next.outcome = "won";
      note(next, "站点通过了本次项目验收，获批长期运行。");
    } else if (!next.endless && next.day > 30) {
      next.outcome = "lost";
      note(next, "评估期结束，项目尚未完成，团队带着已有资料返回海面。");
    }
    if (next.day % 3 === 0 && !shortage)
      note(
        next,
        `今天供给正常。疲劳 ${s.fatigue}，生态 ${s.ecology}，声誉 ${s.reputation}。`,
      );
  } else {
    // Reuse the tested construction/research/staffing rules. New simulation owns time and policies.
    const base = legacy.stationAction(
      state as legacy.StationState,
      action as legacy.StationAction,
    );
    Object.assign(next, base, {
      actions: [...state.actions, action],
      systems: s,
    });
  }
  if (next.integrity <= 0 || next.morale <= 0 || next.shortageDays >= 3) {
    next.outcome = "lost";
    note(next, "生活保障已不足以继续运行，队员安全撤离。");
  }
  if (next.outcome) next.event = null;
  return next;
}
export function stationScore(state: StationState) {
  return (
    legacy.stationScore(state as legacy.StationState) +
    (state.systems
      ? state.systems.reputation * 2 +
        state.systems.ecology +
        state.systems.contracts.length * 80
      : 0)
  );
}
export function encodeStation(state: StationState) {
  return {
    version: state.systems ? 2 : 1,
    setup: state.setup,
    actions: state.actions,
  };
}
export function decodeStation(raw: unknown): StationState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as {
    version?: number;
    setup?: StationSetup;
    actions?: unknown[];
  };
  if (value.version === 1) {
    try {
      return legacy.decodeStation(raw);
    } catch {
      return null;
    }
  }
  if (
    value.version !== 2 ||
    !value.setup ||
    typeof value.setup.name !== "string" ||
    value.setup.name.length > 18 ||
    !["relaxed", "standard"].includes(value.setup.mode) ||
    !stationScenarios.some((item) => item.id === value.setup!.scenario) ||
    !stationGoals.some((item) => item.id === value.setup!.goal) ||
    !Number.isInteger(value.setup.seed) ||
    value.setup.seed < 0 ||
    value.setup.seed > 1000000 ||
    !Array.isArray(value.actions) ||
    value.actions.length > 4000
  )
    return null;
  let state = createStation(value.setup);
  try {
    for (const action of value.actions) {
      if (!action || typeof action !== "object" || Array.isArray(action))
        return null;
      const next = stationAction(state, action as StationAction);
      if (next === state) return null;
      state = next;
    }
  } catch {
    return null;
  }
  return state;
}
