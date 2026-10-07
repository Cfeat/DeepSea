import type { Creature, Reference } from "./types";
const mbari = (slug: string, title: string): Reference => ({
  publisher: "MBARI",
  title,
  url: `https://www.mbari.org/animal/${slug}/`,
});
const aquarium = (slug: string, title: string): Reference => ({
  publisher: "蒙特雷湾水族馆",
  title,
  url: `https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/${slug}`,
});
export const expandedCreatures: Omit<
  Creature,
  "zone" | "reviewedOn" | "media"
>[] = [
  {
    id: "spotted-ratfish",
    name: "斑点银鲛",
    nameEn: "Spotted ratfish",
    scientificName: "Hydrolagus colliei",
    taxon: "物种",
    displayDepth: 175,
    habitatRange: {
      min: 0,
      max: 1000,
      note: "水族馆给出的分布范围；蒙特雷湾常见于约 30–61 米，并不只生活在深海",
    },
    size: "雌性可达约 1 米，雄性较小",
    fact: "用像翅膀一样的胸鳍游动，用齿板磨碎硬壳食物。",
    encyclopedia: {
      summary:
        "斑点银鲛属于银鲛类，是鲨鱼和鳐的亲属。它的身体带白斑，尾部很细长。",
      habitat: "东北太平洋海底附近，可从较浅水域分布到约 1,000 米。",
      diet: "虾、贝、蠕虫、海星和鱼等。",
      features: [
        "皮肤光滑，胸鳍宽大。",
        "口内是适合磨碎食物的齿板。",
        "背鳍前方有一根带毒的棘。",
      ],
      funFact: "尾巴很细，推动身体的主要是不断摆动的胸鳍。",
    },
    sources: [aquarium("spotted-ratfish", "Spotted ratfish")],
  },
  {
    id: "nautilus",
    name: "鹦鹉螺",
    nameEn: "Chambered nautilus",
    scientificName: "Nautilus pompilius",
    taxon: "物种",
    displayDepth: 310,
    size: "壳径约 16–21 厘米",
    fact: "螺旋壳分成许多小室，身体住在最外面的那一间。",
    encyclopedia: {
      summary:
        "鹦鹉螺是带外壳的头足类，与章鱼和鱿鱼是亲属。它用喷出的水推动身体，借壳内的气体与液体调节浮力。",
      habitat: "印度洋与太平洋的陡峭礁坡附近，活动受水深、温度和海底地形限制。",
      diet: "鱼和甲壳动物，也会吃其他动物的残骸。",
      features: [
        "壳内有多个气室，身体位于最外侧。",
        "口周有许多没有吸盘的触手。",
        "眼睛结构简单，没有像人眼那样的晶状体。",
      ],
      funFact:
        "它并不是“长在贝壳里的章鱼”。头足类有许多不同的身体结构，鹦鹉螺保留了明显的外壳。",
    },
    sources: [
      aquarium("chambered-nautilus", "Chambered nautilus"),
      {
        publisher: "NOAA Fisheries",
        title: "Chambered Nautilus",
        url: "https://www.fisheries.noaa.gov/species/chambered-nautilus",
      },
    ],
  },
  {
    id: "oarfish",
    name: "皇带鱼",
    nameEn: "Giant oarfish",
    scientificName: "Regalecus glesne",
    taxon: "物种",
    displayDepth: 520,
    size: "常见记录为数米，博物馆资料列有约 11 米的历史报告",
    fact: "身体很长，却主要吃小型浮游动物，不是追逐大鱼的“海怪”。",
    encyclopedia: {
      summary:
        "皇带鱼又常被叫作勒氏皇带鱼或龙宫使者。扁长的银色身体和红色背鳍，让漂到岸边的个体很容易引起注意。",
      habitat: "多种海域的开放水层，从近海面到较深的水域；活体不容易观察。",
      diet: "浮游动物、甲壳动物和鱿鱼等。",
      features: [
        "红色背鳍沿着细长身体延伸。",
        "身体侧扁，外形像一条宽带。",
        "岸边发现的个体，不能代表正常游动状态。",
      ],
      funFact:
        "照片里被人托起的皇带鱼，是 1996 年在美国加利福尼亚岸边发现的个体；它不是网上流传的“湄公河巨龙”。",
    },
    sources: [
      {
        publisher: "佛罗里达自然历史博物馆",
        title: "Oarfish",
        url: "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/oarfish/",
      },
    ],
  },
  {
    id: "hatchetfish",
    name: "海洋斧头鱼",
    nameEn: "Marine hatchetfishes",
    scientificName: "Sternoptychidae",
    taxon: "类群",
    displayDepth: 610,
    size: "多为小型鱼，体型因物种而异",
    fact: "银色侧面和腹部的发光器，帮助它们藏住自己的轮廓。",
    encyclopedia: {
      summary:
        "这里介绍深海的褶胸鱼科，常被称为海洋斧头鱼；它们和水族箱里同名的淡水鱼不是同一类。许多成员身体侧扁，腹部有发光器。",
      habitat: "开放海洋的中层水域，分布深度随物种与时间而变。",
      diet: "小型浮游动物，具体食谱因物种而异。",
      features: [
        "侧面呈银色，能反射周围的微光。",
        "腹部发光有助于匹配上方照下来的光。",
        "照片展示半裸银斧鱼 Argyropelecus hemigymnus。",
      ],
      funFact:
        "从下面看，一条不发光的鱼会挡住上方微弱的光。腹部补上一点光，反而能让轮廓不那么明显。",
    },
    sources: [
      {
        publisher: "NOAA Fisheries",
        title: "Capturing Images in the Deep-See",
        url: "https://www.fisheries.noaa.gov/science-blog/capturing-images-deep-see",
      },
    ],
  },
  {
    id: "siphonophore",
    name: "管水母",
    nameEn: "Siphonophores",
    scientificName: "Siphonophorae",
    taxon: "类群",
    displayDepth: 930,
    size: "从很小的群体到长达数米的群体，因物种而异",
    fact: "看起来像一个动物，实际由许多分工不同的个体共同组成。",
    encyclopedia: {
      summary:
        "管水母是一类群体生活的刺胞动物。群体中的不同个体分工负责游动、取食、防御或繁殖，彼此连接，一起生活。",
      habitat: "海洋水层中，各物种的栖息深度和海域不同。",
      diet: "浮游动物等；部分物种也捕食小鱼，不同物种的食谱并不相同。",
      features: [
        "许多种有游泳钟和下垂的取食结构。",
        "捕食触手上有刺细胞。",
        "身体柔弱，完整影像常比拖网标本更有帮助。",
      ],
      funFact:
        "这里的照片展示 Marrus orthocanna。管水母的长度通常指整个群体，不能与一只水母的伞径直接比较。",
    },
    sources: [
      mbari("common-siphonophore", "Common siphonophore"),
      mbari("red-siphonophore", "Red siphonophore"),
    ],
  },
  {
    id: "pacific-viperfish",
    name: "太平洋蝰鱼",
    nameEn: "Pacific viperfish",
    scientificName: "Chauliodus macouni",
    taxon: "物种",
    displayDepth: 1180,
    habitatRange: {
      min: 200,
      max: 1500,
      note: "MBARI 给出的分布范围，不能当作每个个体的固定活动范围",
    },
    size: "可达约 30 厘米",
    fact: "长牙看起来吓人，整条鱼却通常只有几十厘米。",
    encyclopedia: {
      summary:
        "太平洋蝰鱼是北太平洋中层的掠食性鱼类。巨大的嘴和针状长牙，有助于它在食物稀少的水域抓住猎物。",
      habitat: "北太平洋的弱光层与无光层，从日本、白令海到美洲西岸一带。",
      diet: "小鱼、甲壳动物、箭虫等。",
      features: [
        "牙齿长而尖。",
        "身体细长，带有发光器。",
        "有些个体夜间会向较浅处移动。",
      ],
      funFact:
        "一张近距离的头部照片会放大它的凶猛印象。查看体长，才更容易想象真实比例。",
    },
    sources: [mbari("pacific-viperfish", "Pacific viperfish")],
  },
  {
    id: "bubblegum-coral",
    name: "树状泡泡糖珊瑚",
    nameEn: "Bubblegum coral",
    scientificName: "Paragorgia arborea",
    taxon: "物种",
    displayDepth: 1550,
    habitatRange: {
      min: 50,
      max: 1800,
      note: "MBARI 展示的常见分布范围；不同海域的记录可能不同",
    },
    size: "大型群体可高约 3 米",
    fact: "深海也有珊瑚；它们张开小触手，接住水流带来的食物。",
    encyclopedia: {
      summary:
        "这种珊瑚形成分枝群体，表面的鼓起像一粒粒泡泡糖。它是动物，不是长在海底的植物。",
      habitat: "冷水海域的海山和海底峡谷岩石表面。",
      diet: "水流带来的浮游动物与有机颗粒。",
      features: [
        "分枝上分布着许多小珊瑚虫。",
        "依靠水流送来食物，生长较慢。",
        "群体能为其他鱼类和无脊椎动物提供藏身空间。",
      ],
      funFact:
        "深海珊瑚不需要像热带浅海珊瑚那样依靠阳光和共生藻类获取主要食物。",
    },
    sources: [mbari("bubblegum-coral", "Bubblegum coral")],
  },
  {
    id: "fangtooth",
    name: "尖牙鱼",
    nameEn: "Fangtooth",
    scientificName: "Anoplogaster cornuta",
    taxon: "物种",
    displayDepth: 1680,
    habitatRange: { min: 500, max: 2100, note: "MBARI 条目给出的分布范围" },
    size: "可达约 18 厘米",
    fact: "嘴里的长牙很显眼，侧线也帮助它感知周围的动静。",
    encyclopedia: {
      summary:
        "尖牙鱼也叫角高体金眼鲷。虽然牙齿突出，它却是一种小型深海掠食鱼。研究者认为，它可能更多靠等待来捕捉靠近的猎物。",
      habitat: "世界许多热带与温带海域的中层和深层水域。",
      diet: "鱼类和甲壳动物。",
      features: [
        "嘴大，有特别突出的长牙。",
        "侧线能感受水中细微的运动。",
        "幼体与成体的外形并不完全一样。",
      ],
      funFact:
        "科学家很少在原位见到它。标本能提供结构信息，活体影像则有助于补上行为上的空白。",
    },
    sources: [mbari("fangtooth", "Fangtooth")],
  },
  {
    id: "pelican-eel",
    name: "鹈鹕鳗",
    nameEn: "Pelican eel",
    scientificName: "Eurypharynx pelecanoides",
    taxon: "物种",
    displayDepth: 1980,
    habitatRange: { min: 500, max: 3000, note: "WHOI 科普条目给出的分布范围" },
    size: "口部宽大、尾部细长的鳗类",
    fact: "大嘴像一个展开的兜，能兜住一群小型猎物。",
    encyclopedia: {
      summary:
        "鹈鹕鳗的下颌和喉部可以大幅展开，外形让人联想到鹈鹕的喉囊。它属于鳗类，但不是靠高速追逐猎物的游泳高手。",
      habitat: "海洋深层开放水域，通常不进行许多中层鱼那样的夜间上浮觅食。",
      diet: "虾、鱿鱼和其他遇到的小动物。",
      features: [
        "嘴和喉部可大幅扩张。",
        "眼睛很小，尾部细长。",
        "吞入的海水可经鳃排出。",
      ],
      funFact:
        "英语中的 gulper eel 也会用来称呼另一类吞噬鳗。辨认条目和照片时，学名比共同的俗名更可靠。",
    },
    sources: [
      {
        publisher: "伍兹霍尔海洋研究所 WHOI",
        title: "Creature feature: Pelican Eel",
        url: "https://www.whoi.edu/ocean-learning-hub/ocean-facts/pelican-eel/",
      },
    ],
  },
  {
    id: "yeti-crab",
    name: "雪人蟹",
    nameEn: "Yeti crab",
    scientificName: "Kiwa hirsuta",
    taxon: "物种",
    displayDepth: 2350,
    size: "小型深海甲壳动物",
    fact: "白色的“毛”其实是刚毛，上面住着许多细菌。",
    encyclopedia: {
      summary:
        "这里介绍 2005 年发现的 Kiwa hirsuta。它的长螯上有密集的浅色刚毛，外形像穿着毛袖子，因而得到了雪人蟹的外号。",
      habitat: "复活节岛以南的太平洋—南极海岭热液喷口附近。",
      diet: "食物来源仍在研究；不能把其他雪人蟹已证实的细菌取食行为，直接套用到这个种。",
      features: [
        "身体浅色，眼部退化。",
        "长螯上密布刚毛和附生细菌。",
        "雪人蟹不只有一种，不同种生活的地点和行为有差别。",
      ],
      funFact:
        "“挥动螯足种细菌”的经典研究对象是 Kiwa puravida，而不是这张照片里的 Kiwa hirsuta。",
    },
    sources: [
      {
        publisher: "MBARI",
        title: "Discovery of the Yeti crab",
        url: "https://www.mbari.org/news/discovery-of-the-yeti-crab/",
      },
      {
        publisher: "PLOS ONE",
        title:
          "Dancing for Food in the Deep Sea: Bacterial Farming by a New Species of Yeti Crab",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3227565/",
      },
    ],
  },
  {
    id: "pompeii-worm",
    name: "庞贝虫",
    nameEn: "Pompeii worm",
    scientificName: "Alvinella pompejana",
    taxon: "物种",
    displayDepth: 2680,
    habitatRange: { min: 1500, max: 3500, note: "MBARI 条目给出的分布范围" },
    size: "可达约 15 厘米",
    fact: "住在热液烟囱上的小管里，在冷热交汇的地方生活。",
    encyclopedia: {
      summary:
        "庞贝虫是一种多毛类环节动物，会在热液烟囱表面建造薄管。许多个体并排生活，伸出鳃，又迅速缩回管内。",
      habitat: "东太平洋海隆、加拉帕戈斯裂谷和太平洋—南极海岭的热液区。",
      diet: "细菌等微生物。",
      features: [
        "身体表面有密集附生细菌。",
        "在管中移动，接触温暖流体和含氧冷海水。",
        "伸出的鳃呈红色至锈红色。",
      ],
      funFact:
        "喷口流体的最高温度不等于虫体的温度。说它“直接活在沸水里”，会把周围混合水和动物本身混为一谈。",
    },
    sources: [mbari("pompeii-worm", "Pompeii worm")],
  },
  {
    id: "swimming-cucumber",
    name: "游泳海参",
    nameEn: "Swimming sea cucumber",
    scientificName: "Enypniastes eximia",
    taxon: "物种",
    displayDepth: 3820,
    size: "小型、柔软的深海海参",
    fact: "它能离开海底游起来，透明身体里常能看到消化道。",
    encyclopedia: {
      summary:
        "这种海参的身体边缘有薄膜，能帮助它在海底附近游动。粉红到深紫红的颜色和半透明身体，使它看起来像一片会飘动的软布。",
      habitat:
        "世界多处深海海底附近，包括南大洋、墨西哥湾与波多黎各近海的观测。",
      diet: "海底沉积物中的有机碎屑。",
      features: [
        "身体部分透明，可看到内部消化道。",
        "薄膜状结构帮助游动。",
        "会接近海底取食，也能离开沉积物表面。",
      ],
      funFact:
        "“无头鸡怪”是它在英文报道里的外号，不是正式的分类名称，更不意味着它没有头端。",
    },
    sources: [
      {
        publisher: "澳大利亚南极计划",
        title: "Cucumber-cam assists conservation",
        url: "https://www.antarctica.gov.au/magazine/issue-35-december-2018/science/cucumber-cam-assists-conservation/",
      },
      {
        publisher: "史密森尼海洋馆",
        title: "Transparent Sea Cucumber",
        url: "https://ocean.si.edu/ocean-life/invertebrates/transparent-sea-cucumber",
      },
    ],
  },
];
