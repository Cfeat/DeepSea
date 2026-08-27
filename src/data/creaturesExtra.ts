import type { Creature } from './types'
import { creatureImage } from './imageUrls'

const e = (
  summary: string,
  habitat: string,
  diet: string,
  features: string[],
  funFact: string,
) => ({ summary, habitat, diet, features, funFact })

/** 精选补充物种（浅海代表 + 标志性深海种） */
export const creaturesExtra: Creature[] = [
  {
    id: 'clownfish',
    name: '小丑鱼',
    nameEn: 'Clownfish',
    depth: 3,
    zone: 'epipelagic',
    image: creatureImage('clownfish'),
    size: '8–12 厘米',
    side: 'left',
    fact: '与海葵共生，体表黏液使其免受海葵刺细胞伤害。',
    encyclopedia: e(
      '小丑鱼是与海葵共生的雀鲷科鱼类，社会结构严格，因《海底总动员》而广为人知。',
      '印度-太平洋珊瑚礁，深度 1–15 米。',
      '藻类、浮游生物及海葵触手捕获的残饵。',
      ['雌雄同体，群体由最大雌鱼主导', '孵化后随洋流扩散', '体色因种类而异', '依赖海葵提供庇护'],
      '小丑鱼通过特定舞蹈与海葵建立共生，是珊瑚礁生态的标志性组合。',
    ),
  },
  {
    id: 'hammerhead-shark',
    name: '双髻鲨',
    nameEn: 'Hammerhead Shark',
    depth: 76,
    zone: 'epipelagic',
    image: creatureImage('hammerhead-shark'),
    size: '3–6 米',
    side: 'right',
    fact: '锤状头部扩大电感受器分布，提升探测猎物的能力。',
    encyclopedia: e(
      '双髻鲨是辨识度最高的鲨鱼之一，锤头结构增强立体视觉与电感应。',
      '全球热带、温带沿海及外海。',
      '魟鱼、鱼类、头足类和其他鲨鱼。',
      ['眼位于锤头两端，视野广', '可形成大型群体', '部分种类极危', '幼鲨在浅海成长'],
      '双髻鲨可以 360° 扫描海底——锤头结构是自然界最极端的感官演化之一。',
    ),
  },
  {
    id: 'firefly-squid',
    name: '荧光乌贼',
    nameEn: 'Firefly Squid',
    depth: 245,
    zone: 'mesopelagic',
    image: creatureImage('firefly-squid'),
    size: '7 厘米',
    side: 'right',
    fact: '日本富山湾春季聚集产卵，全身数百发光器，场景如星海。',
    encyclopedia: e(
      '荧光乌贼是小型头足类，遍布发光器，在日本富山湾的产卵聚集是著名自然奇观。',
      '西太平洋，水深 200–400 米，产卵期近岸。',
      '小型鱼类和甲壳类。',
      ['数百个发光器控制发光', '春季近岸产卵', '发光可能用于交流或伪装', '寿命约 1 年'],
      '富山湾的荧光乌贼产卵季吸引数十万游客——整条海岸线在夜间闪烁蓝光。',
    ),
  },
  {
    id: 'blobfish',
    name: '水滴鱼',
    nameEn: 'Blobfish',
    depth: 823,
    zone: 'mesopelagic',
    image: creatureImage('blobfish'),
    size: '30 厘米',
    side: 'right',
    fact: '出水后凝胶状身体塌陷成「悲伤脸」，深海中压力维持其正常形态。',
    encyclopedia: e(
      '水滴鱼是深海底栖软体鱼，密度略低于水，无需鳔即可浮在海底上方节省能量。',
      '澳大利亚、新西兰周边 600–1200 米深海。',
      '浮游生物、甲壳类和其他经过的有机物。',
      ['无肌肉，依赖浮力悬浮', '出水形态与活体差异极大', '曾被称为「最丑动物」', '深海中外观正常'],
      '水滴鱼的「丑」是减压造成的——在原生高压环境中它们是普通的底栖鱼。',
    ),
  },
]
