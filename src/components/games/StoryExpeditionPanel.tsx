import { useState } from "react";
import {
  cargoSpecs,
  evidenceSpecs,
  storyActionReason,
  storyGoals,
  storyObjectives,
  storyReturnCost,
  storySites,
  storyTravel,
  travelStyles,
  type StoryState,
} from "../../games/storyEngine";
import type {
  EvidenceId,
  StorySiteId,
  TravelStyle,
} from "../../games/storyExpedition";

export default function StoryExpeditionPanel({
  state,
  onAction,
}: {
  state: StoryState;
  onAction: (id: string) => void;
}) {
  const [tab, setTab] = useState<"map" | "evidence" | "cargo">("map");
  const [style, setStyle] = useState<TravelStyle>("steady");
  const [selected, setSelected] = useState<StorySiteId | null>(null);
  const [clues, setClues] = useState<EvidenceId[]>([]);
  const [theory, setTheory] = useState("");
  const e = state.expedition!;
  const site = storySites.find((item) => item.id === state.node);
  const target = site?.links.includes(selected!) ? selected! : site?.links[0];
  const route = target ? storyTravel(state, target, style) : null;
  const compare = `compare:${clues[0]}:${clues[1]}:${theory}`;
  const reason = storyActionReason(state, compare);
  const back = storyReturnCost(state);
  return (
    <section className="expedition-panel" aria-label="航线与物资">
      <div className="expedition-status">
        <span>
          航行时刻 <strong>{String(e.turn).padStart(2, "0")}</strong>
        </span>
        <span className={e.stress >= 60 ? "negative" : ""}>
          紧张 <strong>{e.stress}/100</strong>
        </span>
      </div>
      <p className="expedition-clock">
        {state.flags.includes("rescued")
          ? "林岑已脱困"
          : state.flags.includes("relay") || e.turn >= 20
            ? "母船已接手救援"
            : `林岑的备用供电：剩余 ${20 - e.turn} 个航行时刻`}
      </p>
      <p className="note">
        {e.turn >= 22
          ? "海面天气变差，返航多耗 5 电量。"
          : "时刻 22 起海面天气变差，返航电耗增加。"}{" "}
        航行和现场行动各推进一次，整理物资不推进。
      </p>
      <details className="expedition-objectives" open>
        <summary>
          本次目标：
          {storyGoals.find((item) => item.id === state.setup.goal)?.name}
        </summary>
        <ul>
          {storyObjectives(state).map((item) => (
            <li className={item.done ? "done" : ""} key={item.text}>
              <span>{item.done ? "✓" : "○"}</span>
              {item.text}
            </li>
          ))}
        </ul>
        <small>
          目标完成后仍需返航。预计氧气 −{back.oxygen}，电量 −{back.battery}。
        </small>
      </details>
      <div className="game-tab-row" aria-label="航行操作视图">
        <button aria-pressed={tab === "map"} onClick={() => setTab("map")}>
          航线
        </button>
        <button
          aria-pressed={tab === "evidence"}
          onClick={() => setTab("evidence")}
        >
          证据 {e.evidence.length}/3
        </button>
        <button aria-pressed={tab === "cargo"} onClick={() => setTab("cargo")}>
          物资 {e.cargo.length}/4
        </button>
      </div>
      {tab === "map" && (
        <div className="expedition-map-panel">
          <div
            className="expedition-map"
            role="group"
            aria-label="可折返的九处调查地点"
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {storySites.flatMap((from) =>
                from.links
                  .filter((id) => from.id < id)
                  .map((id) => {
                    const to = storySites.find((item) => item.id === id)!;
                    return (
                      <line
                        key={`${from.id}-${id}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        className={
                          e.visited.includes(from.id) &&
                          e.visited.includes(to.id)
                            ? "visited"
                            : ""
                        }
                      />
                    );
                  }),
              )}
            </svg>
            {storySites.map((item) => {
              const here = item.id === state.node;
              const accessible = site?.links.includes(item.id) ?? false;
              return (
                <button
                  key={item.id}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className={`${here ? "here" : ""} ${e.visited.includes(item.id) ? "visited" : ""} ${target === item.id ? "selected" : ""}`}
                  aria-pressed={target === item.id}
                  disabled={!accessible || !!e.encounter || !!state.ending}
                  aria-label={`${item.title}，${here ? "当前位置" : e.visited.includes(item.id) ? "已到访" : "未到访"}${accessible ? "，可选择航线" : ""}`}
                  onClick={() => setSelected(item.id)}
                >
                  <i />
                  <span>
                    {item.title}
                    <small>{item.depth.toLocaleString()} m</small>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="note">
            亮点是当前位置。选择相邻地点后，在下面确认航行；已经走过的路线可以折返。
          </p>
          {site && !state.ending && (
            <>
              <label className="field-label" htmlFor="travel-style">
                航行方式
              </label>
              <select
                id="travel-style"
                value={style}
                onChange={(event) =>
                  setStyle(event.target.value as TravelStyle)
                }
              >
                {travelStyles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.text}
                  </option>
                ))}
              </select>
              <div className="route-destinations" aria-label="相邻地点">
                {site.links.map((id) => (
                  <button
                    key={id}
                    aria-pressed={target === id}
                    onClick={() => setSelected(id)}
                  >
                    {storySites.find((item) => item.id === id)!.title}
                  </button>
                ))}
              </div>
              {route && (
                <div className="route-preview">
                  <strong>前往{route.destination!.title}</strong>
                  <small>
                    氧气 −{route.oxygen} · 电量 −{route.battery} · 碰撞概率{" "}
                    {route.risk}%
                  </small>
                  <p>
                    {route.reason ||
                      (route.known
                        ? "走过的路线已经标记，不再判定碰撞。"
                        : "碰撞会损耗 8 船体。到达新区域时，也可能遇到需要处理的航行情况。")}
                  </p>
                  <button
                    className="game-button"
                    disabled={!!route.reason}
                    onClick={() => onAction(`travel:${target}:${style}`)}
                  >
                    确认航行 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {tab === "evidence" && (
        <div className="evidence-board">
          <p className="note">
            读原始记录，选择两份能互相印证的证据。提交判断消耗 2 氧气、2
            电量和一个航行时刻；判断错误会损失信任。
          </p>
          {e.evidence.length ? (
            e.evidence.map((id) => (
              <label className={clues.includes(id) ? "selected" : ""} key={id}>
                <input
                  type="checkbox"
                  checked={clues.includes(id)}
                  disabled={
                    (!clues.includes(id) && clues.length >= 2) || !!state.ending
                  }
                  onChange={() =>
                    setClues((old) =>
                      old.includes(id)
                        ? old.filter((item) => item !== id)
                        : [...old, id],
                    )
                  }
                />
                <strong>{evidenceSpecs[id].title}</strong>
                <span>{evidenceSpecs[id].text}</span>
              </label>
            ))
          ) : (
            <p className="setup-tip">
              旧中继舱、回声站和热液裂口都留有记录，先找到其中两份。
            </p>
          )}
          <label className="field-label" htmlFor="story-theory">
            这些记录更支持哪种失联原因？
          </label>
          {clues.length > 0 && (
            <button className="text-button" onClick={() => setClues([])}>
              清空已选证据
            </button>
          )}
          <select
            id="story-theory"
            value={theory}
            onChange={(event) => setTheory(event.target.value)}
            disabled={!!state.ending}
          >
            <option value="" disabled>
              选择你的判断
            </option>
            <option value="electrical">电气接口故障，产生重复脉冲</option>
            <option value="animal">动物主动敲击设备</option>
            <option value="quake">周期性落石或地震</option>
          </select>
          <p className={state.flags.includes("theory") ? "setup-tip" : "note"}>
            {reason || "检修屏已连接，可以提交这组证据。"}
          </p>
          <button
            className="game-button"
            disabled={!!reason}
            onClick={() => onAction(compare)}
          >
            提交失联判断
          </button>
          {e.attempts > 0 && (
            <p
              className={
                state.flags.includes("theory") ? "setup-tip" : "game-warning"
              }
              role="status"
            >
              {
                [...state.log]
                  .reverse()
                  .find((item) => item.choice === "比对证据，提交失联解释")
                  ?.result
              }
            </p>
          )}
        </div>
      )}
      {tab === "cargo" && (
        <div className="cargo-board">
          <p className="note">
            四个货位。使用物资不会推进时刻，旧中继舱还留有一些储备。观察记录与扫描资料不占货位。
          </p>
          {e.cargo.map((id, index) => (
            <article key={`${id}-${index}`}>
              <strong>{cargoSpecs[id].name}</strong>
              <p>{cargoSpecs[id].text}</p>
              <div>
                <button
                  className="game-button secondary"
                  disabled={!!storyActionReason(state, `use:${id}`)}
                  onClick={() => onAction(`use:${id}`)}
                >
                  使用{cargoSpecs[id].name}
                </button>
                <button
                  className="text-button"
                  disabled={!!storyActionReason(state, `drop:${id}`)}
                  onClick={() => onAction(`drop:${id}`)}
                >
                  放弃
                </button>
              </div>
            </article>
          ))}
          {!e.cargo.length && (
            <p className="setup-tip">
              货架已经空了。前往旧中继舱，可以寻找没有取走的补给。
            </p>
          )}
        </div>
      )}
    </section>
  );
}
