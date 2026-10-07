import { creatures, zones, type Creature } from "../data/creatures";
import CreatureCard from "./CreatureCard";
export interface AtlasFilters {
  zone: string;
  query: string;
  savedOnly: boolean;
  page: number;
}
export default function AtlasPage({
  filters,
  onFilter,
  saved,
  visited,
  storageError,
  onSave: toggleSaved,
  onOpen: openCreature,
  onJump: jumpCreature,
}: {
  filters: AtlasFilters;
  onFilter: (filters: AtlasFilters) => void;
  saved: string[];
  visited: Set<string>;
  storageError: boolean;
  onSave: (id: string) => void;
  onOpen: (creature: Creature) => void;
  onJump: (creature: Creature) => void;
}) {
  const { zone, query, savedOnly } = filters;
  const change = (update: Partial<AtlasFilters>) =>
    onFilter({ ...filters, ...update, page: 1 });
  const setZone = (zone: string) => change({ zone });
  const setQuery = (query: string) => change({ query });
  const setSavedOnly = (savedOnly: boolean) => change({ savedOnly });
  const filtered = creatures.filter(
    (c) =>
      (zone === "all" || c.zone === zone) &&
      (!savedOnly || saved.includes(c.id)) &&
      `${c.name} ${c.nameEn} ${c.scientificName} ${c.fact}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(filters.page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  function turnPage(page: number) {
    onFilter({ ...filters, page });
    document.getElementById("atlas")?.scrollIntoView({ behavior: "instant" });
    document
      .querySelector<HTMLInputElement>(".search input")
      ?.focus({ preventScroll: true });
  }
  return (
    <section id="atlas" className="section atlas">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LIFE BELOW THE SURFACE</p>
          <h1 className="page-title">海洋生物图鉴</h1>
        </div>
        <span className="reading-progress">
          已读 <b>{visited.size}</b> / {creatures.length}
        </span>
      </div>
      <p className="page-description">
        看看它们真实的样子。搜索名称或特征，打开百科了解更多；也可以回到深度轴，看看它们的展示位置。
      </p>
      <div className="atlas-tools">
        <div className="filter-tabs" aria-label="按展示海层筛选">
          <button aria-pressed={zone === "all"} onClick={() => setZone("all")}>
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
          共 {filtered.length} 个结果 · 按展示深度排列
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
        {visible.map((c) => (
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
              change({ zone: "all", query: "", savedOnly: false });
            }}
          >
            清除筛选
          </button>
        </div>
      )}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="图鉴分页">
          <button
            disabled={currentPage === 1}
            onClick={() => turnPage(currentPage - 1)}
          >
            ← 上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              aria-label={`图鉴第 ${n} 页`}
              aria-current={n === currentPage ? "page" : undefined}
              onClick={() => turnPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => turnPage(currentPage + 1)}
          >
            下一页 →
          </button>
          <span>
            第 {currentPage} / {totalPages} 页
          </span>
        </nav>
      )}
      <p className="note">
        同一种生物可能生活在多个海层，具体栖息范围可在百科中查看。部分条目介绍的是一类生物，因此条目数不等于物种数。
      </p>
    </section>
  );
}
