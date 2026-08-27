import type { SilhouetteKind } from '../utils/creatureVisual'

interface Props {
  kind: SilhouetteKind
}

const paths: Record<SilhouetteKind, string> = {
  fish: 'M4 12c4-3 8-3 12 0 3 2 6 2 8 0 2-1 4-1 6 0-4 3-8 4-13 4s-9-1-13-4c2 0 4 0 6 0 2-1 4-2 6 0z M20 8v-2M16 9l-1-2M24 9l1-2',
  shark:
    'M3 14c5-2 10-2 15 0 4 1 7 1 9 0M6 14l-2 3M8 12V9M12 13l-1-3M16 13l1-3M20 12v-3M22 14l2 3M18 16h-4',
  whale:
    'M4 14c3-3 7-4 11-3 3 1 5 0 7-2 2 2 4 3 7 2 3-1 5 0 6 1-3 2-6 3-10 3s-8-1-11-3M8 11c0-2 1-3 2-3s2 1 2 3',
  turtle:
    'M8 16c2 1 4 1 6 0 2-1 4-1 6 0M10 12c0-3 2-5 4-5s4 2 4 5M6 14l-2 2M22 14l2 2M12 7V5M16 8l1-2',
  cephalopod:
    'M12 6c-2 0-4 2-4 5 0 3 1 5 4 6 1 3 0 5-1 6M12 6c2 0 4 2 4 5 0 3-1 5-4 6-1 3 0 5 1 6M8 14l-3 4M16 14l3 4M10 15l-2 3M14 15l2 3',
  crustacean:
    'M12 8c-3 0-5 2-5 5v3c0 2 2 3 5 3s5-1 5-3v-3c0-3-2-5-5-5M12 8V6M8 10L5 8M16 10l3-2M7 16l-3 2M17 16l3 2',
  jelly:
    'M6 10c0-2 3-4 6-4s6 2 6 4c0 3-2 6-6 8-4-2-6-5-6-8M9 18v3M12 19v4M15 18v3',
  penguin:
    'M12 5c-2 0-3 2-3 4v5c0 2 1 4 3 5 2-1 3-3 3-5V9c0-2-1-4-3-4M10 9l-1-2M14 9l1-2M11 18l-1 3M13 18l1 3',
  worm: 'M5 12c2-2 5-3 8-2 2 1 4 0 6-1 2 2 3 3 5 2M7 14c1 1 2 2 4 2',
  sponge:
    'M8 18V10c0-2 2-4 4-4h4c2 0 4 2 4 4v8M10 14h2M14 14h2M12 10v2',
  default:
    'M12 6c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7M12 10v4M10 12h4',
}

export default function CreatureSilhouette({ kind }: Props) {
  return (
    <svg
      className="creature-silhouette"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d={paths[kind]} />
    </svg>
  )
}
