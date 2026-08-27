export type OceanZone =
  | 'epipelagic'
  | 'mesopelagic'
  | 'bathypelagic'
  | 'abyssopelagic'
  | 'hadalpelagic'

export interface ZoneInfo {
  id: OceanZone
  name: string
  nameEn: string
  minDepth: number
  maxDepth: number
  description: string
}

export interface Encyclopedia {
  summary: string
  habitat: string
  diet: string
  features: string[]
  funFact: string
}

export interface Creature {
  id: string
  name: string
  nameEn: string
  depth: number
  zone: OceanZone
  image: string
  imageCredit?: string
  size?: string
  /** Short inline fact shown beside the creature, neal.fun style */
  fact: string
  side: 'left' | 'right'
  encyclopedia: Encyclopedia
}

export interface Milestone {
  depth: number
  label: string
  description?: string
}

export type Lane = 'a' | 'b' | 'c' | 'd'

export interface LayoutCreature extends Creature {
  topPx: number
  depthCenterPx: number
  lane: 'a'
}

export const MAX_DEPTH = 11000

/** 像素/米：滚动距离与深度的换算比例 */
export const PIXELS_PER_METER = 0.9

/** 海面标题区占用高度，深度 0 从此处开始计量 */
export const SURFACE_OFFSET = 300

export function depthToPixels(depth: number, ppm = PIXELS_PER_METER): number {
  return SURFACE_OFFSET + depth * ppm
}

export function pixelsToDepth(px: number, ppm = PIXELS_PER_METER): number {
  return Math.max(0, Math.round((px - SURFACE_OFFSET) / ppm))
}

export function getZoneAtDepth(depth: number, zones: ZoneInfo[]): ZoneInfo {
  return (
    zones.find((z) => depth >= z.minDepth && depth < z.maxDepth) ??
    zones[zones.length - 1]
  )
}

export function getOceanColor(depth: number): string {
  const t = Math.min(depth / MAX_DEPTH, 1)
  if (t < 0.02) return '#1a6b8a'
  if (t < 0.05) return '#145a75'
  if (t < 0.1) return '#0f4a63'
  if (t < 0.18) return '#0a3850'
  if (t < 0.27) return '#062840'
  if (t < 0.36) return '#041e30'
  if (t < 0.45) return '#031525'
  if (t < 0.55) return '#020f1a'
  if (t < 0.73) return '#010a12'
  if (t < 0.91) return '#01060c'
  return '#000308'
}
