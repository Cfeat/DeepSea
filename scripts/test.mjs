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
  assert.equal(creatures.length, 37);
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
