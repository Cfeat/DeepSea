import { useEffect, useRef, useState } from "react";
import type { Creature } from "../../data/types";
import { creatures } from "../../data/creatures";
import {
  assignedWorkers,
  createStation,
  decodeStation,
  encodeStation,
  roomSpecs,
  stationAction,
  stationActionReason,
  stationCapacity,
  stationEvents,
  stationForecast,
  STATION_KEY,
  stationMissions,
  stationResourceNames,
  stationScore,
  stationTechs,
  storageCap,
  upgradeCost,
  type RoomKind,
  type StationAction,
  type StationResource,
  type StationSetup,
} from "../../games/stationEngine";
import { exportGameSave, useGameSave } from "../../games/useGameSave";
import GameTools from "./GameTools";
import "../../styles/games.css";

const roomKinds = Object.keys(roomSpecs).filter(
  (kind) => kind !== "core",
) as RoomKind[];
const resourceOrder: StationResource[] = [
  "credits",
  "alloy",
  "science",
  "energy",
  "oxygen",
  "food",
];
const tabs = [
  { id: "build", label: "建设" },
  { id: "research", label: "科研" },
  { id: "missions", label: "考察" },
  { id: "supply", label: "站务" },
  { id: "log", label: "日志" },
] as const;

export default function StationGame({
  onOpen,
}: {
  onOpen: (creature: Creature) => void;
}) {
  const { state, setState, warning, setWarning, importSave, reset } =
    useGameSave(STATION_KEY, decodeStation, encodeStation);
  const [name, setName] = useState("蓝湾站");
  const [mode, setMode] = useState<StationSetup["mode"]>("relaxed");
  const [selected, setSelected] = useState(6);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("build");
  const [demolish, setDemolish] = useState(false);
  const [notice, setNotice] = useState("");
  const command = useRef<HTMLDivElement>(null);
  const start = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLElement>(null);
  const panel = useRef<HTMLElement>(null);
  const ending = useRef<HTMLElement>(null);
  const eventPanel = useRef<HTMLElement>(null);
  const active = !!state;
  const previousActive = useRef(active);
  const outcome = state?.outcome;
  const previousOutcome = useRef(outcome);
  const pendingEvent = state?.event;
  const previousEvent = useRef(pendingEvent);
  function show(element: HTMLElement | null) {
    element?.focus({ preventScroll: true });
    if (element === command.current && start.current) {
      const offset = window.matchMedia("(max-width: 760px)").matches ? 74 : 90;
      window.scrollTo({
        top:
          window.scrollY + start.current.getBoundingClientRect().top - offset,
        behavior: "instant",
      });
    } else element?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  useEffect(() => {
    if (
      (active && !previousActive.current) ||
      (previousOutcome.current && !outcome)
    )
      show(command.current);
    else if (outcome && outcome !== previousOutcome.current)
      show(ending.current);
    else if (pendingEvent && pendingEvent !== previousEvent.current)
      show(eventPanel.current);
    previousActive.current = active;
    previousOutcome.current = outcome;
    previousEvent.current = pendingEvent;
  }, [active, outcome, pendingEvent]);
  const forecast = state ? stationForecast(state) : null;
  const room = state?.rooms[selected];
  function act(action: StationAction) {
    if (!state) return;
    const reason = stationActionReason(state, action);
    if (reason) {
      setNotice(reason);
      return;
    }
    setState((previous) =>
      previous ? stationAction(previous, action) : previous,
    );
    setNotice("");
    setDemolish(false);
  }
  function control(
    action: StationAction,
    label: string,
    style = "game-button secondary",
  ) {
    const reason = state ? stationActionReason(state, action) : "";
    return (
      <button
        className={style}
        disabled={!!reason}
        title={reason || undefined}
        onClick={() => act(action)}
      >
        {label}
      </button>
    );
  }
  return (
    <section
      className="section game-page station-game"
      aria-labelledby="station-title"
    >
      <GameTools
        active={!!state}
        warning={warning}
        onImport={importSave}
        onExport={() =>
          state && exportGameSave("深海前哨-存档.json", encodeStation(state))
        }
        onRestart={() => {
          reset();
          setSelected(6);
          setDemolish(false);
          setNotice("");
        }}
      />
      <header className="game-heading">
        <div>
          <p className="eyebrow">OUTPOST / 深海模拟经营</p>
          <h1 id="station-title">深海前哨</h1>
        </div>
        <p>把一座试验站，经营成能长期留在海底的家。</p>
      </header>
      {!state ? (
        <div className="game-setup station-setup">
          <div className="station-intro">
            <div className="station-emblem" aria-hidden="true">
              <span>◌</span>
              <div>
                <i>ϟ</i>
                <i>◎</i>
                <i>⚗</i>
              </div>
              <span>⇄</span>
            </div>
            <p className="eyebrow">2,400 m / BLUE BAY OUTPOST</p>
            <h2>海底站的第一天</h2>
            <p>
              六名队员、三座生活保障舱，还有三十天评估期。谁去发电，谁做研究，下一笔经费花在哪里，都由你决定。
            </p>
            <dl className="game-facts">
              <div>
                <dt>玩法</dt>
                <dd>按日推进 · 没有操作限时</dd>
              </div>
              <div>
                <dt>系统</dt>
                <dd>8 种可建舱室 · 5 项科技 · 3 类考察</dd>
              </div>
              <div>
                <dt>通关后</dt>
                <dd>可继续自由经营</dd>
              </div>
            </dl>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setState(
                createStation({
                  name,
                  mode,
                  seed: Math.floor(Math.random() * 1000000),
                }),
              );
              setWarning("");
              setSelected(6);
              setTab("build");
            }}
          >
            <h2>接收你的站点</h2>
            <label className="field-label" htmlFor="station-name">
              站点名称
            </label>
            <input
              id="station-name"
              value={name}
              maxLength={18}
              onChange={(event) => setName(event.target.value)}
              placeholder="蓝湾站"
            />
            <fieldset>
              <legend>经营难度</legend>
              <div className="game-options">
                {(
                  [
                    {
                      id: "relaxed",
                      label: "宽裕起步",
                      text: "启动经费更多，没有日常结构损耗",
                    },
                    {
                      id: "standard",
                      label: "标准预算",
                      text: "拨款更少，需要安排定期维修",
                    },
                  ] as const
                ).map((item) => (
                  <label key={item.id}>
                    <input
                      type="radio"
                      name="station-mode"
                      checked={mode === item.id}
                      onChange={() => setMode(item.id)}
                    />
                    <strong>{item.label}</strong>
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="setup-tip">
              先建实验室、分配一名队员，再建考察坞。发电舱升级后，就能支撑更多设备。
            </p>
            <button type="submit" className="game-button">
              开始经营 →
            </button>
          </form>
        </div>
      ) : (
        <>
          <div ref={start} aria-hidden="true" />
          <div
            ref={command}
            className="station-command"
            tabIndex={-1}
            aria-label="站点状态"
          >
            <div>
              <p className="eyebrow">
                {state.setup.name} /{" "}
                {state.endless ? "自由经营" : "30 天评估期"}
              </p>
              <strong className="station-day">第 {state.day} 天</strong>
              <span className="station-crew">
                队员 {state.crew}/{stationCapacity(state)} · 空闲{" "}
                {state.crew - assignedWorkers(state)} 人
              </span>
              <div className="station-shortcuts" aria-label="经营区域导航">
                <button onClick={() => show(plan.current)}>查看布局</button>
                <button onClick={() => show(panel.current)}>站点操作</button>
              </div>
            </div>
            <div className="station-health">
              <span>
                结构 <strong>{state.integrity}%</strong>
              </span>
              <meter
                min={0}
                max={100}
                value={state.integrity}
                aria-label="站点结构"
              />
              <span>
                士气 <strong>{state.morale}%</strong>
              </span>
              <meter
                min={0}
                max={100}
                value={state.morale}
                aria-label="队员士气"
              />
            </div>
            <div className="next-day">
              {control({ type: "advance" }, "推进一天 →", "game-button")}
              <small>
                {state.event
                  ? "先处理下方事件"
                  : state.outcome
                    ? "本局评估已结束"
                    : "点击后结算生产、供给和考察"}
              </small>
            </div>
          </div>
          <div className="station-resources" aria-label="站内资源与明日变化">
            {resourceOrder.map((key) => {
              const low =
                state.resources[key] + forecast!.delta[key] <= 0 &&
                ["energy", "food", "oxygen"].includes(key);
              return (
                <div className={low ? "low" : ""} key={key}>
                  <span>{stationResourceNames[key]}</span>
                  <strong data-resource={key}>
                    {state.resources[key]}
                    {storageCap(key) === 200 && <small>/200</small>}
                  </strong>
                  <small
                    className={
                      forecast!.delta[key] < 0 ? "negative" : "positive"
                    }
                  >
                    明日 {forecast!.delta[key] >= 0 ? "+" : ""}
                    {forecast!.delta[key]}
                  </small>
                </div>
              );
            })}
          </div>
          {(notice || state.shortageDays > 0 || forecast!.shortPower) && (
            <p role="status" className="game-warning">
              {notice ||
                (forecast!.shortPower
                  ? "明日电能不足：用电舱将停产，结构和士气受损。可以升级发电、调配人员或暂停耗电舱。"
                  : `生活供给已连续不足 ${state.shortageDays} 天，连续 3 天会结束本局。`)}
            </p>
          )}
          {state.event && !state.outcome && (
            <section
              ref={eventPanel}
              tabIndex={-1}
              className="station-event"
              aria-labelledby="event-title"
            >
              <div>
                <p className="eyebrow">站点待办 / DAY {state.day}</p>
                <h2 id="event-title">{stationEvents[state.event].title}</h2>
                <p>{stationEvents[state.event].text}</p>
              </div>
              <div className="event-choices">
                {(["pay", "adapt"] as const).map((choice) => {
                  const event = stationEvents[state.event!];
                  const reason = stationActionReason(state, {
                    type: "resolve",
                    choice,
                  });
                  return (
                    <button
                      key={choice}
                      className="game-button secondary"
                      disabled={!!reason}
                      onClick={() => act({ type: "resolve", choice })}
                    >
                      <strong>
                        {choice === "pay" ? event.payLabel : event.adaptLabel}
                      </strong>
                      <small>
                        {reason ||
                          (choice === "pay"
                            ? (
                                Object.entries(event.payCost) as [
                                  StationResource,
                                  number,
                                ][]
                              )
                                .map(
                                  ([key, amount]) =>
                                    `${stationResourceNames[key]} −${amount}`,
                                )
                                .join(" · ")
                            : event.adaptResult)}
                      </small>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          {state.outcome && (
            <section
              ref={ending}
              tabIndex={-1}
              className={`station-ending game-ending ${state.outcome === "won" ? "ending-mint" : "ending-amber"}`}
              aria-labelledby="station-ending-title"
            >
              <p className="eyebrow">站点评估 / RESULT</p>
              <h2 id="station-ending-title">
                {state.outcome === "won"
                  ? "海底的灯，留了下来"
                  : "这次先回到海面"}
              </h2>
              <p>
                {state.outcome === "won"
                  ? "三项考察完成，观测阵列开始值守，供给与站体通过验收。你的试验站获批长期运行。"
                  : state.shortageDays >= 3
                    ? "生活供给连续三天不足，团队已安全撤离。下一次可以先看明日收支，再扩张设备。"
                    : state.integrity <= 0 || state.morale <= 0
                      ? "站体或队员状态不再适合继续值守，团队已安全撤离。维修和生活保障也需要留出预算。"
                      : "30 天已经过去，长期站点的条件还没有全部达到。队员带着已有考察资料返回海面。"}
              </p>
              <div className="ending-stats">
                <span>
                  经营评分 <strong>{stationScore(state)}</strong>
                </span>
                <span>
                  完成考察 <strong>{state.completed.length}/3</strong>
                </span>
                <span>
                  已研究 <strong>{state.techs.length}/5</strong>
                </span>
              </div>
              {state.outcome === "won" &&
                control({ type: "continue" }, "继续自由经营", "game-button")}
              <p className="note">
                可以导出这次存档，或通过页面上方的“重新开始”建设新的站点。
              </p>
            </section>
          )}
          <div className="station-layout">
            <section
              ref={plan}
              tabIndex={-1}
              className="station-plan"
              aria-labelledby="plan-title"
            >
              <div className="plan-heading">
                <div>
                  <p className="eyebrow">STATION BLUEPRINT / 游戏示意</p>
                  <h2 id="plan-title">站点布局</h2>
                </div>
                <span>虚构站点 · 2,400 m</span>
              </div>
              <p className="note">
                点击舱室安排人员；点击相邻空位选择建造。每舱最多 2 人。
              </p>
              <div
                className="station-grid"
                role="group"
                aria-label="12 个舱室位置"
              >
                {state.rooms.map((item, index) => (
                  <button
                    key={index}
                    aria-pressed={selected === index}
                    aria-label={`${index + 1} 号位置：${item ? `${roomSpecs[item.kind].name} ${item.level} 级，${item.workers} 人` : "空位"}`}
                    className={`station-room ${item ? `room-${item.kind}` : "empty"} ${item && (!item.enabled || !item.workers) && item.kind !== "core" ? "inactive" : ""}`}
                    onClick={() => {
                      setSelected(index);
                      setDemolish(false);
                      setTab("build");
                      if (window.matchMedia("(max-width: 900px)").matches)
                        show(panel.current);
                    }}
                  >
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <span className="room-icon" aria-hidden="true">
                      {item ? roomSpecs[item.kind].icon : "+"}
                    </span>
                    <strong>
                      {item ? roomSpecs[item.kind].name : "待建造"}
                    </strong>
                    <span>
                      {item
                        ? item.kind === "core"
                          ? "COMMAND"
                          : `${item.level} 级 · ${item.workers} 人${!item.enabled ? " · 停用" : ""}`
                        : "EMPTY SLOT"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="station-objectives">
                <h3>长期站点的验收条件</h3>
                <ul>
                  <li className={state.completed.length === 3 ? "done" : ""}>
                    三类考察全部完成 <strong>{state.completed.length}/3</strong>
                  </li>
                  <li
                    className={
                      state.rooms.some(
                        (item) =>
                          item?.kind === "beacon" &&
                          item.enabled &&
                          item.workers,
                      )
                        ? "done"
                        : ""
                    }
                  >
                    观测阵列建成并有人值守
                  </li>
                  <li
                    className={
                      state.integrity >= 65 && state.morale >= 40 ? "done" : ""
                    }
                  >
                    结构 ≥65 · 士气 ≥40
                  </li>
                  <li
                    className={
                      state.resources.food >= 30 &&
                      state.resources.oxygen >= 30 &&
                      state.resources.energy >= 20
                        ? "done"
                        : ""
                    }
                  >
                    食物、氧气 ≥30 · 电能 ≥20
                  </li>
                  <li className={state.day >= 10 ? "done" : ""}>
                    第 10–30 天内，推进一天后验收
                  </li>
                </ul>
              </div>
              <details className="production-breakdown">
                <summary>查看每日结算规则</summary>
                <p>
                  生活区每人每天消耗 2 食物和 2 氧气，指挥舱消耗 6
                  电能。拨款先入账，再扣各舱维护费。运行并有人值守的舱室，按人数
                  × 等级生产、用电；停用或无人舱仍有维护费。
                </p>
                <p>
                  发电与用电同日结算。电能不足时，制氧、水培、科研与加工停产。食物或氧气用尽、或电能不足，记为一天供给短缺；连续
                  3 天结束本局。生活储备上限均为 200，超出部分不会入库。
                </p>
                <p>
                  标准预算每日损耗 1 结构；没有居住舱值守时每日士气
                  −1。考察奖励与事件会在日末到账。
                </p>
              </details>
            </section>
            <section
              ref={panel}
              tabIndex={-1}
              className="station-panel"
              aria-label="站点操作"
            >
              <div
                className="game-tab-row station-tabs"
                aria-label="站点操作视图"
              >
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={tab === item.id}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {tab === "build" && (
                <div className="station-panel-body">
                  <h2>
                    {selected + 1} 号位置 ·{" "}
                    {room ? roomSpecs[room.kind].name : "建造新舱室"}
                  </h2>
                  {room ? (
                    <>
                      <p className="note">{roomSpecs[room.kind].text}</p>
                      {room.kind === "core" ? (
                        <p className="setup-tip">
                          指挥舱负责通讯与基础生活区，不需要分配人员，也不能拆除。
                        </p>
                      ) : (
                        <>
                          <div className="room-controls">
                            <span>
                              工作人员 <strong>{room.workers}/2</strong>
                            </span>
                            {control(
                              { type: "workers", slot: selected, delta: -1 },
                              "减少人员",
                            )}
                            {control(
                              { type: "workers", slot: selected, delta: 1 },
                              "增加人员",
                            )}
                          </div>
                          <p className="note">
                            空闲 {state.crew - assignedWorkers(state)} 人 ·{" "}
                            {room.enabled ? "设备运行中" : "设备已停用"} ·
                            每日维护费{" "}
                            {roomSpecs[room.kind].upkeep * room.level}
                          </p>
                          <div className="room-controls">
                            {control(
                              { type: "toggle", slot: selected },
                              room.enabled ? "暂停设备" : "恢复设备",
                            )}
                            {control(
                              { type: "upgrade", slot: selected },
                              room.level >= 3
                                ? "已达三级"
                                : `升级到 ${room.level + 1} 级`,
                            )}
                          </div>
                          {room.level < 3 && (
                            <p className="note">
                              升级费用：经费 {upgradeCost(room).credits} · 合金{" "}
                              {upgradeCost(room).alloy}
                              。人数不变，产出和用电随等级增加。
                            </p>
                          )}
                          <p className="note">
                            {stationActionReason(state, {
                              type: "upgrade",
                              slot: selected,
                            }) || "升级后，下一天开始按新等级结算。"}
                          </p>
                          <button
                            className="abort-button"
                            disabled={
                              !!stationActionReason(state, {
                                type: "demolish",
                                slot: selected,
                              })
                            }
                            onClick={() => setDemolish(!demolish)}
                          >
                            拆除舱室
                          </button>
                          <p className="note">
                            {stationActionReason(state, {
                              type: "demolish",
                              slot: selected,
                            }) || "拆除收回基础造价的 40%；升级投入不返还。"}
                          </p>
                          {demolish && (
                            <div className="game-confirm">
                              <p>
                                确定拆除{roomSpecs[room.kind].name}
                                ？工作人员会回到空闲队列。
                              </p>
                              {control(
                                { type: "demolish", slot: selected },
                                "确认拆除",
                              )}
                              <button
                                className="text-button"
                                onClick={() => setDemolish(false)}
                              >
                                取消
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="note">
                        选中空位后建造。新舱室需要分配人员才能工作。
                      </p>
                      <div className="build-catalog">
                        {roomKinds.map((kind) => {
                          const spec = roomSpecs[kind];
                          const action: StationAction = {
                            type: "build",
                            slot: selected,
                            kind,
                          };
                          const reason = stationActionReason(state, action);
                          return (
                            <article key={kind}>
                              <span className="build-icon" aria-hidden="true">
                                {spec.icon}
                              </span>
                              <div>
                                <h3>{spec.name}</h3>
                                <p>{spec.text}</p>
                                <small>
                                  经费 {spec.credits} · 合金 {spec.alloy} · 维护{" "}
                                  {spec.upkeep}/天
                                </small>
                                {reason && (
                                  <small className="action-reason">
                                    {reason}
                                  </small>
                                )}
                              </div>
                              {control(action, `建造${spec.name}`)}
                            </article>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              {tab === "research" && (
                <div className="station-panel-body">
                  <h2>科研计划</h2>
                  <p className="note">
                    科研点由实验室与考察产生。研发立即生效。
                  </p>
                  {stationTechs.map((tech) => {
                    const action: StationAction = {
                      type: "research",
                      id: tech.id,
                    };
                    const done = state.techs.includes(tech.id);
                    return (
                      <article className="game-project" key={tech.id}>
                        <h3>
                          {tech.name}
                          <span>{done ? "已完成 ✓" : "待研究"}</span>
                        </h3>
                        <p>{tech.text}</p>
                        <small>
                          经费 {tech.credits} · 科研 {tech.science}
                        </small>
                        <p className="action-reason">
                          {done
                            ? ""
                            : stationActionReason(state, action) ||
                              "条件满足，可以开始研究。"}
                        </p>
                        {control(
                          action,
                          done ? `${tech.name}已完成` : `研究${tech.name}`,
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              {tab === "missions" && (
                <div className="station-panel-body">
                  <h2>出海考察</h2>
                  <p className="note">
                    只有一艘考察艇，同一时间执行一项任务。完成过的考察仍可重复，验收只计三种不同任务。
                  </p>
                  {state.mission && (
                    <p className="setup-tip" role="status">
                      进行中：
                      {
                        stationMissions.find(
                          (item) => item.id === state.mission!.id,
                        )!.name
                      }{" "}
                      · 还需 {state.mission.remaining} 天
                    </p>
                  )}
                  {stationMissions.map((mission) => (
                    <article className="game-project" key={mission.id}>
                      <h3>
                        {mission.name}
                        <span>
                          {state.completed.includes(mission.id)
                            ? "已完成 ✓"
                            : `${mission.days} 天`}
                        </span>
                      </h3>
                      <p>{mission.text}</p>
                      <small>
                        出发：经费 {mission.credits} · 电能 {mission.energy}
                      </small>
                      <small>
                        奖励：
                        {(
                          Object.entries(mission.reward) as [
                            StationResource,
                            number,
                          ][]
                        )
                          .map(
                            ([key, value]) =>
                              `${stationResourceNames[key]} +${value}`,
                          )
                          .join(" · ")}
                      </small>
                      <p className="action-reason">
                        {stationActionReason(state, {
                          type: "launch",
                          id: mission.id,
                        }) || "考察艇就绪。"}
                      </p>
                      {control(
                        { type: "launch", id: mission.id },
                        `派出${mission.name}`,
                      )}
                      <button
                        className="game-reading-link"
                        onClick={() =>
                          onOpen(
                            creatures.find(
                              (item) => item.id === mission.creature,
                            )!,
                          )
                        }
                      >
                        认识真实的
                        {
                          creatures.find(
                            (item) => item.id === mission.creature,
                          )!.name
                        }{" "}
                        ↗
                      </button>
                    </article>
                  ))}
                </div>
              )}
              {tab === "supply" && (
                <div className="station-panel-body">
                  <h2>站务与补给</h2>
                  <article className="game-project">
                    <h3>站体维修</h3>
                    <p>
                      经费 20 · 合金 8 · 恢复{" "}
                      {state.techs.includes("pressure") ? 35 : 25} 结构
                    </p>
                    {control({ type: "repair" }, "安排维修")}
                    <p className="action-reason">
                      {stationActionReason(state, { type: "repair" })}
                    </p>
                  </article>
                  <article className="game-project">
                    <h3>招募队员</h3>
                    <p>
                      经费 60 · 食物 10。新队员立即抵达，每天额外消耗 2 食物与 2
                      氧气。
                    </p>
                    {control({ type: "recruit" }, "招募一名队员")}
                    <p className="action-reason">
                      {stationActionReason(state, { type: "recruit" }) ||
                        `床位 ${state.crew}/${stationCapacity(state)}`}
                    </p>
                  </article>
                  <article className="game-project">
                    <h3>应急补给</h3>
                    <p>购买即时到账，储备超过上限的部分不入库。</p>
                    {(["food", "oxygen", "alloy"] as const).map((item) => (
                      <div className="trade-row" key={item}>
                        <span>
                          {stationResourceNames[item]} +
                          {item === "alloy" ? 20 : 30}
                          <small>经费 −{item === "alloy" ? 35 : 25}</small>
                        </span>
                        {control(
                          { type: "trade", item },
                          `购买${stationResourceNames[item]}`,
                        )}
                      </div>
                    ))}
                  </article>
                </div>
              )}
              {tab === "log" && (
                <div className="station-panel-body">
                  <h2>值守日志</h2>
                  <p className="note">
                    保留最近 60 条记录。导出的存档包含完整操作历史。
                  </p>
                  <ol className="station-log">
                    {[...state.log].reverse().map((item, index) => (
                      <li key={index}>
                        <span>DAY {String(item.day).padStart(2, "0")}</span>
                        <p>{item.text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          </div>
        </>
      )}
      <details className="game-rules">
        <summary>新手路线与玩法说明</summary>
        <p>
          先在指挥舱相邻空位建实验室，分配 1 人；再建考察坞并分配 1
          人。升级发电舱，查看“明日”用电是否平衡，然后派出海洋雪观测。考察奖励能支持下一次研究和建设。
        </p>
        <p>
          在第 30
          天评估之前完成三类考察，研究地形声呐与自动控制，再研究海底观测网。建成观测阵列、分配值守人员，达到左侧供给与站体条件后推进一天。最早第
          10 天可以通关，之后可继续自由经营。
        </p>
        <p>
          没有操作限时。只在点击“推进一天”时生产和消耗；离开页面会保留当前进度。事件必须作出选择后才能继续，可以导出存档跨设备游玩。
        </p>
        <p>
          本游戏的站点、预算、生产效率与设施均为虚构的经营规则。现实深海考察主要依靠船舶、潜器和自动观测设备；这里的站点示意与生物图鉴的真实照片分开呈现。
        </p>
      </details>
    </section>
  );
}
