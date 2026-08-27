import type { Creature, LayoutCreature } from '../data/types'
import { depthToPixels, PIXELS_PER_METER } from '../data/types'

/** 滚动页图片标记尺寸（px） */
export const MARKER_SIZE = 52

const ROW_GAP = MARKER_SIZE + 6

/**
 * 同一水平行只保留一种生物：深度换算后的垂直中心距须 ≥ 标记高度
 */
export function dedupeByDepthRow(creatures: Creature[]): Creature[] {
  const sorted = [...creatures].sort((a, b) => a.depth - b.depth)
  const kept: Creature[] = []
  let lastCenter = -Infinity

  for (const c of sorted) {
    const center = depthToPixels(c.depth)
    if (kept.length === 0 || center - lastCenter >= ROW_GAP) {
      kept.push(c)
      lastCenter = center
    }
  }
  return kept
}

/** 垂直中心对齐深度刻度，每行仅一个标记（靠左） */
export function layoutCreatures(creatures: Creature[]): LayoutCreature[] {
  return dedupeByDepthRow(creatures).map((creature) => {
    const depthCenterPx = depthToPixels(creature.depth)
    const topPx = depthCenterPx - MARKER_SIZE / 2
    return { ...creature, topPx, depthCenterPx, lane: 'a' }
  })
}

export { PIXELS_PER_METER }
