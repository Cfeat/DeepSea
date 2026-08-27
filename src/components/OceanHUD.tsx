import { zones, getZoneAtDepth } from '../data/creatures'

interface Props {
  depth: number
  creatureCount: number
}

export default function OceanHUD({ depth, creatureCount }: Props) {
  const zone = getZoneAtDepth(depth, zones)
  const passed = zones.findIndex((z) => z.id === zone.id) + 1

  return (
    <footer className="ocean-hud" aria-live="polite">
      <div className="ocean-hud-inner">
        <span className="hud-zone">{zone.name}</span>
        <span className="hud-sep" aria-hidden />
        <span className="hud-depth">{depth.toLocaleString()} m</span>
        <span className="hud-sep" aria-hidden />
        <span className="hud-meta">{creatureCount} 种生物 · 第 {passed}/5 层</span>
      </div>
    </footer>
  )
}
