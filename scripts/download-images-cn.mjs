import { mkdir, writeFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'images', 'creatures')

/** id -> 中文搜索词（百度百科/图片常用名） */
const searchTerms = {
  'atlantic-cod': '大西洋鳕 鱼类',
  'atlantic-salmon': '大西洋鲑 鱼',
  'european-pilchard': '沙丁鱼 海洋',
  'bottlenose-dolphin': '宽吻海豚',
  'whale-shark': '鲸鲨',
  'mahi-mahi': '鲯鳅 鬼头刀',
  'green-sea-turtle': '绿海龟',
  'great-white-shark': '大白鲨',
  'blue-whale': '蓝鲸',
  'humpback-whale': '座头鲸',
  'orca': '虎鲸 逆戟鲸',
  'manta-ray': '蝠鲼',
  'octopus': '章鱼 海洋',
  'leatherback-turtle': '棱皮龟',
  'emperor-penguin': '帝企鹅',
  'megamouth-shark': '巨口鲨',
  'lanternfish': '灯笼鱼 深海',
  'hatchetfish': '斧鱼 深海',
  'sperm-whale': '抹香鲸',
  'blue-shark': '大青鲨',
  'barreleye': '管眼鱼 深海',
  'giant-squid': '大王乌贼',
  'japanese-spider-crab': '甘氏巨螯蟹 蜘蛛蟹',
  'coelacanth': '腔棘鱼 活化石',
  'vampire-squid': '吸血鬼乌贼',
  'narwhal': '一角鲸',
  'giant-isopod': '大王具足虫 深海',
  'sixgill-shark': '六鳃鲨',
  'frilled-shark': '皱鳃鲨',
  'oarfish': '皇带鱼',
  'colossal-squid': '大王酸浆鱿',
  'gulper-eel': '宽咽鱼 深海',
  'anglerfish': '鮟鱇鱼 深海',
  'giant-tube-worm': '巨型管虫 热液',
  'dumbo-octopus': '薄鳍章鱼 深海',
  'cuvier-beaked-whale': '柯氏喙鲸',
  'goblin-shark': '欧氏尖吻鲨 哥布林鲨',
  'sea-pig': '海猪 深海海参',
  'fangtooth': '尖齿鱼 深海',
  'dragonfish': '黑龙鱼 深海',
  'tripod-fish': '三脚鱼 深海',
  'snailfish': '蜗牛鱼 深海',
  'amphipod': '端足类 深海',
  'hadal-jellyfish': '深海水母 Atolla',
  'clownfish': '小丑鱼 海洋',
  'moon-jelly': '海月水母',
  'sea-horse': '海马 海洋',
  'flying-fish': '飞鱼',
  'barracuda': '梭鱼 海洋',
  'yellowfin-tuna': '黄鳍金枪鱼',
  'sea-lion': '海狮',
  'basking-shark': '姥鲨',
  'sunfish': '翻车鱼 海洋',
  'hammerhead-shark': '双髻鲨 锤头鲨',
  'swordfish': '剑鱼 海洋',
  'lionfish': '狮子鱼 蓑鲉',
  'beluga-whale': '白鲸',
  'comb-jelly': '栉水母',
  'krill': '磷虾 南极',
  'firefly-squid': '荧光乌贼 富山湾',
  'nautilus': '鹦鹉螺',
  'blobfish': '水滴鱼 深海',
  'rattail-fish': '鼠尾鱼 深海',
  'pelican-eel': '鹈鹕鳗 深海',
  'grenadier': '突吻鳕 深海',
  'deep-sea-cucumber': '深海海参',
  'basket-star': '篮星 深海',
  'glass-sponge': '玻璃海绵 深海',
  'xenophyophore': '有孔虫 深海 大型',
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://image.baidu.com/',
  Accept: 'application/json, text/plain, */*',
}

async function searchBaiduImage(keyword) {
  const url =
    'https://image.baidu.com/search/acjson?' +
    new URLSearchParams({
      tn: 'resultjson_com',
      word: keyword,
      queryWord: keyword,
      pn: '0',
      rn: '8',
      ie: 'utf-8',
      oe: 'utf-8',
    })

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`search HTTP ${res.status}`)
  const text = await res.text()
  const json = JSON.parse(text.replace(/[\x00-\x1f]/g, ''))
  const items = json.data?.filter((d) => d && d.thumbURL) ?? []
  if (!items.length) throw new Error('no results')

  for (const item of items) {
    const candidates = [item.middleURL, item.thumbURL, decodeObjUrl(item.objURL)].filter(Boolean)
    for (const imgUrl of candidates) {
      try {
        const imgRes = await fetch(imgUrl, {
          headers: { ...headers, Referer: 'https://www.baidu.com/' },
          signal: AbortSignal.timeout(15000),
        })
        if (!imgRes.ok) continue
        const type = imgRes.headers.get('content-type') ?? ''
        if (!type.startsWith('image/')) continue
        const buf = Buffer.from(await imgRes.arrayBuffer())
        if (buf.length < 3000) continue
        return buf
      } catch {
        continue
      }
    }
  }
  throw new Error('all candidates failed')
}

function decodeObjUrl(objURL) {
  if (!objURL || typeof objURL !== 'string') return null
  try {
    return decodeURIComponent(objURL.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )).replace(/\\\//g, '/')
  } catch {
    return objURL.replace(/\\\//g, '/')
  }
}

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

await mkdir(dir, { recursive: true })

let ok = 0
let fail = 0
let skip = 0

for (const [id, keyword] of Object.entries(searchTerms)) {
  const out = join(dir, `${id}.jpg`)
  if (await fileExists(out)) {
    console.log(`skip ${id}`)
    skip++
    continue
  }

  process.stdout.write(`${id} (${keyword})... `)
  try {
    const buf = await searchBaiduImage(keyword)
    await writeFile(out, buf)
    console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`)
    ok++
  } catch (e) {
    console.log('fail', e.message)
    fail++
  }

  await new Promise((r) => setTimeout(r, 800))
}

console.log(`\n完成：${ok} 下载，${skip} 跳过，${fail} 失败`)
