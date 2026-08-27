/** 本地图片路径（由 npm run download-images 下载到 public/images/creatures/） */
export function creatureImage(id: string): string {
  return `${import.meta.env.BASE_URL}images/creatures/${id}.jpg`
}
