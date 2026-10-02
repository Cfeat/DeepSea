import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { test } from "node:test";
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
const { pressureAtDepth } = await import(moduleUrl("src/data/science.ts"));
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
    assert.ok(existsSync(`public/images/creatures/${c.id}.jpg`), c.id);
    assert.equal(getZoneAtDepth(c.depth, zones).id, c.zone, c.id);
    assert.ok(c.name && c.nameEn && c.fact && c.encyclopedia.habitat, c.id);
  });
  assert.ok(creatures.some((c) => c.id === "amphipod"));
  assert.equal(
    creatures.find((c) => c.id === "hadal-jellyfish").zone,
    "bathypelagic",
  );
});

const { createDiveLayout, DIVE_ROW_HEIGHT } = await import(
  moduleUrl("src/utils/diveLayout.ts")
);
test("depth-axis layout keeps every creature and reserves room for dense and duplicate depths", () => {
  const layout = createDiveLayout(creatures, zones, MAX_DEPTH);
  assert.equal(
    layout.stops.flatMap((stop) => stop.creatures).length,
    creatures.length,
  );
  for (let i = 1; i < layout.stops.length; i++) {
    const previous = layout.stops[i - 1];
    const stop = layout.stops[i];
    assert.ok(stop.depth > previous.depth);
    assert.ok(
      stop.y - previous.y >=
        previous.creatures.length * DIVE_ROW_HEIGHT +
          (previous.zone ? 290 : 0) +
          64,
    );
  }
  assert.equal(layout.stops.find((s) => s.depth === 1500).creatures.length, 2);
  for (let depth = 0; depth <= MAX_DEPTH; depth += 13)
    assert.ok(Math.abs(layout.toDepth(layout.toY(depth)) - depth) < 0.0001);
  assert.equal(layout.toDepth(-100), 0);
  assert.equal(layout.toDepth(layout.height + 100), MAX_DEPTH);
});
