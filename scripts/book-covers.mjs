/**
 * Extracts a cover from every book.
 *
 * ## Page one is not always the cover
 *
 * These are scanned editions and many carry an advertising page before the title
 * 鈥?white background, black text, nothing to do with the book. Rendering page one
 * and shipping it puts an ad on the shelf.
 *
 * So the first few pages are rendered small and scored by how much of the page is
 * near-white. An ad page is mostly paper; a cover is mostly image. The least-white
 * page of the first four wins. It is a crude test, and it gets the common case
 * right without pretending to read the PDF.
 *
 * ## Where the output goes
 *
 * `public/books/covers/<id>.webp`, next to the PDFs and ignored by git for the same
 * reason: a cover is part of the book. A deployed build has no covers and falls
 * back to drawing a spine.
 *
 * ## Resumable
 *
 * An existing cover is skipped. `--limit N` does just the first N missing ones.
 *
 * ## Usage
 *
 *   node scripts/book-covers.mjs            # all missing covers
 *   node scripts/book-covers.mjs --limit 3  # first three missing
 *   node scripts/book-covers.mjs --force    # re-render everything
 */
import { existsSync } from "node:fs"
import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import { pdf } from "pdf-to-img"
import sharp from "sharp"

const ROOT = "public/books"
const OUT = path.join(ROOT, "covers")
/** Wide enough for a 96px card at 2x, small enough that 121 stay modest. */
const WIDTH = 420
/** How many pages to consider before giving up and taking the best one seen. */
const SCAN_PAGES = 8
/** Below this much near-white, a page is pictorial enough to be a cover. */
const PICTORIAL = 0.55

const limitArg = process.argv.indexOf("--limit")
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity
const force = process.argv.includes("--force")

if (!existsSync(ROOT)) {
  console.error(`no ${ROOT} 鈥?run scripts/library-books.mjs first`)
  process.exit(1)
}
await mkdir(OUT, { recursive: true })

/** Share of pixels close to paper white. Ads sit near 0.9; covers near 0.1. */
async function whiteness(buffer) {
  const { data, info } = await sharp(buffer).resize({ width: 96 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = info.width * info.height
  let white = 0
  for (let index = 0; index < data.length; index += info.channels) {
    if (data[index] > 238 && data[index + 1] > 238 && data[index + 2] > 238) white += 1
  }
  return white / pixels
}

const categories = (await readdir(ROOT, { withFileTypes: true })).filter((entry) => entry.isDirectory())
const books = []
for (const category of categories) {
  const files = (await readdir(path.join(ROOT, category.name))).filter((name) => /\.pdf$/i.test(name))
  for (const name of files) books.push({ category: category.name, name, id: name.replace(/\.pdf$/i, "") })
}
books.sort((a, b) => a.id.localeCompare(b.id))

let done = 0
let skipped = 0
let failed = 0

for (const book of books) {
  const target = path.join(OUT, `${book.id}.webp`)
  if (existsSync(target)) {
    if (!force) {
      skipped += 1
      continue
    }
    await rm(target)
  }
  if (done >= limit) break

  try {
    const document = await pdf(path.join(ROOT, book.category, book.name), { scale: 2 })
    let best = null
    let bestWhiteness = 1
    let seen = 0

    for await (const page of document) {
      seen += 1
      const score = await whiteness(page)
      // First pictorial page wins. The front cover comes before the back one,
      // so "earliest image" beats "least white image" for a scan.
      if (score <= PICTORIAL) {
        bestWhiteness = score
        // Copy: the library reuses its page buffer, so keeping the reference
        // would leave `best` pointing at whatever page was rendered last.
        best = Buffer.from(page)
        break
      }
      if (seen >= SCAN_PAGES) break
    }

    if (!best) {
      // Every page considered was mostly paper: this scan has no pictorial cover,
      // and an ad page on the shelf is worse than a drawn spine.
      skipped += 1
      continue
    }
    const webp = await sharp(best).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
    await writeFile(target, webp)
    done += 1
    if (seen > 1) console.log(`  ${book.id}: used page ${seen} (white ${bestWhiteness.toFixed(2)})`)
    else if (done % 10 === 0) console.log(`  ${done} covers`)
  } catch (error) {
    failed += 1
    console.warn(`  ! ${book.id} (${book.category}): ${error.message}`)
  }
}

console.log(`covers: ${done} made, ${skipped} already there, ${failed} failed`)
