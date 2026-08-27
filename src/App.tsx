import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  creatures,
  milestones,
  zones,
  MAX_DEPTH,
  depthToPixels,
  getOceanColor,
  getZoneAtDepth,
  pixelsToDepth,
  type Creature,
} from './data/creatures'
import { layoutCreatures, MARKER_SIZE } from './utils/layoutCreatures'
import DepthTrack from './components/DepthTrack'
import CreatureMarker from './components/CreatureMarker'
import EncyclopediaModal from './components/EncyclopediaModal'
import ZoneBanner from './components/ZoneBanner'
import MilestoneMarker from './components/MilestoneMarker'
import MarineSnow from './components/MarineSnow'
import ScrollPrompt from './components/ScrollPrompt'
import OceanHUD from './components/OceanHUD'
import ZoneWatermark from './components/ZoneWatermark'

export default function App() {
  const laidOut = useMemo(() => layoutCreatures(creatures), [])

  const totalHeight = useMemo(() => {
    const maxBottom = laidOut.reduce(
      (max, c) => Math.max(max, c.topPx + MARKER_SIZE),
      depthToPixels(MAX_DEPTH),
    )
    return maxBottom + 700
  }, [laidOut])

  const [scrollDepth, setScrollDepth] = useState(0)
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null)
  const [visibleZone, setVisibleZone] = useState(zones[0])
  const [showPrompt, setShowPrompt] = useState(true)

  const handleScroll = useCallback(() => {
    const depth = Math.min(pixelsToDepth(window.scrollY), MAX_DEPTH)
    setScrollDepth(depth)
    setVisibleZone(getZoneAtDepth(depth, zones))
    if (window.scrollY > 80) setShowPrompt(false)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const oceanColor = getOceanColor(scrollDepth)
  const lightRayOpacity = Math.max(0, 1 - scrollDepth / 400)

  return (
    <>
      <DepthTrack depth={scrollDepth} maxDepth={MAX_DEPTH} />
      <OceanHUD depth={scrollDepth} creatureCount={laidOut.length} />
      <ZoneWatermark zone={visibleZone} />

      <div
        className="ocean"
        style={{
          height: totalHeight,
          background: `linear-gradient(180deg,
            #7ec8e8 0%,
            #3a8fbf 4%,
            ${oceanColor} 38%)`,
        }}
      >
        <div className="sun-rays" style={{ opacity: lightRayOpacity }} aria-hidden />

        <MarineSnow depth={scrollDepth} />

        <header className="surface-header">
          <p className="surface-byline">Scroll to descend</p>
          <h1>深海</h1>
          <p className="surface-sub">
            从海面到 {MAX_DEPTH.toLocaleString()} 米 · 点击生物查看百科
          </p>
        </header>

        {zones.map((zone) => (
          <ZoneBanner
            key={zone.id}
            zone={zone}
            top={depthToPixels(zone.minDepth)}
            isActive={visibleZone.id === zone.id}
          />
        ))}

        {milestones.map((m) => (
          <MilestoneMarker key={m.depth} milestone={m} />
        ))}

        {laidOut.map((creature) => (
          <CreatureMarker
            key={creature.id}
            creature={creature}
            onClick={() => setSelectedCreature(creature)}
          />
        ))}

        <footer
          className="challenger-deep"
          style={{ top: depthToPixels(10935) }}
        >
          <p className="challenger-label">Challenger Deep</p>
          <p className="challenger-depth">10,935 m</p>
          <p className="challenger-text">
            1960 年，的里雅斯特号首次抵达。2012 年，James Cameron 独自再次下潜至此。
          </p>
          <p className="challenger-end">The bottom.</p>
        </footer>
      </div>

      {showPrompt && scrollDepth < 50 && <ScrollPrompt />}

      {selectedCreature && (
        <EncyclopediaModal
          creature={selectedCreature}
          onClose={() => setSelectedCreature(null)}
        />
      )}
    </>
  )
}
