import { useState } from "react";
import { getZoneAtDepth, MAX_DEPTH } from "../data/types";
import { zones } from "../data/zones";
import { pressureAtDepth } from "../data/science";
import Experiments from "./Experiments";
export default function DepthLab() {
  const [depth, setDepth] = useState(1000);
  const [answer, setAnswer] = useState<number | null>(null);
  const zone = getZoneAtDepth(depth, zones);
  return (
    <section id="lab" className="section lab">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE OCEAN LAB</p>
          <h1 className="page-title">海水越深，压力有多大？</h1>
        </div>
        <p>
          拖动深度滑块，观察压力的变化。
          <br />
          也可以点击下方的深度数值进行比较。
        </p>
      </div>
      <div className="lab-grid">
        <div className="depth-console">
          <div className="console-top">
            <span>
              <i className="live-dot" /> 深度模拟器
            </span>
            <span>近似计算</span>
          </div>
          <div className="depth-value">
            {depth.toLocaleString()}
            <small>m</small>
          </div>
          <label htmlFor="depth-slider">下潜深度 · {zone.name}</label>
          <input
            id="depth-slider"
            type="range"
            min="0"
            max={MAX_DEPTH}
            step="10"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>海面 0 m</span>
            <span>海沟 11,000 m</span>
          </div>
          <div className="depth-presets">
            {[0, 200, 1000, 4000, 6000, 11000].map((d) => (
              <button
                key={d}
                aria-pressed={depth === d}
                onClick={() => setDepth(d)}
              >
                {d.toLocaleString()} m
              </button>
            ))}
          </div>
          <div className="lab-readouts">
            <div>
              <span>绝对压力估算</span>
              <strong>
                {pressureAtDepth(depth).toLocaleString("en-US", {
                  maximumFractionDigits: 1,
                })}
                <small> atm</small>
              </strong>
            </div>
            <div>
              <span>自然光环境</span>
              <strong>
                {depth < 200
                  ? "阳光充足*"
                  : depth < 1000
                    ? "微弱暮光*"
                    : "永久黑暗"}
              </strong>
            </div>
          </div>
          <details className="model-details">
            <summary>计算方法与模型假设</summary>
            <p className="note">
              P = P₀ + ρgh；取海水密度 1,025 kg/m³、g = 9.81 m/s²、1 atm =
              101,325
              Pa。忽略密度和重力随深度的变化，为近似值，非实测数据。*光照分区为概括。
            </p>
          </details>
        </div>
        <div className="lab-story">
          <span className="eyebrow">深海里的食物从哪来</span>
          <h3>
            没有阳光，
            <br />
            生命从哪里获得能量？
          </h3>
          <p>
            许多深海生物依靠从上方沉降的有机物，像缓慢飘落的“海洋雪”。在热液喷口附近，部分微生物能利用化学能合成有机物，支持另一种食物网。
          </p>
          <div className="quiz">
            <span>试着回答</span>
            <h4>下潜约 10 米，压力大约增加多少？</h4>
            <div>
              {["0.1 个大气压", "1 个大气压", "10 个大气压"].map((a, i) => (
                <button
                  key={a}
                  aria-pressed={answer === i}
                  onClick={() => setAnswer(i)}
                >
                  {a}
                </button>
              ))}
            </div>
            {answer !== null && (
              <p role="status">
                {answer === 1 ? "答对了！" : "正确答案是 1 个大气压。"}每下潜约
                10 米，水柱带来的压力增加约 1 atm；绝对压力还包括海面的约 1
                atm。
              </p>
            )}
          </div>
        </div>
      </div>
      <Experiments />
    </section>
  );
}
