import { useEffect, useMemo, useRef, useState } from "react";
import {
  creatures,
  zones,
  MAX_DEPTH,
  getZoneAtDepth,
  type Creature,
} from "../data/creatures";
import { pressureAtDepth } from "../data/science";
import { createDiveLayout, DIVE_ROW_HEIGHT } from "../utils/diveLayout";
import "../styles/dive.css";

function DiveCreature({
  creature,
  onOpen,
  saved,
  onSave,
}: {
  creature: Creature;
  onOpen: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="dive-creature">
      <button
        className="dive-creature-open"
        onClick={onOpen}
        aria-label={`在深度轴上认识${creature.name}`}
      >
        <div className="dive-photo">
          {failed ? (
            <span className="image-fallback">≋</span>
          ) : (
            <img
              src={creature.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          )}
        </div>
        <div className="dive-creature-copy">
          <span className="dive-specimen">MARINE LIFE / {creature.nameEn}</span>
          <h3>{creature.name}</h3>
          <p>{creature.fact}</p>
          <span className="dive-read">查看百科 ↗</span>
        </div>
      </button>
      <button
        className="dive-save"
        aria-label={`${saved ? "取消收藏" : "收藏"}${creature.name}`}
        aria-pressed={saved}
        onClick={onSave}
      >
        {saved ? "★" : "☆"}
      </button>
    </article>
  );
}

export default function DiveExplorer({
  onOpen,
  saved,
  onSave,
}: {
  onOpen: (creature: Creature) => void;
  saved: string[];
  onSave: (id: string) => void;
}) {
  const layout = useMemo(
    () => createDiveLayout(creatures, zones, MAX_DEPTH),
    [],
  );
  const stage = useRef<HTMLDivElement>(null);
  const [depth, setDepth] = useState(0);
  const [immersed, setImmersed] = useState(false);
  const zone = getZoneAtDepth(depth, zones);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = stage.current?.getBoundingClientRect();
      if (!rect) return;
      const cursor = Math.max(240, window.innerHeight * 0.45);
      setDepth(Math.round(layout.toDepth(cursor - rect.top)));
      setImmersed(rect.top < cursor && rect.bottom > cursor);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (stage.current) observer.observe(stage.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [layout]);
  function jump(target: number) {
    if (!stage.current) return;
    const cursor = Math.max(240, window.innerHeight * 0.45);
    window.scrollTo({
      top:
        window.scrollY +
        stage.current.getBoundingClientRect().top +
        layout.toY(target) -
        cursor,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  const ticks = useMemo(
    () =>
      Array.from({ length: 111 }, (_, i) => i * 100).filter((d) => {
        const y = layout.toY(d);
        return !layout.stops.some((s) => Math.abs(s.y - y) < 50);
      }),
    [layout],
  );
  return (
    <section
      id="journey"
      className="dive-explorer"
      aria-labelledby="dive-title"
    >
      <div className="dive-intro">
        <p className="eyebrow">01 / A JOURNEY FROM 0 TO 11,000 METERS</p>
        <h2 id="dive-title">从海面开始，向下探索</h2>
        <p>向下滚动可以下潜，点击生物查看介绍，也可以选择海层直接跳转。</p>
        <div className="dive-method">
          <span>↓ 滚动即下潜</span>
          <span>↗ 点击生物看百科</span>
          <span>≋ 深度轴非等比例</span>
        </div>
        <p className="note">
          为方便阅读，生物较多的区段拉开了间距。生物旁的深度仅表示图中的示意位置，不代表实际观测深度或下潜极限；栖息范围请查看百科。
        </p>
      </div>
      <div className={`dive-toolbar ${immersed ? "is-immersed" : ""}`}>
        <div className="dive-instruments">
          <div className="dive-depth">
            <span className="live-dot" />
            <strong>{depth.toLocaleString()}</strong>
            <small>m</small>
            <span className="dive-current-zone">{zone.name}</span>
          </div>
          <span className="dive-pressure">
            ≈ {pressureAtDepth(depth).toFixed(0)} atm{" "}
            <small>绝对压力估算</small>
          </span>
          <a href="#atlas" className="dive-atlas-link">
            搜索 / 收藏 ↗
          </a>
        </div>
        <nav className="dive-zone-nav" aria-label="深度轴海层导航">
          {zones.map((z, i) => (
            <button
              key={z.id}
              aria-pressed={zone.id === z.id}
              onClick={() => jump(z.minDepth)}
            >
              <span>0{i + 1}</span> {z.name}
              <small>{z.minDepth.toLocaleString()} m</small>
            </button>
          ))}
          <button className="dive-bottom-jump" onClick={() => jump(MAX_DEPTH)}>
            抵达海底 ↓
          </button>
        </nav>
        <div className="dive-progress" aria-hidden="true">
          <span style={{ width: `${(depth / MAX_DEPTH) * 100}%` }} />
        </div>
      </div>
      <div ref={stage} className="dive-stage" style={{ height: layout.height }}>
        {zones.map((z, i) => (
          <div
            key={z.id}
            className={`dive-water dive-water-${i}`}
            style={{
              top: layout.toY(z.minDepth),
              height: layout.toY(z.maxDepth) - layout.toY(z.minDepth),
            }}
            aria-hidden="true"
          />
        ))}
        <div
          className="dive-axis"
          style={{
            top: layout.toY(0),
            height: layout.toY(MAX_DEPTH) - layout.toY(0),
          }}
          aria-hidden="true"
        />
        {ticks.map((d) => (
          <div
            key={d}
            className={`dive-tick ${d % 1000 === 0 ? "major" : ""}`}
            style={{ top: layout.toY(d) }}
            aria-hidden="true"
          >
            <span>{d.toLocaleString()} m</span>
          </div>
        ))}
        {layout.stops.map((stop, index) => (
          <div key={stop.depth}>
            {stop.zone && (
              <div className="dive-zone-banner" style={{ top: stop.y }}>
                <span className="dive-zone-depth">
                  {stop.depth.toLocaleString()} m
                </span>
                <div>
                  <p className="eyebrow">{stop.zone.nameEn.toUpperCase()}</p>
                  <h2>{stop.zone.name}</h2>
                  <p>{stop.zone.description}</p>
                </div>
              </div>
            )}
            {stop.creatures.length > 0 && (
              <div
                className={`dive-encounter ${index % 2 ? "on-left" : "on-right"}`}
                style={{ top: stop.y + (stop.zone ? 290 : 0) }}
              >
                <div className="dive-anchor">
                  <span>{stop.depth.toLocaleString()} m</span>
                  <small>示意位置</small>
                </div>
                <div className="dive-encounter-cards">
                  {stop.creatures.map((c) => (
                    <div key={c.id} style={{ height: DIVE_ROW_HEIGHT }}>
                      <DiveCreature
                        creature={c}
                        onOpen={() => onOpen(c)}
                        saved={saved.includes(c.id)}
                        onSave={() => onSave(c.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="dive-finish" style={{ top: layout.toY(MAX_DEPTH) }}>
          <span className="eyebrow">THE HADAL FRONTIER</span>
          <h2>约 11,000 米，海洋的最深处。</h2>
          <p>
            挑战者深渊的一项研究给出 10,935 ± 6 米的深度估计。
            <br />
            不同测量方法和地点会得到略有差异的结果，下面的论文介绍了这次测量。
          </p>
          <a
            href="https://repository.library.noaa.gov/view/noaa/33477"
            target="_blank"
            rel="noreferrer"
          >
            阅读 2021 年研究 ↗
          </a>
          <div>
            <button onClick={() => jump(0)}>返回海面 ↑</button>
            <a href="#lab">进入深海实验室 →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
