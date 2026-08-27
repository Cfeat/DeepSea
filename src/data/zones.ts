import type { ZoneInfo, Milestone } from './types'

export const zones: ZoneInfo[] = [
  {
    id: 'epipelagic',
    name: '透光层',
    nameEn: 'Epipelagic Zone',
    minDepth: 0,
    maxDepth: 200,
    description: '阳光能够穿透的海域。这里集中了约 90% 的海洋生物。',
  },
  {
    id: 'mesopelagic',
    name: '弱光层',
    nameEn: 'Mesopelagic Zone',
    minDepth: 200,
    maxDepth: 1000,
    description: '又称暮光区。阳光迅速衰减，许多生物演化出发光能力。',
  },
  {
    id: 'bathypelagic',
    name: '午夜层',
    nameEn: 'Bathypelagic Zone',
    minDepth: 1000,
    maxDepth: 4000,
    description: '完全黑暗，压力约为海面的 100 倍。生物依靠化学感受与生物光生存。',
  },
  {
    id: 'abyssopelagic',
    name: '深渊层',
    nameEn: 'Abyssopelagic Zone',
    minDepth: 4000,
    maxDepth: 6000,
    description: '海底平原与缓坡，水温接近 4°C，食物主要来自上方沉降的有机碎屑。',
  },
  {
    id: 'hadalpelagic',
    name: '超深渊层',
    nameEn: 'Hadalpelagic Zone',
    minDepth: 6000,
    maxDepth: 11000,
    description: '海沟深处，是地球最极端的栖息地之一。',
  },
]

export const milestones: Milestone[] = [
  { depth: 10, label: '10 m', description: '人类日常接触海洋的深度' },
  { depth: 40, label: '40 m', description: '休闲水肺潜水的常规极限' },
  { depth: 200, label: '200 m', description: '阳光几乎无法抵达的边界' },
  { depth: 332, label: '332 m', description: '人类水肺潜水最深纪录（Ahmed Gabr，2014）' },
  { depth: 828, label: '828 m', description: '无辅助自由潜水最深纪录' },
  { depth: 1000, label: '1,000 m', description: '进入完全黑暗的午夜层' },
  { depth: 1090, label: '1,090 m', description: '帝企鹅潜水的最大深度' },
  { depth: 2000, label: '2,000 m', description: '抹香鲸日常觅食的典型深度' },
  { depth: 3800, label: '3,800 m', description: '泰坦尼克号残骸所在深度' },
  { depth: 4000, label: '4,000 m', description: '这是海洋的平均深度' },
  { depth: 6000, label: '6,000 m', description: '进入超深渊层' },
  { depth: 8848, label: '8,848 m', description: '你已下潜相当于珠穆朗玛峰的高度' },
  { depth: 10935, label: '10,935 m', description: '挑战者深渊——海洋最深处' },
]
