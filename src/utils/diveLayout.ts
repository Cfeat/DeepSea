import type { Creature, ZoneInfo } from "../data/types";

export interface DiveStop {
  depth: number;
  y: number;
  creatures: Creature[];
  zone?: ZoneInfo;
}
export const DIVE_ROW_HEIGHT = 230;
/** Expand crowded regions, preserving every entry and a strictly increasing scale. */
export function createDiveLayout(
  creatures: Creature[],
  zones: ZoneInfo[],
  maxDepth: number,
) {
  const depths = [
    ...new Set([
      0,
      maxDepth,
      ...zones.map((z) => z.minDepth),
      ...creatures.map((c) => c.depth),
    ]),
  ].sort((a, b) => a - b);
  const stops: DiveStop[] = [];
  for (const depth of depths) {
    const previous = stops[stops.length - 1];
    const room = previous
      ? (previous.zone ? 290 : 0) + previous.creatures.length * DIVE_ROW_HEIGHT
      : 0;
    const y = previous
      ? previous.y + Math.max(room + 65, (depth - previous.depth) * 0.72)
      : 100;
    stops.push({
      depth,
      y,
      creatures: creatures.filter((c) => c.depth === depth),
      zone: zones.find((z) => z.minDepth === depth),
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
