import type { DiveTopic } from "./types";
import { topicMedia } from "./topicMedia";
export const topics: DiveTopic[] = [
  {
    id: "marine-snow",
    depth: 1300,
    kicker: "深海食物网",
    title: "海洋里，也会“下雪”。",
    kind: "snow",
    media: topicMedia["marine-snow"],
    relatedCreatures: ["vampire-squid", "sea-pig"],
    sections: [
      {
        title: "这场“雪”从哪里来？",
        text: "上层海水里的生物死亡后，残骸会向下沉。排泄物、其他有机碎屑和无机颗粒也会混入其中。颗粒在下沉过程中聚集，看起来像飘落的雪花，但它们并不是结冰的海水。",
      },
      {
        title: "为什么深海需要它？",
        text: "自然光无法抵达大部分深海，那里不能像海面附近一样依靠光合作用持续生产食物。海洋雪把上方的有机物带到下方，供动物滤食、摄食，也供微生物分解。沿途被消耗以后，剩下的一部分进入海底沉积物。",
      },
      {
        title: "照片里能看出什么？",
        text: "照片记录的是某一时刻水中的颗粒。单看白点，无法判断每一粒的成分、来源或下沉速度；也不能用颗粒多少推断所有深海的食物供应。",
      },
    ],
    text: "浮游生物的残骸、排泄物和其他颗粒缓缓下沉，成为海洋雪。沿途的动物和微生物不断消耗它们，只有一部分最终抵达海底。",
    source: {
      publisher: "NOAA",
      title: "What is marine snow?",
      url: "https://oceanservice.noaa.gov/facts/marinesnow.html",
    },
  },
  {
    id: "vents",
    depth: 2500,
    kicker: "化学能与生命",
    title: "没有阳光，也能有食物网。",
    kind: "vent",
    media: topicMedia.vents,
    relatedCreatures: ["giant-tube-worm"],
    sections: [
      {
        title: "黑烟并不是燃烧的烟",
        text: "海水进入地壳裂隙后被加热，又从喷口涌出。热液与冷海水混合时，细小矿物颗粒形成了看起来像烟的流体。部分矿物还会沉积下来，逐渐形成烟囱。",
      },
      {
        title: "食物网怎样开始？",
        text: "一些微生物利用硫化物等物质参与的化学反应获得能量，合成有机物。它们可以成为其他生物的食物，或与动物共生。这类化能合成支撑的食物网，不需要阳光直接照到喷口。",
      },
      {
        title: "看见喷口，不等于整片海都很热",
        text: "高温热液与周围冷海水之间存在很大的温度差。照片里的动物生活在适合自己的微环境中，不能把喷口流体的温度当作它们的体温。不同喷口的地质环境与生物群落也可能很不一样。",
      },
    ],
    text: "海水进入地壳裂隙，被加热后从热液喷口流出。部分微生物利用化学反应获得能量、合成有机物，管虫等动物依靠它们生活。喷口分布在特定地质环境，并非这一深度处处都有。",
    source: {
      publisher: "NOAA",
      title: "What is a hydrothermal vent?",
      url: "https://oceanservice.noaa.gov/facts/vents.html",
    },
  },
  {
    id: "whale-fall",
    depth: 3300,
    kicker: "海底的食物补给",
    title: "一头鲸沉下去以后。",
    kind: "whale",
    media: topicMedia["whale-fall"],
    relatedCreatures: ["giant-isopod"],
    sections: [
      {
        title: "突然到来的食物",
        text: "鲸的尸体沉到海底，会为平时食物供应有限的环境带来集中补给。食腐动物先消耗软组织，碎屑又能丰富附近的沉积物。",
      },
      {
        title: "骨骼也能支持生命",
        text: "留下的骨骼既是附着表面，也含有可以继续分解的有机物。分解过程产生的硫化物还能为微生物提供化学能，让新的群落延续下去。不同阶段会持续多久，要看鲸体大小和当地环境。",
      },
      {
        title: "一张照片只是其中一个阶段",
        text: "图中保留的是鲸骨与周围动物的画面，不能据此还原整段分解过程。鲸落也没有固定水深；它在深度轴上的位置只是阅读安排。",
      },
    ],
    text: "鲸的尸体为海底带来集中的食物。食腐动物先吃软组织，之后骨骼和周围沉积物还能支持新的群落。不同阶段持续多久，取决于环境与鲸体大小。鲸落没有固定的水深。",
    source: {
      publisher: "NOAA",
      title: "What is a whale fall?",
      url: "https://oceanservice.noaa.gov/facts/whale-fall.html",
    },
  },
  {
    id: "abyss-floor",
    depth: 5200,
    kicker: "认识海底",
    title: "海底并不是一张平面。",
    kind: "seafloor",
    media: topicMedia["abyss-floor"],
    relatedCreatures: ["blobfish", "sea-pig"],
    sections: [
      {
        title: "海底也有高低起伏",
        text: "海底地形包括平原、海山、山脉、峡谷和陡壁。水深地形图用颜色、等深线等方式，把被海水遮住的地形表达出来，作用类似陆地上的地形图。",
      },
      {
        title: "照片和地图各能告诉我们什么？",
        text: "潜水器照片能看到局部岩石、沉积物和动物；测绘数据则能帮助认识更大范围的地形。图中的弧形陡壁位于波多黎各南部的海底峡谷，显示的是局部坡面，不是整片深海平原。",
      },
      {
        title: "同样深，不一定住着同样的动物",
        text: "深度分区只描述水深。岩石表面与柔软沉积物提供不同的栖息条件，食物供应等因素也会影响生物分布。查找一种动物的生活环境时，还要结合具体栖息地。",
      },
    ],
    text: "深海里有平原、山脉、海山和峡谷。水深一样，底质和食物供应也可能不同。“海层”描述水深分区，不能替代对真实栖息地的描述。",
    source: {
      publisher: "NOAA",
      title: "What is bathymetry?",
      url: "https://oceanservice.noaa.gov/facts/bathymetry.html",
    },
  },
  {
    id: "trenches",
    depth: 6600,
    kicker: "进入海沟",
    title: "最深的海，不在每片海域。",
    kind: "trench",
    media: topicMedia.trenches,
    relatedCreatures: ["snailfish", "amphipod"],
    sections: [
      {
        title: "板块运动塑造海沟",
        text: "在一些板块相遇的边界，一块板块向另一块板块下方俯冲，形成深长的海沟。海沟是特定地质环境中的地形，不能把每片海域的深水区都叫作海沟。",
      },
      {
        title: "这张图怎样读？",
        text: "这是 NOAA 发布的马里亚纳海沟水深地形可视化。颜色和阴影帮助显示起伏，并不表示海水或海底本身的颜色。大范围地形很难由一张水下照片呈现，因此这里采用测深数据图。",
      },
      {
        title: "深度记录需要说明条件",
        text: "一种动物的最深观测、常见栖息范围和照片拍摄深度是不同的信息。本站将它们分别标注在百科里；沿深度轴排列的生物来自不同海域，不能当作一条真实航线上的完整物种清单。",
      },
    ],
    text: "海沟常形成在板块俯冲的边界，一块板块向另一块板块下方移动。这里的“下潜路线”把不同海域的生物放在同一条阅读轴上，并不是一处地点的完整物种清单。",
    source: {
      publisher: "NOAA",
      title: "Plate tectonics and earthquakes",
      url: "https://www.noaa.gov/jetstream/tsunamis/tsunami-generation-earthquakes/jetstream-max-plate-tectonics-and-earthquakes",
    },
  },
  {
    id: "survey",
    depth: 9500,
    kicker: "深海测量",
    title: "我们怎样知道海有多深？",
    kind: "survey",
    media: topicMedia.survey,
    relatedCreatures: ["snailfish"],
    sections: [
      {
        title: "从声波的往返时间算起",
        text: "测深声呐向海底发出声波，再接收回波。知道传播时间和海水中的声速，就可以估算距离。声速会受到温度、盐度等条件影响，因此测量时还需要相应的校正。",
      },
      {
        title: "船与潜水器各有用途",
        text: "科考船可以搭载声呐开展测绘，潜水器则能近距离拍摄影像、采集样品，并记录压力等数据。照片中的 Okeanos Explorer 是测绘和探索平台，不代表它能让搭载的每种设备到达海洋最深处。",
      },
      {
        title: "为什么最深处不是一个永远不变的数字？",
        text: "测量地点、定位、仪器与校正方式都会影响结果。2021 年的一项研究给出了挑战者深渊 10,935 ± 6 米的估计；“± 6 米”是结果的不确定度，应该与数值一起阅读。",
      },
    ],
    text: "声呐测深要考虑声波在海水中的传播速度，潜水器也可以用压力等数据估计深度。温度、盐度、定位和仪器误差都会影响结果，所以精确的深度通常带有不确定度。",
    source: {
      publisher: "Deep-Sea Research I · 2021",
      title: "Revised depth of the Challenger Deep",
      url: "https://repository.library.noaa.gov/view/noaa/33477",
    },
  },
];
