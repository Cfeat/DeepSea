export const games = [
  {
    id: "story",
    name: "深渊来信",
    type: "文字探险",
    key: "deepsea-game-story-v1",
    description: "规划一条能走回来的航线。救援、补给、证据与井底档案，哪些值得冒险？",
    features: ["九处自由调查地点", "证据推理", "三种航行目标", "六种航行结果"],
    duration: "随时存档，分段游玩",
  },
  {
    id: "station",
    name: "深海前哨",
    type: "模拟经营",
    key: "deepsea-game-station-v1",
    description:
      "接手一座试验海底站，安排队员、建设舱室，让科研和生活都持续下去。",
    features: ["三种海域与项目", "排班与设施协作", "考察风险与委托", "通关后自由经营"],
    duration: "30 天评估，之后自由经营",
  },
] as const;
