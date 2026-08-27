import { useMemo } from 'react'

interface Props {
  depth: number
}

export default function MarineSnow({ depth }: Props) {
  const flakes = useMemo(
    () =>
      Array.from({ length: depth > 200 ? 40 : 20 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        size: 1 + (i % 3),
        delay: (i * 0.7) % 8,
        duration: 12 + (i % 10),
        opacity: 0.08 + (i % 5) * 0.04,
      })),
    [depth],
  )

  return (
    <div className="marine-snow" aria-hidden>
      {flakes.map((f) => (
        <span
          key={f.id}
          className="marine-snow-flake"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            opacity: depth > 200 ? f.opacity * 1.5 : f.opacity,
          }}
        />
      ))}
    </div>
  )
}
