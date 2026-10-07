import type { SceneMedia } from "./types";

const conversion = "保留完整画面，等比例缩放并转换为 WebP。";
const noaaUse = "https://oceanexplorer.noaa.gov/about/media-kit/";
export const topicMedia: Record<string, SceneMedia> = {
  "marine-snow": {
    path: "images/topics/marine-snow.webp",
    version: "79604da06610",
    kind: "photo",
    caption:
      "水中散布的海洋雪颗粒。白色颗粒来自上层海水中的生物残骸等物质，并不是冰雪。",
    author: "NOAA National Ocean Service",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Marine_snow.jpg",
    originalUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Marine_snow.jpg",
    license: "公有领域",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    modifications: conversion,
  },
  vents: {
    path: "images/topics/vents.webp",
    version: "fa0e424ec46e",
    kind: "photo",
    caption:
      "2016 年马里亚纳海域考察中的活跃热液烟囱。黑色流体周围可见附着在烟囱上的动物。",
    author:
      "NOAA Ocean Exploration · 2016 Deepwater Exploration of the Marianas",
    sourceUrl:
      "https://oceanexplorer.noaa.gov/multimedia/explorations-ex2405-ex2406-learning-at-sea-1605activevent/",
    originalUrl:
      "https://oceanexplorer.noaa.gov/wp-content/uploads/2024/10/1605activevent-hires.jpg",
    license: "NOAA 公开使用说明",
    licenseUrl: noaaUse,
    modifications: conversion,
  },
  "whale-fall": {
    path: "images/topics/whale-fall.webp",
    version: "112db17b77d1",
    kind: "photo",
    caption:
      "海底鲸骨与周围的动物。鲸的软组织被消耗后，骨骼仍能为其他生物提供栖息空间和食物来源。",
    author: "NOAA Undersea Research Program",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Whale_fall.jpg",
    originalUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/Whale_fall.jpg",
    license: "公有领域",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    modifications: "保留完整画面，转换为 WebP；原图分辨率为 483 × 328。",
  },
  "abyss-floor": {
    path: "images/topics/abyss-floor.webp",
    version: "07055706a43a",
    kind: "photo",
    caption:
      "Deep Discoverer 潜水器观察波多黎各南部 Guayanilla 海底峡谷中约 20 米宽的弧形陡壁，陡壁下方可见滑落的岩体。",
    author:
      "NOAA Ocean Exploration · Exploring Puerto Rico’s Seamounts, Trenches, and Troughs",
    sourceUrl:
      "https://oceanexplorer.noaa.gov/multimedia/daily-image-media-20200810/",
    originalUrl:
      "https://oceanexplorer.noaa.gov/wp-content/uploads/2020/08/20200810-hires.jpg",
    license: "NOAA 公开使用说明",
    licenseUrl: noaaUse,
    modifications: conversion,
  },
  trenches: {
    path: "images/topics/trenches.webp",
    version: "ef7f483f051a",
    kind: "data-map",
    caption:
      "NOAA 发布的马里亚纳海沟水深地形图。颜色和立体阴影用于表现地形，不是海底的自然颜色；这是一幅数据可视化。",
    author: "NOAA / NCEI",
    sourceUrl: "https://www.ncei.noaa.gov/news/planet-postcard-mariana-trench",
    originalUrl:
      "https://www.ncei.noaa.gov/sites/default/files/styles/max_1300x1300/public/sites/default/files/mariana-trench-1200x480.jpg?itok=rP2sP2Bf",
    license: "NOAA 公开使用说明",
    licenseUrl: "https://data.ngdc.noaa.gov/ngdcinfo/privacy.html",
    modifications: "保留完整画面，转换为 WebP。",
  },
  survey: {
    path: "images/topics/survey.webp",
    version: "ae4f4a2af11b",
    kind: "photo",
    caption:
      "2022 年加勒比海测绘航次中的 NOAA Okeanos Explorer 科考船。船上搭载测绘声呐和遥控潜水器等设备。",
    author:
      "Anna Sagatov / GFOE · NOAA Ocean Exploration · 2022 Caribbean Mapping",
    sourceUrl: "https://oceanexplorer.noaa.gov/okeanos/about/",
    originalUrl:
      "https://oceanexplorer.noaa.gov/wp-content/uploads/2025/08/ex-bow-hires.jpg",
    license: "NOAA 公开使用说明",
    licenseUrl: noaaUse,
    modifications:
      "采用来源提供的 1536 像素版本，保留完整画面，缩放并转换为 WebP。",
  },
};
