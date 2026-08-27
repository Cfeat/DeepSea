import type { ZoneInfo } from '../data/creatures'

interface Props {
  zone: ZoneInfo
}

export default function ZoneWatermark({ zone }: Props) {
  return (
    <div className="zone-watermark" aria-hidden>
      <span>{zone.nameEn}</span>
    </div>
  )
}
