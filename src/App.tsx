import { useEffect, useRef, useState } from "react";
import { creatures, zones, type Creature } from "./data/creatures";
import EncyclopediaModal from "./components/EncyclopediaModal";
import DepthLab from "./components/DepthLab";
import CreatureCard from "./components/CreatureCard";
import DiveExplorer, { type DiveHandle } from "./components/DiveExplorer";
import { sources } from "./data/science";
import { mediaById } from "./data/media";
import { readIds, writeStorage } from "./utils/storage";
const ids = creatures.map((c) => c.id);

export default function App() {
  const [zone, setZone] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Creature | null>(null);
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(readIds("deepsea-read", ids)),
  );
  const dive = useRef<DiveHandle>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return readIds("deepsea-saved", ids);
    } catch {
      return [];
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);
  const filtered = creatures.filter(
    (c) =>
      (zone === "all" || c.zone === zone) &&
      (!savedOnly || saved.includes(c.id)) &&
      `${c.name} ${c.nameEn} ${c.scientificName} ${c.fact}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  function markRead(creature: Creature) {
    setVisited((previous) => {
      const next = new Set(previous).add(creature.id);
      return next;
    });
  }
  function openCreature(creature: Creature) {
    setSelected(creature);
    markRead(creature);
    const url = new URL(location.href);
    url.searchParams.set("creature", creature.id);
    history.pushState(null, "", url);
  }
  useEffect(() => {
    writeStorage("deepsea-read", [...visited]);
  }, [visited]);
  function closeCreature() {
    setSelected(null);
    const url = new URL(location.href);
    url.searchParams.delete("creature");
    history.replaceState(null, "", url);
  }
  function jumpCreature(creature: Creature) {
    if (selected) closeCreature();
    requestAnimationFrame(() => dive.current?.jumpCreature(creature.id));
  }
  useEffect(() => {
    function readLink() {
      const id = new URL(location.href).searchParams.get("creature");
      const creature = creatures.find((c) => c.id === id);
      setSelected(creature || null);
      if (creature) markRead(creature);
    }
    readLink();
    window.addEventListener("popstate", readLink);
    return () => window.removeEventListener("popstate", readLink);
  }, []);
  function toggleSaved(id: string) {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("deepsea-saved", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        跳至主要内容
      </a>
      <header className="site-header">
        <a className="brand" href="#">
          <span className="brand-icon">≋</span> 深海{" "}
          <span className="brand-en">DEEP SEA</span>
        </a>
        <nav aria-label="主导航">
          <a href="#journey">深度探索</a>
          <a href="#atlas">生物图鉴</a>
          <a href="#lab">深海实验室</a>
        </nav>
        <a className="header-link" href="#sources">
          参考资料 ↗
        </a>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          {!heroFailed && (
            <img
              className="hero-image"
              src={`${import.meta.env.BASE_URL}${mediaById["blue-whale"].path}`}
              alt="海面附近游动的蓝鲸，照片由 NOAA Fisheries 提供"
              fetchPriority="high"
              onError={() => setHeroFailed(true)}
            />
          )}
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">
              <span className="live-dot" /> DEEP SEA / 海洋深度探索
            </p>
            <h1 id="hero-title">
              海面之下，
              <br />
              另一个<span>世界。</span>
            </h1>
            <p className="hero-description">
              从海面向下，看看不同深度的海洋。
              <br />
              沿途了解海洋生物，以及它们的生活环境。
            </p>
            <a className="primary-button" href="#journey">
              开始下潜 <span>↓</span>
            </a>
            <a className="text-button" href="#atlas">
              查看生物图鉴 ↗
            </a>
          </div>
          <div className="hero-coordinate">
            <span>01 / THE SUNLIGHT ZONE</span>
            <strong>海面附近 · 透光层</strong>
            <small>
              {heroFailed
                ? "海洋深度探索"
                : "蓝鲸 · Balaenoptera musculus · NOAA Fisheries"}
            </small>
          </div>
          <div className="hero-ruler" aria-hidden="true">
            0 m<i />
            50
            <i />
            100
            <i />
            200 m
          </div>
          <div className="hero-bottom">
            <span>SCROLL TO EXPLORE ↓</span>
            <span>向下滚动，开始探索。</span>
          </div>
        </section>
        <div className="intro-stats">
          <div>
            <strong>
              ~11,000 <small>m</small>
            </strong>
            <span>海洋最深处约有这么深</span>
          </div>
          <div>
            <strong>
              05 <small>层</small>
            </strong>
            <span>从透光层到超深渊层</span>
          </div>
          <div>
            <strong>
              {creatures.length} <small>个条目</small>
            </strong>
            <span>海洋生物图鉴</span>
          </div>
          <p>
            越往下，阳光越少，
            <br />
            生活在这里的生物也不同。
          </p>
        </div>
        <DiveExplorer
          ref={dive}
          saved={saved}
          onSave={toggleSaved}
          onOpen={openCreature}
        />
        <section id="atlas" className="section atlas">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / LIFE BELOW THE SURFACE</p>
              <h2>海洋生物图鉴</h2>
            </div>
            <span className="reading-progress">
              已读 <b>{visited.size}</b> / {creatures.length}
            </span>
          </div>
          <div className="atlas-tools">
            <div className="filter-tabs" aria-label="按展示海层筛选">
              <button
                aria-pressed={zone === "all"}
                onClick={() => setZone("all")}
              >
                全部海层
              </button>
              {zones.map((z) => (
                <button
                  key={z.id}
                  aria-pressed={zone === z.id}
                  onClick={() => setZone(z.id)}
                >
                  {z.name}
                </button>
              ))}
            </div>
            <label className="search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索名称、学名或特征"
                aria-label="搜索生物"
              />
            </label>
          </div>
          <div className="results-line">
            <span aria-live="polite">
              共 {filtered.length} 个结果 · 按展示海层分组
            </span>
            <button
              className="save-filter"
              aria-pressed={savedOnly}
              onClick={() => setSavedOnly(!savedOnly)}
            >
              {" "}
              {savedOnly ? "★" : "☆"} 我的收藏 · {saved.length}
            </button>
          </div>
          {storageError && (
            <p role="status" className="note">
              收藏暂时无法保存到浏览器，刷新后可能丢失。
            </p>
          )}
          <div className="creature-grid">
            {filtered.map((c) => (
              <CreatureCard
                key={c.id}
                creature={c}
                saved={saved.includes(c.id)}
                onSave={() => toggleSaved(c.id)}
                onOpen={() => openCreature(c)}
                onJump={() => jumpCreature(c)}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <span>≋</span>
              <h3>没有找到匹配的生物</h3>
              <p>换个关键词试试，或清除筛选条件。</p>
              <button
                className="primary-button"
                onClick={() => {
                  setZone("all");
                  setQuery("");
                  setSavedOnly(false);
                }}
              >
                清除筛选
              </button>
            </div>
          )}
          <p className="note">
            同一种生物可能生活在多个海层，具体栖息范围可在百科中查看。部分条目介绍的是一类生物，因此条目数不等于物种数。
          </p>
        </section>
        <DepthLab />
        <section className="section sources" id="sources">
          <div>
            <p className="eyebrow">04 / FURTHER READING</p>
            <h2>
              想了解更多？
              <br />
              从这些资料读起。
            </h2>
            <p>
              这里列出了海层、压力和深海生物的参考资料，
              <br />
              点击可前往研究机构网站或论文页面。
            </p>
          </div>
          <div className="source-list">
            {sources.map((s, i) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                <span>0{i + 1}</span>
                <div>
                  <small>{s.publisher}</small>
                  <h3>{s.title}</h3>
                </div>
                <span>↗</span>
              </a>
            ))}
            <p className="note">
              生物配图均为真实照片，图片上标注拍摄状态。类群条目会注明照片中的具体物种；部分深海生物使用标本照片，请结合图注了解与活体外观的差异。出处、署名和许可列在百科内。轴上的展示位置不表示照片的拍摄深度。资料整理日期：2026
              年 10 月 7 日。
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand" href="#">
          ≋ 深海 <span className="brand-en">DEEP SEA</span>
        </a>
        <span>从海面到海沟，了解海洋。</span>
        <a href="#">返回海面 ↑</a>
      </footer>
      {selected && (
        <EncyclopediaModal
          key={selected.id}
          creature={selected}
          onClose={closeCreature}
          onJump={() => jumpCreature(selected)}
        />
      )}
    </>
  );
}
