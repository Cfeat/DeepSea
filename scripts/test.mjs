import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { test } from "node:test";
import { createHash } from "node:crypto";
import ts from "typescript";
// Load application TypeScript with the project's compiler, without a test framework.
const cache = new Map();
function moduleUrl(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file);
  let code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  code = code.replace(/import\.meta\.env\.BASE_URL/g, "'/DeepSea/'");
  code = code.replace(
    /from ['"](\.[^'"]+)['"]/g,
    (_, specifier) =>
      `from '${moduleUrl(resolve(dirname(file), `${specifier}.ts`))}'`,
  );
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  cache.set(file, url);
  return url;
}
const { pressureAtDepth, gasVolumeFraction } = await import(
  moduleUrl("src/data/science.ts")
);
const { zones } = await import(moduleUrl("src/data/zones.ts"));
const { getZoneAtDepth, MAX_DEPTH } = await import(
  moduleUrl("src/data/types.ts")
);
const { creatures } = await import(moduleUrl("src/data/creatureData.ts"));
test("pressure includes atmospheric pressure and grows monotonically", () => {
  assert.equal(pressureAtDepth(0), 1);
  assert.ok(Math.abs(pressureAtDepth(10) - 1.9924) < 0.001);
  assert.ok(pressureAtDepth(11000) > 1090 && pressureAtDepth(11000) < 1100);
  for (let d = 0; d < MAX_DEPTH; d += 100)
    assert.ok(pressureAtDepth(d + 100) > pressureAtDepth(d));
});
test("zone boundaries cover the complete exploration range without gaps", () => {
  assert.equal(zones[0].minDepth, 0);
  assert.equal(zones.at(-1).maxDepth, MAX_DEPTH);
  zones.forEach((zone, i) => {
    assert.equal(getZoneAtDepth(zone.minDepth, zones).id, zone.id);
    assert.equal(getZoneAtDepth(zone.maxDepth - 1, zones).id, zone.id);
    if (i) assert.equal(zones[i - 1].maxDepth, zone.minDepth);
  });
  assert.equal(getZoneAtDepth(MAX_DEPTH, zones).id, "hadalpelagic");
});
test("catalog has unique IDs, available images and consistent teaching groups", () => {
  assert.equal(new Set(creatures.map((c) => c.id)).size, creatures.length);
  creatures.forEach((c) => {
    assert.equal(getZoneAtDepth(c.displayDepth, zones).id, c.zone, c.id);
    assert.ok(
      c.name &&
        c.nameEn &&
        c.scientificName &&
        c.fact &&
        c.encyclopedia.habitat &&
        c.reviewedOn,
      c.id,
    );
    assert.ok(c.sources.length, c.id);
    for (const s of c.sources) assert.equal(new URL(s.url).protocol, "https:");
    if (c.habitatRange) {
      assert.ok(
        c.habitatRange.min <= c.displayDepth &&
          c.displayDepth <= c.habitatRange.max,
        c.id,
      );
      assert.ok(c.habitatRange.note);
    }
    if (c.depthRecord) {
      assert.ok(
        c.depthRecord.year && c.depthRecord.source.url && c.depthRecord.note,
      );
    }
  });
  assert.ok(creatures.some((c) => c.id === "amphipod"));
  assert.equal(
    creatures.find((c) => c.id === "hadal-jellyfish").zone,
    "bathypelagic",
  );
});

test("every entry has a local, credited real photo with an explicit subject and capture context", () => {
  assert.equal(creatures.length, 49);
  assert.equal(
    new Set(creatures.map((c) => c.media.path)).size,
    creatures.length,
  );
  for (const c of creatures) {
    const media = c.media;
    assert.equal(media.kind, "photo", c.id);
    assert.match(media.path, /^images\/reviewed\/[\w-]+\.webp$/, c.id);
    assert.ok(existsSync(`public/${media.path}`), c.id);
    const file = readFileSync(`public/${media.path}`);
    assert.equal(file.toString("ascii", 0, 4), "RIFF", c.id);
    assert.equal(file.toString("ascii", 8, 12), "WEBP", c.id);
    assert.equal(
      media.version,
      createHash("sha256").update(file).digest("hex").slice(0, 12),
      `${c.id}: photo version must match the local file`,
    );
    for (const key of [
      "author",
      "caption",
      "license",
      "subjectScientificName",
      "captureType",
      "modifications",
    ])
      assert.ok(media[key]?.trim(), `${c.id}: ${key}`);
    for (const key of ["sourceUrl", "originalUrl", "licenseUrl"])
      assert.equal(new URL(media[key]).protocol, "https:", `${c.id}: ${key}`);
    if (c.taxon === "物种")
      assert.equal(media.subjectScientificName, c.scientificName, c.id);
    else
      assert.ok(
        media.note,
        `${c.id}: explain the photographed member of the group`,
      );
  }
});

const { createDiveLayout, stopHeight } = await import(
  moduleUrl("src/utils/diveLayout.ts")
);
const { topics } = await import(moduleUrl("src/data/topics.ts"));
test("all topic media are local, versioned, credited and clearly separate photos from measurement maps", () => {
  assert.equal(topics.length, 6);
  assert.equal(
    topics.filter((topic) => topic.media.kind === "photo").length,
    5,
  );
  assert.equal(
    topics.filter((topic) => topic.media.kind === "data-map").length,
    1,
  );
  for (const topic of topics) {
    const media = topic.media;
    assert.match(media.path, /^images\/topics\/[\w-]+\.webp$/);
    const file = readFileSync(`public/${media.path}`);
    assert.equal(file.toString("ascii", 0, 4), "RIFF");
    assert.equal(file.toString("ascii", 8, 12), "WEBP");
    assert.equal(
      media.version,
      createHash("sha256").update(file).digest("hex").slice(0, 12),
    );
    for (const key of ["author", "caption", "license", "modifications"])
      assert.ok(media[key]?.trim(), `${topic.id}: ${key}`);
    for (const key of ["originalUrl", "sourceUrl", "licenseUrl"])
      assert.equal(new URL(media[key]).protocol, "https:");
    assert.equal(topic.sections.length, 3);
    for (const id of topic.relatedCreatures)
      assert.ok(creatures.some((creature) => creature.id === id));
  }
  assert.match(
    topics.find((topic) => topic.id === "trenches").media.caption,
    /数据可视化/,
  );
});
test("depth-axis layout keeps every creature and reserves room for dense and duplicate depths", () => {
  const layout = createDiveLayout(creatures, zones, MAX_DEPTH, topics);
  assert.equal(
    layout.stops.flatMap((stop) => stop.creatures).length,
    creatures.length,
  );
  for (let i = 1; i < layout.stops.length; i++) {
    const previous = layout.stops[i - 1];
    const stop = layout.stops[i];
    assert.ok(stop.depth > previous.depth);
    assert.ok(stop.y - previous.y >= stopHeight(previous) + 35);
  }
  assert.equal(layout.stops.find((s) => s.depth === 1500).creatures.length, 2);
  for (let depth = 0; depth <= MAX_DEPTH; depth += 13)
    assert.ok(Math.abs(layout.toDepth(layout.toY(depth)) - depth) < 0.0001);
  assert.equal(layout.toDepth(-100), 0);
  assert.equal(layout.toDepth(layout.height + 100), MAX_DEPTH);
  assert.equal(layout.stops.filter((s) => s.topic).length, topics.length);
  assert.ok(
    layout.stops.at(-1).y - layout.stops.at(-2).y <= 600,
    "no empty 1,800-pixel tail",
  );
});
test("gas volume uses absolute pressure; negative depth is surface", () => {
  assert.equal(gasVolumeFraction(0), 1);
  assert.equal(gasVolumeFraction(-20), 1);
  assert.ok(Math.abs(gasVolumeFraction(10) - 0.5019) < 0.001);
  assert.ok(gasVolumeFraction(100) < 0.1);
  assert.equal(getZoneAtDepth(-1, zones).id, "epipelagic");
});

const story = await import(moduleUrl("src/games/storyEngine.ts"));
const station = await import(moduleUrl("src/games/stationEngine.ts"));
function storyPath(actions, mode = "standard", gear = ["sonar", "arm"]) {
  let state = story.createStory({ name: "试航", mode, gear });
  for (const id of actions) {
    const next = story.chooseStory(state, id);
    assert.notEqual(next, state, `${state.node}: ${id}`);
    state = next;
  }
  return state;
}
const truthPath = [
  "brief",
  "observe",
  "scan",
  "arm",
  "accept",
  "film",
  "shelter",
  "record",
  "charge",
  "observe",
  "lift",
  "patient",
  "report",
];
test("all six story endings are reachable in both difficulties and survive save replay", () => {
  const routes = {
    home: ["abort"],
    rescue: ["brief", "observe", "scan", "arm", "escort"],
    truth: truthPath,
    discovery: [
      "rush",
      "follow",
      "station",
      "course",
      "shelter",
      "pass",
      "charge",
      "observe",
      "lift",
      "patient",
      "report",
    ],
    archive: [...truthPath.slice(0, -2), "send"],
    lost: [...truthPath.slice(0, -3), "deeper", "force"],
  };
  for (const mode of ["standard", "gentle"])
    for (const [ending, actions] of Object.entries(routes)) {
      const state = storyPath(actions, mode);
      assert.equal(state.ending, ending);
      assert.deepEqual(story.decodeStory(story.encodeStory(state)), state);
      assert.equal(story.chooseStory(state, "abort"), state);
      assert.ok(story.storyScore(state) > 0);
    }
});
test("story branches respect equipment, resource limits and factual reading links", () => {
  const state = storyPath(["brief", "follow"], "standard", [
    "battery",
    "medkit",
  ]);
  const scan = story.storyNode(state).choices.find((c) => c.id === "scan");
  assert.match(story.storyChoiceReason(state, scan), /未携带/);
  assert.equal(story.chooseStory(state, "scan"), state);
  assert.equal(story.chooseStory(state, "unknown"), state);
  const low = { ...state, battery: 1 };
  assert.equal(story.chooseStory(low, "light"), low);
  const depleted = story.chooseStory({ ...state, battery: 5 }, "light");
  assert.equal(depleted.ending, "lost");
  assert.equal(depleted.battery, 0);
  for (const node of story.storyNodes) {
    assert.equal(
      new Set(node.choices.map((c) => c.id)).size,
      node.choices.length,
    );
    if (node.creature) assert.ok(creatures.some((c) => c.id === node.creature));
    if (node.topic) assert.ok(topics.some((t) => t.id === node.topic));
    for (const choice of node.choices) {
      if (choice.next && choice.next !== "finish")
        assert.ok(story.storyNodes.some((n) => n.id === choice.next));
      if (choice.record) assert.ok(story.storyRecords[choice.record]);
    }
  }
  for (let i = 0; i < story.storyGear.length; i++)
    for (let j = i + 1; j < story.storyGear.length; j++) {
      const gear = [story.storyGear[i].id, story.storyGear[j].id];
      const ending = storyPath(
        [
          "rush",
          "follow",
          "station",
          "course",
          "detour",
          "pass",
          "charge",
          "skip",
          "partial",
          "patient",
          "report",
        ],
        "standard",
        gear,
      );
      assert.equal(ending.ending, "home");
    }
});
function winStation(mode, seed) {
  let state = station.createStation({ name: "测试站", mode, seed });
  const act = (action) => {
    assert.equal(
      station.stationActionReason(state, action),
      null,
      `${state.day}: ${JSON.stringify(action)}`,
    );
    const next = station.stationAction(state, action);
    assert.notEqual(next, state);
    state = next;
  };
  const attempt = (action) => {
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
    if (state.event && !attempt({ type: "resolve", choice: "pay" }))
      act({ type: "resolve", choice: "adapt" });
    if (state.integrity < 75) attempt({ type: "repair" });
    for (const id of ["sonar", "automation", "network"])
      attempt({ type: "research", id });
    if (!state.mission) {
      const id = ["snow", "vent", "map"].find(
        (id) => !state.completed.includes(id),
      );
      if (id) attempt({ type: "launch", id });
    }
    if (state.techs.includes("network") && !state.rooms[10]) {
      if (state.resources.alloy < 50) attempt({ type: "trade", item: "alloy" });
      if (attempt({ type: "build", slot: 10, kind: "beacon" }))
        act({ type: "workers", slot: 10, delta: 1 });
    }
    act({ type: "advance" });
  }
  return state;
}
test("station can complete all expeditions, research and staffed beacon with every event order", () => {
  for (const mode of ["relaxed", "standard"])
    for (let seed = 0; seed < 4; seed++) {
      const state = winStation(mode, seed);
      assert.equal(state.outcome, "won", `${mode}/${seed}`);
      assert.ok(state.day >= 10 && state.day <= 30);
      assert.equal(state.completed.length, 3);
      assert.deepEqual(
        station.decodeStation(station.encodeStation(state)),
        state,
      );
      let endless = station.stationAction(state, { type: "continue" });
      assert.equal(endless.endless, true);
      assert.equal(endless.outcome, null);
      for (let day = endless.day; day < 33; day++) {
        if (endless.event)
          endless = station.stationAction(endless, {
            type: "resolve",
            choice: "adapt",
          });
        if (endless.integrity < 60)
          endless = station.stationAction(endless, { type: "repair" });
        endless = station.stationAction(endless, { type: "advance" });
      }
      assert.equal(endless.day, 33);
      assert.equal(endless.outcome, null);
      assert.deepEqual(
        station.decodeStation(station.encodeStation(endless)),
        endless,
      );
    }
});
test("construction connectivity, staff, beds and expedition guards prevent invalid spending", () => {
  let state = station.createStation({ name: "边界", mode: "relaxed", seed: 0 });
  for (const action of [
    { type: "build", slot: 11, kind: "lab" },
    { type: "build", slot: -1, kind: "lab" },
    { type: "build", slot: 6, kind: "__proto__" },
    { type: "research", id: "network" },
    { type: "recruit" },
    { type: "launch", id: "snow" },
  ])
    assert.equal(station.stationAction(state, action), state);
  state = station.stationAction(state, { type: "build", slot: 6, kind: "lab" });
  state = station.stationAction(state, {
    type: "build",
    slot: 7,
    kind: "dock",
  });
  assert.match(
    station.stationActionReason(state, { type: "demolish", slot: 6 }),
    /连接/,
  );
  state = station.stationAction(state, { type: "workers", slot: 6, delta: 1 });
  state = station.stationAction(state, { type: "workers", slot: 7, delta: 1 });
  state = station.stationAction(state, { type: "workers", slot: 4, delta: 1 });
  assert.equal(station.assignedWorkers(state), 6);
  assert.match(
    station.stationActionReason(state, { type: "workers", slot: 6, delta: 1 }),
    /空闲/,
  );
  state = station.stationAction(state, { type: "launch", id: "snow" });
  assert.match(
    station.stationActionReason(state, { type: "demolish", slot: 7 }),
    /尚未返回/,
  );
  assert.equal(
    station.stationAction(state, { type: "launch", id: "vent" }),
    state,
  );
  for (let i = 0; i < 2; i++)
    state = station.stationAction(state, { type: "advance" });
  assert.deepEqual(state.completed, ["snow"]);
  assert.equal(state.mission, null);
  assert.equal(state.resources.science, 22);
  assert.equal(
    station.stationActionReason(state, { type: "demolish", slot: 7 }),
    null,
  );
});
test("daily supply reflects upgrades, upkeep, paused production and shortage recovery", () => {
  let state = station.createStation({
    name: "收支",
    mode: "standard",
    seed: 0,
  });
  assert.equal(station.stationForecast(state).delta.energy, 5);
  assert.equal(station.stationForecast(state).delta.credits, 24);
  state = station.stationAction(state, { type: "upgrade", slot: 4 });
  assert.equal(station.stationForecast(state).delta.energy, 23);
  assert.equal(station.stationForecast(state).delta.credits, 22);
  state = station.stationAction(state, { type: "toggle", slot: 1 });
  assert.equal(station.stationForecast(state).delta.oxygen, -12);
  assert.equal(station.stationForecast(state).delta.credits, 22);
  state = station.stationAction(state, { type: "toggle", slot: 9 });
  for (let i = 0; i < 7; i++) {
    if (state.event)
      state = station.stationAction(state, {
        type: "resolve",
        choice: "adapt",
      });
    state = station.stationAction(state, { type: "advance" });
  }
  assert.equal(state.shortageDays, 2);
  assert.equal(state.outcome, null);
  let recovered = station.stationAction(state, { type: "trade", item: "food" });
  recovered = station.stationAction(recovered, {
    type: "trade",
    item: "oxygen",
  });
  recovered = station.stationAction(recovered, { type: "toggle", slot: 1 });
  recovered = station.stationAction(recovered, { type: "toggle", slot: 9 });
  recovered = station.stationAction(recovered, { type: "advance" });
  assert.equal(recovered.shortageDays, 0);
  assert.equal(recovered.outcome, null);
  const failed = station.stationAction(state, { type: "advance" });
  assert.equal(failed.outcome, "lost");
  assert.equal(station.stationAction(failed, { type: "advance" }), failed);
  let deadline = station.createStation({
    name: "期限",
    mode: "relaxed",
    seed: 0,
  });
  while (!deadline.outcome) {
    if (deadline.event)
      deadline = station.stationAction(deadline, {
        type: "resolve",
        choice: "adapt",
      });
    if (deadline.integrity < 65)
      deadline = station.stationAction(deadline, { type: "repair" });
    deadline = station.stationAction(deadline, { type: "advance" });
  }
  assert.equal(deadline.day, 30);
  assert.equal(deadline.outcome, "lost");
  assert.equal(deadline.event, null);
});

test("workshop, living quarters, recruitment and both support technologies have working effects", () => {
  let state = station.createStation({ name: "扩建", mode: "relaxed", seed: 0 });
  const act = (action) => {
    assert.equal(
      station.stationActionReason(state, action),
      null,
      JSON.stringify(action),
    );
    state = station.stationAction(state, action);
  };
  for (const [slot, kind] of [
    [6, "workshop"],
    [10, "quarters"],
    [2, "lab"],
  ]) {
    act({ type: "build", slot, kind });
    act({ type: "workers", slot, delta: 1 });
  }
  act({ type: "upgrade", slot: 4 });
  const nextDay = () => {
    if (state.event) act({ type: "resolve", choice: "pay" });
    act({ type: "advance" });
  };
  assert.equal(station.stationCapacity(state), 9);
  assert.equal(station.stationForecast(state).morale, 1);
  const alloyBefore = state.resources.alloy;
  for (let i = 0; i < 4; i++) nextDay();
  assert.equal(state.resources.alloy, alloyBefore + 32);
  if (state.event) act({ type: "resolve", choice: "pay" });
  act({ type: "research", id: "recycling" });
  assert.equal(station.stationForecast(state).delta.food, 3);
  assert.equal(station.stationForecast(state).delta.oxygen, 8);
  act({ type: "recruit" });
  assert.equal(state.crew, 7);
  assert.equal(station.stationForecast(state).delta.food, 1);
  assert.match(
    station.stationActionReason(state, { type: "demolish", slot: 10 }),
    /床位/,
  );
  for (let i = 0; i < 6; i++) nextDay();
  while (
    station.stationActionReason(state, { type: "research", id: "pressure" }) &&
    state.day < 25
  )
    nextDay();
  act({ type: "research", id: "pressure" });
  assert.equal(station.stationForecast(state).wear, 0);
  while (
    station.stationActionReason(state, { type: "upgrade", slot: 10 }) &&
    state.day < 25
  )
    nextDay();
  act({ type: "upgrade", slot: 10 });
  assert.equal(station.stationCapacity(state), 12);
  act({ type: "demolish", slot: 6 });
  assert.equal(station.assignedWorkers(state), 5);
  assert.deepEqual(station.decodeStation(station.encodeStation(state)), state);
});
test("events block time, deterministic saves replay rather than trusting injected resources", () => {
  let state = station.createStation({ name: "事件", mode: "relaxed", seed: 0 });
  for (let i = 0; i < 4; i++)
    state = station.stationAction(state, { type: "advance" });
  assert.equal(state.event, "seal");
  assert.equal(station.stationAction(state, { type: "advance" }), state);
  const resolved = station.stationAction(state, {
    type: "resolve",
    choice: "pay",
  });
  assert.equal(resolved.resources.alloy, state.resources.alloy - 10);
  assert.equal(
    station.stationAction(resolved, { type: "resolve", choice: "pay" }),
    resolved,
  );
  const save = {
    ...station.encodeStation(resolved),
    resources: { credits: 999999 },
  };
  assert.deepEqual(station.decodeStation(save), resolved);
  for (const bad of [
    null,
    [],
    {},
    { ...save, version: 2 },
    {
      ...save,
      actions: [...save.actions, { type: "workers", slot: 4, delta: 100 }],
    },
    { ...save, actions: [{ type: "build", slot: 6, kind: "constructor" }] },
  ])
    assert.equal(station.decodeStation(bad), null);
  const storySave = story.encodeStory(storyPath(["brief"]));
  assert.equal(station.decodeStation(storySave), null);
  assert.equal(story.decodeStory(save), null);
  assert.equal(story.decodeStory({ ...storySave, actions: ["scan"] }), null);
  assert.equal(
    story.decodeStory({
      ...storySave,
      setup: { ...storySave.setup, gear: ["arm", "arm"] },
    }),
    null,
  );
});
