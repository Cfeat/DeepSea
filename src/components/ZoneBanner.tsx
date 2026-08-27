import type { ZoneInfo } from '../data/creatures'

interface Props {
  zone: ZoneInfo
  top: number
  isActive: boolean
}

export default function ZoneBanner({ zone, top, isActive }: Props) {
  if (zone.minDepth === 0) return null

  return (
    <div
      className={`zone-banner ${isActive ? 'zone-banner--active' : ''}`}
      style={{ top }}
    >
      <div className="zone-banner-inner">
        <span className="zone-depth">{zone.minDepth.toLocaleString()} m</span>
        <h2>{zone.name}</h2>
        <p className="zone-name-en">{zone.nameEn}</p>
        <p className="zone-desc">{zone.description}</p>
      </div>
    </div>
  )
}
