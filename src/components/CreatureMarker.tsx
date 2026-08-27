import { useState } from 'react'
import type { LayoutCreature } from '../data/creatures'

interface Props {
  creature: LayoutCreature
  onClick: () => void
}

export default function CreatureMarker({ creature, onClick }: Props) {
  const [err, setErr] = useState(false)

  return (
    <button
      type="button"
      className="creature"
      style={{ top: creature.topPx }}
      onClick={onClick}
      aria-label={`${creature.name}，${creature.depth} 米`}
    >
      <span className="creature-depth-line" aria-hidden />
      <span className="creature-photo">
        {!err ? (
          <img
            src={creature.image}
            alt=""
            loading="lazy"
            onError={() => setErr(true)}
          />
        ) : (
          <span className="creature-photo-fallback">{creature.name.slice(0, 1)}</span>
        )}
      </span>
      <span className="creature-tag">
        <span className="creature-tag-name">{creature.name}</span>
        <span className="creature-tag-depth">{creature.depth} m</span>
      </span>
    </button>
  )
}
