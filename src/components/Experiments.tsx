import { useState } from "react";
import { gasVolumeFraction, pressureAtDepth } from "../data/science";
export default function Experiments() {
  const [depth, setDepth] = useState(10);
  const [background, setBackground] = useState(55);
  const [lamp, setLamp] = useState(20);
  const [enabled, setEnabled] = useState(false);
  const fraction = gasVolumeFraction(depth);
  const shade = (value: number) =>
    `rgb(${Math.round(value * 2.2)},${Math.round(value * 2.2)},${Math.round(value * 2.2)})`;
  const difference = Math.abs(background - (enabled ? lamp : 0));
  return (
    <div className="experiments">
      <article className="experiment">
        <p className="eyebrow">01 / 气体与压力</p>
        <h3>一个气囊，下潜后会缩多少？</h3>
        <p>
          海面时装有 1
          升气体的柔软密闭气囊，随水深增加会被压缩。拖动滑块，看看它的体积。
        </p>
        <div
          className="gas-visual"
          role="img"
          aria-label={`海面体积 1 升；${depth} 米处约 ${(fraction * 1000).toFixed(0)} 毫升`}
        >
          <div>
            <span className="gas-bubble" style={{ width: 110, height: 110 }} />
            <small>海面 · 1,000 mL</small>
          </div>
          <span className="gas-arrow">→</span>
          <div>
            <span
              className="gas-bubble"
              style={{
                width: 110 * Math.cbrt(fraction),
                height: 110 * Math.cbrt(fraction),
              }}
            />
            <small>
              {depth} m · {(fraction * 1000).toFixed(0)} mL
            </small>
          </div>
        </div>
        <label htmlFor="gas-depth">
          气囊水深 <output>{depth} m</output>
        </label>
        <input
          id="gas-depth"
          type="range"
          min="0"
          max="100"
          step="1"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
        <div className="experiment-readout">
          <span>绝对压力 ≈ {pressureAtDepth(depth).toFixed(2)} atm</span>
          <strong>剩余体积 {(fraction * 100).toFixed(1)}%</strong>
        </div>
        <details>
          <summary>计算方法与适用条件</summary>
          <p>
            玻意耳定律 P₁V₁ =
            P₂V₂。假设温度不变、气体不泄漏或溶解、薄膜张力忽略、内外压力平衡。圆形表示球形气囊的剖面，半径按体积的立方根缩放。模型只演示气体压缩，不能套用于整个动物身体。
          </p>
          <a
            href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/boyles-law/"
            target="_blank"
            rel="noreferrer"
          >
            NASA · Boyle's law ↗
          </a>
        </details>
      </article>
      <article className="experiment">
        <p className="eyebrow">02 / 生物发光</p>
        <h3>发光，为什么能帮助隐藏？</h3>
        <p>
          从下方向上看，动物会挡住来自上方的微光。有些动物让腹部发光，减小身体与背景的亮度差。
        </p>
        <div className="light-visual">
          <svg
            viewBox="0 0 360 160"
            role="img"
            aria-label={`从下方看，腹部${enabled ? "发光" : "不发光"}，示意亮度差 ${difference}`}
          >
            <rect width="360" height="160" fill={shade(background)} />
            <path
              d="M69 80Q139 33 227 68L291 44L278 80L291 119L227 94Q140 135 69 80Z"
              fill={enabled ? shade(lamp) : "#000"}
            />
          </svg>
          <span>观察方向：从下方看向水面</span>
        </div>
        <label htmlFor="background-light">
          上方背景亮度 <output>{background}</output>
        </label>
        <input
          id="background-light"
          type="range"
          min="10"
          max="90"
          value={background}
          onChange={(e) => setBackground(Number(e.target.value))}
        />
        <label htmlFor="belly-light">
          腹部发光亮度 <output>{lamp}</output>
        </label>
        <input
          id="belly-light"
          type="range"
          min="0"
          max="100"
          disabled={!enabled}
          value={lamp}
          onChange={(e) => setLamp(Number(e.target.value))}
        />
        <div className="light-actions">
          <button aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
            {enabled ? "关闭腹部发光" : "开启腹部发光"}
          </button>
          <button
            onClick={() => {
              setEnabled(true);
              setLamp(background);
            }}
          >
            匹配背景亮度
          </button>
        </div>
        <p className="light-result" role="status">
          示意亮度差：{difference} / 100。
          {difference === 0
            ? "在这个简化视角下，身体轮廓与背景融合。"
            : "试着让两种亮度接近，观察轮廓的变化。"}
        </p>
        <details>
          <summary>这个示意省略了什么</summary>
          <p>
            滑块使用相对亮度，没有实测单位。真实伪装还取决于光谱、观察角度、发光器分布与捕食者视觉。不是所有发光动物都用发光来隐藏。
          </p>
          <a
            href="https://naturalhistory.si.edu/visit/accessibility/audio-and-visual-description/sant-ocean-hall-visual-description-highlights-tour"
            target="_blank"
            rel="noreferrer"
          >
            史密森尼 · Counterillumination ↗
          </a>
        </details>
      </article>
    </div>
  );
}
