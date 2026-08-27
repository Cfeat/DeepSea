/** 本地图片路径（由 npm run download-images 下载到 public/images/creatures/） */
export function creatureImage(id: string): string {
  return `/images/creatures/${id}.jpg`
}
