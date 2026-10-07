export const sources = [
  {
    publisher: "NOAA / 美国国家海洋和大气管理局",
    title: "阳光能抵达多深的海洋？",
    url: "https://oceanservice.noaa.gov/facts/light_travel.html",
  },
  {
    publisher: "NOAA / OCEAN EXPLORATION",
    title: "压力如何影响海洋动物？",
    url: "https://oceanexplorer.noaa.gov/ocean-fact/animal-pressure/",
  },
  {
    publisher: "MBARI / 蒙特雷湾水族研究所",
    title: "认识深海动物与它们的适应方式",
    url: "https://www.mbari.org/education/animals-of-the-deep/",
  },
  {
    publisher: "DEEP-SEA RESEARCH I / 2021",
    title: "挑战者深渊的深度为何需要修正？",
    url: "https://repository.library.noaa.gov/view/noaa/33477",
  },
];
/** Constant-density hydrostatic approximation; absolute pressure in atmospheres. */
export function pressureAtDepth(depth: number) {
  return 1 + (1025 * 9.81 * Math.max(0, depth)) / 101325;
}
/** Boyle's law for a flexible sealed gas bag; fixed temperature, equilibrium. */
export function gasVolumeFraction(depth: number) {
  return 1 / pressureAtDepth(depth);
}
