import { useState } from "react";
import { creatures } from "../data/creatures";
import { mediaById } from "../data/media";
import { topicMedia } from "../data/topicMedia";
import ScenePhoto from "./ScenePhoto";
import CreatureArtwork from "./CreatureArtwork";
export default function HomePage() {
  const [heroFailed, setHeroFailed] = useState(false);
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        {!heroFailed && (
          <img
            className="hero-image"
            src={`${import.meta.env.BASE_URL}${mediaById["blue-whale"].path}?v=${mediaById["blue-whale"].version}`}
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
          <span>DIVE INTO THE OCEAN ↓</span>
          <span>从深度轴开始，认识海洋。</span>
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
      <section
        className="section home-entrances"
        aria-labelledby="entrances-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE YOUR WAY</p>
            <h2 id="entrances-title">也可以从这里开始</h2>
          </div>
          <p>找一种生物，读一个故事，或亲手试一试。</p>
        </div>
        <div className="entrance-grid">
          <a href="#atlas" className="entrance-card">
            <div className="entrance-image">
              <CreatureArtwork
                creature={creatures.find((c) => c.id === "vampire-squid")!}
              />
            </div>
            <div>
              <p className="eyebrow">01 / MARINE LIFE</p>
              <h3>
                遇见海洋生物 <span>↗</span>
              </h3>
              <p>从真实照片出发，了解它们的样貌、食物和栖息环境。</p>
            </div>
          </a>
          <a href="#topics" className="entrance-card">
            <ScenePhoto media={topicMedia["whale-fall"]} />
            <div>
              <p className="eyebrow">02 / OCEAN STORIES</p>
              <h3>
                读懂深海现象 <span>↗</span>
              </h3>
              <p>海洋雪、鲸落、热液喷口……看看深海的食物与地形。</p>
            </div>
          </a>
          <a href="#lab" className="entrance-card">
            <ScenePhoto media={topicMedia.vents} />
            <div>
              <p className="eyebrow">03 / TRY & OBSERVE</p>
              <h3>
                动手做个实验 <span>↗</span>
              </h3>
              <p>改变水深和亮度，观察压力、气体体积与伪装的变化。</p>
            </div>
          </a>
        </div>
        <p className="note">
          影像：NOAA / NOAA Ocean
          Exploration。生物照片的详细署名见百科，环境影像的出处见海洋专题。
        </p>
      </section>
    </>
  );
}
