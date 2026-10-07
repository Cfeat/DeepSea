// Representative player strategies shared by rule tests and browser walkthroughs.
import * as story from "../src/games/storyEngine";
import * as station from "../src/games/stationEngine";
import type { StorySiteId, TravelStyle } from "../src/games/storyExpedition";
export function storyVoyage(
  setup: story.StorySetup,
  ending: "truth" | "rescue" | "discovery" | "archive" = "truth",
) {
  let state = story.createStory(setup);
  const act = (id: string) => {
    const reason = story.storyActionReason(state, id);
    if (reason) throw new Error(`${state.node}/${id}: ${reason}`);
    state = story.chooseStory(state, id);
    if (state.ending && state.ending !== ending)
      throw new Error(
        `Unexpected ${state.ending}: ${JSON.stringify(state.log.slice(-2))}`,
      );
  };
  function supplies() {
    for (const [id, key] of [
      ["oxygen", "oxygen"],
      ["battery", "battery"],
      ["plate", "hull"],
    ] as const)
      if (
        state[key] <= (key === "hull" ? 65 : 80) &&
        state.expedition!.cargo.includes(id)
      )
        act(`use:${id}`);
  }
  function resolve() {
    supplies();
    if (state.expedition!.encounter) {
      const choices = story
        .storyNode(state)
        .choices.filter((choice) => !story.storyChoiceReason(state, choice));
      const choice = choices.sort(
        (a, b) =>
          (a.cost?.hull ?? 0) * 5 +
          (a.cost?.oxygen ?? 0) +
          (a.cost?.battery ?? 0) -
          ((b.cost?.hull ?? 0) * 5 +
            (b.cost?.oxygen ?? 0) +
            (b.cost?.battery ?? 0)),
      )[0];
      if (!choice) throw new Error("No safe encounter action");
      act(choice.id);
    }
  }
  function travel(id: StorySiteId, style: TravelStyle = "steady") {
    supplies();
    act(`travel:${id}:${style}`);
    resolve();
  }
  act("brief");
  act("observe");
  if (ending === "discovery") {
    travel("drift");
    act("film");
    travel("whale");
    act("record");
    act("mark");
    travel("station");
    act("charge");
    travel("vent");
    act("observe");
    travel("well");
    act("copy");
    supplies();
    act("abort");
    return state;
  }
  act("listen");
  travel("ridge");
  travel("refuge");
  if (setup.gear.includes("arm")) act("arm");
  else if (setup.gear.includes("medkit")) act("repair");
  else {
    for (
      let tries = 0;
      tries < 8 && !state.flags.includes("rescued");
      tries++
    ) {
      supplies();
      act("tow");
    }
    if (!state.flags.includes("rescued"))
      throw new Error("Rescue did not succeed");
  }
  if (ending === "rescue") {
    act("abort");
    return state;
  }
  travel("station");
  act("sensor");
  act("charge");
  travel("wreck");
  act("log");
  supplies();
  if (!story.storyActionReason(state, "oxygen")) act("oxygen");
  supplies();
  if (!story.storyActionReason(state, "battery")) act("battery");
  supplies();
  travel("station");
  act("compare:maintenance:sensor:electrical");
  travel("vent");
  act("observe");
  act("cable");
  travel("well");
  act(setup.gear.includes("arm") ? "arm" : "dock");
  supplies();
  act(ending === "archive" ? "evacuate" : "abort");
  return state;
}
export function stationCampaign(setup: station.StationSetup) {
  let state = station.createStation(setup);
  const act = (action: station.StationAction) => {
    const reason = station.stationActionReason(state, action);
    if (reason)
      throw new Error(`Day ${state.day} ${JSON.stringify(action)}: ${reason}`);
    state = station.stationAction(state, action);
  };
  const attempt = (action: station.StationAction) => {
    if (station.stationActionReason(state, action)) return false;
    act(action);
    return true;
  };
  act({ type: "build", slot: 6, kind: "lab" });
  act({ type: "workers", slot: 6, delta: 1 });
  act({ type: "build", slot: 2, kind: "dock" });
  act({ type: "workers", slot: 2, delta: 1 });
  act({ type: "upgrade", slot: 4 });
  while (!state.outcome && state.day <= 30) {
    if (
      state.event &&
      !attempt({ type: "resolve", choice: "tech" }) &&
      !attempt({ type: "resolve", choice: "pay" })
    )
      act({ type: "resolve", choice: "adapt" });
    if (state.integrity < 78) attempt({ type: "repair" });
    if (state.systems!.fatigue >= 45)
      attempt({ type: "policy", field: "shift", value: "rest" });
    else if (state.systems!.fatigue <= 12)
      attempt({ type: "policy", field: "shift", value: "normal" });
    if (state.systems!.contract) attempt({ type: "deliver" });
    else {
      const offer = station
        .offeredContracts(state)
        .find((item) =>
          Object.entries(item.cost).every(
            ([key, cost]) =>
              state.resources[key as station.StationResource] >=
              cost +
                (key === "food" || key === "oxygen"
                  ? 35
                  : key === "science"
                    ? 70
                    : 45),
          ),
        );
      if (offer && attempt({ type: "accept", id: offer.id }))
        act({ type: "deliver" });
    }
    for (const id of [
      "recycling",
      ...(setup.goal === "habitat" ? [] : ["sonar"]),
      "automation",
      ...(setup.goal === "conservation" ? ["pressure"] : []),
      ...(setup.goal === "habitat" ? [] : ["network"]),
    ] as station.TechId[])
      attempt({ type: "research", id });
    if (setup.goal === "habitat") {
      if (state.resources.alloy < 20) attempt({ type: "trade", item: "alloy" });
      if (
        !state.rooms[10] &&
        attempt({ type: "build", slot: 10, kind: "quarters" })
      )
        act({ type: "workers", slot: 10, delta: 1 });
      if (state.rooms[10]?.level === 1) attempt({ type: "upgrade", slot: 10 });
      if (state.rooms[1]!.level < 2) attempt({ type: "upgrade", slot: 1 });
      if (state.rooms[9]!.level < 2) attempt({ type: "upgrade", slot: 9 });
      if (
        state.resources.oxygen >= 40 &&
        state.resources.food >= 40 &&
        state.rooms[1]!.level >= 2 &&
        state.rooms[9]!.level >= 2 &&
        state.crew < 9
      )
        attempt({ type: "recruit" });
    }
    if (
      setup.goal === "conservation" &&
      state.completed.length >= 3 &&
      state.rooms[2]!.level < 2
    )
      attempt({ type: "upgrade", slot: 2 });
    if (!state.mission) {
      const list =
        setup.goal === "habitat"
          ? ["snow", "wreck"]
          : setup.goal === "conservation"
            ? ["snow", "vent", "map", "wreck", "seep"]
            : ["snow", "vent", "map"];
      const id = list.find((id) => !state.completed.includes(id));
      if (id) attempt({ type: "launch", id });
    }
    if (
      setup.goal !== "habitat" &&
      state.techs.includes("network") &&
      !state.rooms[10]
    ) {
      if (state.resources.alloy < 50) attempt({ type: "trade", item: "alloy" });
      if (attempt({ type: "build", slot: 10, kind: "beacon" }))
        act({ type: "workers", slot: 10, delta: 1 });
    }
    const forecast = station.stationForecast(state);
    if (
      state.resources.energy + forecast.delta.energy < 40 &&
      state.rooms[4]!.level < 3
    )
      attempt({ type: "upgrade", slot: 4 });
    for (const item of ["food", "oxygen"] as const)
      if (
        state.resources[item] + station.stationForecast(state).delta[item] <
        35
      )
        attempt({ type: "trade", item });
    act({ type: "advance" });
  }
  return state;
}
