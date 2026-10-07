export const STATION_KEY = "deepsea-game-station-v1";
export type RoomKind =
  | "core"
  | "reactor"
  | "oxygen"
  | "farm"
  | "lab"
  | "workshop"
  | "dock"
  | "quarters"
  | "beacon";
export type TechId =
  | "recycling"
  | "automation"
  | "sonar"
  | "pressure"
  | "network";
export type StationResource =
  | "credits"
  | "alloy"
  | "science"
  | "food"
  | "oxygen"
  | "energy";
export interface StationSetup {
  name: string;
  mode: "relaxed" | "standard";
  seed: number;
}
export interface Room {
  kind: RoomKind;
  level: number;
  workers: number;
  enabled: boolean;
}
export interface StationState {
  setup: StationSetup;
  day: number;
  resources: Record<StationResource, number>;
  integrity: number;
  morale: number;
  crew: number;
  rooms: (Room | null)[];
  techs: TechId[];
  completed: string[];
  mission: { id: string; remaining: number } | null;
  event: string | null;
  shortageDays: number;
  outcome: "won" | "lost" | null;
  endless: boolean;
  actions: StationAction[];
  log: { day: number; text: string }[];
}
export type StationAction =
  | { type: "build"; slot: number; kind: RoomKind }
  | { type: "workers"; slot: number; delta: 1 | -1 }
  | { type: "upgrade" | "demolish" | "toggle"; slot: number }
  | { type: "research"; id: TechId }
  | { type: "launch"; id: string }
  | { type: "resolve"; choice: "pay" | "adapt" }
  | { type: "trade"; item: "food" | "oxygen" | "alloy" }
  | { type: "repair" | "recruit" | "advance" | "continue" };
export interface RoomSpec {
  name: string;
  icon: string;
  text: string;
  credits: number;
  alloy: number;
  upkeep: number;
  power: number;
  output?: { resource: StationResource; amount: number };
  tech?: TechId;
}
export const roomSpecs: Record<RoomKind, RoomSpec> = {
  core: {
    name: "指挥舱",
    icon: "◎",
    text: "维持通讯与生活区，每日获得研究拨款。",
    credits: 0,
    alloy: 0,
    upkeep: 0,
    power: 6,
  },
  reactor: {
    name: "发电舱",
    icon: "ϟ",
    text: "每位工作人员每天产出 18 电能。",
    credits: 70,
    alloy: 20,
    upkeep: 2,
    power: 0,
    output: { resource: "energy", amount: 18 },
  },
  oxygen: {
    name: "制氧舱",
    icon: "◌",
    text: "每位工作人员每天产出 16 氧气，消耗 4 电能。",
    credits: 65,
    alloy: 18,
    upkeep: 2,
    power: 4,
    output: { resource: "oxygen", amount: 16 },
  },
  farm: {
    name: "水培舱",
    icon: "♧",
    text: "每位工作人员每天产出 12 食物，消耗 3 电能。",
    credits: 65,
    alloy: 18,
    upkeep: 2,
    power: 3,
    output: { resource: "food", amount: 12 },
  },
  lab: {
    name: "实验室",
    icon: "⚗",
    text: "每位工作人员每天产出 5 科研，消耗 4 电能。",
    credits: 85,
    alloy: 22,
    upkeep: 3,
    power: 4,
    output: { resource: "science", amount: 5 },
  },
  workshop: {
    name: "加工舱",
    icon: "⚒",
    text: "每位工作人员每天产出 8 合金，消耗 5 电能。",
    credits: 80,
    alloy: 20,
    upkeep: 3,
    power: 5,
    output: { resource: "alloy", amount: 8 },
  },
  dock: {
    name: "考察坞",
    icon: "⇄",
    text: "至少分配 1 人即可派出考察艇。每天消耗 2 电能。",
    credits: 95,
    alloy: 25,
    upkeep: 3,
    power: 2,
  },
  quarters: {
    name: "居住舱",
    icon: "⌂",
    text: "每级增加 3 人上限；每位值守人员每天提高 2 士气。",
    credits: 80,
    alloy: 20,
    upkeep: 2,
    power: 2,
  },
  beacon: {
    name: "观测阵列",
    icon: "⌁",
    text: "与海面建立长期观测网络。需要人员值守和稳定供电。",
    credits: 150,
    alloy: 50,
    upkeep: 5,
    power: 12,
    tech: "network",
  },
};
export const stationTechs: {
  id: TechId;
  name: string;
  text: string;
  credits: number;
  science: number;
  requires?: TechId[];
}[] = [
  {
    id: "recycling",
    name: "循环利用",
    text: "制氧与水培产出增加 25%。",
    credits: 60,
    science: 12,
  },
  {
    id: "sonar",
    name: "地形声呐",
    text: "解锁深海地形测绘考察。",
    credits: 80,
    science: 18,
  },
  {
    id: "automation",
    name: "自动控制",
    text: "除指挥舱外的用电减少 25%。",
    credits: 90,
    science: 25,
  },
  {
    id: "pressure",
    name: "耐压维护",
    text: "停止日常结构损耗，每次维修多恢复 10 点。",
    credits: 100,
    science: 30,
  },
  {
    id: "network",
    name: "海底观测网",
    text: "解锁观测阵列，准备建立长期站点。",
    credits: 140,
    science: 55,
    requires: ["sonar", "automation"],
  },
];
export const stationMissions: {
  id: string;
  name: string;
  text: string;
  days: number;
  credits: number;
  energy: number;
  tech?: TechId;
  reward: Partial<Record<StationResource, number>>;
  creature: string;
}[] = [
  {
    id: "snow",
    name: "海洋雪观测",
    text: "记录水层中的颗粒分布。",
    days: 2,
    credits: 30,
    energy: 10,
    reward: { credits: 80, science: 12 },
    creature: "vampire-squid",
  },
  {
    id: "vent",
    name: "热液区调查",
    text: "在群落外围做影像与环境记录。",
    days: 3,
    credits: 45,
    energy: 15,
    reward: { credits: 110, science: 20, alloy: 12 },
    creature: "pompeii-worm",
  },
  {
    id: "map",
    name: "深海地形测绘",
    text: "补齐站点周边的测深数据。",
    days: 3,
    credits: 55,
    energy: 20,
    tech: "sonar",
    reward: { credits: 130, science: 28 },
    creature: "sea-pig",
  },
];
export const stationEvents: Record<
  string,
  {
    title: string;
    text: string;
    payLabel: string;
    payCost: Partial<Record<StationResource, number>>;
    payResult: string;
    adaptLabel: string;
    adaptResult: string;
    adapt: {
      integrity?: number;
      morale?: number;
      resources?: Partial<Record<StationResource, number>>;
    };
  }
> = {
  seal: {
    title: "密封圈老化",
    text: "外部接口出现小渗漏。工程员建议换一组密封圈，也可以先隔离故障区。",
    payLabel: "更换密封圈",
    payCost: { alloy: 10 },
    payResult: "接口已修复，站点继续正常运作。",
    adaptLabel: "暂时隔离故障区",
    adaptResult: "渗漏被控制住，但站体受损 10 点，士气降低 3 点。",
    adapt: { integrity: -10, morale: -3 },
  },
  supply: {
    title: "补给船改期",
    text: "海面的风浪让补给船晚到一天。可以购买应急运输服务，或先调配站内储备。",
    payLabel: "安排应急运输",
    payCost: { credits: 30 },
    payResult: "补给按时抵达，储备不受影响。",
    adaptLabel: "使用站内储备",
    adaptResult: "额外消耗 12 食物，队员接受了临时安排。",
    adapt: { resources: { food: -12 }, morale: -2 },
  },
  visitors: {
    title: "来访的研究小组",
    text: "合作团队希望借用设备，交换一份新观测资料。接待需要一些经费，也可以婉拒。",
    payLabel: "接待研究小组",
    payCost: { credits: 25 },
    payResult: "交流带来 12 点科研，士气提高 4 点。",
    adaptLabel: "这次先谢绝",
    adaptResult: "你们约好等站点空闲一些再合作。",
    adapt: {},
  },
  flow: {
    title: "强水流经过站点",
    text: "水流增加了系留结构的负载。可以加固，也可以等待水流过去后再维修。",
    payLabel: "加固系留结构",
    payCost: { alloy: 12, energy: 8 },
    payResult: "站点经受住了水流，系留记录完整保存。",
    adaptLabel: "降低负载，等待水流过去",
    adaptResult: "结构损耗 12 点，电能消耗 8 点。",
    adapt: { integrity: -12, resources: { energy: -8 } },
  },
};
const resourceNames: Record<StationResource, string> = {
  credits: "经费",
  alloy: "合金",
  science: "科研",
  food: "食物",
  oxygen: "氧气",
  energy: "电能",
};
export const stationResourceNames = resourceNames;
export function stationCapacity(state: StationState) {
  return (
    6 +
    state.rooms.reduce(
      (sum, room) => sum + (room?.kind === "quarters" ? room.level * 3 : 0),
      0,
    )
  );
}
export function assignedWorkers(state: StationState) {
  return state.rooms.reduce((sum, room) => sum + (room?.workers || 0), 0);
}
export function storageCap(resource: StationResource) {
  return ["food", "oxygen", "energy"].includes(resource) ? 200 : 9999;
}
function affordable(
  state: StationState,
  cost: Partial<Record<StationResource, number>>,
) {
  for (const key of Object.keys(cost) as StationResource[])
    if (state.resources[key] < cost[key]!)
      return `${resourceNames[key]}不足（需要 ${cost[key]}）`;
  return null;
}
export function upgradeCost(room: Room) {
  const spec = roomSpecs[room.kind];
  return {
    credits: Math.ceil(spec.credits * room.level * 0.7),
    alloy: Math.ceil(spec.alloy * room.level * 0.7),
  };
}
export function createStation(setup: StationSetup): StationState {
  const rooms: (Room | null)[] = Array.from({ length: 12 }, () => null);
  rooms[5] = { kind: "core", level: 1, workers: 0, enabled: true };
  rooms[4] = { kind: "reactor", level: 1, workers: 1, enabled: true };
  rooms[1] = { kind: "oxygen", level: 1, workers: 1, enabled: true };
  rooms[9] = { kind: "farm", level: 1, workers: 1, enabled: true };
  return {
    setup: { ...setup, name: setup.name.trim().slice(0, 18) || "蓝湾站" },
    day: 1,
    resources: {
      credits: setup.mode === "relaxed" ? 340 : 260,
      alloy: setup.mode === "relaxed" ? 110 : 90,
      science: 0,
      food: 70,
      oxygen: 70,
      energy: 80,
    },
    integrity: 100,
    morale: 80,
    crew: 6,
    rooms,
    techs: [],
    completed: [],
    mission: null,
    event: null,
    shortageDays: 0,
    outcome: null,
    endless: false,
    actions: [],
    log: [
      {
        day: 1,
        text: "蓝湾站已接收。三座生活保障舱有人值守，先建实验室和考察坞吧。",
      },
    ],
  };
}
export function stationForecast(state: StationState) {
  const delta: Record<StationResource, number> = {
    credits: state.setup.mode === "relaxed" ? 36 : 30,
    alloy: 0,
    science: 0,
    food: -state.crew * 2,
    oxygen: -state.crew * 2,
    energy: -6,
  };
  let morale = -1;
  for (const room of state.rooms) {
    if (!room || room.kind === "core") continue;
    const spec = roomSpecs[room.kind];
    delta.credits -= spec.upkeep * room.level;
    if (!room.enabled || !room.workers) continue;
    delta.energy -= Math.ceil(
      spec.power *
        room.workers *
        room.level *
        (state.techs.includes("automation") ? 0.75 : 1),
    );
    if (spec.output) {
      const factor =
        state.techs.includes("recycling") &&
        ["farm", "oxygen"].includes(room.kind)
          ? 1.25
          : 1;
      delta[spec.output.resource] += Math.floor(
        spec.output.amount * room.workers * room.level * factor,
      );
    }
    if (room.kind === "quarters") morale += 2 * room.workers;
  }
  // Reactor output is available during the same day; an undersupplied grid throttles powered production.
  const shortPower = state.resources.energy + delta.energy < 0;
  if (shortPower) {
    for (const key of ["food", "oxygen", "science", "alloy"] as const)
      delta[key] = key === "food" || key === "oxygen" ? -state.crew * 2 : 0;
    morale -= 10;
  }
  return {
    delta,
    morale,
    shortPower,
    wear:
      state.techs.includes("pressure") || state.setup.mode === "relaxed"
        ? 0
        : 1,
  };
}
export function stationActionReason(
  state: StationState,
  action: StationAction,
): string | null {
  if (state.actions.length >= 4000)
    return "本局操作已达上限，请导出存档后开始新站点";
  if (state.outcome === "won" && action.type === "continue") return null;
  if (state.outcome) return "本局已经结束";
  if (state.event && action.type !== "resolve") return "请先处理待办事件";
  if (action.type === "build") {
    if (
      !Number.isInteger(action.slot) ||
      action.slot < 0 ||
      action.slot >= 12 ||
      state.rooms[action.slot] ||
      action.kind === "core" ||
      !Object.prototype.hasOwnProperty.call(roomSpecs, action.kind)
    )
      return "这个位置不能建造";
    const spec = roomSpecs[action.kind];
    if (spec.tech && !state.techs.includes(spec.tech))
      return "先研究海底观测网";
    if (
      !state.rooms.some(
        (room, index) =>
          room &&
          ((Math.floor(index / 4) === Math.floor(action.slot / 4) &&
            Math.abs(index - action.slot) === 1) ||
            Math.abs(index - action.slot) === 4),
      )
    )
      return "先选择与已有舱室相邻的空位";
    return affordable(state, { credits: spec.credits, alloy: spec.alloy });
  }
  if (
    action.type === "workers" ||
    action.type === "upgrade" ||
    action.type === "demolish" ||
    action.type === "toggle"
  ) {
    const room = Number.isInteger(action.slot)
      ? state.rooms[action.slot]
      : null;
    if (!room || room.kind === "core") return "指挥舱不能调整";
    if (action.type === "workers") {
      if (action.delta !== 1 && action.delta !== -1) return "无效人员调整";
      if (room.workers + action.delta < 0 || room.workers + action.delta > 2)
        return "每舱最多 2 人";
      if (action.delta > 0 && assignedWorkers(state) >= state.crew)
        return "没有空闲人员，请从其他舱调配或招募";
    }
    if (action.type === "upgrade") {
      if (room.level >= 3) return "已达三级";
      return affordable(state, upgradeCost(room));
    }
    if (action.type === "demolish") {
      const remaining = state.rooms.map((item, index) =>
        index === action.slot ? null : item,
      );
      const seen = new Set<number>([5]);
      const queue = [5];
      while (queue.length) {
        const current = queue.shift()!;
        remaining.forEach((item, index) => {
          if (
            item &&
            !seen.has(index) &&
            (Math.abs(index - current) === 4 ||
              (Math.floor(index / 4) === Math.floor(current / 4) &&
                Math.abs(index - current) === 1))
          ) {
            seen.add(index);
            queue.push(index);
          }
        });
      }
      if (seen.size !== remaining.filter(Boolean).length)
        return "这座舱室连接着其他舱室，不能拆除";
      if (
        room.kind === "quarters" &&
        stationCapacity(state) - room.level * 3 < state.crew
      )
        return "剩余床位不足，暂时不能拆除";
      if (
        room.kind === "dock" &&
        state.mission &&
        !remaining.some((item) => item?.kind === "dock")
      )
        return "考察艇尚未返回，不能拆除最后一座考察坞";
    }
    return null;
  }
  if (action.type === "research") {
    const tech = stationTechs.find((item) => item.id === action.id);
    if (!tech || state.techs.includes(action.id)) return "研究已经完成";
    if (
      !state.rooms.some(
        (room) => room?.kind === "lab" && room.enabled && room.workers,
      )
    )
      return "需要有人值守的实验室";
    if (tech.requires?.some((id) => !state.techs.includes(id)))
      return "先完成地形声呐与自动控制";
    return affordable(state, { credits: tech.credits, science: tech.science });
  }
  if (action.type === "launch") {
    const mission = stationMissions.find((item) => item.id === action.id);
    if (!mission) return "考察不存在";
    if (state.mission) return "考察艇还未返回";
    if (
      !state.rooms.some(
        (room) => room?.kind === "dock" && room.enabled && room.workers,
      )
    )
      return "考察坞需要至少 1 人值守";
    if (mission.tech && !state.techs.includes(mission.tech))
      return "先研究地形声呐";
    if (state.integrity < 35 || state.morale < 25)
      return "先将结构恢复到 35、士气恢复到 25";
    return affordable(state, {
      credits: mission.credits,
      energy: mission.energy,
    });
  }
  if (action.type === "resolve") {
    if (
      !state.event ||
      !stationEvents[state.event] ||
      !["pay", "adapt"].includes(action.choice)
    )
      return "没有待办事件";
    return action.choice === "pay"
      ? affordable(state, stationEvents[state.event].payCost)
      : null;
  }
  if (action.type === "repair")
    return state.integrity >= 100
      ? "结构完好，无需维修"
      : affordable(state, { credits: 20, alloy: 8 });
  if (action.type === "recruit") {
    if (state.crew >= stationCapacity(state))
      return "床位已满，先建造或升级居住舱";
    return affordable(state, { credits: 60, food: 10 });
  }
  if (action.type === "trade") {
    if (!["food", "oxygen", "alloy"].includes(action.item)) return "补给不存在";
    if (state.resources[action.item] >= storageCap(action.item))
      return "储备已满";
    return affordable(state, { credits: action.item === "alloy" ? 35 : 25 });
  }
  return action.type === "advance" ? null : "无效操作";
}
function log(state: StationState, text: string) {
  state.log.push({ day: state.day, text });
  state.log = state.log.slice(-60);
}
function changeResources(
  state: StationState,
  delta: Partial<Record<StationResource, number>>,
  sign = 1,
) {
  for (const key of Object.keys(delta) as StationResource[])
    state.resources[key] = Math.max(
      0,
      Math.min(storageCap(key), state.resources[key] + delta[key]! * sign),
    );
}
function missionStationReady(state: StationState) {
  return (
    state.rooms.some(
      (room) => room?.kind === "beacon" && room.enabled && room.workers > 0,
    ) &&
    state.integrity >= 65 &&
    state.morale >= 40 &&
    state.resources.oxygen >= 30 &&
    state.resources.food >= 30 &&
    state.resources.energy >= 20
  );
}
export function stationAction(
  state: StationState,
  action: StationAction,
): StationState {
  if (stationActionReason(state, action)) return state;
  const next: StationState = {
    ...state,
    resources: { ...state.resources },
    rooms: state.rooms.map((room) => (room ? { ...room } : null)),
    techs: [...state.techs],
    completed: [...state.completed],
    mission: state.mission ? { ...state.mission } : null,
    log: [...state.log],
    actions: [...state.actions, { ...action }],
  };
  if (action.type === "build") {
    const spec = roomSpecs[action.kind];
    changeResources(next, { credits: spec.credits, alloy: spec.alloy }, -1);
    next.rooms[action.slot] = {
      kind: action.kind,
      level: 1,
      workers: 0,
      enabled: true,
    };
    log(next, `${spec.name}建造完成，分配人员后开始工作。`);
  }
  if (action.type === "workers")
    next.rooms[action.slot]!.workers += action.delta;
  if (action.type === "toggle")
    next.rooms[action.slot]!.enabled = !next.rooms[action.slot]!.enabled;
  if (action.type === "upgrade") {
    const room = next.rooms[action.slot]!;
    changeResources(next, upgradeCost(room), -1);
    room.level++;
    log(
      next,
      `${roomSpecs[room.kind].name}升至 ${room.level} 级。产出与用电一起增加。`,
    );
  }
  if (action.type === "demolish") {
    const room = next.rooms[action.slot]!;
    const spec = roomSpecs[room.kind];
    changeResources(next, {
      credits: Math.floor(spec.credits * 0.4),
      alloy: Math.floor(spec.alloy * 0.4),
    });
    next.rooms[action.slot] = null;
    log(next, `${spec.name}已拆除，收回基础造价的 40%，人员回到空闲队列。`);
  }
  if (action.type === "research") {
    const tech = stationTechs.find((item) => item.id === action.id)!;
    changeResources(next, { credits: tech.credits, science: tech.science }, -1);
    next.techs.push(action.id);
    log(next, `${tech.name}研究完成。`);
  }
  if (action.type === "launch") {
    const mission = stationMissions.find((item) => item.id === action.id)!;
    changeResources(
      next,
      { credits: mission.credits, energy: mission.energy },
      -1,
    );
    next.mission = { id: action.id, remaining: mission.days };
    log(next, `考察艇出发：${mission.name}，${mission.days} 天后返回。`);
  }
  if (action.type === "repair") {
    changeResources(next, { credits: 20, alloy: 8 }, -1);
    next.integrity = Math.min(
      100,
      next.integrity + (next.techs.includes("pressure") ? 35 : 25),
    );
    log(next, "维护组完成站体维修。");
  }
  if (action.type === "recruit") {
    changeResources(next, { credits: 60, food: 10 }, -1);
    next.crew++;
    log(next, "新队员抵达。记得安排岗位，生活供给每天多消耗 2 点。");
  }
  if (action.type === "trade") {
    changeResources(next, { credits: action.item === "alloy" ? 35 : 25 }, -1);
    changeResources(next, { [action.item]: action.item === "alloy" ? 20 : 30 });
    log(next, `${resourceNames[action.item]}补给已经入库。`);
  }
  if (action.type === "continue") {
    next.outcome = null;
    next.endless = true;
    log(next, "长期站点已经获批，进入自由经营。");
  }
  if (action.type === "resolve") {
    const event = stationEvents[next.event!];
    if (action.choice === "pay") {
      changeResources(next, event.payCost, -1);
      if (next.event === "visitors") {
        changeResources(next, { science: 12 });
        next.morale = Math.min(100, next.morale + 4);
      }
      log(next, event.payResult);
    } else {
      changeResources(next, event.adapt.resources || {});
      next.integrity = Math.max(
        0,
        next.integrity + (event.adapt.integrity || 0),
      );
      next.morale = Math.max(0, next.morale + (event.adapt.morale || 0));
      log(next, event.adaptResult);
    }
    next.event = null;
  }
  if (action.type === "advance") {
    const forecast = stationForecast(state);
    next.day++;
    changeResources(next, forecast.delta);
    next.integrity = Math.max(
      0,
      next.integrity - forecast.wear - (forecast.shortPower ? 6 : 0),
    );
    next.morale = Math.max(0, Math.min(100, next.morale + forecast.morale));
    const shortage =
      next.resources.oxygen <= 0 ||
      next.resources.food <= 0 ||
      forecast.shortPower;
    next.shortageDays = shortage ? next.shortageDays + 1 : 0;
    if (shortage) {
      next.morale = Math.max(0, next.morale - 8);
      next.integrity = Math.max(0, next.integrity - 5);
      log(
        next,
        `供给不足（第 ${next.shortageDays} 天）。连续 3 天将撤离站点，请补给、调岗或停用耗电舱。`,
      );
    }
    if (next.mission) {
      next.mission.remaining--;
      if (next.mission.remaining <= 0) {
        const mission = stationMissions.find(
          (item) => item.id === next.mission!.id,
        )!;
        changeResources(next, mission.reward);
        if (!next.completed.includes(mission.id))
          next.completed.push(mission.id);
        next.morale = Math.min(100, next.morale + 5);
        log(next, `${mission.name}考察完成，奖励已经入库。`);
        next.mission = null;
      }
    }
    if (next.day % 5 === 0) {
      const eventIds = Object.keys(stationEvents);
      next.event =
        eventIds[
          (Math.floor(next.day / 5) - 1 + next.setup.seed) % eventIds.length
        ];
      log(next, "站点有一项待办事件，需要你作决定。");
    }
    if (!shortage && next.day % 3 === 0)
      log(next, "今天的值守结束，站内供给正常。");
    if (
      !next.endless &&
      next.day >= 30 &&
      !(next.completed.length === 3 && missionStationReady(next))
    ) {
      next.outcome = "lost";
      log(next, "30 天评估期结束，站点尚未达到长期运行要求，团队按计划撤离。");
    }
    if (
      !next.endless &&
      next.day >= 10 &&
      next.completed.length === 3 &&
      missionStationReady(next) &&
      !shortage
    ) {
      next.outcome = "won";
      next.event = null;
      log(next, "三项考察和观测阵列通过验收。蓝湾站成为长期观测站！");
    }
  }
  if (next.integrity <= 0 || next.morale <= 0 || next.shortageDays >= 3) {
    next.outcome = "lost";
    next.event = null;
    log(next, "生活保障已不足以继续运行，队员安全撤离。本局结束。");
  }
  if (next.outcome) next.event = null;
  return next;
}
export function stationScore(state: StationState) {
  return (
    state.completed.length * 300 +
    state.techs.length * 100 +
    state.integrity * 2 +
    state.morale +
    (state.outcome === "won" || state.endless
      ? Math.max(0, 31 - state.day) * 20 + 500
      : 0)
  );
}
export function encodeStation(state: StationState) {
  return { version: 1, setup: state.setup, actions: state.actions };
}
export function decodeStation(raw: unknown): StationState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as {
    version?: unknown;
    setup?: Partial<StationSetup>;
    actions?: unknown;
  };
  if (
    value.version !== 1 ||
    !value.setup ||
    typeof value.setup.name !== "string" ||
    value.setup.name.length > 18 ||
    !["relaxed", "standard"].includes(value.setup.mode || "") ||
    !Number.isInteger(value.setup.seed) ||
    value.setup.seed! < 0 ||
    value.setup.seed! > 1000000 ||
    !Array.isArray(value.actions) ||
    value.actions.length > 4000
  )
    return null;
  let state = createStation(value.setup as StationSetup);
  for (const action of value.actions) {
    if (!action || typeof action !== "object" || Array.isArray(action))
      return null;
    const next = stationAction(state, action as StationAction);
    if (next === state) return null;
    state = next;
  }
  return state;
}
