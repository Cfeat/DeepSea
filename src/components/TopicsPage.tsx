import { creatures, type Creature } from "../data/creatures";
import { topics } from "../data/topics";
import ScenePhoto from "./ScenePhoto";

export default function TopicsPage({
  topicId,
  onOpen,
}: {
  topicId?: string;
  onOpen: (creature: Creature) => void;
}) {
  const topic = topics.find((item) => item.id === topicId);
  if (topicId && !topic)
    return (
      <section className="section empty-state">
        <h1 className="page-title">这个专题暂时不存在</h1>
        <p>可以从专题目录继续阅读。</p>
        <a className="primary-button" href="#topics">
          查看全部专题 →
        </a>
      </section>
    );
  if (!topic)
    return (
      <section className="section topics-index">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OCEAN STORIES</p>
            <h1 className="page-title">海洋专题</h1>
          </div>
          <p>从一个现象开始，看看深海怎样运转。</p>
        </div>
        <div className="topic-grid">
          {topics.map((item, index) => (
            <a key={item.id} className="topic-card" href={`#topics/${item.id}`}>
              <ScenePhoto media={item.media} eager={index < 2} />
              <div className="topic-card-copy">
                <p className="eyebrow">
                  0{index + 1} / {item.kicker}
                </p>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <span>阅读专题 →</span>
              </div>
            </a>
          ))}
        </div>
        <p className="note">
          环境照片来自 NOAA。海沟采用 NOAA
          的水深地形数据图；各篇专题附有完整图注、署名与出处。
        </p>
      </section>
    );
  const index = topics.indexOf(topic);
  const related = creatures.filter((creature) =>
    topic.relatedCreatures.includes(creature.id),
  );
  return (
    <article className="section topic-article">
      <header className="article-heading">
        <p className="eyebrow">{topic.kicker} / OCEAN STORIES</p>
        <h1 className="page-title">{topic.title}</h1>
        <p>{topic.text}</p>
        <span>资料核对 · 2026 年 10 月 7 日</span>
      </header>
      <ScenePhoto media={topic.media} caption eager />
      <div className="article-body">
        {topic.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
        <aside className="article-source">
          <p className="eyebrow">继续查阅</p>
          <a href={topic.source.url} target="_blank" rel="noreferrer">
            {topic.source.publisher} · {topic.source.title} ↗
          </a>
          {topic.id === "survey" && (
            <a href={topic.media.sourceUrl} target="_blank" rel="noreferrer">
              NOAA · Okeanos Explorer 的设备与任务 ↗
            </a>
          )}
          <a href="#lab">到实验室观察压力与光照 →</a>
        </aside>
        {related.length > 0 && (
          <aside className="related-reading">
            <h2>还可以认识这些生物</h2>
            <p>阅读它们各自的栖息环境与生活方式。</p>
            <div>
              {related.map((creature) => (
                <button key={creature.id} onClick={() => onOpen(creature)}>
                  {creature.name} <span>↗</span>
                </button>
              ))}
            </div>
          </aside>
        )}
        <nav className="article-pagination" aria-label="专题阅读导航">
          <a href="#topics">← 全部专题</a>
          <a href={`#topics/${topics[(index + 1) % topics.length].id}`}>
            下一篇：{topics[(index + 1) % topics.length].kicker} →
          </a>
        </nav>
      </div>
    </article>
  );
}
