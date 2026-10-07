export const games = [
  {
    id: "story",
    name: "深渊来信",
    type: "文字探险",
    key: "deepsea-game-story-v1",
    description: "一封来自失联观测站的来信。带上装备，在调查与返航之间作选择。",
    features: ["6 章航程", "6 种结局", "装备与资源", "完整航行日志"],
    duration: "约 15–25 分钟",
  },
  {
    id: "station",
    name: "深海前哨",
    type: "模拟经营",
    key: "deepsea-game-station-v1",
    description:
      "接手一座试验海底站，安排队员、建设舱室，让科研和生活都持续下去。",
    features: ["舱室建设", "人员与供给", "科技与考察", "通关后自由经营"],
    duration: "约 30–50 分钟 / 局",
  },
] as const;
