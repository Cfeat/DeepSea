import { useState } from "react";
import {
  approachSpecs,
  contractSpecs,
  offeredContracts,
  prioritySpecs,
  rationSpecs,
  shiftSpecs,
  stationActionReason,
  stationForecast,
  stationResourceNames,
  stationScenarios,
  stationWeather,
  type StationAction,
  type StationState,
} from "../../games/stationEngine";

export function StationWeatherPanel({ state }: { state: StationState }) {
  const s = state.systems!;
  const weather = stationWeather(state);
  const forecast = stationForecast(state);
  return (
    <section className="station-environment" aria-label="海况预报与队员状态">
      <div className="environment-primary">
        <p className="eyebrow">
          {
            stationScenarios.find((item) => item.id === state.setup.scenario)
              ?.name
          }{" "}
          / 明日海况
        </p>
        <h2>{weather.name}</h2>
        <p>{weather.text}</p>
        <small>
          明日结构 −{forecast.wear} · 工作效率{" "}
          {Math.round(forecast.efficiency * 100)}%
        </small>
      </div>
      <div className="environment-meters">
        {[
          {
            label: "疲劳",
            value: s.fatigue,
            change: forecast.fatigue,
            bad: s.fatigue >= 60,
          },
          {
            label: "生态",
            value: s.ecology,
            change: forecast.ecology,
            bad: s.ecology < 50,
          },
          {
            label: "声誉",
            value: s.reputation,
            change: null,
            bad: s.reputation < 30,
          },
        ].map((item) => (
          <div key={item.label} className={item.bad ? "low" : ""}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              <small>/100</small>
            </strong>
            <meter
              aria-label={item.label}
              min={0}
              max={100}
              value={item.value}
            />
            {item.change !== null && (
              <small>
                明日 {item.change >= 0 ? "+" : ""}
                {item.change}
              </small>
            )}
          </div>
        ))}
      </div>
      <div className="weather-days" aria-label="未来三天海况">
        {[1, 2, 3].map((n) => (
          <span key={n}>
            <small>第 {state.day + n} 天</small>
            {stationWeather(state, state.day + n).name}
          </span>
        ))}
      </div>
    </section>
  );
}
export function StationStrategyPanel({
  state,
  onAction,
}: {
  state: StationState;
  onAction: (action: StationAction) => void;
}) {
  const s = state.systems!;
  const forecast = stationForecast(state);
  const policies = [
    { field: "shift", label: "排班", specs: shiftSpecs },
    { field: "ration", label: "伙食", specs: rationSpecs },
    { field: "priority", label: "供电优先级", specs: prioritySpecs },
  ] as const;
  return (
    <div className="station-panel-body strategy-panel">
      <h2>今天怎样运转？</h2>
      <p className="note">
        安排立即写入明日预测。疲劳每到 25
        点，工作效率降低一档；留出空闲队员轮休，往往比一直加班更划算。
      </p>
      {policies.map((policy) => (
        <fieldset key={policy.field}>
          <legend>{policy.label}</legend>
          <div className="policy-options">
            {policy.specs.map((item) => {
              const action = {
                type: "policy",
                field: policy.field,
                value: item.id,
              } as StationAction;
              return (
                <button
                  key={item.id}
                  aria-pressed={s[policy.field] === item.id}
                  disabled={!!state.outcome || !!state.event}
                  onClick={() => onAction(action)}
                >
                  <strong>
                    {item.name}
                    {s[policy.field] === item.id ? " ✓" : ""}
                  </strong>
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <h3>明日设备结算</h3>
      <p className="note">
        生活保障先供电，再按选定顺序分配余电。供电不足的设备单独停产，其他设备继续运行。设施相邻与热源位置会影响效率。
      </p>
      <div className="production-table" role="table" aria-label="明日设备产出">
        <div role="row" className="production-head">
          <span role="columnheader">设施</span>
          <span role="columnheader">用电</span>
          <span role="columnheader">产出 / 状态</span>
        </div>
        {forecast.rows.map((row) => (
          <div role="row" key={row.slot}>
            <span role="cell">
              <strong>
                {row.slot + 1} · {row.name}
              </strong>
              <small>{row.bonus}</small>
            </span>
            <span role="cell">{row.power}</span>
            <span
              role="cell"
              className={row.status === "unpowered" ? "negative" : ""}
            >
              {row.status === "off"
                ? "无人或已停用"
                : row.status === "unpowered"
                  ? "缺电停产"
                  : row.resource
                    ? `${stationResourceNames[row.resource]} +${row.output}`
                    : "正常值守"}
            </span>
          </div>
        ))}
      </div>
      <p className="setup-tip">
        加工会降低生态状态，正常排班每天恢复 1 生态，轮休恢复 2。生态低于
        40，科研产出降低 25%；声誉达到 70，每天多获 4 经费，低于 30 则少获
        4。谨慎考察和按时完成委托，有助于维持这两项状态。
      </p>
    </div>
  );
}
export function StationContractPanel({
  state,
  onAction,
}: {
  state: StationState;
  onAction: (action: StationAction) => void;
}) {
  const [cancel, setCancel] = useState(false);
  const current = state.systems!.contract;
  const spec = contractSpecs.find((item) => item.id === current?.id);
  function button(action: StationAction, label: string) {
    const reason = stationActionReason(state, action);
    return (
      <>
        <button
          className="game-button secondary"
          disabled={!!reason}
          onClick={() => {
            onAction(action);
            setCancel(false);
          }}
        >
          {label}
        </button>
        {reason && <p className="action-reason">{reason}</p>}
      </>
    );
  }
  return (
    <div className="station-panel-body">
      <h2>合作委托</h2>
      <p className="note">
        每六天更换一批报价，同时只能接一项。委托不是验收必需项；先确认能按时交货，再占用自己的储备。逾期声誉
        −8，取消声誉 −5。
      </p>
      {spec && current ? (
        <article className="game-project active-contract">
          <p className="eyebrow">
            进行中 / 第 {current.deadline} 天为最后交付日
          </p>
          <h3>{spec.name}</h3>
          <p>{spec.text}</p>
          <small>
            还剩 {Math.max(0, current.deadline - state.day)} 天 · 声誉奖励 +
            {spec.reputation}
          </small>
          {button({ type: "deliver" }, "交付当前委托")}
          <button className="abort-button" onClick={() => setCancel(!cancel)}>
            取消委托
          </button>
          {cancel && (
            <div className="game-confirm">
              <p>现在取消会降低 5 声誉，站内材料仍保留。</p>
              {button({ type: "cancelContract" }, "确认取消委托")}
              <button className="text-button" onClick={() => setCancel(false)}>
                继续执行
              </button>
            </div>
          )}
        </article>
      ) : (
        <p className="setup-tip">
          当前没有委托。看看这一批报价是否适合站点的生产能力。
        </p>
      )}
      {offeredContracts(state).map((item) => (
        <article className="game-project" key={item.id}>
          <h3>
            {item.name}
            <span>{item.days} 天期限</span>
          </h3>
          <p>{item.text}</p>
          <small>
            报酬：
            {Object.entries(item.reward)
              .map(
                ([key, value]) =>
                  `${stationResourceNames[key as keyof typeof stationResourceNames]} +${value}`,
              )
              .join(" · ")}{" "}
            · 声誉 +{item.reputation}
          </small>
          {button({ type: "accept", id: item.id }, `接受${item.name}`)}
        </article>
      ))}
      <p className="note">
        已交付 {state.systems!.contracts.length}{" "}
        项委托。声明取消或发生逾期时，当前报价不会重复刷新。
      </p>
    </div>
  );
}
export function ExpeditionApproach({
  state,
  onAction,
}: {
  state: StationState;
  onAction: (action: StationAction) => void;
}) {
  return (
    <fieldset className="mission-approaches">
      <legend>下一航次的准备方式</legend>
      <div className="policy-options">
        {approachSpecs.map((item) => (
          <button
            key={item.id}
            aria-pressed={state.systems?.approach === item.id}
            disabled={!!state.event || !!state.outcome}
            onClick={() =>
              onAction({ type: "policy", field: "approach", value: item.id })
            }
          >
            <strong>{item.name}</strong>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
