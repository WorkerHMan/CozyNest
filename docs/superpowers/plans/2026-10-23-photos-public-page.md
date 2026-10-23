# 公开相册页（/photos）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/photos` 从占位页变成 spec §8 描述的四段式公开相册：头部统计、足迹地图、归类右栏、时间轴，外加搜索与照片详情。

**Architecture:** 全静态。照片元数据只有 `src/data/album.ts` 一个来源，页面全是 Server Component，构建期预渲染，没有 API、没有数据库、没有运行时查询。地图是构建期用 `d3-geo` 算好的 SVG path，运行时零地理依赖。搜索索引在构建期由 `minisearch` 生成，客户端只在搜索框获得焦点时才取。

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · TypeScript 5 · `d3-geo`（构建期）· `minisearch`（构建期 + 客户端）· `vitest`（新增，纯函数测试）

**Spec:** `docs/superpowers/specs/2026-10-23-photos-album-design.md`（本计划实现其 §8、§9、§11、§12；§4.3 的体积预算作为全局约束）

## Global Constraints

- 照片总量：**一期上限 300 张**；单张 webp **≤ 320KB**；公开照片总量 **≤ 90MB**。超预算时构建必须失败并给出数字，不允许静默上线。
- 搜索索引 gzip 后 **< 120KB**；超过就按年分片（本期先断言，不实现分片）。
- 动效 **200–350ms**；卡片 hover **只改边框与阴影，不位移**。
- 地图点热区 **≥ 44×44px**（视觉可以小，用透明圈补满）。
- 数字一律 `font-mono`；中文标题用站点既有的 `font-heading`（站酷快乐体）。
- 品牌绿（`text-brand` / `bg-brand` / `var(--brand)`）只用于：地图点、当前选中、可点的强调。照片本身有颜色，界面要退后。
- 亮色模式必须同样可用，**不硬编码颜色**：地图底用 `bg-muted`/`border-border` 一类语义 token，深色只是默认。
- `prefers-reduced-motion: reduce` 时地图不做入场动画，hover 卡直接出现。
- 地名**跟内容语言走**：`place.name` / `place.name_en`，不跟界面语言走（§12）。
- 公开集合只有一种定义：照片 `visibility='public'` 且 `status='active'`，加上公开相册里 `status='active'` 的照片（§5.1）。本计划的 `src/data/album.ts` 只包含**已发布**的照片，过滤不在页面里做。
- 空状态诚实：没照片就写"还没有照片，这个相册刚开张"，不放示例点、不放假种子数据（§8.7）。

## Review Focus

这几类输入 spec 没有逐条写，但一定会被真实数据碰到。每条都会落到下面某个任务的测试里：

1. **一张照片同时属于公开相册、又单独标了 public** —— 页面上必须只出现一次，计数也只能算一次。
2. **没有 GPS 的照片**（截图、笔记配图）—— 不进地图，但**必须**进时间轴、归类与搜索。
3. **没有拍摄时间的照片**（`takenEstimated`）—— 时间轴不能崩、不能掉进 1970；年份跨度要忽略它。
4. **英文界面下的中国城市** —— 显示 `Hangzhou` 而不是 `杭州`，即使查询是用中文输的。
5. **0 张与 1 张照片** —— 年份跨度、12 格密度条、`√n` 点半径都不能除零。
6. **只输入空格的搜索** —— 必须当作空查询（回到未搜索状态），不能渲染"没找到"。

## File Structure

| 文件 | 职责 |
|---|---|
| `src/lib/album/types.ts` | 数据契约：`Photo` / `Place` / `Album` / `AlbumData`。所有其他文件的唯一类型来源 |
| `src/data/album.ts` | 公开照片的唯一来源。**本期手写，P2 的发布脚本以后覆盖生成** |
| `src/lib/album/stats.ts` | 纯派生：总数、城市数、年份跨度、城市聚合、`√n` 半径、月度密度 |
| `src/lib/album/search.ts` | 查询解析（chip 拆分）、索引构建、检索排序 |
| `src/lib/album/concepts.ts` | 中文别名表 → 概念 id（`小狗 / 狗狗 / 汪 / 柴犬 → dog`） |
| `src/lib/album/place-name.ts` | `placeName(place, locale)` |
| `src/config/photos-labels.ts` | 全部文案（zh/en），照 `blog-labels.ts` 的样子 |
| `scripts/build-geo.ts` | 构建期把 GeoJSON 投影成 SVG path，写 `src/generated/geo.ts` |
| `src/generated/geo.ts` | 生成物，勿手改 |
| `src/components/photos/*.tsx` | 头、地图、归类、时间轴、照片墙、搜索、详情元数据 |
| `src/app/[locale]/photos/page.tsx` | 组装（替换占位页） |
| `src/app/[locale]/photos/year/[year]/page.tsx` · `place/[city]/page.tsx` · `photo/[id]/page.tsx` | 三个下钻页 |
| `tests/album/*.test.ts` | vitest，只测纯函数与数据一致性 |
| `vitest.config.ts` | 新增 |

**测试策略（明说）：** 仓库当前没有任何测试框架，也没有 DOM 测试库。计划只用 `vitest` 测 `src/lib/album/*` 与 `src/data/album.ts` 这类纯模块；**组件与页面不写 DOM 测试**，它们的验收是 `next build` 通过 + 对 `next start` 的 HTTP 响应做内容断言（本项目已有的验证手法）。不为了组件测试再引入 RTL/jsdom。

---

### Task 1: 测试基线 + 地名解析

**Files:**
- Create: `vitest.config.ts`, `src/lib/album/place-name.ts`, `tests/album/place-name.test.ts`
- Modify: `package.json`（`scripts.test`、devDependency `vitest`）

**Interfaces:**
- Produces: `placeName(place: { name: string; nameEn: string }, locale: "zh" | "en"): string`

- [ ] **Step 1: 装 vitest 并加脚本**

```bash
npm i -D vitest
```
`package.json` 的 `scripts` 增加 `"test": "vitest run"`。`vitest.config.ts` 里把 `@/` 别名指到 `./src`（与 `tsconfig.json` 的 paths 一致），`test.environment` 用 `node`。

- [ ] **Step 2: 写会失败的测试**

```ts
// tests/album/place-name.test.ts
import { expect, test } from "vitest"
import { placeName } from "@/lib/album/place-name"

test("zh 用中文名", () => {
  expect(placeName({ name: "杭州", nameEn: "Hangzhou" }, "zh")).toBe("杭州")
})

test("en 用英文名，而不是中文名", () => {
  expect(placeName({ name: "杭州", nameEn: "Hangzhou" }, "en")).toBe("Hangzhou")
})

test("缺英文名时退回中文名，不返回空串", () => {
  expect(placeName({ name: "某镇", nameEn: "" }, "en")).toBe("某镇")
})
```

- [ ] **Step 3: 跑测试确认失败**

Run: `npm test -- tests/album/place-name.test.ts`
Expected: FAIL —— 找不到模块 `@/lib/album/place-name`

- [ ] **Step 4: 实现**

`placeName` 三行：`en` 优先 `nameEn`，为空则退回 `name`。

- [ ] **Step 5: 跑测试确认通过**

Run: `npm test`
Expected: PASS，3 passed

- [ ] **Step 6: 提交**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/album/place-name.ts tests/album/place-name.test.ts
git commit -m "test: add vitest baseline and place-name locale resolution"
```

---

### Task 2: 数据契约 + 一批真实照片

**Files:**
- Create: `src/lib/album/types.ts`, `src/data/album.ts`, `tests/album/data.test.ts`
- Modify: `public/album/`（放入真实图片，见 Step 2）

**Interfaces:**
- Produces:
  ```ts
  export interface Place { id: string; name: string; nameEn: string; lat: number; lon: number }
  export interface Photo {
    id: string; src: string; width: number; height: number; blur: string
    takenAt: string | null; bucket: string | null; takenEstimated?: boolean
    placeId: string | null
    caption?: string
    albumIds: readonly string[]
    tags: readonly string[]
  }
  export interface Album { id: string; slug: string; title: string; titleEn: string; description?: string; coverId?: string; photoIds: readonly string[] }
  export interface AlbumData { photos: readonly Photo[]; places: readonly Place[]; albums: readonly Album[] }
  export const albumData: AlbumData
  ```

- [ ] **Step 1: 写会失败的数据一致性测试**

```ts
// tests/album/data.test.ts
import { expect, test } from "vitest"
import { albumData } from "@/data/album"

test("id 不重复", () => {
  const ids = albumData.photos.map((p) => p.id)
  expect(new Set(ids).size).toBe(ids.length)
})

test("每张照片的 placeId 都能找到对应 Place", () => {
  const places = new Set(albumData.places.map((p) => p.id))
  for (const photo of albumData.photos) {
    if (photo.placeId) expect(places.has(photo.placeId)).toBe(true)
  }
})

test("每张照片的 albumIds 都存在，且相册的 photoIds 反过来包含它", () => {
  const albumIds = new Set(albumData.albums.map((a) => a.id))
  for (const photo of albumData.photos) {
    for (const id of photo.albumIds) expect(albumIds.has(id)).toBe(true)
  }
  for (const album of albumData.albums) {
    for (const id of album.photoIds) {
      expect(albumData.photos.some((p) => p.id === id)).toBe(true)
    }
  }
})

test("每张照片都是 webp 且在体积预算内由发布保证（这里只校验扩展名）", () => {
  for (const photo of albumData.photos) expect(photo.src).toMatch(/\.webp$/)
})

test("takenAt 与 bucket 一致：bucket 就是 takenAt 的前 7 位", () => {
  for (const photo of albumData.photos) {
    if (photo.takenAt) expect(photo.bucket).toBe(photo.takenAt.slice(0, 7))
    else expect(photo.bucket).toBeNull()
  }
})
```

- [ ] **Step 2: 放入 8–20 张真实照片**

从你自己的相册里挑 8–20 张（**不要示例图**），转成 webp、宽 2400 以内、单张 ≤ 320KB，放到 `public/album/<年>/<id>.webp`。这一步是本计划唯一需要你提供素材的地方；`src/data/album.ts` **手写**这批条目（以后由 P2 的发布脚本生成同一个文件）。至少包含：一张没有 GPS 的（截图）、一张没有拍摄时间的（`takenAt: null`）、两个城市。

- [ ] **Step 3: 跑测试确认失败**

Run: `npm test -- tests/album/data.test.ts`
Expected: FAIL —— `src/data/album.ts` 不存在

- [ ] **Step 4: 实现 `types.ts` 与 `album.ts`**

按上面 Interfaces 的字段写。`album.ts` 末尾 `export const albumData: AlbumData = { photos, places, albums }`，并用 `satisfies AlbumData` 让字段拼错立即报错。

- [ ] **Step 5: 跑测试确认通过**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add src/lib/album/types.ts src/data/album.ts tests/album/data.test.ts public/album
git commit -m "feat(photos): add album data contract with the first real photos"
```

---

### Task 3: 统计派生

**Files:**
- Create: `src/lib/album/stats.ts`, `tests/album/stats.test.ts`, `tests/album/fixtures.ts`（`photo()` / `data()` 夹具，Task 3 / 10 / 12 共用）

**Interfaces:**
- Produces:
  ```ts
  export interface AlbumStats { photoCount: number; cityCount: number; minYear: number | null; maxYear: number | null }
  export function albumStats(data: AlbumData): AlbumStats
  export interface CityAggregate { placeId: string; count: number; minYear: number; maxYear: number; coverId: string | null }
  export function cityAggregates(data: AlbumData): CityAggregate[]
  export function dotRadius(count: number, maxCount: number): number   // 3–14
  export function monthDensity(data: AlbumData, year: number): number[] // 长度 12，0–1
  ```

- [ ] **Step 1: 写测试（含 0/1 张、无 GPS、无时间三类边界）**

```ts
import { expect, test } from "vitest"
import { albumStats, cityAggregates, dotRadius, monthDensity } from "@/lib/album/stats"
import { data, photo } from "./fixtures"

test("0 张照片：不崩，年份为 null", () => {
  expect(albumStats(data())).toEqual({ photoCount: 0, cityCount: 0, minYear: null, maxYear: null })
})

test("1 张照片：跨度是单年", () => {
  const s = albumStats(data(photo({ id: "a" })))
  expect([s.minYear, s.maxYear]).toEqual([2023, 2023])
})

test("没有拍摄时间的照片不参与年份跨度", () => {
  const s = albumStats(data(photo({ id: "a", takenAt: null, bucket: null })))
  expect([s.minYear, s.maxYear]).toEqual([null, null])
})

test("没有 GPS 的照片不计入城市数，但计入张数", () => {
  const s = albumStats(data(photo({ id: "a", placeId: null }), photo({ id: "b", placeId: "hz" })))
  expect(s.cityCount).toBe(1)
  expect(s.photoCount).toBe(2)
})

test("dotRadius：满额 14、零额 3、分母为 0 不除零", () => {
  expect(dotRadius(100, 100)).toBe(14)
  expect(dotRadius(0, 0)).toBe(3)
  expect(dotRadius(1, 100)).toBeCloseTo(3 + 11 * 0.1, 5)
  expect(dotRadius(50, 100)).toBeGreaterThan(dotRadius(25, 100))
})

test("cityAggregates 每张照片只计一次，并按 count 降序", () => {
  const agg = cityAggregates(
    data(photo({ id: "a", placeId: "hz" }), photo({ id: "b", placeId: "hz" }))
  )
  expect(agg).toHaveLength(1)
  expect(agg[0]).toMatchObject({ placeId: "hz", count: 2, minYear: 2023, maxYear: 2023 })
})

test("monthDensity 返回 12 个数、峰值 1、空年全 0", () => {
  const year = monthDensity(data(photo({ id: "a" }), photo({ id: "b" })), 2023)
  expect(year).toHaveLength(12)
  expect(Math.max(...year)).toBe(1)
  expect(monthDensity(data(), 1999).every((v) => v === 0)).toBe(true)
})
```

- [ ] **Step 2: 跑测试确认失败**
Run: `npm test -- tests/album/stats.test.ts` — Expected: FAIL，模块不存在

- [ ] **Step 3: 实现**
  - 年份取 `Number(photo.bucket.slice(0, 4))`，跳过 `bucket === null`。
  - `cityCount` = 有 `placeId` 且 `placeId` 在 `places` 里的照片涉及的城市数。
  - `dotRadius(count, maxCount)`：`maxCount <= 0` 返回 3；否则 `3 + 11 * Math.sqrt(count / maxCount)`。
  - `monthDensity`：按 `bucket.slice(5,7)` 分桶计数，除以当年最大桶值；最大为 0 时返回全 0。

- [ ] **Step 4: 跑测试确认通过**
Run: `npm test` — Expected: PASS

- [ ] **Step 5: 提交**
```bash
git add src/lib/album/stats.ts tests/album/stats.test.ts
git commit -m "feat(photos): derive album stats, city aggregates and dot radii"
```

---

### Task 4: 文案模块

**Files:**
- Create: `src/config/photos-labels.ts`, `tests/album/labels.test.ts`

**Interfaces:**
- Produces: `export const photosLabels: Record<string, Localized<string>>`，键至少包含：`eyebrow` `title` `intro` `count` `cities` `years` `footprint` `categories` `albumsGroup` `placesGroup` `tagsGroup` `timeline` `searchPlaceholder` `searchEmpty` `searchHint` `noPhotos` `noPhotosHint` `allPhotos` `backToAlbums` `previous` `next` `close`.

- [ ] **Step 1: 写测试：每个键 zh 与 en 都不为空**
```ts
test("每个标签双语都不为空", () => {
  for (const [key, value] of Object.entries(photosLabels)) {
    expect(value.zh, key).not.toBe("")
    expect(value.en, key).not.toBe("")
  }
})
```
- [ ] **Step 2: 跑测试确认失败** — Run: `npm test` — Expected: FAIL，模块不存在
- [ ] **Step 3: 实现** — 照 `blog-labels.ts` 的形态写；`noPhotos` = `还没有照片，这个相册刚开张` / `No photos yet — this album just opened`；`searchEmpty` 按 spec §8.5 写成"没有和「X」对上的照片"。
- [ ] **Step 4: 跑测试确认通过** — Run: `npm test` — Expected: PASS
- [ ] **Step 5: 提交**
```bash
git add src/config/photos-labels.ts tests/album/labels.test.ts
git commit -m "feat(photos): add bilingual copy module"
```

---

### Task 5: 构建期地理投影

**Files:**
- Create: `scripts/build-geo.ts`, `src/generated/geo.ts`, `tests/album/geo.test.ts`
- Modify: `package.json`（devDependency `d3-geo`、`topojson-client`；script `"geo": "tsx scripts/build-geo.ts"`）

**Interfaces:**
- Produces: `export const chinaPaths: readonly string[]`、`export const worldPaths: readonly string[]`、`export const CHINA_VIEWBOX: string`、`export const WORLD_VIEWBOX: string`、**`export function projectChina(lon: number, lat: number): [number, number]`**（Task 7 用它把城市点放在同一投影下，否则点和国界对不上）

- [ ] **Step 1: 写测试：投影结果落在 viewBox 内且非空**
```ts
test("中国视图把三亚/漠河/喀什都框进去", () => {
  // 用 CHINA_VIEWBOX 的宽高解析出边界，断言 [109.5,18.2] / [122.3,53.5] / [75.9,39.5]
  // 投影后的坐标都在边界内（留 0 padding 之外）
})

test("path 字符串非空且不含 NaN", () => {
  for (const d of [...chinaPaths, ...worldPaths]) {
    expect(d.length).toBeGreaterThan(10)
    expect(d).not.toContain("NaN")
  }
})

test("中国视图用 Albers，世界视图用 Natural Earth（投影类型断言）", () => {
  // 同一组经纬度在两个投影下结果不同
})
```
- [ ] **Step 2: 跑测试确认失败** — Run: `npm test` — Expected: FAIL，`src/generated/geo.ts` 不存在
- [ ] **Step 3: 实现 `scripts/build-geo.ts`**
  读 `node_modules` 外的 GeoJSON（建议来源写进脚本注释：`world-atlas` 的 `countries-110m.json` + 中国省级 `china.json`），用 `geoAlbers` 与 `geoNaturalEarth1` + `geoPath` 生成 `d` 字符串，写文件并在头部写 `/* 由 scripts/build-geo.ts 生成，勿手改 */`。`viewBox` 用 `projection.fitExtent` 反推出的实际范围。
- [ ] **Step 4: 生成并跑测试**
Run: `npm run geo && npm test` — Expected: PASS
- [ ] **Step 5: 提交**
```bash
git add scripts/build-geo.ts src/generated/geo.ts package.json package-lock.json tests/album/geo.test.ts
git commit -m "feat(photos): generate SVG map paths at build time"
```

---

### Task 6: 头部 + 页面骨架（替换占位页）

**Files:**
- Create: `src/components/photos/photos-head.tsx`
- Modify: `src/app/[locale]/photos/page.tsx`, `src/i18n/dictionaries/{zh,en}.ts`（`modules.photos` 描述可改）

**Interfaces:**
- Consumes: `albumStats`（Task 3）、`photosLabels`（Task 4）
- Produces: `<PhotosHead stats={AlbumStats} locale={Locale} />`

- [ ] **Step 1: 实现 `PhotosHead`**
  结构照 spec §8.1：`eyebrow`（相册）→ `h1`（`font-heading`）→ 一句实话（`intro`）→ 三个 `font-mono` 数字（张数 / 城市 / 年份跨度）。搜索框先留一个禁用的占位（Task 11 接上），避免后面改布局。
- [ ] **Step 2: 页面改成 Server Component 组装**
  `/photos/page.tsx` 读 `albumData` + `albumStats`，渲染 `<PhotosHead>`，下面暂时只有一个空态块（`photosLabels.noPhotos` / `noPhotosHint`）。删掉原占位页内容。
- [ ] **Step 3: 构建并断言**
Run: `npm run build && npm start`
然后 `GET /zh/photos` 与 `/en/photos`，断言 200 且 HTML 同时包含 `相册` / `Photos` 与三个数字（`takenAt: null` 的那张不进年份跨度）。
- [ ] **Step 4: 提交**
```bash
git add src/components/photos/photos-head.tsx "src/app/[locale]/photos/page.tsx" src/i18n
git commit -m "feat(photos): replace placeholder with head and stats"
```

---

### Task 7: 足迹地图

**Files:**
- Create: `src/components/photos/footprint-map.tsx`, `src/components/photos/city-tooltip.tsx`
- Modify: `src/app/[locale]/photos/page.tsx`

**Interfaces:**
- Consumes: `cityAggregates` / `dotRadius`（Task 3）、`chinaPaths` / `worldPaths` / `*_VIEWBOX`（Task 5）、`placeName`（Task 1）
- Produces: `<FootprintMap aggregates={CityAggregate[]} locale={Locale} />`

- [ ] **Step 1: 实现静态渲染**
  SVG：先画 `chinaPaths`（`fill="none" stroke="var(--border)"`），再画每个城市的 `<circle r={dotRadius(...)}>`。城市点按 `place.lat/lon` 用**同一个**投影换算 —— 投影函数必须由 `scripts/build-geo.ts` 一起导出到 `generated/geo.ts`（`export function projectChina(lon: number, lat: number): [number, number]`），否则点和国界会对不上。
- [ ] **Step 2: 交互与无障碍**
  - 每个点是一 `<a href={\`/photos/place/${placeId}\`}>`，`<title>` 或 `aria-label` 写"杭州 · 63 张"。
  - 热区：`<circle r={Math.max(radius, 22)} fill="transparent">` 叠在视觉点下面。
  - `:focus-visible` 用站点既有的 `focusRing` 写法（`ring-2 ring-ring`）。
  - hover/focus 显示小卡（城市名、年份跨度、张数、封面缩略图），**位移为 0**，只改 `border` 与 `shadow`。
  - 右上角中国/世界切换：两个 `button`，`aria-pressed`。
- [ ] **Step 3: 数据生成的一句话**
  "你去过 23 个城市，最北到哈尔滨，最南到三亚。" —— 由 `albumData` 计算（`lat` 最大/最小），本地化文案进 `photosLabels`。0 个城市时这条不渲染。
- [ ] **Step 4: 构建并断言**
Run: `npm run build && npm start`
`GET /zh/photos` 断言：HTML 含 `projects` 之外的 `<circle`、含每个城市的中文名、含那句话；`/en/photos` 断言含 `Hangzhou` 而**不**含 `杭州`。
- [ ] **Step 5: 提交**
```bash
git add src/components/photos "src/app/[locale]/photos/page.tsx" src/generated/geo.ts src/config/photos-labels.ts
git commit -m "feat(photos): footprint map with accessible city dots"
```

---

### Task 8: 归类右栏

**Files:**
- Create: `src/components/photos/photo-categories.tsx`
- Modify: `src/app/[locale]/photos/page.tsx`

**Interfaces:**
- Consumes: `cityAggregates`（Task 3）、`albumData.albums`、标签计数
- Produces: `<PhotoCategories data={AlbumData} locale={Locale} />`

- [ ] **Step 1: 实现三组 chips**
  相册（最多 5–6 个，带封面与张数）、地点（按张数前几名）、主题（`tags` 按计数）。样式复用博客的 topic chip（`rounded-full border px-3 py-1 text-xs`），**不新造一套**。
- [ ] **Step 2: 移动端**
  `< lg` 时三组变成横向滚动条（`overflow-x-auto` + `shrink-0`），不做 tab。
- [ ] **Step 3: 构建并断言**
`GET /zh/photos` 断言三个分组标题都在、每个相册名出现、`狗` 这类标签出现且带计数。
- [ ] **Step 4: 提交**
```bash
git add src/components/photos/photo-categories.tsx "src/app/[locale]/photos/page.tsx"
git commit -m "feat(photos): album/place/tag category rail"
```

---

### Task 9: 时间轴

**Files:**
- Create: `src/components/photos/photo-timeline.tsx`
- Modify: `src/app/[locale]/photos/page.tsx`

**Interfaces:**
- Consumes: `monthDensity`（Task 3）
- Produces: `<PhotoTimeline data={AlbumData} locale={Locale} />`

- [ ] **Step 1: 实现年行**
  每年一行：`年份` · 12 格密度条（`bg-brand` 按 `opacity` 分级，复用归档页手法）· `N 张` · 首排 5 个缩略图（`next/image`，`sizes` 明确）· `全部 →` 链到 `/photos/year/<year>`。年份倒序。
- [ ] **Step 2: 构建并断言**
`GET /zh/photos` 断言每年出现、`2024` 这类年份与 `张` 同现；`takenAt: null` 的照片出现在"未标注时间"那一组而不是 1970。
- [ ] **Step 3: 提交**
```bash
git add src/components/photos/photo-timeline.tsx "src/app/[locale]/photos/page.tsx"
git commit -m "feat(photos): year-grouped timeline with month density"
```

---

### Task 10: 不等高照片墙 + 两个下钻页

**Files:**
- Create: `src/components/photos/photo-wall.tsx`, `src/app/[locale]/photos/year/[year]/page.tsx`, `src/app/[locale]/photos/place/[city]/page.tsx`
- Modify: `src/lib/album/stats.ts`（加 `photosByYear` / `photosByPlace`）

**Interfaces:**
- Produces: `photosByYear(data, year): Photo[]`、`photosByPlace(data, placeId): Photo[]`、`<PhotoWall photos={Photo[]} locale={Locale} />`；两个页面用 `generateStaticParams()` 预渲染全部年份与城市。

- [ ] **Step 1: 写测试**
```ts
import { expect, test } from "vitest"
import { photosByPlace, photosByYear } from "@/lib/album/stats"
import { data, photo } from "./fixtures"

test("photosByYear 只返回该年，并按拍摄时间正序", () => {
  const list = photosByYear(
    data(
      photo({ id: "a", takenAt: "2023-09-01T00:00:00Z", bucket: "2023-09" }),
      photo({ id: "b", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
      photo({ id: "c", takenAt: "2022-01-01T00:00:00Z", bucket: "2022-01" })
    ),
    2023
  )
  expect(list.map((p) => p.id)).toEqual(["b", "a"])
})

test("photosByPlace 只返回该城市，无 GPS 的不出现", () => {
  const list = photosByPlace(
    data(photo({ id: "a", placeId: "hz" }), photo({ id: "b", placeId: null })),
    "hz"
  )
  expect(list.map((p) => p.id)).toEqual(["a"])
})

test("不存在的年份/城市返回空数组，不抛错", () => {
  expect(photosByYear(data(), 1800)).toEqual([])
  expect(photosByPlace(data(), "nope")).toEqual([])
})
```
- [ ] **Step 2: 跑测试确认失败** — Run: `npm test` — Expected: FAIL
- [ ] **Step 3: 实现筛选 + 照片墙**
  照片墙用 CSS `columns-2 sm:columns-3 lg:columns-4`（竖图横图都不裁），每张 `next/image` 带 `blurDataURL`（`photo.blur`），`loading="lazy"`。
- [ ] **Step 4: 构建并断言**
`npm run build` 后 `GET /zh/photos/year/2023` 与 `/zh/photos/place/<id>` 均 200；断言不存在的年份返回 404。
- [ ] **Step 5: 提交**
```bash
git add src/components/photos/photo-wall.tsx "src/app/[locale]/photos" src/lib/album/stats.ts
git commit -m "feat(photos): masonry wall plus year and place pages"
```

---

### Task 11: 搜索

**Files:**
- Create: `src/lib/album/concepts.ts`, `src/lib/album/search.ts`, `src/components/photos/photo-search.tsx`
- Modify: `scripts/build-geo.ts` 旁边新增 `scripts/build-search-index.ts`、`package.json`（dependency `minisearch`）

**Interfaces:**
- Produces:
  ```ts
  export const CONCEPT_ALIASES: Record<string, readonly string[]>  // { dog: ["小狗","狗狗","狗","汪","柴犬"], ... }
  export function parseQuery(raw: string): { terms: string[]; year: number | null; placeId: string | null; albumId: string | null }
  export function conceptIdsFor(term: string): string[]
  export function buildIndexJson(data: AlbumData): string   // 构建期写入 public/album/search-index.json
  ```
- 客户端组件 `<PhotoSearch locale={Locale} onResults={...} />`，防抖 120ms，`/` 聚焦，`Esc` 清空。

- [ ] **Step 1: 写测试**
```ts
test("别名字段：小狗 映射到 dog", () => { expect(conceptIdsFor("小狗")).toEqual(["dog"]) })
test("小狗 2023 → 一次查询拆成标签与年份", () => {
  expect(parseQuery("小狗 2023")).toEqual({ terms: ["小狗"], year: 2023, placeId: null, albumId: null })
})
test("只输入空格 → 视为空查询，不是搜索失败", () => {
  expect(parseQuery("   ")).toEqual({ terms: [], year: null, placeId: null, albumId: null })
})
test("年份越界（1800）不被当成年份", () => { expect(parseQuery("1800").year).toBeNull() })
test("索引体积 gzip 后小于 120KB", () => {
  // buildIndexJson(albumData) → gzipSync → Buffer.byteLength < 120 * 1024
})
```
- [ ] **Step 2: 跑测试确认失败** — Run: `npm test` — Expected: FAIL
- [ ] **Step 3: 实现**
  `minisearch` 字段权重：`tags` 3 > `caption` 2 > `place`/`bucket` 1；同分按 `takenAt` 倒序。同时把 `"search-index": "tsx scripts/build-search-index.ts"` 写进 `package.json`，并把 `"prebuild"` 设为 `"npm run geo && npm run search-index"` —— 索引必须先于 `next build` 生成，否则客户端取不到文件。
- [ ] **Step 4: 接进页面**
  搜索有结果时**原地替换**时间轴区域，不跳页；结果上方显示可摘除的 chip。
- [ ] **Step 5: 构建并断言**
`npm run build && npm start`；`GET /zh/photos` 的 HTML 里不应包含索引内容（索引只在聚焦时取）；直接 `GET /album/search-index.json` 断言 200 且体积在预算内。
- [ ] **Step 6: 提交**
```bash
git add src/lib/album/concepts.ts src/lib/album/search.ts src/components/photos/photo-search.tsx scripts/build-search-index.ts package.json package-lock.json tests/album
git commit -m "feat(photos): concept-alias client search over a build-time index"
```

---

### Task 12: 照片详情页

**Files:**
- Create: `src/app/[locale]/photos/photo/[id]/page.tsx`, `src/components/photos/photo-meta.tsx`
- Modify: `src/app/[locale]/photos/`（照片墙缩略图链到详情）

**Interfaces:**
- Consumes: `albumData`、`placeName`、`photosByYear` / `photosByPlace`
- Produces: 详情页；`neighbours(data: AlbumData, id: string): { previous: Photo | null; next: Photo | null }`（按 `takenAt` 全局顺序）

- [ ] **Step 1: 写测试**

```ts
import { expect, test } from "vitest"
import { neighbours } from "@/lib/album/stats"
import { data, photo } from "./fixtures"

test("neighbours 按 takenAt 排序；无时间的照片不参与翻页", () => {
  const d = data(
    photo({ id: "a", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
    photo({ id: "b", takenAt: "2024-01-01T00:00:00Z", bucket: "2024-01" }),
    photo({ id: "x", takenAt: null, bucket: null })
  )
  expect(neighbours(d, "b").previous?.id).toBe("a")
  expect(neighbours(d, "x")).toEqual({ previous: null, next: null })
})

test("首张没有 previous，末张没有 next", () => {
  const d = data(
    photo({ id: "a", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
    photo({ id: "b", takenAt: "2024-01-01T00:00:00Z", bucket: "2024-01" })
  )
  expect(neighbours(d, "a").previous).toBeNull()
  expect(neighbours(d, "b").next).toBeNull()
})
```
- [ ] **Step 2: 跑测试确认失败** → **Step 3: 实现** → **Step 4: 跑测试通过**
- [ ] **Step 5: 实现页面**
  大图居中，右侧元数据（时间、地点可点回城市、相机、相册、`caption`）。下面"同一天"与"同一地点"各一排。键盘 `←/→` 翻页、`Esc` 回列表——用一个客户端小包装实现 `keydown`，焦点陷阱不做（不是模态）。
- [ ] **Step 6: 构建并断言**
`GET /zh/photos/photo/<存在的id>` 200 且含 `caption`；不存在的 id 404；`GET /en/photos/photo/<id>` 城市名是英文。
- [ ] **Step 7: 提交**
```bash
git add "src/app/[locale]/photos" src/components/photos/photo-meta.tsx src/lib/album
git commit -m "feat(photos): photo detail with keyboard paging"
```

---

## 收尾验收（全部任务完成后跑一次）

- [ ] `npm test` 全绿
- [ ] `npm run build` 通过，且构建输出里 `/photos`、`/photos/year/*`、`/photos/place/*`、`/photos/photo/*` 都是静态预渲染
- [ ] `public/album` 总体积 ≤ 90MB、单张 ≤ 320KB、≤ 300 张（写一条 node 脚本做断言，CI 里可复用）
- [ ] 亮色模式下地图与照片墙可用（手动看一眼）
- [ ] 键盘走一遍：Tab 到地图点有 focus ring；`/` 聚焦搜索；详情页 `←/→/Esc`
- [ ] `prefers-reduced-motion: reduce` 下地图无入场动画
- [ ] `/en/photos` 里所有城市名是英文，`/zh/photos` 里是中文
