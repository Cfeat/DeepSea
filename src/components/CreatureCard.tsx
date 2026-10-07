import CreatureArtwork from "./CreatureArtwork";
import type { Creature } from "../data/types";
import { zones } from "../data/zones";
export default function CreatureCard({
  creature,
  saved,
  onSave,
  onOpen,
  onJump,
}: {
  creature: Creature;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  onJump: () => void;
}) {
  return (
    <article className="creature-card">
      <button
        className="card-open"
        onClick={onOpen}
        aria-label={`阅读${creature.name}百科`}
      >
        <div className="card-image">
          <CreatureArtwork creature={creature} />
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
        className="card-jump"
        onClick={onJump}
        aria-label={`在深度轴查看${creature.name}`}
      >
        在深度轴查看 ↓{" "}
        <small>{creature.displayDepth.toLocaleString()} m · 示意</small>
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
