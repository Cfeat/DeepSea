import { useEffect } from 'react'
import type { Creature } from '../data/creatures'
import { zones } from '../data/creatures'

interface Props {
  creature: Creature
  onClose: () => void
}

export default function EncyclopediaModal({ creature, onClose }: Props) {
  const zone = zones.find((z) => z.id === creature.zone)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <article
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>

        <div className="modal-hero">
          <img src={creature.image} alt={creature.name} className="modal-img" />
          <div className="modal-hero-text">
            <h2 id="modal-title">{creature.name}</h2>
            <p className="modal-subtitle">{creature.nameEn}</p>
            <dl className="modal-meta">
              <div>
                <dt>深度</dt>
                <dd>{creature.depth.toLocaleString()} m</dd>
              </div>
              {zone && (
                <div>
                  <dt>分区</dt>
                  <dd>{zone.name}</dd>
                </div>
              )}
              {creature.size && (
                <div>
                  <dt>体型</dt>
                  <dd>{creature.size}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="modal-body">
          <section className="modal-lead">
            <p>{creature.fact}</p>
          </section>
          <section>
            <h3>概述</h3>
            <p>{creature.encyclopedia.summary}</p>
          </section>
          <section>
            <h3>栖息地</h3>
            <p>{creature.encyclopedia.habitat}</p>
          </section>
          <section>
            <h3>食性</h3>
            <p>{creature.encyclopedia.diet}</p>
          </section>
          <section>
            <h3>特征</h3>
            <ul>
              {creature.encyclopedia.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section className="modal-aside">
            <h3>补充</h3>
            <p>{creature.encyclopedia.funFact}</p>
          </section>
        </div>

        <p className="modal-credit">图片来源：本地图库（百度图片）</p>
      </article>
    </div>
  )
}
