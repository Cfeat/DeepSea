import { sources } from "../data/science";
import { topicMedia } from "../data/topicMedia";
export default function SourcesPage() {
  return (
    <>
      <section className="section sources" id="sources">
        <div>
          <p className="eyebrow">FURTHER READING</p>
          <h1 className="page-title">
            想了解更多？
            <br />
            从这些资料读起。
          </h1>
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
      <section
        className="section editorial-method"
        aria-labelledby="method-title"
      >
        <p className="eyebrow">HOW TO READ THIS SITE</p>
        <h2 id="method-title">阅读前，分清这几种信息</h2>
        <div className="method-grid">
          <article>
            <span>01</span>
            <h3>展示位置与真实水深</h3>
            <p>
              深度轴是一条非等比例的阅读路线。生物卡片旁的数字是示意位置；栖息范围、最深记录及其出处在百科中分别列出。
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>物种与类群</h3>
            <p>
              有些条目介绍的是一个物种，有些介绍一类生物。学名和分类层级会明确标注；类群照片还会注明图中实际拍到的成员。
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>照片、数据与模型</h3>
            <p>
              照片记录实际主体，测深图呈现数据，实验用简化模型观察变化。标本与活体外观可能不同，不能把模型输出当作海洋实测值。
            </p>
          </article>
        </div>
        <details className="image-register">
          <summary>查看环境影像的全部出处与使用说明</summary>
          <div className="credit-register">
            {Object.entries(topicMedia).map(([id, media]) => (
              <article key={id}>
                <h3>{media.caption}</h3>
                <p>{media.author}</p>
                <p>{media.modifications}</p>
                <a href={media.sourceUrl} target="_blank" rel="noreferrer">
                  来源页面 ↗
                </a>
                <a href={media.originalUrl} target="_blank" rel="noreferrer">
                  原始影像 ↗
                </a>
                <a href={media.licenseUrl} target="_blank" rel="noreferrer">
                  {media.license} ↗
                </a>
              </article>
            ))}
          </div>
        </details>
        <p className="note">
          资料核对与图注更新：2026 年 10 月 7
          日。本站是独立的非商业科普项目，引用机构不代表对本站内容的认可。物种图片的具体许可见百科；图片许可与代码许可分别适用。
        </p>
      </section>
    </>
  );
}
