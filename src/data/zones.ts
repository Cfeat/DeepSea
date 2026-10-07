import type { ZoneInfo } from "./types";
export const zones: ZoneInfo[] = [
  {
    id: "epipelagic",
    name: "透光层",
    nameEn: "Sunlight Zone",
    minDepth: 0,
    maxDepth: 200,
    description: "阳光照亮海洋表层，浮游植物的光合作用支持丰富的食物网。",
  },
  {
    id: "mesopelagic",
    name: "弱光层",
    nameEn: "Twilight Zone",
    minDepth: 200,
    maxDepth: 1000,
    description:
      "只剩微弱的光。许多居民借助生物发光，在暮色中隐藏、交流与捕食。",
  },
  {
    id: "bathypelagic",
    name: "午夜层",
    nameEn: "Midnight Zone",
    minDepth: 1000,
    maxDepth: 4000,
    description: "阳光无法抵达。黑暗、高压与稀少的食物，塑造了独特的生存方式。",
  },
  {
    id: "abyssopelagic",
    name: "深渊层",
    nameEn: "Abyssal Zone",
    minDepth: 4000,
    maxDepth: 6000,
    description: "寒冷的深层海水中，来自上方的有机物缓缓下沉，为生命带来能量。",
  },
  {
    id: "hadalpelagic",
    name: "超深渊层",
    nameEn: "Hadal Zone",
    minDepth: 6000,
    maxDepth: 11000,
    description: "走入海沟深处。即使面对极端压力，这里仍有适应环境的生命。",
  },
];
