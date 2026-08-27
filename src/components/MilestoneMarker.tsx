import type { Milestone } from '../data/creatures'
import { depthToPixels } from '../data/creatures'

interface Props {
  milestone: Milestone
}

export default function MilestoneMarker({ milestone }: Props) {
  const centerY = depthToPixels(milestone.depth)

  return (
    <div className="milestone" style={{ top: centerY }}>
      <div className="milestone-line" />
      <div className="milestone-body">
        <span className="milestone-depth">{milestone.label}</span>
        {milestone.description && (
          <p className="milestone-desc">{milestone.description}</p>
        )}
      </div>
    </div>
  )
}
