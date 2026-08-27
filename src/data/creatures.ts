export type {
  OceanZone,
  ZoneInfo,
  Encyclopedia,
  Creature,
  Milestone,
  LayoutCreature,
  Lane,
} from './types'

export {
  MAX_DEPTH,
  PIXELS_PER_METER,
  SURFACE_OFFSET,
  depthToPixels,
  pixelsToDepth,
  getZoneAtDepth,
  getOceanColor,
} from './types'

export { zones, milestones } from './zones'
export { creatures } from './creatureData'
