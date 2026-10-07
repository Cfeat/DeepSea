import { useState } from "react";
import type { SceneMedia } from "../data/types";

export default function ScenePhoto({
  media,
  caption = false,
  eager = false,
}: {
  media: SceneMedia;
  caption?: boolean;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="scene-photo">
      <div className="scene-frame">
        {failed ? (
          <p className="photo-placeholder">影像暂时无法加载。</p>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}${media.path}?v=${media.version}`}
            alt={media.caption}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        <span className="scene-kind">
          {media.kind === "photo" ? "真实影像" : "测深数据图"}
        </span>
      </div>
      {caption && (
        <figcaption>
          <p>{media.caption}</p>
          <span>
            {media.author} ·{" "}
            <a href={media.sourceUrl} target="_blank" rel="noreferrer">
              影像出处 ↗
            </a>
            {" · "}
            <a href={media.licenseUrl} target="_blank" rel="noreferrer">
              {media.license}
            </a>
          </span>
          <small>{media.modifications}</small>
        </figcaption>
      )}
    </figure>
  );
}
