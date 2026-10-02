import { useState } from "react";
import type { Creature } from "../data/types";
import { zones } from "../data/zones";
export default function CreatureCard({
  creature,
  saved,
  onSave,
  onOpen,
}: {
  creature: Creature;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="creature-card">
      <button
        className="card-open"
        onClick={onOpen}
        aria-label={`阅读${creature.name}百科`}
      >
        <div className="card-image">
          {failed ? (
            <span className="image-fallback">
              ≋<small>图片暂不可用</small>
            </span>
          ) : (
            <img
              src={creature.image}
              alt={creature.name}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          )}
          <span className="card-zone">
            {zones.find((z) => z.id === creature.zone)?.name}
          </span>
          <span className="card-arrow">↗</span>
        </div>
        <div className="card-body">
          <p className="card-en">{creature.nameEn}</p>
          <h3>{creature.name}</h3>
          <p className="card-fact">{creature.fact}</p>
          <span className="card-read">
            查看百科 <span>→</span>
          </span>
        </div>
      </button>
      <button
        className="bookmark"
        aria-label={`${saved ? "取消收藏" : "收藏"}${creature.name}`}
        aria-pressed={saved}
        onClick={onSave}
      >
        {saved ? "★" : "☆"}
      </button>
    </article>
  );
}
