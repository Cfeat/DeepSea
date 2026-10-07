import { useState } from "react";
import type { Creature } from "../data/types";

export default function CreatureArtwork({
  creature,
  className = "",
}: {
  creature: Creature;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const media = creature.media;
  return (
    <div
      className={`creature-art is-photo ${failed ? "photo-unavailable" : ""} ${className}`}
    >
      {!failed ? (
        <img
          src={`${import.meta.env.BASE_URL}${media.path}`}
          alt={media.caption}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <p className="photo-placeholder">照片暂时无法加载</p>
      )}
      <span className="art-label">
        {failed ? "图片暂不可用" : media.captureType}
      </span>
    </div>
  );
}
