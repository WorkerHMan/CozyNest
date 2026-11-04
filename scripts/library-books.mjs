/**
 * Copies the book folder into `public/books/<category>/` and writes a manifest.
 *
 * ## Why the files go under `public/`
 *
 * `next start` serves the contents of `public/` from disk at request time, so a
 * file that exists locally is reachable locally even though git never saw it.
 * `public/books/` is git-ignored, which is the whole point: these are published
 * books, and a public repository would be redistribution.
 *
 * ## Presence is the switch
 *
 * There is no environment flag that says "open everything". The reader looks for
 * the file on disk: present -> readable, absent -> the catalogue entry stays a
 * spine. A deployment cannot leak what was never copied there, and no setting can
 * turn a shelf into a library by accident.
 *
 * ## Output
 *
 * - files: `public/books/<category>/<id>.pdf`
 * - manifest: `public/books/manifest.json` — id, category, title, path, bytes.
 *   Also git-ignored (it names every book).
 *
 * ## Usage
 *
 *   node scripts/library-books.mjs "E:\Course\149本各学科入门书籍"
 */
import { cp, mkdir, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const folder = process.argv[2]
if (!folder) {
  console.error('usage: node scripts/library-books.mjs "<folder of book files>"')
  process.exit(1)
}

const OUT = "public/books"

const CATEGORY_RULES = [
  ["计算机", ["计算机", "编程", "Python", "Java", "C++", "C语言", "算法", "数据结构", "网络", "Linux", "操作系统", "数据库", "软件", "设计模式", "Perl", "JavaScript", "前端", "代码", "Object-Oriented"]],
  ["数学", ["数学", "代数", "几何", "微积分", "统计", "概率", "拓扑", "数论"]],
  ["物理", ["物理", "量子", "力学", "相对论", "电磁", "热力学", "光学"]],
  ["化学", ["化学", "分子", "有机", "元素周期"]],
  ["生物", ["生物", "基因", "细胞", "进化", "生态", "生命科学", "遗传", "生化"]],
  ["医学", ["医学", "外科", "解剖", "生理", "临床", "心脏", "病理", "药理", "内科"]],
  ["心理", ["心理", "精神", "认知", "咨询", "行为"]],
  ["经济管理", ["经济", "金融", "投资", "货币", "银行", "华尔街", "商业", "市场营销", "管理"]],
  ["哲学", ["哲学", "伦理", "逻辑", "存在", "叔本华", "康德", "尼采"]],
  ["历史", ["历史", "文明", "史话", "通史", "战争"]],
  ["建筑", ["建筑", "空间", "结构", "城市", "景观", "营造"]],
  ["艺术设计", ["设计", "艺术", "美术", "摄影", "绘画", "音乐", "字体", "色彩"]],
  ["法律", ["法律", "法理", "宪法", "民法", "刑法"]],
  ["语言写作", ["语言", "文学", "写作", "诗", "修辞", "翻译"]],
  ["社科", ["社会", "人类学", "政治", "文化", "教育", "传播", "民族"]],
]

function toCategory(title) {
  for (const [category, keywords] of CATEGORY_RULES) {
    if (keywords.some((keyword) => title.includes(keyword))) return category
  }
  return "其他"
}

function toTitle(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^[[【]/, "")
    .replace(/[\]】]$/, "")
    .replace(/%5D/gi, "")
    .replace(/[《》]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

const files = (await readdir(folder, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(pdf|epub)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))

const manifest = []

for (const [index, filename] of files.entries()) {
  const id = `b${String(index + 1).padStart(3, "0")}`
  const title = toTitle(filename)
  const category = toCategory(title)
  const dir = path.join(OUT, category)
  const target = path.join(dir, `${id}.pdf`)

  await mkdir(dir, { recursive: true })
  await cp(path.join(folder, filename), target)

  const bytes = (await stat(target)).size
  manifest.push({
    id,
    category,
    title,
    path: `/${target.replace(/\\/g, "/").replace(/^public\//, "")}`,
    source: filename,
    bytes,
  })

  if ((index + 1) % 20 === 0) console.log(`  copied ${index + 1}/${files.length}`)
}

await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8")

const totalMb = Math.round(manifest.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024)
const byCategory = new Map()
for (const item of manifest) byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)

console.log(`copied ${manifest.length} books (${totalMb} MB) into ${OUT}/<category>/`)
console.log([...byCategory.entries()].map(([name, count]) => `${name}: ${count}`).join(" · "))
