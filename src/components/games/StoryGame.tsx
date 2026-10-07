import { useEffect, useRef, useState } from "react";
import type { Creature } from "../../data/types";
import { creatures } from "../../data/creatures";
import {
  chooseStory,
  createStory,
  decodeStory,
  encodeStory,
  STORY_KEY,
  storyChoiceReason,
  storyEndings,
  storyGear,
  storyNode,
  storyRecords,
  storyScore,
  type StoryGear,
  type StoryMode,
} from "../../games/storyEngine";
import { exportGameSave, useGameSave } from "../../games/useGameSave";
import GameTools from "./GameTools";
import "../../styles/games.css";

export default function StoryGame({
  onOpen,
}: {
  onOpen: (creature: Creature) => void;
}) {
  const { state, setState, warning, setWarning, importSave, reset } =
    useGameSave(STORY_KEY, decodeStory, encodeStory);
  const [name, setName] = useState("远舟");
  const [mode, setMode] = useState<StoryMode>("gentle");
  const [gear, setGear] = useState<StoryGear[]>(["sonar", "arm"]);
  const [abortConfirm, setAbortConfirm] = useState(false);
  const [tab, setTab] = useState<"records" | "log">("records");
  const chapter = useRef<HTMLElement>(null);
  const dashboard = useRef<HTMLDivElement>(null);
  const node = state ? storyNode(state) : null;
  const previousNode = useRef(state?.node);
  const previousEnding = useRef(state?.ending);
  useEffect(() => {
    if (
      state &&
      (previousNode.current !== state.node ||
        previousEnding.current !== state.ending)
    ) {
      chapter.current?.focus({ preventScroll: true });
      (state.ending ? chapter.current : dashboard.current)?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    }
    previousNode.current = state?.node;
    previousEnding.current = state?.ending;
    setAbortConfirm(false);
  }, [state?.node, state?.ending]);
  function choose(id: string) {
    setState((previous) => (previous ? chooseStory(previous, id) : previous));
    setAbortConfirm(false);
  }
  function selectGear(id: StoryGear) {
    setGear((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : previous.length < 2
          ? [...previous, id]
          : previous,
    );
  }
  return (
    <section
      className="section game-page story-game"
      aria-labelledby="story-title"
    >
      <GameTools
        active={!!state}
        warning={warning}
        onImport={importSave}
        onExport={() =>
          state && exportGameSave("深渊来信-存档.json", encodeStory(state))
        }
        onRestart={reset}
      />
      <header className="game-heading">
        <div>
          <p className="eyebrow">THE LAST TRANSMISSION / 文字探险</p>
          <h1 id="story-title">深渊来信</h1>
        </div>
        <p>一次失联调查。你的选择，会留在航行报告里。</p>
      </header>
      {!state ? (
        <div className="game-setup story-setup">
          <div className="story-prologue">
            <span className="transmission-label">INCOMING / 7 SECONDS</span>
            <div className="waveform" aria-hidden="true">
              {Array.from({ length: 35 }, (_, i) => (
                <i
                  key={i}
                  style={{ height: `${10 + ((i * 17 + 7) % 51)}px` }}
                />
              ))}
            </div>
            <blockquote>“别靠近主井。林岑，坐标……”</blockquote>
            <p>
              深海观测站已经失联三天。一封断续的来信，把你和搭档带向海面之下。
            </p>
            <dl className="game-facts">
              <div>
                <dt>航程</dt>
                <dd>6 章 · 约 15–25 分钟</dd>
              </div>
              <div>
                <dt>结局</dt>
                <dd>6 种航行结果</dd>
              </div>
              <div>
                <dt>玩法</dt>
                <dd>装备选择 · 分支调查 · 资源管理</dd>
              </div>
            </dl>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (gear.length === 2) {
                setState(createStory({ name, mode, gear }));
                setWarning("");
              }
            }}
          >
            <h2>准备出航</h2>
            <label className="field-label" htmlFor="story-name">
              你的呼号
            </label>
            <input
              id="story-name"
              value={name}
              maxLength={18}
              onChange={(event) => setName(event.target.value)}
              placeholder="远舟"
            />
            <fieldset>
              <legend>航程难度</legend>
              <div className="game-options">
                {(
                  [
                    {
                      id: "gentle",
                      label: "从容探索",
                      text: "更多储备，适合第一次出航",
                    },
                    {
                      id: "standard",
                      label: "标准航程",
                      text: "资源更紧，需要计划回程",
                    },
                  ] as const
                ).map((item) => (
                  <label key={item.id}>
                    <input
                      type="radio"
                      name="story-mode"
                      value={item.id}
                      checked={mode === item.id}
                      onChange={() => setMode(item.id)}
                    />
                    <strong>{item.label}</strong>
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                携带两件装备 <span>{gear.length}/2</span>
              </legend>
              <div className="gear-grid">
                {storyGear.map((item) => (
                  <label
                    className={gear.includes(item.id) ? "selected" : ""}
                    key={item.id}
                  >
                    <input
                      type="checkbox"
                      checked={gear.includes(item.id)}
                      disabled={!gear.includes(item.id) && gear.length === 2}
                      onChange={() => selectGear(item.id)}
                    />
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              className="game-button"
              type="submit"
              disabled={gear.length !== 2}
            >
              登上潜器，开始调查 ↓
            </button>
          </form>
        </div>
      ) : (
        <>
          <div ref={dashboard} className="story-dashboard">
            <div className="story-depth">
              <span>
                {state.setup.name} / 第 {node!.chapter} 章
              </span>
              <strong>
                {node!.depth.toLocaleString()}
                <small> m</small>
              </strong>
              <span>故事场景深度</span>
            </div>
            <div className="resource-strip">
              {(
                [
                  { key: "hull", label: "船体", max: 100 },
                  { key: "oxygen", label: "氧气", max: 125 },
                  { key: "battery", label: "电量", max: 125 },
                  { key: "trust", label: "信任", max: 100 },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className={
                    state[item.key] <= 20 ? "resource low" : "resource"
                  }
                >
                  <span>{item.label}</span>
                  <strong>
                    {state[item.key]}
                    <small> / {item.max}</small>
                  </strong>
                  <meter
                    aria-label={item.label}
                    value={state[item.key]}
                    min={0}
                    max={item.max}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="story-layout">
            <article
              ref={chapter}
              tabIndex={-1}
              className="story-chapter"
              aria-labelledby="chapter-title"
            >
              {state.ending ? (
                <div
                  className={`game-ending ending-${storyEndings[state.ending].color}`}
                >
                  <p className="eyebrow">航行报告 / END OF EXPEDITION</p>
                  <h2 id="chapter-title">{storyEndings[state.ending].title}</h2>
                  <p>{storyEndings[state.ending].text}</p>
                  <div className="ending-stats">
                    <span>
                      航行评分 <strong>{storyScore(state)}</strong>
                    </span>
                    <span>
                      观察笔记 <strong>{state.records.length}/6</strong>
                    </span>
                    <span>
                      救援{" "}
                      <strong>
                        {state.flags.includes("rescued")
                          ? "完成"
                          : state.flags.includes("relay")
                            ? "交接母船"
                            : "未介入"}
                      </strong>
                    </span>
                  </div>
                  <p className="note">
                    改变装备和路线，能遇到不同结果。下面的日志保留了本局的所有选择。
                  </p>
                  <button className="game-button" onClick={reset}>
                    再开始一次航程
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="chapter-progress"
                    aria-label={`第 ${node!.chapter} 章，共 6 章`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <span
                        className={item <= node!.chapter ? "active" : ""}
                        key={item}
                      >
                        {String(item).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <p className="chapter-speaker">{node!.speaker}</p>
                  <h2 id="chapter-title">{node!.title}</h2>
                  {state.log.length > 0 && (
                    <p className="choice-result" role="status">
                      {state.log[state.log.length - 1].result}
                    </p>
                  )}
                  <div className="chapter-copy">
                    {node!.paragraphs.map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  </div>
                  {Math.min(state.hull, state.oxygen, state.battery) <= 20 && (
                    <p className="game-warning" role="status">
                      储备已偏低。返航也是一个完整结局，请把回程的消耗算进去。
                    </p>
                  )}
                  <div className="story-choices" aria-label="选择下一步">
                    {node!.choices.map((choice, index) => {
                      const reason = storyChoiceReason(state, choice);
                      return (
                        <button
                          key={choice.id}
                          disabled={!!reason}
                          onClick={() => choose(choice.id)}
                        >
                          <span className="choice-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <strong>{choice.label}</strong>
                            <small>{reason || choice.hint}</small>
                          </span>
                          <span aria-hidden="true">→</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="abort-button"
                    onClick={() => setAbortConfirm(!abortConfirm)}
                  >
                    中止调查，返回海面
                  </button>
                  {abortConfirm && (
                    <div className="game-confirm">
                      <p>
                        现在返航会结束本次调查，已有观察会保留在航行报告中。
                      </p>
                      <button
                        className="game-button secondary"
                        onClick={() => choose("abort")}
                      >
                        确认返航
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setAbortConfirm(false)}
                      >
                        继续调查
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
            <aside className="story-notebook" aria-label="航行笔记">
              <h2>航行笔记</h2>
              <p className="equipment-note">
                {state.setup.gear
                  .map((id) => storyGear.find((item) => item.id === id)!.name)
                  .join(" · ")}
              </p>
              <div className="game-tab-row" aria-label="笔记视图">
                <button
                  aria-pressed={tab === "records"}
                  onClick={() => setTab("records")}
                >
                  观察 {state.records.length}
                </button>
                <button
                  aria-pressed={tab === "log"}
                  onClick={() => setTab("log")}
                >
                  日志 {state.log.length}
                </button>
              </div>
              {tab === "records" ? (
                <div className="notebook-content">
                  {state.records.length ? (
                    state.records.map((id) => (
                      <details key={id}>
                        <summary>{storyRecords[id].title}</summary>
                        <p>{storyRecords[id].text}</p>
                      </details>
                    ))
                  ) : (
                    <p className="note">
                      停下来观察时，笔记会记在这里。多看一眼，也要多留一些资源。
                    </p>
                  )}
                </div>
              ) : (
                <ol className="story-log">
                  {state.log.map((item, index) => (
                    <li key={index}>
                      <small>{item.title}</small>
                      <strong>{item.choice}</strong>
                      <p>{item.result}</p>
                    </li>
                  ))}
                </ol>
              )}
              {!state.ending && (node!.creature || node!.topic) && (
                <div className="game-reading">
                  <p>故事之外，了解真实深海</p>
                  {node!.creature &&
                    creatures.some((item) => item.id === node!.creature) && (
                      <button
                        onClick={() =>
                          onOpen(
                            creatures.find(
                              (item) => item.id === node!.creature,
                            )!,
                          )
                        }
                      >
                        认识
                        {
                          creatures.find((item) => item.id === node!.creature)!
                            .name
                        }{" "}
                        ↗
                      </button>
                    )}
                  {node!.topic && (
                    <a href={`#topics/${node!.topic}`}>阅读相关海洋专题 ↗</a>
                  )}
                  <small>阅读百科不会消耗游戏资源。</small>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
      <details className="game-rules">
        <summary>玩法与说明</summary>
        <p>
          选择两件装备出航。每个选项都标明资源变化；不满足装备或资源要求时不能选择。船体、氧气或电量降到
          0，航程中止。你可以在任何章节主动返航，取得已有观察对应的结局。
        </p>
        <p>
          救援、完整档案、热液观测和对环境的处理方式，会影响最终报告。观察笔记和每次选择都在右侧日志里。进度自动保存在当前浏览器，导出的存档可在其他设备导入。
        </p>
        <p>
          人物、站点和事件均为虚构。场景深度、氧气、电量、维修和应急流程用于游戏叙事，不是现实潜水或潜器操作指南。生物与环境知识可从相关百科查看原始资料。
        </p>
      </details>
    </section>
  );
}
