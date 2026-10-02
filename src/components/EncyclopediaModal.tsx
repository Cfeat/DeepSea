import { useEffect, useRef, useState } from "react";
import type { Creature } from "../data/creatures";
import { zones } from "../data/creatures";
interface Props {
  creature: Creature;
  onClose: () => void;
}
export default function EncyclopediaModal({ creature, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
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
        {failed ? (
          <div className="image-fallback">
            ≋<small>图片暂不可用</small>
          </div>
        ) : (
          <img
            src={creature.image}
            alt={creature.name}
            className="modal-img"
            onError={() => setFailed(true)}
          />
        )}
        <div className="modal-hero-text">
          <p className="eyebrow">海洋生物百科</p>
          <h2 id="modal-title">{creature.name}</h2>
          <p className="modal-subtitle">{creature.nameEn}</p>
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
        <section className="modal-lead">
          <p>{creature.fact}</p>
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
            图中只选取了一个海层作展示。生物的分布和体型因种类、年龄及海域而异；部分内容的文献出处仍在核对中。
          </p>
          <a
            className="modal-source"
            href="https://www.mbari.org/education/animals-of-the-deep/"
            target="_blank"
            rel="noreferrer"
          >
            延伸阅读：MBARI 深海动物资料库 ↗
          </a>
        </section>
      </div>
      <p className="modal-credit">
        图片仅供参考，不能用于物种鉴定。作者与授权信息尚未完整确认。
      </p>
    </dialog>
  );
}
