interface Props {
  depth: number
  maxDepth: number
}

export default function DepthTrack({ depth, maxDepth }: Props) {
  const progress = Math.min((depth / maxDepth) * 100, 100)

  return (
    <aside className="depth-track" aria-label={`当前深度 ${depth} 米`}>
      <div className="depth-track-readout">
        <span className="depth-track-num">{depth.toLocaleString()}</span>
        <span className="depth-track-unit">meters</span>
      </div>
      <div className="depth-track-bar">
        <div className="depth-track-fill" style={{ height: `${progress}%` }} />
      </div>
    </aside>
  )
}
