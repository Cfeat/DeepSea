import { useEffect, useRef, useState } from "react";
import type { Creature } from "../data/creatures";
import { zones } from "../data/creatures";
import CreatureArtwork from "./CreatureArtwork";
interface Props {
  creature: Creature;
  onClose: () => void;
  onJump: () => void;
}
export default function EncyclopediaModal({
  creature,
  onClose,
  onJump,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const link = new URL(location.href);
  link.searchParams.set("creature", creature.id);
  link.hash = "";
  const citations = [
    ...new Map(
      [
        ...creature.sources,
        ...(creature.depthRecord ? [creature.depthRecord.source] : []),
      ].map((s) => [s.url, s]),
    ).values(),
  ];
  const zone = zones.find((z) => z.id === creature.zone);
  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <button
        type="button"
        className="modal-close"
        onClick={onClose}
        aria-label="关闭百科"
      >
        ×
      </button>
      <div className="modal-hero">
        <CreatureArtwork creature={creature} className="modal-art" />
        <div className="modal-hero-text">
          <p className="eyebrow">海洋生物百科</p>
          <h2 id="modal-title">{creature.name}</h2>
          <p className="modal-subtitle">{creature.nameEn}</p>
          <p className="scientific-name">
            <i>{creature.scientificName}</i> · {creature.taxon}
          </p>
          <dl className="modal-meta">
            <div>
              <dt>图中海层</dt>
              <dd>{zone?.name}</dd>
            </div>
            {creature.size && (
              <div>
                <dt>体型参考</dt>
                <dd>{creature.size}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      <div className="modal-body">
        <div className="modal-actions">
          <button onClick={onJump}>在深度轴查看 ↓</button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link.href);
                setCopyStatus("链接已复制");
              } catch {
                setCopyStatus("请选中下方链接复制");
              }
            }}
          >
            复制条目链接 ↗
          </button>
          <span role="status">{copyStatus}</span>
        </div>
        <input
          className="share-url"
          aria-label="条目链接"
          readOnly
          value={link.href}
          onFocus={(e) => e.target.select()}
        />
        <section className="modal-lead">
          <p>{creature.fact}</p>
        </section>
        <section>
          <h3>怎样读这些深度</h3>
          <dl className="depth-facts">
            <div>
              <dt>轴上展示位置</dt>
              <dd>
                {creature.displayDepth.toLocaleString()} m{" "}
                <small>为阅读安排选取的示意位置</small>
              </dd>
            </div>
            <div>
              <dt>栖息水深参考</dt>
              <dd>
                {creature.habitatRange ? (
                  <>
                    {creature.habitatRange.min.toLocaleString()}–
                    {creature.habitatRange.max.toLocaleString()} m
                    <small>{creature.habitatRange.note}</small>
                  </>
                ) : (
                  <>
                    请结合下方栖息说明
                    <small>所引资料未给出可用于此条目的统一数值范围</small>
                  </>
                )}
              </dd>
            </div>
            {creature.depthRecord && (
              <div>
                <dt>文献中的深度纪录</dt>
                <dd>
                  {creature.depthRecord.depth.toLocaleString()} m ·{" "}
                  {creature.depthRecord.year} 年
                  <small>{creature.depthRecord.note}</small>
                </dd>
              </div>
            )}
          </dl>
          {creature.habitatRange && (
            <div className="habitat-bar" aria-hidden="true">
              <span
                style={{
                  left: `${creature.habitatRange.min / 110}%`,
                  width: `${(creature.habitatRange.max - creature.habitatRange.min) / 110}%`,
                }}
              />
              <i style={{ left: `${creature.displayDepth / 110}%` }} />
              <small>0 m</small>
              <small>11,000 m</small>
            </div>
          )}
          <p className="note">
            数值范围可能来自多个物种或不同海域，不能把整段范围都当作某个个体的日常活动区域。
          </p>
        </section>
        <section>
          <h3>简介</h3>
          <p>{creature.encyclopedia.summary}</p>
        </section>
        <section>
          <h3>栖息环境</h3>
          <p>{creature.encyclopedia.habitat}</p>
        </section>
        <section>
          <h3>食物</h3>
          <p>{creature.encyclopedia.diet}</p>
        </section>
        <section>
          <h3>主要特征</h3>
          <ul>
            {creature.encyclopedia.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <section className="modal-aside">
          <h3>你可能还想知道</h3>
          <p>{creature.encyclopedia.funFact}</p>
        </section>
        <section>
          <h3>关于这条介绍</h3>
          <p>
            {creature.taxon === "类群"
              ? "这个条目介绍一类生物，不是单一物种。"
              : "这个条目介绍一个物种。"}
            体型与生活方式会随年龄、种群和海域改变。资料整理日期：
            {creature.reviewedOn}。
          </p>
          <ul className="entry-sources">
            {citations.map((s) => (
              <li key={s.url}>
                <a
                  className="modal-source"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.publisher} · {s.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="modal-credit">
        {creature.media ? (
          <>
            图片：{creature.media.caption} · {creature.media.author}。
            <a href={creature.media.sourceUrl} target="_blank" rel="noreferrer">
              原始出处 ↗
            </a>{" "}
            ·{" "}
            <a
              href={creature.media.licenseUrl}
              target="_blank"
              rel="noreferrer"
            >
              {creature.media.license} ↗
            </a>
          </>
        ) : (
          "配图：本站绘制的简化形态示意，不按比例，不用于物种鉴定。"
        )}
      </p>
    </dialog>
  );
}
