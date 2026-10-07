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
  storyActionReason,
  storyChoiceChance,
  storyGoals,
  storyObjectives,
  storyReturnCost,
  type StorySetup,
  type StoryGear,
  type StoryMode,
} from "../../games/storyEngine";
import { exportGameSave, useGameSave } from "../../games/useGameSave";
import GameTools from "./GameTools";
import StoryExpeditionPanel from "./StoryExpeditionPanel";
import "../../styles/games.css";
import "../../styles/gameplay.css";

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
  const [goal, setGoal] = useState<StorySetup["goal"]>("truth");
  const [abortConfirm, setAbortConfirm] = useState(false);
  const [tab, setTab] = useState<"records" | "log">("records");
  const chapter = useRef<HTMLElement>(null);
  const dashboard = useRef<HTMLDivElement>(null);
  const notebook = useRef<HTMLElement>(null);
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
        <p>选一条航线，留够回程储备，把人和答案带回来。</p>
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
                <dd>9 处地点 · 可以绕路与折返</dd>
              </div>
              <div>
                <dt>结局</dt>
                <dd>6 种航行结果</dd>
              </div>
              <div>
                <dt>玩法</dt>
                <dd>航线规划 · 证据推理 · 风险与补给</dd>
              </div>
            </dl>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (gear.length === 2) {
                setState(
                  createStory({
                    name,
                    mode,
                    gear,
                    goal,
                    seed: Math.floor(Math.random() * 1000000),
                  }),
                );
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
              <legend>这次为什么出航？</legend>
              <div className="campaign-options">
                {storyGoals.map((item) => (
                  <label key={item.id}>
                    <input
                      type="radio"
                      name="story-goal"
                      checked={goal === item.id}
                      onChange={() => setGoal(item.id)}
                    />
                    <strong>{item.name}</strong>
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
          {state.expedition && (
            <div className="story-shortcuts" aria-label="探险区域导航">
              <button
                onClick={() => {
                  chapter.current?.focus({ preventScroll: true });
                  chapter.current?.scrollIntoView({
                    block: "start",
                    behavior: "instant",
                  });
                }}
              >
                现场调查
              </button>
              <button
                onClick={() => {
                  notebook.current?.focus({ preventScroll: true });
                  notebook.current?.scrollIntoView({
                    block: "start",
                    behavior: "instant",
                  });
                }}
              >
                航线与物资
              </button>
              <span>已到访 {state.expedition.visited.length}/9</span>
            </div>
          )}
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
                    {state.expedition && (
                      <span>
                        航行目标{" "}
                        <strong>
                          {storyObjectives(state).every((item) => item.done)
                            ? "完成"
                            : "尚未完成"}
                        </strong>
                      </span>
                    )}
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
                    {state.flags.includes("evacuated")
                      ? "人员已经返回，潜器留在了海底。"
                      : "改变目标、装备和航线，下一次会是不同的旅程。"}
                    下面的日志保留了本局的所有选择。
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
                  {state.expedition && (
                    <p className="eyebrow">
                      {state.expedition.encounter
                        ? "航行遭遇 / 先处理当前情况"
                        : "自由调查 / 不必按深度顺序行动"}
                    </p>
                  )}
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
                      const chance = storyChoiceChance(state, choice);
                      return (
                        <button
                          key={choice.id}
                          data-choice={choice.id}
                          disabled={!!reason}
                          onClick={() => choose(choice.id)}
                        >
                          <span className="choice-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <strong>{choice.label}</strong>
                            <small>
                              {reason ||
                                `${choice.hint}${chance !== null ? ` · 当前成功率 ${chance}%` : ""}`}
                            </small>
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
                        {state.expedition
                          ? `正常返航需要 ${storyReturnCost(state).oxygen} 氧气、${storyReturnCost(state).battery} 电量。现有资料会保留；请先使用物资，或发出信标等待接应。`
                          : "现在返航会结束本次调查，已有观察会保留在航行报告中。"}
                      </p>
                      <button
                        className="game-button secondary"
                        disabled={
                          !!state.expedition &&
                          !!storyActionReason(state, "abort")
                        }
                        onClick={() => choose("abort")}
                      >
                        确认返航
                      </button>
                      {state.expedition && (
                        <button
                          className="game-button secondary"
                          disabled={!!storyActionReason(state, "evacuate")}
                          onClick={() => choose("evacuate")}
                        >
                          放弃潜器，等待接应
                        </button>
                      )}
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
            <aside
              ref={notebook}
              tabIndex={-1}
              className="story-notebook"
              aria-label="航行笔记"
            >
              {state.expedition && (
                <StoryExpeditionPanel state={state} onAction={choose} />
              )}
              {!state.expedition && (
                <p className="setup-tip">
                  这份旧存档沿用原航程规则。重新开始时可以体验自由航线与证据调查。
                </p>
              )}
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
          选择目标和两件装备出航。现场行动和航行各推进一个时刻，使用物资不推进。先定位林岑，再在时刻
          20 前完成救援；时刻 22
          起海面天气变差。每次行动都标明成本，已领取的补给不能重复领取。船体、氧气、电量降到
          0 或紧张达到 100，航程中止。
        </p>
        <p>
          地图上选择相邻地点，再确认航行。旧中继舱有补给和检修册；在回声站选择两份证据核实故障，才能取得完整档案。可以随时用已知路线返航，但需要预留氧气与电量。目标、救援和带回的资料影响报告。风险判定会随本局行动固定，刷新页面不会重新判定。
        </p>
        <p>
          人物、站点和事件均为虚构。场景深度、氧气、电量、维修和应急流程用于游戏叙事，不是现实潜水或潜器操作指南。生物与环境知识可从相关百科查看原始资料。
        </p>
      </details>
    </section>
  );
}
