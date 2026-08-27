# 深海 · Deep Sea

类似 [neal.fun/deep-sea](https://neal.fun/deep-sea/) 的垂直滚动深海探索网站。向下滚动即下潜，点击生物查看自建百科。

## 功能

- 从海面（0 m）到挑战者深渊（10,935 m）的连续滚动体验
- **44 种**按真实深度分布的海洋生物
- 每种生物配有 **Wikimedia Commons 真实参考照片**
- 左右交替布局 + 自动防重叠算法
- 点击生物打开百科（概述、栖息地、食性、特征、补充）
- 深度里程碑、分区标记、随深度变化的背景

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5173`

线上预览（GitHub Pages）：https://cfeat.github.io/DeepSea/

## 图片

图片通过百度图片搜索下载到本地（国内源）：

```bash
npm run download-images
```

保存路径：`public/images/creatures/*.jpg`

## 添加生物

编辑 `src/data/creatureData.ts`，并在 `src/data/imageUrls.ts` 添加对应图片 URL：

```typescript
{
  id: 'my-fish',
  name: '中文名',
  nameEn: 'English Name',
  depth: 500,
  zone: 'mesopelagic',
  image: creatureImage('my-fish'),
  side: 'left',
  fact: '一行简短介绍，显示在滚动页面上。',
  encyclopedia: { summary, habitat, diet, features, funFact },
}
```

## 技术栈

React 19 · TypeScript · Vite 6 · 纯 CSS
