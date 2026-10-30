/**
 * Stand-in photos so the album can be built and looked at before the real
 * library exists.
 *
 * Crops the site's own wallpapers (`public/hero/*.webp`) into ten photographs
 * with plausible metadata and writes both the files and `src/data/album.ts` —
 * the same two outputs the real publish pipeline will produce, which is why the
 * page code needs no change when the real photos arrive.
 *
 * Deliberately spread to exercise the awkward cases: vertical and horizontal
 * frames, three years, one photo with no capture time, one with no coordinates,
 * two albums, and a city with a single photo.
 *
 * Run: node scripts/make-sample-photos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

const HERO = "public/hero"
const OUT = "public/album"
/** Spec §4.3: one photo may not exceed this. */
const BUDGET = 320 * 1024

const places = [
  { id: "hz", name: "杭州", nameEn: "Hangzhou", lat: 30.2741, lon: 120.1551 },
  { id: "bj", name: "北京", nameEn: "Beijing", lat: 39.9042, lon: 116.4074 },
  { id: "cd", name: "成都", nameEn: "Chengdu", lat: 30.5728, lon: 104.0668 },
  { id: "sy", name: "三亚", nameEn: "Sanya", lat: 18.2528, lon: 109.5119 },
]

const albums = [
  {
    id: "seaside",
    slug: "seaside",
    title: "海边的几天",
    titleEn: "Days by the sea",
    description: "潮水、风，和没拍好的那些。",
    photoIds: [],
  },
  {
    id: "snowline",
    slug: "snowline",
    title: "雪线以上",
    titleEn: "Above the snow line",
    description: "一年里最安静的几天。",
    photoIds: [],
  },
]

/** `caption` is what the site displays; `tags` are concept ids. */
const photos = [
  {
    id: "hz-01",
    from: "winter-snow.webp",
    w: 1600,
    h: 1067,
    placeId: "hz",
    takenAt: "2022-01-09T09:12:00+08:00",
    albums: ["snowline"],
    tags: ["snow", "mountain"],
    caption: "早上的雪还没被人踩过。",
  },
  {
    id: "hz-02",
    from: "dusk-lake.webp",
    w: 1200,
    h: 1600,
    placeId: "hz",
    takenAt: "2023-03-18T18:40:00+08:00",
    albums: [],
    tags: ["lake", "night"],
    caption: "湖对面的灯一盏一盏亮起来。",
  },
  {
    id: "hz-03",
    from: "rooftop-berries.webp",
    w: 1600,
    h: 1200,
    placeId: "hz",
    takenAt: "2023-06-02T15:05:00+08:00",
    albums: ["seaside"],
    tags: ["food", "summer"],
    caption: "天台上采的野果。",
  },
  {
    id: "hz-04",
    from: "anime-sleep.webp",
    w: 1400,
    h: 1400,
    placeId: "hz",
    takenAt: null,
    albums: [],
    tags: ["night"],
    caption: "一张没有拍摄时间的旧图。",
  },
  {
    id: "bj-01",
    from: "cartoon-goats.webp",
    w: 1600,
    h: 1000,
    placeId: "bj",
    takenAt: "2022-04-11T10:30:00+08:00",
    albums: [],
    tags: ["animal", "street"],
    caption: "胡同里遇到的两只羊。",
  },
  {
    id: "bj-02",
    from: "anime-profile.webp",
    w: 1200,
    h: 1500,
    placeId: "bj",
    takenAt: "2024-05-20T20:15:00+08:00",
    albums: [],
    tags: ["night", "portrait"],
    caption: "下班路上回头拍的一张。",
  },
  {
    id: "bj-03",
    from: "dusk-lake.webp",
    w: 1600,
    h: 1067,
    placeId: null,
    takenAt: "2024-07-03T21:02:00+08:00",
    albums: [],
    tags: ["night"],
    caption: "没有定位的一张，位置记不清了。",
  },
  {
    id: "cd-01",
    from: "winter-snow.webp",
    w: 1600,
    h: 1100,
    placeId: "cd",
    takenAt: "2022-12-24T08:05:00+08:00",
    albums: ["snowline"],
    tags: ["snow"],
    caption: "平安夜的清晨。",
  },
  {
    id: "cd-02",
    from: "rooftop-berries.webp",
    w: 1200,
    h: 1600,
    placeId: "cd",
    takenAt: "2024-09-14T16:48:00+08:00",
    albums: ["seaside"],
    tags: ["food", "summer"],
    caption: "夏天最后一批。",
  },
  {
    id: "cd-03",
    from: "anime-sleep.webp",
    w: 1600,
    h: 1067,
    placeId: "cd",
    takenAt: "2023-11-30T23:20:00+08:00",
    albums: [],
    tags: ["night", "portrait"],
    caption: "凌晨的屋子。",
  },
  {
    id: "sy-01",
    from: "cartoon-goats.webp",
    w: 1600,
    h: 1067,
    placeId: "sy",
    takenAt: "2024-02-06T12:00:00+08:00",
    albums: ["seaside"],
    tags: ["sea", "summer"],
    caption: "三亚的海，正午太晒了。",
  },
]

const written = []

for (const photo of photos) {
  const year = photo.takenAt ? photo.takenAt.slice(0, 4) : "undated"
  const file = path.join(OUT, year, `${photo.id}.webp`)
  await mkdir(path.dirname(file), { recursive: true })

  const source = path.join(HERO, photo.from)
  // Quality ladder rather than one setting: a busy crop can blow past the
  // 320KB budget at q82, and lowering quality is cheaper than shrinking the
  // frame. Spec §4.3 makes the budget a hard limit, so this refuses to write a
  // photo that breaks it.
  let buffer
  for (const quality of [82, 74, 66, 58, 50]) {
    buffer = await sharp(source)
      // `attention` finds the busiest region rather than the geometric centre,
      // which is what makes a crop of an illustration land on the subject.
      .resize(photo.w, photo.h, { fit: "cover", position: "attention" })
      .webp({ quality })
      .toBuffer()
    if (buffer.length <= BUDGET) break
  }
  if (buffer.length > BUDGET) {
    throw new Error(`${photo.id} is ${Math.round(buffer.length / 1024)}KB even at q50`)
  }

  await writeFile(file, buffer)

  const blurBuffer = await sharp(buffer).resize(32).webp({ quality: 40 }).toBuffer()
  const blur = `data:image/webp;base64,${blurBuffer.toString("base64")}`

  for (const albumId of photo.albums) {
    const album = albums.find((item) => item.id === albumId)
    if (album) album.photoIds.push(photo.id)
  }

  written.push({
    id: photo.id,
    src: `/${file.replace(/\\/g, "/").replace(/^public\//, "")}`,
    width: photo.w,
    height: photo.h,
    blur,
    takenAt: photo.takenAt,
    bucket: photo.takenAt ? photo.takenAt.slice(0, 7) : null,
    placeId: photo.placeId,
    caption: photo.caption,
    albumIds: photo.albums,
    tags: photo.tags,
    bytes: buffer.length,
  })
}

const total = written.reduce((sum, photo) => sum + photo.bytes, 0)
for (const photo of written) {
  const kb = Math.round(photo.bytes / 1024)
  if (photo.bytes > 320 * 1024) throw new Error(`${photo.id} is ${kb}KB, over the 320KB budget`)
}
if (written.length > 300) throw new Error("over the 300 photo budget")

const literal = JSON.stringify(
  written.map((photo) => Object.fromEntries(Object.entries(photo).filter(([key]) => key !== "bytes"))),
  null,
  2
).replace(/"([a-zA-Z]+)":/g, "$1:")

const source = `import type { AlbumData } from "@/lib/album/types"

/**
 * The published album. The only photo source the site reads.
 *
 * ## These ten are placeholders
 *
 * They are crops of this site's own wallpapers, generated by
 * \`scripts/make-sample-photos.mjs\`, so that \`/photos\` can be built and looked
 * at before the real library exists. When the publish pipeline (spec §10) lands,
 * it rewrites this file with real entries and the page code does not change.
 *
 * They are chosen to be awkward on purpose: vertical and horizontal frames,
 * three years, one photo with no capture time, one with no coordinates.
 *
 * ## The rules the writer must keep
 *
 * Only photos marked public and still active belong here (spec §5.1) — the page
 * does no filtering of its own. A \`src\` must point at a webp already in
 * \`public/album/\` at ≤ 320KB, and the whole set must stay under 300 photos /
 * 90MB (spec §4.3).
 */
export const albumData: AlbumData = {
  photos: ${literal},
  places: ${JSON.stringify(places, null, 2).replace(/"([a-zA-Z]+)":/g, "$1:")},
  albums: ${JSON.stringify(albums, null, 2).replace(/"([a-zA-Z]+)":/g, "$1:")},
}
`

await writeFile("src/data/album.ts", source, "utf8")
console.log(
  `wrote ${written.length} photos (${Math.round(total / 1024)}KB total), ` +
    `${places.length} places, ${albums.length} albums, and src/data/album.ts`
)
