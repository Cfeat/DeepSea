export type OceanZone =
  | "epipelagic"
  | "mesopelagic"
  | "bathypelagic"
  | "abyssopelagic"
  | "hadalpelagic";
export interface ZoneInfo {
  id: OceanZone;
  name: string;
  nameEn: string;
  minDepth: number;
  maxDepth: number;
  description: string;
}
export interface Reference {
  publisher: string;
  title: string;
  url: string;
}
export interface CreatureMedia {
  originalUrl: string;
  path: string;
  kind: "photo";
  subjectScientificName: string;
  captureType: "实景照片" | "野外照片" | "水族馆照片" | "标本照片";
  note?: string;
  modifications: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  caption: string;
}
export interface Creature {
  id: string;
  name: string;
  nameEn: string;
  scientificName: string;
  taxon: "物种" | "类群";
  /** Editorial position on the non-linear reading axis, never an observation. */
  displayDepth: number;
  zone: OceanZone;
  habitatRange?: { min: number; max: number; note: string };
  depthRecord?: {
    depth: number;
    year: number;
    note: string;
    source: Reference;
  };
  size: string;
  fact: string;
  encyclopedia: {
    summary: string;
    habitat: string;
    diet: string;
    features: string[];
    funFact: string;
  };
  sources: Reference[];
  reviewedOn: string;
  media: CreatureMedia;
}
export interface DiveTopic {
  id: string;
  depth: number;
  title: string;
  kicker: string;
  text: string;
  kind: "snow" | "vent" | "whale" | "seafloor" | "trench" | "survey";
  source: Reference;
}
export const MAX_DEPTH = 11000;
export function getZoneAtDepth(depth: number, zones: ZoneInfo[]): ZoneInfo {
  return (
    zones.find((z) => Math.max(0, depth) >= z.minDepth && depth < z.maxDepth) ??
    zones[zones.length - 1]
  );
}
