/**
 * Projects the world's country outlines into SVG paths, once, at build time.
 *
 * ## Why generate instead of shipping a map library
 *
 * The page needs "which places have I lit up", not navigation. A tile service
 * would mean a key, a quota, a third-party request and colours I cannot control;
 * a client-side map library would ship more JavaScript than the whole album page.
 * So the projection runs here and the page receives finished `d` strings.
 *
 * ## Data
 *
 * `world-atlas` (Natural Earth, public domain) at 1:110m — country outlines only.
 * It has no province boundaries, and the province datasets that circulate do not
 * come with a licence I can rely on, so the China view draws the same country
 * outlines around the fitted China frame: neighbours stay visible as faint
 * context and the city dots stay the subject, which is what spec §8.2 asks for.
 *
 * ## What it writes
 *
 * `src/generated/geo.ts` — path strings, viewBoxes, and the two projections
 * rebuilt from the fitted scale/translate so a city dot lands in the same place
 * as the outline it sits on. This file imports `d3-geo`; it is only ever reached
 * from a Server Component, so nothing here ships to the browser.
 */
import { readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"

import { geoAlbers, geoNaturalEarth1, geoPath } from "d3-geo"
import { feature } from "topojson-client"

const require = createRequire(import.meta.url)

const CHINA_WIDTH = 600
const CHINA_HEIGHT = 400
const CHINA_PAD = 12
const WORLD_WIDTH = 800
const WORLD_HEIGHT = 400
const WORLD_PAD = 4

const atlasPath = require.resolve("world-atlas/countries-110m.json")
const topology = JSON.parse(await readFile(atlasPath, "utf8"))
const countries = feature(topology, topology.objects.countries).features

const china = countries.find((item) => item.properties?.name === "China")
if (!china) throw new Error("world-atlas has no China feature — check the dataset version")

/**
 * Albers, the projection Chinese cartography uses for the national view:
 * parallels 25°N/47°N, centred on 105°E, fitted to the country itself so the
 * frame is decided by geography rather than by a guessed scale.
 */
const chinaProjection = geoAlbers()
  .rotate([-105, 0])
  .center([0, 35])
  .parallels([25, 47])
  .fitExtent(
    [
      [CHINA_PAD, CHINA_PAD],
      [CHINA_WIDTH - CHINA_PAD, CHINA_HEIGHT - CHINA_PAD],
    ],
    china
  )

const worldProjection = geoNaturalEarth1().fitExtent(
  [
    [WORLD_PAD, WORLD_PAD],
    [WORLD_WIDTH - WORLD_PAD, WORLD_HEIGHT - WORLD_PAD],
  ],
  { type: "Sphere" }
)

const chinaPath = geoPath(chinaProjection)
const worldPath = geoPath(worldProjection)

const toPaths = (path) =>
  countries
    .map((item) => path(item))
    .filter((d) => typeof d === "string" && d.length > 0)

const chinaPaths = toPaths(chinaPath)
const worldPaths = toPaths(worldPath)

const round = (n) => Number(n.toFixed(3))

const file = `/* 由 scripts/build-geo.mjs 生成，勿手改。 */

import { geoAlbers, geoNaturalEarth1, type GeoProjection } from "d3-geo"

export const CHINA_VIEWBOX = "0 0 ${CHINA_WIDTH} ${CHINA_HEIGHT}"
export const WORLD_VIEWBOX = "0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}"

/** Country outlines, projected for the China frame (Albers). */
export const chinaPaths: readonly string[] = ${JSON.stringify(chinaPaths)}

/** Country outlines, projected for the world frame (Natural Earth). */
export const worldPaths: readonly string[] = ${JSON.stringify(worldPaths)}

const china: GeoProjection = geoAlbers()
  .rotate([-105, 0])
  .center([0, 35])
  .parallels([25, 47])
  .scale(${round(chinaProjection.scale())})
  .translate([${round(chinaProjection.translate()[0])}, ${round(chinaProjection.translate()[1])}])

const world: GeoProjection = geoNaturalEarth1()
  .scale(${round(worldProjection.scale())})
  .translate([${round(worldProjection.translate()[0])}, ${round(worldProjection.translate()[1])}])

/** A city dot must land on the same outline it belongs to, so it uses this. */
export function projectChina(lon: number, lat: number): [number, number] {
  const point = china([lon, lat])
  return point ? [point[0], point[1]] : [0, 0]
}

export function projectWorld(lon: number, lat: number): [number, number] {
  const point = world([lon, lat])
  return point ? [point[0], point[1]] : [0, 0]
}
`

await writeFile("src/generated/geo.ts", file, "utf8")
console.log(
  `geo: ${chinaPaths.length} china paths, ${worldPaths.length} world paths, ` +
    `scale ${round(chinaProjection.scale())}`
)
