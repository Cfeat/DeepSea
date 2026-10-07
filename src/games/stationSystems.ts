import {
  stationEvents as oldEvents,
  stationMissions as oldMissions,
  type StationResource,
  type TechId,
} from "./stationLegacy";
export const stationScenarios = [
  {
    id: "bay",
    name: "蓝湾盆地",
    text: "海况较温和。适合先熟悉排班、供电和考察。",
    depth: 2400,
  },
  {
    id: "vent",
    name: "热液边缘",
    text: "热源位置的发电加成更高，日常结构损耗也更多。",
    depth: 3180,
  },
  {
    id: "ridge",
    name: "海岭侧翼",
    text: "科研产出 +20%，强流和风暴的结构负载更大。",
    depth: 2860,
  },
] as const;
export const stationGoals = [
  {
    id: "network",
    name: "观测网络",
    text: "完成三项基础考察，让阵列连续运行三天。",
  },
  {
    id: "habitat",
    name: "海底家园",
    text: "接纳九名队员，建好居住区，保持高士气与稳定供给。",
  },
  {
    id: "conservation",
    name: "低扰动研究",
    text: "调查五处海域，保持生态状态，建立长期观测网。",
  },
] as const;
export const shiftSpecs = [
  { id: "normal", name: "正常轮班", text: "标准产出；空闲人员可轮休" },
  { id: "overtime", name: "临时加班", text: "产出 +30%；疲劳 +10、士气 −2/天" },
  { id: "rest", name: "轮休检修", text: "产出 −20%；疲劳 −10、士气 +2/天" },
] as const;
export const rationSpecs = [
  { id: "normal", name: "正常伙食", text: "每人每天 2 食物" },
  { id: "limited", name: "短期配给", text: "食耗 −30%；士气 −2、疲劳 +2/天" },
  { id: "generous", name: "改善伙食", text: "食耗 +40%；士气 +2、疲劳 −1/天" },
] as const;
export const prioritySpecs = [
  { id: "life", name: "生活优先", text: "制氧、水培、居住先供电" },
  { id: "research", name: "科研优先", text: "生活保障后优先实验室与阵列" },
  { id: "industry", name: "加工优先", text: "生活保障后优先加工舱与考察坞" },
] as const;
export const approachSpecs = [
  {
    id: "careful",
    name: "谨慎观测",
    text: "多用 1 天、风险 −15%、额外科研 +4，生态 +1",
  },
  { id: "normal", name: "常规考察", text: "按预计航程执行，生态 −1" },
  {
    id: "salvage",
    name: "加急回收",
    text: "少用 1 天、风险 +18%、额外合金 +18，生态 −6",
  },
] as const;
export type ShiftId = (typeof shiftSpecs)[number]["id"];
export type RationId = (typeof rationSpecs)[number]["id"];
export type PriorityId = (typeof prioritySpecs)[number]["id"];
export type ApproachId = (typeof approachSpecs)[number]["id"];
export type ScenarioId = (typeof stationScenarios)[number]["id"];
export type GoalId = (typeof stationGoals)[number]["id"];
export interface MissionSpec {
  id: string;
  name: string;
  text: string;
  days: number;
  credits: number;
  energy: number;
  tech?: TechId;
  reward: Partial<Record<StationResource, number>>;
  creature: string;
  risk: number;
  dock: number;
  depth: number;
}
export const stationMissions: MissionSpec[] = [
  ...oldMissions.map((item, index) => ({
    ...item,
    risk: [8, 20, 15][index],
    dock: 1,
    depth: [800, 3180, 2800][index],
  })),
  {
    id: "wreck",
    name: "旧设备回收",
    text: "回收沉底的旧观测模块，补充建设材料。",
    days: 3,
    credits: 45,
    energy: 18,
    reward: { credits: 80, alloy: 38, science: 10 },
    creature: "giant-isopod",
    risk: 22,
    dock: 1,
    depth: 1900,
  },
  {
    id: "seep",
    name: "深海群落调查",
    text: "比较底栖群落与周围沉积物的环境数据。",
    days: 4,
    credits: 60,
    energy: 22,
    tech: "pressure",
    reward: { credits: 135, science: 32 },
    creature: "dumbo-octopus",
    risk: 27,
    dock: 2,
    depth: 3500,
  },
  {
    id: "trench",
    name: "海沟边缘航线",
    text: "沿预先测绘的路线布设自动观测器。",
    days: 5,
    credits: 75,
    energy: 28,
    tech: "sonar",
    reward: { credits: 170, science: 42, alloy: 15 },
    creature: "amphipod",
    risk: 35,
    dock: 2,
    depth: 6000,
  },
];
export const weatherSpecs = {
  calm: {
    name: "平静海况",
    text: "设施按正常效率运行，补给价格正常。",
    power: 1,
    food: 1,
    wear: 0,
    risk: 0,
    price: 1,
  },
  current: {
    name: "强流经过",
    text: "发电效率 −10%，结构额外损耗 1，考察风险 +10%。",
    power: 0.9,
    food: 1,
    wear: 1,
    risk: 10,
    price: 1,
  },
  silt: {
    name: "悬浮颗粒增多",
    text: "水培效率 −15%，考察风险 +6%。",
    power: 1,
    food: 0.85,
    wear: 0,
    risk: 6,
    price: 1,
  },
  storm: {
    name: "海面风暴",
    text: "结构额外损耗 2，考察风险 +20%，应急补给涨价 50%。",
    power: 1,
    food: 1,
    wear: 2,
    risk: 20,
    price: 1.5,
  },
};
export type WeatherId = keyof typeof weatherSpecs;
interface EventSpec {
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
export const stationEvents: Record<string, EventSpec> = {
  ...oldEvents,
  heat: {
    title: "设备散热吃紧",
    text: "加工舱附近的冷却回路负载偏高。队员建议更换冷却介质，或让部分设备轮流停机。",
    payLabel: "更换冷却介质",
    payCost: { credits: 28, alloy: 6 },
    payResult: "冷却回路恢复正常。",
    adaptLabel: "安排停机检查",
    adaptResult: "检查增加疲劳 8 点，士气降低 3 点。",
    adapt: { morale: -3 },
  },
  survey: {
    title: "邻站求助",
    text: "邻站有一组观测器无法定位，想借用你们的地形数据。可以派艇协助，也可以把记录发过去。",
    payLabel: "派艇协助定位",
    payCost: { energy: 12, credits: 20 },
    payResult: "协作带来 16 科研和 8 声誉。",
    adaptLabel: "先共享现有记录",
    adaptResult: "邻站收到了资料，声誉提高 2 点。",
    adapt: {},
  },
};
export const contractSpecs = [
  {
    id: "materials",
    name: "观测架材料",
    text: "交付 32 合金，支持邻站安装新的观测架。",
    days: 5,
    cost: { alloy: 32 },
    reward: { credits: 115, science: 8 },
    reputation: 8,
  },
  {
    id: "data",
    name: "跨站数据校对",
    text: "交付 24 科研，整理一份可复核的环境记录。",
    days: 5,
    cost: { science: 24 },
    reward: { credits: 135, alloy: 12 },
    reputation: 10,
  },
  {
    id: "food",
    name: "临时伙食支援",
    text: "交付 45 食物，帮助换班中的合作团队。",
    days: 4,
    cost: { food: 45 },
    reward: { credits: 95, science: 6 },
    reputation: 7,
  },
  {
    id: "reserve",
    name: "生命保障备件",
    text: "交付 30 氧气与 12 合金，为下一航次准备储备。",
    days: 6,
    cost: { oxygen: 30, alloy: 12 },
    reward: { credits: 110, science: 10 },
    reputation: 8,
  },
] as const;
export interface StationSystems {
  fatigue: number;
  ecology: number;
  reputation: number;
  shift: ShiftId;
  ration: RationId;
  priority: PriorityId;
  approach: ApproachId;
  stableDays: number;
  beaconDays: number;
  totalScience: number;
  totalAlloy: number;
  trips: Record<string, number>;
  milestones: string[];
  missionPlan: { approach: ApproachId; risk: number; roll: number } | null;
  report: { id: string; approach: ApproachId } | null;
  contract: { id: string; deadline: number; cycle: number } | null;
  contracts: string[];
  offersTaken: string[];
}
