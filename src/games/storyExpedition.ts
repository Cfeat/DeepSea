import { storyNodes, type StoryChoice } from "./storyLegacy";

export type StorySiteId =
  | "buoy"
  | "ridge"
  | "refuge"
  | "drift"
  | "wreck"
  | "whale"
  | "station"
  | "vent"
  | "well";
export type TravelStyle = "quiet" | "steady" | "fast";
export type CargoId = "oxygen" | "battery" | "plate";
export type EvidenceId = "maintenance" | "sensor" | "wear";
export interface ExpeditionChoice extends StoryChoice {
  evidence?: EvidenceId;
  cargo?: CargoId;
  stress?: number;
  chance?: number;
  failure?: string;
  failureCost?: { hull?: number; trust?: number; stress?: number };
  needs?: string;
}
export interface StorySite {
  id: StorySiteId;
  title: string;
  depth: number;
  chapter: number;
  speaker: string;
  paragraphs: string[];
  links: StorySiteId[];
  choices: ExpeditionChoice[];
  creature?: string;
  topic?: string;
  x: number;
  y: number;
}
function prose(id: string) {
  return storyNodes.find((node) => node.id === id)!.paragraphs;
}
export const storyGoals = [
  {
    id: "rescue",
    name: "先把人带回来",
    text: "找到林岑、解除系留，带着她的证词返航。",
  },
  {
    id: "research",
    name: "完成一次调查",
    text: "留下三类观察，带回井底档案；不必把所有谜团都解开。",
  },
  {
    id: "truth",
    name: "查清失联原因",
    text: "救援、热液观测、证据比对和原始档案，缺一不可。",
  },
] as const;
export const travelStyles: {
  id: TravelStyle;
  name: string;
  oxygen: number;
  battery: number;
  risk: number;
  text: string;
}[] = [
  {
    id: "quiet",
    name: "低速航行",
    oxygen: 6,
    battery: 2,
    risk: 0,
    text: "省电、风险低，耗氧更多",
  },
  {
    id: "steady",
    name: "常速航行",
    oxygen: 4,
    battery: 4,
    risk: 12,
    text: "速度与耗能均衡",
  },
  {
    id: "fast",
    name: "快速航行",
    oxygen: 2,
    battery: 8,
    risk: 28,
    text: "省氧，但电耗与碰撞风险高",
  },
];
export const cargoSpecs: Record<
  CargoId,
  {
    name: string;
    text: string;
    gain: { oxygen?: number; battery?: number; hull?: number };
  }
> = {
  oxygen: {
    name: "应急氧气",
    text: "氧气 +22，使用后腾出一个货位",
    gain: { oxygen: 22 },
  },
  battery: {
    name: "电池模块",
    text: "电量 +22，使用后腾出一个货位",
    gain: { battery: 22 },
  },
  plate: {
    name: "修补材料",
    text: "船体 +20，使用后腾出一个货位",
    gain: { hull: 20 },
  },
};
export const evidenceSpecs: Record<
  EvidenceId,
  { title: string; text: string }
> = {
  maintenance: {
    title: "检修时序",
    text: "02:14，继电器开始频繁复位；02:17，人工断电测试期间，敲击声也停止了。检修员把这两件事写在同一行。",
  },
  sensor: {
    title: "原始监听",
    text: "脉冲间隔固定为 5.2 秒，恰好与继电器复位周期相同。人工断电的三分钟里，温度与水流仍有记录，脉冲却没有了。",
  },
  wear: {
    title: "缆线磨痕",
    text: "缆线护套破损，裸露的接口出现短路。裂口的温度变化并不与脉冲同步。落石也没有按固定节奏发生。",
  },
};
export const storySites: StorySite[] = [
  {
    id: "buoy",
    title: "导航浮标",
    depth: 420,
    chapter: 1,
    speaker: "许舟 · 母船通讯",
    x: 50,
    y: 8,
    paragraphs: [
      ...prose("twilight"),
      "导航屏上有两条通道：右侧回波更近，左侧可以沿观测浮标下潜。现在起，航线由你来定；走过的路可以折返。",
    ],
    links: ["ridge", "drift"],
    creature: "vampire-squid",
    topic: "marine-snow",
    choices: [
      {
        id: "observe",
        label: "停下来记录海洋雪",
        hint: "氧气 −4 · 电量 −2 · 信任 +4",
        cost: { oxygen: 4, battery: 2 },
        gain: { trust: 4 },
        record: "snow",
        result: "碎屑缓慢下沉。你把动物与颗粒的位置一起记进观察册。",
      },
      {
        id: "listen",
        label: "听完应急频道的残余录音",
        hint: "氧气 −2 · 标记失联潜器",
        cost: { oxygen: 2 },
        flag: "located",
        result: "林岑的呼号夹在静电里。岩壁下的避流处被标在航线上。",
      },
    ],
  },
  {
    id: "ridge",
    title: "回波岩壁",
    depth: 850,
    chapter: 2,
    speaker: "阿澈 · 副驾驶",
    x: 76,
    y: 22,
    paragraphs: prose("signal"),
    links: ["buoy", "refuge", "wreck"],
    choices: [
      {
        id: "scan",
        label: "用声呐确认林岑的位置",
        hint: "需要声呐 · 氧气 −2 · 电量 −3 · 信任 +6",
        gear: "sonar",
        cost: { oxygen: 2, battery: 3 },
        flag: "located",
        gain: { trust: 6 },
        result: "岩壁下有一艘小潜器，系留缆被压在落石下面。",
      },
      {
        id: "search",
        label: "贴近岩壁，用灯搜索",
        hint: "氧气 −4 · 电量 −2 · 船体 −6",
        cost: { oxygen: 4, battery: 2, hull: 6 },
        flag: "located",
        result: "灯光照到她举起来的手。阿澈一边报距离，一边让你往外退。",
      },
      {
        id: "chart",
        label: "补齐背流航线的地形图",
        hint: "氧气 −4 · 电量 −3 · 此后航行电耗 −1",
        cost: { oxygen: 4, battery: 3 },
        flag: "charted",
        result:
          "背流通道的落石位置已标清。下次经过时，不必一直开着推进器试探。",
      },
    ],
  },
  {
    id: "refuge",
    title: "被困的潜器",
    depth: 1080,
    chapter: 2,
    speaker: "林岑 · 应急频率",
    x: 94,
    y: 36,
    paragraphs: [
      ...prose("rescue"),
      "她的备用供电撑不了太久。航行时刻达到 20 之前，需要完成救援。",
    ],
    links: ["ridge", "station"],
    choices: [
      {
        id: "arm",
        label: "用机械臂松开系留缆",
        hint: "需要机械臂 · 氧气 −5 · 电量 −5",
        gear: "arm",
        cost: { oxygen: 5, battery: 5 },
        flag: "rescued",
        gain: { trust: 12 },
        record: "signal",
        result: "缆线松开了。林岑启用备用浮力，并把主井图像和证词传了过来。",
      },
      {
        id: "repair",
        label: "修好切割器的供电接口",
        hint: "需要工具箱 · 氧气 −5 · 电量 −4",
        gear: "medkit",
        cost: { oxygen: 5, battery: 4 },
        flag: "rescued",
        gain: { trust: 12 },
        record: "signal",
        result: "切割器重新启动。林岑切断系留缆，传回了主井旁的变化记录。",
      },
      {
        id: "tow",
        label: "试着用潜器拖开落石",
        hint: "氧气 −6 · 电量 −6 · 成功率随信任变化",
        cost: { oxygen: 6, battery: 6 },
        flag: "rescued",
        record: "signal",
        gain: { trust: 8 },
        chance: 72,
        failureCost: { hull: 12, stress: 15 },
        failure:
          "落石滑了一下，没能拖开。外壳受损，但她仍在回应；换一种方法，或再试一次。",
        result:
          "落石终于滚离缆线。林岑脱困，第一句话是：“回程我自己来。你们看好剩下的储备。”",
      },
      {
        id: "relay",
        label: "把位置交给母船，保留调查时间",
        hint: "电量 −2 · 本次无法完成亲自救援目标",
        cost: { battery: 2 },
        flag: "relay",
        result: "母船接手救援。林岑还来得及提醒你：主井下的记录器有独立供电。",
      },
    ],
  },
  {
    id: "drift",
    title: "发光水层",
    depth: 1450,
    chapter: 3,
    speaker: "许舟 · 航线校正",
    x: 22,
    y: 27,
    paragraphs: prose("lights"),
    links: ["buoy", "wreck", "whale"],
    creature: "pacific-viperfish",
    choices: [
      {
        id: "film",
        label: "调暗探照灯，记录发光动物",
        hint: "氧气 −4 · 电量 −3 · 紧张 −5",
        cost: { oxygen: 4, battery: 3 },
        record: "light",
        stress: -5,
        result: "亮点在光束边缘停了一会儿。许舟提醒你，发光不是导航信号。",
      },
      {
        id: "route",
        label: "校对浮标，标出一条返航捷径",
        hint: "氧气 −4 · 电量 −4 · 返航少耗 4 氧气",
        cost: { oxygen: 4, battery: 4 },
        flag: "shortcut",
        result:
          "两处浮标之间可以直接通过。它只适合上浮使用，坐标已保存在日志里。",
      },
      {
        id: "calm",
        label: "停下推进，和搭档核对仪表",
        hint: "氧气 −3 · 紧张 −18 · 信任 +5",
        cost: { oxygen: 3 },
        stress: -18,
        gain: { trust: 5 },
        result: "你们把不必要的报警声音关小，重新核对各自负责的仪表。",
      },
    ],
  },
  {
    id: "wreck",
    title: "废弃中继舱",
    depth: 1900,
    chapter: 3,
    speaker: "阿澈 · 旧设施检修",
    x: 61,
    y: 43,
    paragraphs: [
      "旧中继舱倾斜地靠在岩壁上。标签上的站名已经褪色，但物资箱仍锁在货架里。机柜旁有一本防水检修册。",
      "留下多久、带走什么，都需要算一算。潜器只有四个货位；资料扫描不占货位。",
    ],
    links: ["ridge", "drift", "station"],
    choices: [
      {
        id: "log",
        label: "扫描旧检修册",
        hint: "氧气 −3 · 电量 −2 · 获得证据：检修时序",
        cost: { oxygen: 3, battery: 2 },
        evidence: "maintenance",
        result: "你注意到断电测试与敲击声停止的时刻，似乎对得上。",
      },
      {
        id: "oxygen",
        label: "取走应急氧气",
        hint: "氧气 −3 · 电量 −2 · 占用一个货位",
        cost: { oxygen: 3, battery: 2 },
        cargo: "oxygen",
        result: "氧气模块装上外部货架，状态灯正常。",
      },
      {
        id: "battery",
        label: "回收备用电池",
        hint: "氧气 −3 · 电量 −2 · 占用一个货位",
        cost: { oxygen: 3, battery: 2 },
        cargo: "battery",
        result: "阿澈检查完接口，把电池固定在了货架上。",
      },
      {
        id: "plate",
        label: "拆下一组修补材料",
        hint: "氧气 −3 · 电量 −2 · 占用一个货位",
        cost: { oxygen: 3, battery: 2 },
        cargo: "plate",
        result: "这组材料可以修补一次外壳。你把松动的零件留在原位。",
      },
    ],
  },
  {
    id: "whale",
    title: "鲸骨斜坡",
    depth: 2450,
    chapter: 3,
    speaker: "海底 · 泥质斜坡",
    x: 15,
    y: 49,
    paragraphs: prose("whale"),
    links: ["drift", "station", "vent"],
    topic: "whale-fall",
    choices: [
      {
        id: "record",
        label: "悬停记录鲸骨与周围群落",
        hint: "氧气 −4 · 电量 −2 · 信任 +5",
        cost: { oxygen: 4, battery: 2 },
        gain: { trust: 5 },
        record: "whale",
        result:
          "你没有落在骨架上。沉积物保持清澈，影像里的小动物也没有被驱散。",
      },
      {
        id: "mark",
        label: "沿旧缆线寻找井口方向",
        hint: "氧气 −3 · 电量 −2 · 标记主井",
        cost: { oxygen: 3, battery: 2 },
        flag: "well-known",
        result: "旧缆从鲸骨外侧穿过，一直向裂口下方延伸。主井坐标有了。",
      },
    ],
  },
  {
    id: "station",
    title: "回声观测站",
    depth: 2860,
    chapter: 4,
    speaker: "回声站 · 外部维护口",
    x: 59,
    y: 65,
    paragraphs: [
      ...prose("station"),
      "检修屏上有三种失联原因待核实。拿到两份能互相印证的证据后，可以在证据页提交判断。",
    ],
    links: ["refuge", "wreck", "whale", "vent", "well"],
    choices: [
      {
        id: "charge",
        label: "借维护口充电",
        hint: "氧气 −6 · 电量 +28 · 仅一次",
        cost: { oxygen: 6 },
        gain: { battery: 28 },
        result: "充电完成。剩余供电留给了观测站的温度和流速仪。",
      },
      {
        id: "patch",
        label: "使用站内材料修补外壳",
        hint: "氧气 −5 · 电量 −2 · 船体 +22 · 仅一次",
        cost: { oxygen: 5, battery: 2 },
        gain: { hull: 22 },
        result: "阿澈确认裂口封住了。受损支架仍需要在回船后更换。",
      },
      {
        id: "sensor",
        label: "下载原始监听与环境数据",
        hint: "氧气 −4 · 电量 −3 · 获得证据：原始监听",
        cost: { oxygen: 4, battery: 3 },
        evidence: "sensor",
        result: "监听里有一段三分钟的安静。温度与流速仪在这段时间仍正常工作。",
      },
      {
        id: "rest",
        label: "停靠休息，让搭档检查航线",
        hint: "氧气 −4 · 紧张 −22 · 信任 +5",
        cost: { oxygen: 4 },
        stress: -22,
        gain: { trust: 5 },
        result: "阿澈把水杯递过来。你们约好了回程时谁看导航、谁盯储备。",
      },
    ],
  },
  {
    id: "vent",
    title: "新生热液裂口",
    depth: 3180,
    chapter: 4,
    speaker: "许舟 · 等待观测",
    x: 27,
    y: 79,
    paragraphs: prose("vent"),
    links: ["whale", "station", "well"],
    creature: "giant-tube-worm",
    topic: "vents",
    choices: [
      {
        id: "observe",
        label: "在群落外围记录环境与影像",
        hint: "氧气 −5 · 电量 −4 · 信任 +10",
        cost: { oxygen: 5, battery: 4 },
        record: "vent",
        flag: "careful",
        gain: { trust: 10 },
        result:
          "影像、温度和位置都有了。许舟终于不用对着一张没有上下文的照片猜测。",
      },
      {
        id: "cable",
        label: "检查旧缆与电气接口",
        hint: "氧气 −4 · 电量 −3 · 标记主井 · 获得磨痕证据",
        cost: { oxygen: 4, battery: 3 },
        evidence: "wear",
        flag: "well-known",
        result:
          "护套破损处露出旧导线。短路和机械摩擦都有痕迹，得与监听记录对照。",
      },
      {
        id: "sample",
        label: "近距离取样，补充一份研究材料",
        hint: "需要机械臂 · 氧气 −5 · 电量 −5 · 信任 −8 · 船体 −6",
        gear: "arm",
        cost: { oxygen: 5, battery: 5, hull: 6 },
        gain: { trust: -8 },
        flag: "sample",
        result:
          "样品取得了，但推进器扬起了沉积物。许舟要求你把这次扰动也写进报告。",
      },
    ],
  },
  {
    id: "well",
    title: "主井记录器",
    depth: 3540,
    chapter: 5,
    speaker: "阿澈 · 外部支架监控",
    x: 72,
    y: 94,
    paragraphs: [
      "记录器还在供电，隔着一根绷紧的旧缆，状态灯每五秒左右闪一次。日志有两层：基础观测可直接复制，完整故障档案需要通过站外校验。",
      "先确认你能带着东西回去。备用浮力可以保住人员和资料，但潜器会留在这里。",
    ],
    links: ["station", "vent"],
    choices: [
      {
        id: "copy",
        label: "远程复制基础观测档案",
        hint: "氧气 −5 · 电量 −6 · 获得基础档案",
        cost: { oxygen: 5, battery: 6 },
        flag: "basic-archive",
        result: "基础观测复制完成。故障时序仍被校验锁保护着。",
      },
      {
        id: "arm",
        label: "用机械臂取回完整记录器",
        hint: "需机械臂和正确失联判断 · 氧气 −6 · 电量 −6",
        gear: "arm",
        needs: "theory",
        cost: { oxygen: 6, battery: 6 },
        record: "archive",
        result: "机械臂避开旧缆，取回了原始记录。故障日志没有缺页。",
      },
      {
        id: "dock",
        label: "贴近接口，传输完整故障档案",
        hint: "需正确失联判断 · 氧气 −8 · 电量 −8 · 船体 −8",
        needs: "theory",
        cost: { oxygen: 8, battery: 8, hull: 8 },
        record: "archive",
        result: "传输进度到达百分之百。潜器外壳擦到旧支架，阿澈催你离开。",
      },
      {
        id: "cut",
        label: "切开缆线，直接回收加密记录器",
        hint: "氧气 −5 · 电量 −5 · 船体 −15 · 基础档案 · 信任 −5",
        cost: { oxygen: 5, battery: 5, hull: 15 },
        flag: "basic-archive",
        gain: { trust: -5 },
        result:
          "记录器取出来了。完整日志仍是加密的，基础观测能够读取；外壳需要维修。",
      },
    ],
  },
];
export const storyEncounters = {
  current: {
    title: "水流突然变强",
    text: "横向水流把潜器推离了航线。推进器负载开始升高；你还能主动选一个安全方向。",
    choices: [
      {
        id: "shelter",
        label: "用声呐找背流处",
        hint: "需要声呐 · 氧气 −2 · 电量 −3",
        gear: "sonar",
        cost: { oxygen: 2, battery: 3 },
        stress: -4,
        result: "背流处的水缓了下来。航线重新出现在屏幕上。",
      },
      {
        id: "wait",
        label: "降低推进，等水流缓下来",
        hint: "氧气 −5 · 紧张 −3",
        cost: { oxygen: 5 },
        stress: -3,
        result: "水流减弱，你们恢复了航向。",
      },
      {
        id: "push",
        label: "用电量换时间，顶过去",
        hint: "电量 −7 · 船体 −5 · 紧张 +7",
        cost: { battery: 7, hull: 5 },
        stress: 7,
        result: "潜器越过水流边缘。阿澈把这一段高负载记在了日志里。",
      },
    ],
  },
  cable: {
    title: "外部支架挂到了旧缆",
    text: "潜器没有前进，缆线却越来越紧。阿澈关掉自动推进，等你下令。",
    choices: [
      {
        id: "arm",
        label: "把缆线从支架上拨开",
        hint: "需要机械臂 · 电量 −3",
        gear: "arm",
        cost: { battery: 3 },
        result: "缆线从支架上滑开，外壳没有受损。",
      },
      {
        id: "reverse",
        label: "慢慢退回原位置",
        hint: "氧气 −4 · 电量 −3",
        cost: { oxygen: 4, battery: 3 },
        result: "你沿刚才的方向倒退，终于看清了缆线的位置。",
      },
      {
        id: "force",
        label: "卸开外部支架，立即脱离",
        hint: "船体 −12 · 紧张 +8",
        cost: { hull: 12 },
        stress: 8,
        result: "支架脱落了。潜器恢复移动，外壳留下了一道裂纹。",
      },
    ],
  },
  blackout: {
    title: "屏幕暂时失去图像",
    text: "悬浮颗粒涌进灯光，摄像头一片白。导航仍在工作，但你不知道前方离岩壁多远。",
    choices: [
      {
        id: "sonar",
        label: "切换声呐导航",
        hint: "需要声呐 · 电量 −3",
        gear: "sonar",
        cost: { battery: 3 },
        result: "声呐勾勒出岩壁，航向保持正常。",
      },
      {
        id: "slow",
        label: "停下来，等颗粒散开",
        hint: "氧气 −4 · 紧张 −5",
        cost: { oxygen: 4 },
        stress: -5,
        result: "图像逐渐清楚了。没有必要在看不清的时候抢这几分钟。",
      },
      {
        id: "blind",
        label: "沿最后的航向快速通过",
        hint: "电量 −4 · 船体 −8 · 紧张 +10",
        cost: { battery: 4, hull: 8 },
        stress: 10,
        result: "你重新看到了岩壁，但距离比想象中近。阿澈检查了一遍外壳报警。",
      },
    ],
  },
} satisfies Record<
  string,
  { title: string; text: string; choices: ExpeditionChoice[] }
>;
