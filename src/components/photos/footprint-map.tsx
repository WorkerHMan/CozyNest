import { CHINA_VIEWBOX, chinaPaths, projectChina } from "@/generated/geo"
import { photosLabels } from "@/config/photos-labels"
import { placeName } from "@/lib/album/place-name"
import { dotRadius, type CityAggregate } from "@/lib/album/stats"
import type { AlbumData } from "@/lib/album/types"
import type { Locale } from "@/i18n"

/**
 * The footprint map: country outlines with one dot per city.
 *
 * ## Server-rendered, no map library
 *
 * The paths are already projected (`src/generated/geo.ts`), and the dots are
 * placed with the same projection the outlines were fitted with — so a dot
 * always lands on the outline it belongs to, and nothing about `d3-geo` reaches
 * the browser.
 *
 * ## A plain anchor inside the SVG
 *
 * `next/link` renders an HTML anchor, and an anchor inside `<svg>` is a *different*
 * element (SVG's own `a`). Plain `<a href>` is what the SVG namespace actually
 * wants, and these dots are one-per-city — a full navigation here costs less than
 * the risk of a hybrid element.
 *
 * ## The dot is the picture, the halo is the target
 *
 * A 4px dot is not a touch target, so each city draws a transparent circle at the
 * 44px minimum underneath its visible dot (spec §11: small in the picture,
 * generous under the finger). `title` supplies both the native tooltip and the
 * accessible name, so no JavaScript is involved.
 */
export function FootprintMap({
  data,
  aggregates,
  locale,
}: {
  data: AlbumData
  aggregates: CityAggregate[]
  locale: Locale
}) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]
  const places = new Map(data.places.map((place) => [place.id, place]))
  const busiest = aggregates.reduce((max, city) => Math.max(max, city.count), 0)

  if (aggregates.length === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/20">
        <p className="text-sm text-muted-foreground">{label("noPhotos")}</p>
      </div>
    )
  }

  return (
    <svg
      viewBox={CHINA_VIEWBOX}
      role="img"
      aria-label={label("footprint")}
      className="w-full rounded-2xl border border-border/60 bg-muted/20"
    >
      {/* Faint neighbours: context without competing with the dots. */}
      <g aria-hidden className="fill-muted-foreground/10 stroke-border/70" strokeWidth={0.5}>
        {chinaPaths.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>

      {aggregates.map((city) => {
        const place = places.get(city.placeId)
        if (!place) return null
        const [x, y] = projectChina(place.lon, place.lat)

        return (
          <a key={city.placeId} href={`/photos/place/${city.placeId}`}>
            {/* 44px minimum hit area, invisible. */}
            <circle cx={x} cy={y} r={22} fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={dotRadius(city.count, busiest)}
              className="fill-brand"
              opacity={0.8}
            />
            <title>{`${placeName(place, locale)} · ${city.count}`}</title>
          </a>
        )
      })}
    </svg>
  )
}
