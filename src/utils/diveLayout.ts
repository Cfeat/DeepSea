import type { Creature, ZoneInfo, DiveTopic } from "../data/types";

export interface DiveStop {
  depth: number;
  y: number;
  creatures: Creature[];
  zone?: ZoneInfo;
  topic?: DiveTopic;
}
export const DIVE_ROW_HEIGHT = 220;
export const ZONE_HEIGHT = 260;
export const TOPIC_HEIGHT = 340;
export function stopHeight(stop: DiveStop) {
  return (
    (stop.zone ? ZONE_HEIGHT : 0) +
    (stop.topic ? TOPIC_HEIGHT : 0) +
    stop.creatures.length * DIVE_ROW_HEIGHT
  );
}
/** Expand crowded regions, preserving every entry and a strictly increasing scale. */
export function createDiveLayout(
  creatures: Creature[],
  zones: ZoneInfo[],
  maxDepth: number,
  topics: DiveTopic[] = [],
) {
  const depths = [
    ...new Set([
      0,
      maxDepth,
      ...zones.map((z) => z.minDepth),
      ...creatures.map((c) => c.displayDepth),
      ...topics.map((t) => t.depth),
    ]),
  ].sort((a, b) => a - b);
  const stops: DiveStop[] = [];
  for (const depth of depths) {
    const previous = stops[stops.length - 1];
    const room = previous ? stopHeight(previous) : 0;
    const y = previous
      ? previous.y +
        Math.max(room + 36, Math.min(600, (depth - previous.depth) * 0.55))
      : 100;
    stops.push({
      depth,
      y,
      creatures: creatures.filter((c) => c.displayDepth === depth),
      zone: zones.find((z) => z.minDepth === depth),
      topic: topics.find((t) => t.depth === depth),
    });
  }
  function interpolate(value: number, from: "depth" | "y", to: "depth" | "y") {
    if (value <= stops[0][from]) return stops[0][to];
    for (let i = 1; i < stops.length; i++) {
      if (value <= stops[i][from]) {
        const a = stops[i - 1],
          b = stops[i];
        return (
          a[to] + ((b[to] - a[to]) * (value - a[from])) / (b[from] - a[from])
        );
      }
    }
    return stops[stops.length - 1][to];
  }
  return {
    stops,
    height: stops[stops.length - 1].y + 440,
    toY: (depth: number) => interpolate(depth, "depth", "y"),
    toDepth: (y: number) => interpolate(y, "y", "depth"),
  };
}
