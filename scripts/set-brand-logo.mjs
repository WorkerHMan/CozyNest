/**
 * Replaces the brand mark in one step, with a content hash in the filename.
 *
 * `next/image` and the browser both cache by URL, so overwriting a fixed name
 * leaves the old bytes on screen — that is not hypothetical here, it happened
 * twice. This script makes the swap atomic: crop, hash, write, rewrite the
 * constant, delete the previous file.
 *
 * Usage:
 *   node scripts/set-brand-logo.mjs "<path to source image>" [cropSize]
 *
 * `cropSize` is the side of the square window taken out of the source, in source
 * pixels. Omit it to use the whole image. The output is 768×768, cropped 1:1
 * with no resampling when `cropSize` is 768.
 */
import { createHash } from "node:crypto"
import { readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

const BRAND_DIR = "public/brand"
const CONFIG = "src/config/brand.ts"
const OUTPUT = 768

const [source, cropArg] = process.argv.slice(2)
if (!source) {
  console.error('usage: node scripts/set-brand-logo.mjs "<source image>" [cropSize]')
  process.exit(1)
}

const cropSize = cropArg ? Number(cropArg) : null
if (cropArg && (!Number.isInteger(cropSize) || cropSize <= 0)) {
  console.error("cropSize must be a positive integer")
  process.exit(1)
}

const image = sharp(source)
const meta = await image.metadata()

// `attention` finds the busiest region, which is what puts the subject in frame
// when the source is an illustration rather than a centred portrait.
const buffer = await image
  .resize(OUTPUT, OUTPUT, cropSize ? { fit: "cover", position: "attention" } : { fit: "cover" })
  .png()
  .toBuffer()

const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8)
const name = `logo-${hash}.png`
await writeFile(path.join(BRAND_DIR, name), buffer)

for (const existing of await readdir(BRAND_DIR)) {
  if (existing.startsWith("logo-") && existing !== name) {
    await rm(path.join(BRAND_DIR, existing))
    console.log(`removed ${existing}`)
  }
}

const config = await readFile(CONFIG, "utf8")
await writeFile(CONFIG, config.replace(/\/brand\/logo-[0-9a-f]{8}\.png/, `/brand/${name}`), "utf8")

console.log(`brand mark: ${path.join(BRAND_DIR, name)} (from ${meta.width}x${meta.height} source)`)
console.log(`updated ${CONFIG}`)
