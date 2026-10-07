// Authored fiction. Resource values are game rules, not dive planning data.
export const STORY_KEY = "deepsea-game-story-v1";
export type StoryGear = "sonar" | "arm" | "battery" | "medkit";
export type StoryMode = "gentle" | "standard";
export interface StorySetup {
  name: string;
  mode: StoryMode;
  gear: StoryGear[];
}
export type StoryEnding =
  | "home"
  | "rescue"
  | "discovery"
  | "truth"
  | "lost"
  | "archive";
export interface StoryState {
  setup: StorySetup;
  node: string;
  hull: number;
  oxygen: number;
  battery: number;
  trust: number;
  flags: string[];
  records: string[];
  actions: string[];
  ending: StoryEnding | null;
  log: { title: string; choice: string; result: string }[];
}
export interface StoryChoice {
  id: string;
  label: string;
  hint: string;
  next?: string;
  ending?: StoryEnding;
  cost?: Partial<Record<"hull" | "oxygen" | "battery", number>>;
  gain?: Partial<Record<"hull" | "oxygen" | "battery" | "trust", number>>;
  gear?: StoryGear;
  flag?: string;
  requires?: string;
  record?: string;
  result: string;
}
export interface StoryNode {
  id: string;
  chapter: number;
  depth: number;
  title: string;
  speaker: string;
  paragraphs: string[];
  choices: StoryChoice[];
  creature?: string;
  topic?: string;
}
export const storyGear: { id: StoryGear; name: string; description: string }[] =
  [
    {
      id: "sonar",
      name: "成像声呐",
      description: "在浑水里辨认障碍，也能寻找失联潜器。",
    },
    {
      id: "arm",
      name: "精密机械臂",
      description: "回收记录器，松开缆线，尽量少打扰海底。",
    },
    {
      id: "battery",
      name: "备用电池",
      description: "出发时增加 20 点电量，最后一程更从容。",
    },
    {
      id: "medkit",
      name: "应急工具箱",
      description: "修好破损接口，让遇险的人更容易返回海面。",
    },
  ];
export const storyRecords: Record<string, { title: string; text: string }> = {
  snow: {
    title: "漂落的食物",
    text: "海洋雪把浅层产生的有机物带向深处。大多数碎屑会在到达海底之前被消耗。",
  },
  light: {
    title: "黑暗里的闪光",
    text: "海洋里的许多动物能发光。发光可能用来捕食、防御或伪装，不能只凭亮光判断用途。",
  },
  vent: {
    title: "喷口旁的生命",
    text: "部分微生物靠化学能合成有机物，支撑热液区食物网。喷出的高温流体和动物生活的混合水不同。",
  },
  whale: {
    title: "一具鲸骨",
    text: "沉入海底的鲸尸能供养不同阶段的生物群落。这里的骨架属于故事场景。",
  },
  signal: {
    title: "旧站的监听记录",
    text: "录音里的重复脉冲来自故障设备。故事中的“回声”并不是发现未知动物的证据。",
  },
  archive: {
    title: "完整观测档案",
    text: "温度、流速和影像要互相印证。保留时间与位置，往往比带回一份孤立的样品更有价值。",
  },
};
export const storyEndings: Record<
  StoryEnding,
  { title: string; text: string; color: string }
> = {
  home: {
    title: "平安返航",
    text: "甲板上的人拉起缆绳。你没有带回所有答案，但带回了整支队伍。海还在那里，下次可以准备得更好。",
    color: "mint",
  },
  rescue: {
    title: "有人在等这束光",
    text: "林岑的潜器终于浮出水面。她把手贴在舷窗上，向你点了点头。这次航行最珍贵的发现，是一个活着回来的人。",
    color: "amber",
  },
  discovery: {
    title: "留给明天的坐标",
    text: "你带回了一份足够开展下一次研究的档案。地点、时间和环境记录都很清楚。许舟已经开始准备下一次调查，想再看一眼那个新生的裂口。",
    color: "mint",
  },
  truth: {
    title: "暗海有回声",
    text: "旧站的故障记录、喷口观测和林岑的证词拼到了一起。神秘信号有了来处，新的观测也完整保留下来。返航路上，无线电里终于响起了笑声。",
    color: "mint",
  },
  archive: {
    title: "档案先到家",
    text: "你在最后一刻发出了记录。救援船循着信标找到你，潜器却永远留在了海底。完整的档案得以保存，这条路线的代价仍让人久久沉默。",
    color: "amber",
  },
  lost: {
    title: "中止的航程",
    text: "舱内的警报盖过了无线电。支援船收到了自动求救信标，调查就此中止。复盘会从你最后一次忽略的资源警告开始。",
    color: "red",
  },
};
export const storyNodes: StoryNode[] = [
  {
    id: "launch",
    chapter: 1,
    depth: 0,
    title: "最后一条来信",
    speaker: "研究船 · 清晨 05:40",
    paragraphs: [
      "三天前，海底观测站“回声”停止上传数据。今天凌晨，船上收到一段只有七秒的录音：两次敲击，接着是一个女人的声音。",
      "“别靠近主井。林岑，坐标……”录音断在这里。工程师阿澈已经坐进副驾驶，生物学家许舟在母船等你们的图像。“设备可能坏了，”他提醒，“先找到人。”",
    ],
    choices: [
      {
        id: "brief",
        label: "先和队员核对任务",
        hint: "氧气 −3 · 信任 +10",
        cost: { oxygen: 3 },
        gain: { trust: 10 },
        flag: "briefed",
        next: "twilight",
        result:
          "阿澈把救援和调查路线都写在舱壁上。你们约好：资源见底之前，一定返回。",
      },
      {
        id: "rush",
        label: "沿着坐标立刻下潜",
        hint: "不消耗资源 · 保留时间",
        next: "twilight",
        result: "锁扣松开了。晨光从舷窗上方慢慢消失。",
      },
    ],
  },
  {
    id: "twilight",
    chapter: 1,
    depth: 420,
    title: "像雪一样落下来",
    speaker: "许舟 · 母船通讯",
    creature: "vampire-squid",
    topic: "marine-snow",
    paragraphs: [
      "灯光里有无数细小的白点。它们飘得很慢，像一场不会落到地面的雪。一个暗红色的轮廓从光边掠过，又缩回黑暗。",
      "“先别追它。”许舟让你把灯调暗，“这种水域里的生活，很多时候靠的就是这些碎屑。”屏幕角落，观测站的导航浮标还在闪。",
    ],
    choices: [
      {
        id: "observe",
        label: "关掉推进器，做一段低光观察",
        hint: "氧气 −5 · 电量 −4 · 获得观察笔记",
        cost: { oxygen: 5, battery: 4 },
        record: "snow",
        gain: { trust: 5 },
        next: "signal",
        result: "你记录了碎屑和动物的位置，没有为了拍清楚而追逐它。",
      },
      {
        id: "follow",
        label: "直接追踪导航浮标",
        hint: "氧气 −3 · 电量 −3",
        cost: { oxygen: 3, battery: 3 },
        next: "signal",
        result: "你们继续下潜。光束中的白点很快退成了细线。",
      },
    ],
  },
  {
    id: "signal",
    chapter: 2,
    depth: 850,
    title: "另一道回波",
    speaker: "阿澈 · 副驾驶",
    paragraphs: [
      "接收器忽然响了两下。导航浮标在正前方，另一道弱回波却在右侧岩壁下面。“这不是站里的频道。”阿澈把音量拧大，“有人把电台调到应急频率了。”",
      "灯照不到那里。右侧岩壁的地形图缺了一块。",
    ],
    choices: [
      {
        id: "scan",
        label: "用成像声呐确认回波",
        hint: "需要成像声呐 · 氧气 −3 · 电量 −6 · 信任 +5",
        gear: "sonar",
        cost: { battery: 6, oxygen: 3 },
        gain: { trust: 5 },
        flag: "located",
        next: "rescue",
        result: "回波勾勒出一艘小潜器。它卡在岩壁下，里面还有人。",
      },
      {
        id: "light",
        label: "靠近一些，用灯搜索",
        hint: "氧气 −7 · 电量 −5 · 船体 −8",
        cost: { oxygen: 7, battery: 5, hull: 8 },
        flag: "located",
        next: "rescue",
        result: "舱壁擦过一块突出岩石。灯光终于照到林岑举起来的手。",
      },
      {
        id: "station",
        label: "先去观测站恢复通讯",
        hint: "氧气 −3 · 电量 −3 · 暂时离开救援支线",
        cost: { oxygen: 3, battery: 3 },
        next: "lights",
        result: "你把弱回波的位置存了下来，继续前往观测站。",
      },
    ],
  },
  {
    id: "rescue",
    chapter: 2,
    depth: 1080,
    title: "她还在里面",
    speaker: "林岑 · 断续的无线电",
    paragraphs: [
      "“系留缆被落石压住了。我试过切断，刀头折了。”林岑说。她的潜器还在供电，但备用浮力系统的接口开着，水已经进入外部设备箱。",
      "阿澈指向你们的工具架。解开缆线和修好接口，是两件不同的事。",
    ],
    choices: [
      {
        id: "arm",
        label: "用机械臂松开缆线",
        hint: "需要精密机械臂 · 氧气 −7 · 电量 −8",
        gear: "arm",
        cost: { oxygen: 7, battery: 8 },
        flag: "rescued",
        gain: { trust: 15 },
        next: "message",
        result: "缆线松开后，林岑启用了剩下的一组浮力装置。她能够返航了。",
      },
      {
        id: "repair",
        label: "用应急工具箱修好接口",
        hint: "需要应急工具箱 · 氧气 −7 · 电量 −6",
        gear: "medkit",
        cost: { oxygen: 7, battery: 6 },
        flag: "rescued",
        gain: { trust: 15 },
        next: "message",
        result: "修好的接口让切割器重新工作。林岑切断缆线，缓缓离开岩壁。",
      },
      {
        id: "tow",
        label: "冒险拉开系留缆",
        hint: "氧气 −10 · 电量 −10 · 船体 −18",
        cost: { oxygen: 10, battery: 10, hull: 18 },
        flag: "rescued",
        gain: { trust: 8 },
        next: "message",
        result:
          "两艘潜器一起晃了一下。缆线断了，你们的外壳也留下了深深的擦痕。",
      },
      {
        id: "relay",
        label: "标记位置，请母船接手救援",
        hint: "电量 −3 · 留下救援坐标",
        cost: { battery: 3 },
        flag: "relay",
        next: "lights",
        result:
          "母船确认收到坐标。林岑说：“谢谢。你们去查主井，别贴着那根旧缆。”",
      },
    ],
  },
  {
    id: "message",
    chapter: 2,
    depth: 1080,
    title: "主井下的记录器",
    speaker: "林岑 · 已解除系留",
    paragraphs: [
      "林岑把最后一份图像传来：观测站旁边有一道新的热液裂口。主井的系留缆穿过那里，被反复摩擦，触发了故障信号。",
      "“声音是设备发的，不是什么怪物。真正值得看的是裂口附近的变化。”她犹豫了一下，“主井下有记录器，别只带一张好看的照片回来。”",
    ],
    choices: [
      {
        id: "accept",
        label: "接收图像，把证词存进日志",
        hint: "电量 −3 · 信任 +5 · 获得信号记录",
        cost: { battery: 3 },
        gain: { trust: 5 },
        record: "signal",
        next: "lights",
        result: "图像和证词已经保存。林岑开始上浮，你们向相反的方向驶去。",
      },
      {
        id: "escort",
        label: "护送林岑一起返回海面",
        hint: "现在返航 · 结束本次调查",
        ending: "rescue",
        result: "你向母船报告：“人已经找到。调查先到这里。”",
      },
    ],
  },
  {
    id: "lights",
    chapter: 3,
    depth: 1450,
    title: "不要把每一道光都当成路标",
    speaker: "许舟 · 母船通讯",
    creature: "pacific-viperfish",
    paragraphs: [
      "舷窗外划过一串细小亮点。你刚想调整航向，许舟就说：“那是动物自己的光，不是导航浮标。”你重新核对方位，发现航线已经偏了几度。",
      "观测站还有一千多米的落差。可以沿开放水域走，也可以借岩壁挡住横向水流。",
    ],
    choices: [
      {
        id: "film",
        label: "留下一段影像，再回到航线",
        hint: "氧气 −5 · 电量 −5 · 获得发光观察",
        cost: { oxygen: 5, battery: 5 },
        record: "light",
        next: "current",
        result: "影像有了清楚的时间和深度标记。你们没有追着发光动物离开航线。",
      },
      {
        id: "course",
        label: "核对航线，继续下潜",
        hint: "氧气 −3 · 电量 −3",
        cost: { oxygen: 3, battery: 3 },
        next: "current",
        result:
          "导航误差被修正。阿澈把动物亮点和仪器指示分开放到了两个屏幕上。",
      },
    ],
  },
  {
    id: "current",
    chapter: 3,
    depth: 1900,
    title: "逆着水流",
    speaker: "阿澈 · 副驾驶",
    paragraphs: [
      "横向水流比预报强。潜器被推向一面斜坡，推进器发出持续的低鸣。阿澈盯着电量：“可以绕一点路，也可以直接顶过去。”",
      "岩壁旁有一段未测绘区。声呐如果还在，能省下很多猜测。",
    ],
    choices: [
      {
        id: "shelter",
        label: "用声呐寻找岩壁背流处",
        hint: "需要成像声呐 · 氧气 −4 · 电量 −4",
        gear: "sonar",
        cost: { oxygen: 4, battery: 4 },
        next: "whale",
        result: "岩壁背面的水流弱了下来。推进器终于可以低速工作。",
      },
      {
        id: "detour",
        label: "绕行开放水域",
        hint: "氧气 −8 · 电量 −5",
        cost: { oxygen: 8, battery: 5 },
        next: "whale",
        result: "你们绕过了斜坡。航程变长了，舱体保持完好。",
      },
      {
        id: "push",
        label: "加大推进，穿过水流",
        hint: "氧气 −4 · 电量 −9 · 船体 −10",
        cost: { oxygen: 4, battery: 9, hull: 10 },
        next: "whale",
        result: "潜器冲出了水流边缘。阿澈把红色的负载记录圈了起来。",
      },
    ],
  },
  {
    id: "whale",
    chapter: 3,
    depth: 2450,
    title: "海底的一张餐桌",
    speaker: "海底 · 宽阔的泥质斜坡",
    topic: "whale-fall",
    paragraphs: [
      "灯光扫过一串巨大的白骨。骨头间有小动物在移动，远处一条鱼停在光束边缘。观测站就在更低处，它的外壳看起来比这副骨架年轻得多。",
      "许舟说：“不要落在骨头上。沉积物一扬起来，我们和它们都什么也看不见。”",
    ],
    choices: [
      {
        id: "record",
        label: "悬停记录，保持与海底的距离",
        hint: "氧气 −5 · 电量 −3 · 获得鲸落观察",
        cost: { oxygen: 5, battery: 3 },
        record: "whale",
        gain: { trust: 5 },
        next: "station",
        result: "你在不扰动沉积物的距离完成了观察。许舟留下了骨架的坐标。",
      },
      {
        id: "pass",
        label: "从骨架上方缓慢通过",
        hint: "氧气 −3 · 电量 −2",
        cost: { oxygen: 3, battery: 2 },
        next: "station",
        result: "你们留下足够的距离，抵达了观测站外侧。",
      },
    ],
  },
  {
    id: "station",
    chapter: 4,
    depth: 2860,
    title: "无人值守的灯",
    speaker: "回声站 · 外部维护口",
    paragraphs: [
      "站外的状态灯一直亮着。阿澈接通维护端口，错误代码一行行滚过屏幕。电力系统还能用，只是通讯缆线断了。",
      "维护口旁有备用充电接口。检修需要时间，但补充电量或修理外壳，都可能让回程好走一些。",
    ],
    choices: [
      {
        id: "charge",
        label: "停靠充电，再前往主井",
        hint: "氧气 −8 · 电量 +24",
        cost: { oxygen: 8 },
        gain: { battery: 24 },
        next: "vent",
        result: "充电结束时，阿澈把接口重新盖好。观测站仍需要下一支维修队。",
      },
      {
        id: "patch",
        label: "借维护口修补外壳",
        hint: "需要应急工具箱 · 氧气 −6 · 船体 +24",
        gear: "medkit",
        cost: { oxygen: 6 },
        gain: { hull: 24 },
        next: "vent",
        result:
          "外壳裂纹被临时补好。阿澈检查完接口，把用过的工具一件件放回架子上。",
      },
      {
        id: "leave",
        label: "设备尚好，继续去主井",
        hint: "氧气 −3 · 电量 −3",
        cost: { oxygen: 3, battery: 3 },
        next: "vent",
        result: "站灯留在身后，主井的黑影出现在前方。",
      },
    ],
  },
  {
    id: "vent",
    chapter: 4,
    depth: 3180,
    title: "裂口附近",
    speaker: "许舟 · 等待影像",
    creature: "giant-tube-worm",
    topic: "vents",
    paragraphs: [
      "热液从裂缝里升起，灯光照到一片管虫。它们靠近混合了冷海水的边缘，没待在喷口最热的那束流体里。旧系留缆在水流中慢慢摆动。",
      "“先记录温度和位置，再决定要不要采样。”许舟说。阿澈轻轻敲了敲电量表。",
    ],
    choices: [
      {
        id: "observe",
        label: "做一次不接触的影像与环境观测",
        hint: "氧气 −6 · 电量 −5 · 完成热液观测",
        cost: { oxygen: 6, battery: 5 },
        record: "vent",
        flag: "careful",
        gain: { trust: 10 },
        next: "recorder",
        result: "完整的影像保留下来，管虫群落没有被碰到。",
      },
      {
        id: "sample",
        label: "贴近裂口，取下一块附着物",
        hint: "氧气 −4 · 电量 −4 · 船体 −14 · 信任 −10",
        cost: { oxygen: 4, battery: 4, hull: 14 },
        gain: { trust: -10 },
        record: "vent",
        flag: "sampled",
        next: "recorder",
        result:
          "你带回了附着物，却缺少原位记录。阿澈避开流体时又擦伤了一处外壳。",
      },
      {
        id: "skip",
        label: "优先找回记录器",
        hint: "氧气 −2 · 电量 −2",
        cost: { oxygen: 2, battery: 2 },
        next: "recorder",
        result: "你们沿着旧缆线寻找记录器。喷口调查只能留给下一次了。",
      },
    ],
  },
  {
    id: "recorder",
    chapter: 5,
    depth: 3420,
    title: "缆线尽头",
    speaker: "阿澈 · 主井下方",
    paragraphs: [
      "记录器压在一截弯曲的缆线下面。接口上的灯还在闪，过去一个月的数据应该都在里面。远处有落石撞击海底的闷响。",
      "你必须决定，带走记录器、远程传回数据，还是现在就走。",
    ],
    choices: [
      {
        id: "deeper",
        label: "越过记录器，检查主井深处",
        hint: "氧气 −6 · 电量 −6 · 船体 −12 · 进入危险支线",
        cost: { oxygen: 6, battery: 6, hull: 12 },
        next: "jam",
        result: "你们靠近主井底部。旧缆突然绷紧，挡住了退路。",
      },
      {
        id: "lift",
        label: "用机械臂取回记录器",
        hint: "需要精密机械臂 · 氧气 −7 · 电量 −8 · 获得完整档案",
        gear: "arm",
        cost: { oxygen: 7, battery: 8 },
        record: "archive",
        next: "ascent",
        result: "记录器被稳稳放进样品篮。你们终于可以返航。",
      },
      {
        id: "download",
        label: "接近接口，下载完整档案",
        hint: "氧气 −10 · 电量 −12 · 船体 −6",
        cost: { oxygen: 10, battery: 12, hull: 6 },
        record: "archive",
        next: "ascent",
        result: "最后一份文件下载结束时，落石已经滑到了灯光边缘。",
      },
      {
        id: "partial",
        label: "传回目前的观察，开始返航",
        hint: "氧气 −3 · 电量 −4 · 保留已有记录",
        cost: { oxygen: 3, battery: 4 },
        next: "ascent",
        result: "你把当前记录发给母船，转向了上升航线。",
      },
    ],
  },
  {
    id: "jam",
    chapter: 5,
    depth: 3540,
    title: "绷紧的旧缆",
    speaker: "阿澈 · 外壳负载报警",
    paragraphs: [
      "主井没有新的出口。潜器转向时，旧缆缠住了外部支架。阿澈关掉推进器：‘别再往前了，这里的记录器已经足够说明问题。’",
      "画面里，缆线正压向受损的外壳。现在可以慢慢退回去，也可以试着用机械臂解开它。继续强行推进，会让这次航行提前结束。",
    ],
    choices: [
      {
        id: "untangle",
        label: "用机械臂松开旧缆，再回到记录器旁",
        hint: "需要精密机械臂 · 氧气 −5 · 电量 −6",
        gear: "arm",
        cost: { oxygen: 5, battery: 6 },
        next: "ascent",
        result: "旧缆被推离支架。你们离开主井，这一次没能带回完整档案。",
      },
      {
        id: "reverse",
        label: "慢慢倒退，放弃井底调查",
        hint: "氧气 −8 · 电量 −8 · 船体 −8",
        cost: { oxygen: 8, battery: 8, hull: 8 },
        next: "ascent",
        result: "旧缆从支架上滑开，留下了一道擦痕。你们转向返航路线。",
      },
      {
        id: "force",
        label: "忽略警告，继续强行推进",
        hint: "高风险 · 船体损坏 · 调查中止",
        ending: "lost",
        gain: { hull: -100 },
        result:
          "支架在拉扯中断裂，外壳报警响起。你们发出求救信标，调查被迫中止。",
      },
    ],
  },
  {
    id: "ascent",
    chapter: 5,
    depth: 1800,
    title: "上方仍是黑暗",
    speaker: "母船 · 回收准备",
    paragraphs: [
      "回程的水流没有停。你检查储备，阿澈把记录器固定在座椅下面。母船说，海面上的天气正在变差，接下来一段通讯可能断开。",
      "“资料可以再补，”阿澈说，“你来选怎么回去。”",
    ],
    choices: [
      {
        id: "patient",
        label: "沿已知航线稳稳返回",
        hint: "氧气 −8 · 电量 −6 · 完成航程",
        cost: { oxygen: 8, battery: 6 },
        next: "surface",
        result: "你们遵循来时留下的航线，母船的声音越来越清楚。",
      },
      {
        id: "fast",
        label: "缩短路线，快速上浮",
        hint: "氧气 −4 · 电量 −10 · 船体 −10",
        cost: { oxygen: 4, battery: 10, hull: 10 },
        next: "surface",
        result: "潜器穿过水流，海面的亮光终于显出来。",
      },
      {
        id: "send",
        label: "放弃潜器，发出档案后等待接应",
        hint: "需要完整档案 · 电量 −4 · 潜器损失 · 档案结局",
        requires: "record:archive",
        cost: { battery: 4 },
        ending: "archive",
        result: "发送进度到了百分之百。你启动应急信标，等待母船的接应。",
      },
    ],
  },
  {
    id: "surface",
    chapter: 6,
    depth: 0,
    title: "第一口海风",
    speaker: "研究船 · 返航甲板",
    paragraphs: [
      "舱门打开，海风一下子涌进来。许舟接过你递出的记录，林岑的应急频道已经安静下来。甲板上的人都在等你说这次航行发生了什么。",
      "你翻到日志最后一页，写下报告的第一句话。",
    ],
    choices: [
      {
        id: "report",
        label: "整理档案，提交航行报告",
        hint: "根据救援、观测与档案，揭晓本次结局",
        next: "finish",
        result: "每一次选择，都留在了这份报告里。",
      },
    ],
  },
];
export function createStory(setup: StorySetup): StoryState {
  return {
    setup: {
      ...setup,
      name: setup.name.trim().slice(0, 18) || "远舟",
      gear: [...setup.gear],
    },
    node: "launch",
    hull: setup.mode === "gentle" ? 100 : 90,
    oxygen: setup.mode === "gentle" ? 115 : 90,
    battery:
      (setup.mode === "gentle" ? 100 : 85) +
      (setup.gear.includes("battery") ? 20 : 0),
    trust: 50,
    flags: [],
    records: [],
    actions: [],
    log: [],
    ending: null,
  };
}
export function storyNode(state: StoryState) {
  return storyNodes.find((node) => node.id === state.node)!;
}
export function storyChoiceReason(
  state: StoryState,
  choice: StoryChoice,
): string | null {
  if (state.ending) return "本次航程已经结束";
  if (choice.gear && !state.setup.gear.includes(choice.gear))
    return `未携带${storyGear.find((item) => item.id === choice.gear)!.name}`;
  if (
    choice.requires?.startsWith("record:") &&
    !state.records.includes(choice.requires.slice(7))
  )
    return "尚未取得完整档案";
  for (const [key, value] of Object.entries(choice.cost || {})) {
    if (state[key as "hull" | "oxygen" | "battery"] < value)
      return `${key === "hull" ? "船体" : key === "oxygen" ? "氧气" : "电量"}不足`;
  }
  return null;
}
export function chooseStory(state: StoryState, choiceId: string): StoryState {
  if (state.ending || state.actions.length >= 60) return state;
  if (choiceId === "abort")
    return {
      ...state,
      ending: state.flags.includes("rescued") ? "rescue" : "home",
      actions: [...state.actions, "abort"],
      log: [
        ...state.log,
        {
          title: storyNode(state).title,
          choice: "中止调查，返回海面",
          result: "你将返航决定告知母船。",
        },
      ],
    };
  const node = storyNode(state);
  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice || storyChoiceReason(state, choice)) return state;
  const next: StoryState = {
    ...state,
    flags: [...state.flags],
    records: [...state.records],
    actions: [...state.actions, choice.id],
    log: [
      ...state.log,
      { title: node.title, choice: choice.label, result: choice.result },
    ],
    node: choice.next || state.node,
    ending: choice.ending || null,
  };
  for (const key of ["hull", "oxygen", "battery", "trust"] as const)
    next[key] = Math.max(
      0,
      Math.min(
        key === "battery" || key === "oxygen" ? 125 : 100,
        state[key] -
          (key === "trust" ? 0 : choice.cost?.[key] || 0) +
          (choice.gain?.[key] || 0),
      ),
    );
  if (choice.flag && !next.flags.includes(choice.flag))
    next.flags.push(choice.flag);
  if (choice.record && !next.records.includes(choice.record))
    next.records.push(choice.record);
  if (next.hull <= 0 || next.oxygen <= 0 || next.battery <= 0) {
    next.ending = "lost";
    next.node = state.node;
  }
  if (choice.next === "finish") {
    next.ending =
      next.flags.includes("rescued") &&
      next.records.includes("archive") &&
      next.records.includes("vent") &&
      next.records.includes("signal") &&
      next.flags.includes("careful") &&
      next.trust >= 70
        ? "truth"
        : next.records.includes("archive") && next.records.includes("vent")
          ? "discovery"
          : next.flags.includes("rescued")
            ? "rescue"
            : "home";
    next.node = "surface";
  }
  return next;
}
export function storyScore(state: StoryState) {
  return (
    state.records.length * 80 +
    (state.flags.includes("rescued") ? 200 : 0) +
    Math.round(state.hull + state.oxygen + state.battery) +
    state.trust
  );
}
export function encodeStory(state: StoryState) {
  return { version: 1, setup: state.setup, actions: state.actions };
}
export function decodeStory(raw: unknown): StoryState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as {
    version?: unknown;
    setup?: Partial<StorySetup>;
    actions?: unknown;
  };
  if (
    value.version !== 1 ||
    !value.setup ||
    typeof value.setup.name !== "string" ||
    value.setup.name.length > 18 ||
    !["gentle", "standard"].includes(value.setup.mode || "") ||
    !Array.isArray(value.setup.gear) ||
    value.setup.gear.length !== 2 ||
    new Set(value.setup.gear).size !== 2 ||
    value.setup.gear.some(
      (gear) => !storyGear.some((item) => item.id === gear),
    ) ||
    !Array.isArray(value.actions) ||
    value.actions.length > 60
  )
    return null;
  let state = createStory(value.setup as StorySetup);
  for (const id of value.actions) {
    if (typeof id !== "string") return null;
    const next = chooseStory(state, id);
    if (next === state) return null;
    state = next;
  }
  return state;
}
