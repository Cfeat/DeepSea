export type SilhouetteKind =
  | 'fish'
  | 'shark'
  | 'whale'
  | 'turtle'
  | 'cephalopod'
  | 'crustacean'
  | 'jelly'
  | 'penguin'
  | 'worm'
  | 'sponge'
  | 'default'

const kindById: Record<string, SilhouetteKind> = {
  'atlantic-cod': 'fish',
  'atlantic-salmon': 'fish',
  'bottlenose-dolphin': 'whale',
  'whale-shark': 'shark',
  'green-sea-turtle': 'turtle',
  'great-white-shark': 'shark',
  'blue-whale': 'whale',
  'humpback-whale': 'whale',
  orca: 'whale',
  'manta-ray': 'fish',
  octopus: 'cephalopod',
  'emperor-penguin': 'penguin',
  lanternfish: 'fish',
  'sperm-whale': 'whale',
  barreleye: 'fish',
  'giant-squid': 'cephalopod',
  'japanese-spider-crab': 'crustacean',
  coelacanth: 'fish',
  'vampire-squid': 'cephalopod',
  narwhal: 'whale',
  'giant-isopod': 'crustacean',
  'sixgill-shark': 'shark',
  'colossal-squid': 'cephalopod',
  anglerfish: 'fish',
  'giant-tube-worm': 'worm',
  'dumbo-octopus': 'cephalopod',
  'cuvier-beaked-whale': 'whale',
  'goblin-shark': 'shark',
  'sea-pig': 'worm',
  dragonfish: 'fish',
  snailfish: 'fish',
  'hadal-jellyfish': 'jelly',
  clownfish: 'fish',
  'hammerhead-shark': 'shark',
  'firefly-squid': 'cephalopod',
  blobfish: 'fish',
}

export function getSilhouetteKind(id: string): SilhouetteKind {
  return kindById[id] ?? 'default'
}

/** 标记直径（px），与 layoutCreatures 保持一致 */
export const MARKER_SIZE = 44
