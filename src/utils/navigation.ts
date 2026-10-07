export const pages = [
  { id: "home", label: "首页" },
  { id: "journey", label: "深度探索" },
  { id: "atlas", label: "生物图鉴" },
  { id: "lab", label: "深海实验室" },
  { id: "topics", label: "海洋专题" },
  { id: "games", label: "深海游乐场" },
  { id: "sources", label: "参考资料" },
] as const;

export type PageId = (typeof pages)[number]["id"];
export function readLocation() {
  const url = new URL(window.location.href);
  const [page, topicId] = url.hash.slice(1).replace(/^\//, "").split("/");
  const creatureId = url.searchParams.get("creature");
  const pageId: PageId = pages.some((item) => item.id === page)
    ? (page as PageId)
    : !page && creatureId
      ? "atlas"
      : "home";
  return {
    pageId,
    topicId: pageId === "topics" ? topicId : undefined,
    gameId: pageId === "games" ? topicId : undefined,
    creatureId,
  };
}

export function pageHref(page: PageId) {
  return `#${page}`;
}
