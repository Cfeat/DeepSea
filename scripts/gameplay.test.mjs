import assert from "node:assert/strict";
import { test } from "node:test";
import { moduleUrl } from "./load-typescript.mjs";
const story = await import(moduleUrl("src/games/storyEngine.ts"));
const station = await import(moduleUrl("src/games/stationEngine.ts"));
const oldStory = await import(moduleUrl("src/games/storyLegacy.ts"));
const oldStation = await import(moduleUrl("src/games/stationLegacy.ts"));
const { storyVoyage, stationCampaign } = await import(
  moduleUrl("tests/gameplayPaths.ts")
);
test("every story loadout has a full investigation route in both difficulties", () => {
  for (const mode of ["gentle", "standard"])
    for (let i = 0; i < story.storyGear.length; i++)
      for (let j = i + 1; j < story.storyGear.length; j++) {
        const state = storyVoyage({
          name: "调查",
          mode,
          seed: 3,
          goal: "truth",
          gear: [story.storyGear[i].id, story.storyGear[j].id],
        });
        assert.equal(state.ending, "truth");
        assert.ok(story.storyObjectives(state).every((item) => item.done));
        assert.deepEqual(story.decodeStory(story.encodeStory(state)), state);
        assert.ok(state.expedition.cargo.length <= 4);
      }
});
test("rescue, field study and archive evacuation produce different reports", () => {
  for (const ending of ["rescue", "discovery", "archive"])
    for (const seed of [0, 1, 5, 17]) {
      const state = storyVoyage(
        {
          name: "考察",
          mode: "standard",
          seed,
          gear: ["sonar", "arm"],
          goal:
            ending === "rescue"
              ? "rescue"
              : ending === "discovery"
                ? "research"
                : "truth",
        },
        ending,
      );
      assert.equal(state.ending, ending);
      assert.deepEqual(story.decodeStory(story.encodeStory(state)), state);
    }
});
test("every station project can finish in every region and difficulty", () => {
  for (const mode of ["relaxed", "standard"])
    for (const scenario of ["bay", "vent", "ridge"])
      for (const goal of ["network", "habitat", "conservation"])
        for (const seed of [0, 3, 7]) {
          const state = stationCampaign({
            name: "海底站",
            mode,
            scenario,
            goal,
            seed,
          });
          assert.equal(
            state.outcome,
            "won",
            `${mode}/${scenario}/${goal}/${seed}: ${JSON.stringify({ day: state.day, objectives: station.stationObjectives(state), resources: state.resources, systems: state.systems })}`,
          );
          assert.ok(state.day <= 30);
          assert.deepEqual(
            station.decodeStation(station.encodeStation(state)),
            state,
          );
        }
});
test("version one saves retain the exact original rules and can still be exported", () => {
  const storySave = oldStory.encodeStory(
    oldStory.chooseStory(
      oldStory.createStory({
        name: "旧航程",
        mode: "gentle",
        gear: ["sonar", "arm"],
      }),
      "brief",
    ),
  );
  const stationSave = oldStation.encodeStation(
    oldStation.stationAction(
      oldStation.createStation({ name: "旧站", mode: "standard", seed: 2 }),
      { type: "advance" },
    ),
  );
  assert.deepEqual(
    story.decodeStory(storySave),
    oldStory.decodeStory(storySave),
  );
  assert.deepEqual(
    station.decodeStation(stationSave),
    oldStation.decodeStation(stationSave),
  );
  assert.equal(story.encodeStory(story.decodeStory(storySave)).version, 1);
  assert.equal(
    station.encodeStation(station.decodeStation(stationSave)).version,
    1,
  );
});
test("exploration guards cargo, one-time rewards, rescue time and emergency escape", () => {
  let state = story.createStory({
    name: "边界",
    mode: "standard",
    gear: ["battery", "medkit"],
    goal: "rescue",
    seed: 0,
  });
  assert.equal(state.expedition.cargo.length, 4);
  state = story.chooseStory(state, "brief");
  assert.equal(story.chooseStory(state, "travel:well:steady"), state);
  state = story.chooseStory(state, "observe");
  assert.equal(story.chooseStory(state, "observe"), state);
  assert.equal(story.chooseStory(state, "use:constructor"), state);
  const consumed = story.chooseStory(state, "use:oxygen");
  assert.equal(consumed.expedition.turn, state.expedition.turn);
  assert.equal(consumed.expedition.cargo.length, 3);
  const stranded = {
    ...consumed,
    oxygen: 1,
    battery: 1,
    expedition: { ...consumed.expedition, encounter: "current" },
  };
  const evacuated = story.chooseStory(stranded, "evacuate");
  assert.equal(evacuated.ending, "home");
  assert.equal(evacuated.expedition.encounter, null);
  assert.equal(story.storyNode(evacuated).depth, 0);
  const late = {
    ...consumed,
    node: "refuge",
    expedition: { ...consumed.expedition, turn: 20 },
  };
  assert.match(story.storyActionReason(late, "repair"), /母船/);
});
test("failed evidence does not unlock the archive, and risk replays identically", () => {
  const full = storyVoyage({
    name: "证据",
    mode: "standard",
    gear: ["sonar", "arm"],
    goal: "truth",
    seed: 3,
  });
  const save = story.encodeStory(full);
  const prefix = {
    ...save,
    actions: save.actions.slice(
      0,
      save.actions.findIndex((id) => id.startsWith("compare:")),
    ),
  };
  let state = story.decodeStory(prefix);
  const before = state;
  state = story.chooseStory(state, "compare:maintenance:sensor:animal");
  assert.ok(!state.flags.includes("theory"));
  assert.equal(state.trust, before.trust - 5);
  state = story.chooseStory(state, "compare:maintenance:sensor:electrical");
  assert.ok(state.flags.includes("theory"));
  assert.deepEqual(story.decodeStory(story.encodeStory(state)), state);
  assert.equal(
    story.decodeStory({ ...prefix, oxygen: 99999 }).oxygen,
    before.oxygen,
  );
  assert.equal(
    story.decodeStory({ ...prefix, actions: ["travel:well:fast"] }),
    null,
  );
});
test("fatigue, room placement and power priorities change actual production", () => {
  let state = station.createStation({ name: "供电", mode: "relaxed", seed: 0 });
  state = station.stationAction(state, { type: "build", slot: 6, kind: "lab" });
  state = station.stationAction(state, { type: "workers", slot: 6, delta: 1 });
  state = station.stationAction(state, {
    type: "build",
    slot: 8,
    kind: "workshop",
  });
  state = station.stationAction(state, { type: "workers", slot: 8, delta: 1 });
  assert.equal(station.stationRoomBonus(state, 8).production, 1.2);
  const low = { ...state, resources: { ...state.resources, energy: 0 } };
  const life = station.stationForecast(low);
  const industry = station.stationForecast(
    station.stationAction(low, {
      type: "policy",
      field: "priority",
      value: "industry",
    }),
  );
  assert.ok(life.rows.find((row) => row.slot === 6).output > 0);
  assert.equal(life.rows.find((row) => row.slot === 8).status, "unpowered");
  assert.equal(industry.rows.find((row) => row.slot === 6).status, "unpowered");
  assert.ok(industry.rows.find((row) => row.slot === 8).output > 0);
  assert.equal(life.delta.oxygen, industry.delta.oxygen);
  const tired = { ...state, systems: { ...state.systems, fatigue: 80 } };
  assert.ok(
    station.stationForecast(tired).delta.science <
      station.stationForecast(state).delta.science,
  );
  const overtime = station.stationAction(state, {
    type: "policy",
    field: "shift",
    value: "overtime",
  });
  assert.ok(
    station.stationForecast(overtime).delta.alloy >
      station.stationForecast(state).delta.alloy,
  );
  assert.ok(
    station.stationAction(overtime, { type: "advance" }).systems.fatigue >
      state.systems.fatigue,
  );
});
test("contracts have deadlines and cannot be farmed by cancelling or replaying delivery", () => {
  let state = station.createStation({ name: "委托", mode: "relaxed", seed: 0 });
  state = station.stationAction(state, { type: "accept", id: "materials" });
  const cancelled = station.stationAction(state, { type: "cancelContract" });
  assert.equal(cancelled.systems.reputation, 45);
  assert.equal(
    station.stationAction(cancelled, { type: "accept", id: "materials" }),
    cancelled,
  );
  const delivered = station.stationAction(state, { type: "deliver" });
  assert.equal(delivered.resources.alloy, state.resources.alloy - 32);
  assert.equal(delivered.resources.credits, state.resources.credits + 115);
  assert.equal(
    station.stationAction(delivered, { type: "deliver" }),
    delivered,
  );
  while (state.day <= 6) {
    if (state.event)
      state = station.stationAction(state, {
        type: "resolve",
        choice: "adapt",
      });
    state = station.stationAction(state, { type: "advance" });
  }
  assert.equal(state.systems.contract, null);
  assert.equal(state.systems.reputation, 42);
  assert.deepEqual(
    station.decodeStation(station.encodeStation(delivered)),
    delivered,
  );
});
test("expedition preparation changes time, risk, returns and ecological impact", () => {
  let state = station.createStation({ name: "考察", mode: "relaxed", seed: 0 });
  state = station.stationAction(state, {
    type: "build",
    slot: 6,
    kind: "dock",
  });
  state = station.stationAction(state, { type: "workers", slot: 6, delta: 1 });
  const cautious = station.stationMissionPlan(state, "vent");
  const hastyState = station.stationAction(state, {
    type: "policy",
    field: "approach",
    value: "salvage",
  });
  const hasty = station.stationMissionPlan(hastyState, "vent");
  assert.ok(hasty.risk > cautious.risk);
  assert.ok(hasty.days < cautious.days);
  const trips = { ...state, systems: { ...state.systems, trips: { vent: 4 } } };
  assert.equal(station.stationMissionPlan(trips, "vent").factor, 0.4);
  assert.match(
    station.stationActionReason(state, { type: "launch", id: "seep" }),
    /研究/,
  );
  const launched = station.stationAction(hastyState, {
    type: "launch",
    id: "vent",
  });
  assert.deepEqual(
    station.decodeStation(station.encodeStation(launched)),
    launched,
  );
  // Simulate a voyage needing assistance to check both return decisions.
  let mission = {
    ...launched,
    systems: {
      ...launched.systems,
      missionPlan: { ...launched.systems.missionPlan, roll: 0 },
    },
  };
  while (mission.mission && !mission.event)
    mission = station.stationAction(mission, { type: "advance" });
  assert.equal(mission.event, "voyage");
  const assisted = station.stationAction(mission, {
    type: "resolve",
    choice: "pay",
  });
  const recalled = station.stationAction(mission, {
    type: "resolve",
    choice: "adapt",
  });
  assert.equal(assisted.mission, null);
  assert.equal(recalled.mission, null);
  assert.ok(assisted.resources.science > recalled.resources.science);
  assert.ok(assisted.resources.alloy > recalled.resources.alloy);
  assert.ok(assisted.resources.energy < recalled.resources.energy);
  assert.equal(assisted.systems.ecology, mission.systems.ecology - 6);
  assert.equal(recalled.morale, mission.morale - 2);
});
test("v2 decoders reject malformed, mixed and impossible action histories without throwing", () => {
  const ss = story.encodeStory(
    story.createStory({
      name: "存档",
      mode: "gentle",
      gear: ["sonar", "arm"],
      goal: "truth",
      seed: 0,
    }),
  );
  const st = station.encodeStation(
    station.createStation({ name: "存档", mode: "relaxed", seed: 0 }),
  );
  for (const invalid of [
    null,
    [],
    {},
    {
      ...st,
      actions: [
        { type: "policy", field: { toString: "bad" }, value: "normal" },
      ],
    },
    { ...st, actions: [{ type: "build", slot: 6, kind: { toString: "bad" } }] },
    { ...st, actions: [{ type: "resolve", choice: "pay" }] },
    { ...st, actions: [{ type: "accept", id: "__proto__" }] },
  ])
    assert.equal(station.decodeStation(invalid), null);
  assert.equal(station.decodeStation(ss), null);
  assert.equal(story.decodeStory(st), null);
  assert.equal(
    story.decodeStory({
      ...ss,
      actions: ["compare:maintenance:sensor:electrical"],
    }),
    null,
  );
});
