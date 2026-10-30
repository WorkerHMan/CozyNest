import Image from "next/image"
import Link from "next/link"

import { photosLabels } from "@/config/photos-labels"
import { monthDensity, photosByYear, undated, yearOf } from "@/lib/album/stats"
import type { AlbumData } from "@/lib/album/types"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** How many thumbnails preview a year before "全部". */
const PREVIEW = 5

/**
 * The timeline: one row per year, newest first.
 *
 * The density strip is twelve cells of brand green at varying opacity — the same
 * device the blog archive uses, so the two pages read as one site (spec §8.4).
 * It answers "when in that year" before a single photograph loads.
 *
 * Undated photos get their own row at the bottom instead of being dropped: a
 * screenshot with no EXIF is still in the album, it just has no place on the
 * timeline.
 */
export function PhotoTimeline({ data, locale }: { data: AlbumData; locale: Locale }) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  const years = [...new Set(data.photos.map(yearOf).filter((year): year is number => year !== null))].sort(
    (a, b) => b - a
  )
  const noDate = undated(data)

  if (years.length === 0 && noDate.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center">
        <p className="font-heading text-lg font-semibold">{label("noPhotos")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
          {label("noPhotosHint")}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/60">
      {years.map((year) => {
        const photos = photosByYear(data, year)
        const density = monthDensity(data, year)
        return (
          <section key={year} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-4">
              <h2 className="font-heading w-14 shrink-0 text-lg font-semibold tabular-nums">{year}</h2>

              {/* Twelve cells; opacity carries the count, so the shape is visible
                  before any image loads. */}
              <div aria-hidden className="flex items-end gap-[3px]">
                {density.map((value, index) => (
                  <span
                    key={index}
                    className="w-2 rounded-sm bg-brand"
                    style={{ height: 8 + value * 18, opacity: value === 0 ? 0.12 : 0.25 + value * 0.75 }}
                  />
                ))}
              </div>

              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {photos.length} {label("count")}
              </p>

              <Link
                href={`/photos/year/${year}`}
                className={cn(
                  "ml-auto font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-foreground",
                  focusRing
                )}
              >
                {label("allPhotos")} →
              </Link>
            </div>

            <ul className="flex gap-2 overflow-x-auto pb-1">
              {photos.slice(0, PREVIEW).map((photo) => (
                <li key={photo.id} className="shrink-0">
                  <Link
                    href={`/photos/photo/${photo.id}`}
                    className={cn("block overflow-hidden rounded-lg", focusRing)}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.caption ?? ""}
                      width={photo.width}
                      height={photo.height}
                      sizes="(max-width: 640px) 30vw, 140px"
                      placeholder={photo.blur ? "blur" : "empty"}
                      blurDataURL={photo.blur || undefined}
                      className="h-20 w-auto object-cover"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {noDate.length > 0 ? (
        <section className="flex flex-col gap-3 py-5 last:pb-0">
          <div className="flex items-center gap-4">
            <h2 className="font-heading w-14 shrink-0 text-sm font-semibold text-muted-foreground">
              {locale === "zh" ? "未标注" : "Undated"}
            </h2>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {noDate.length} {label("count")}
            </p>
          </div>
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {noDate.slice(0, PREVIEW).map((photo) => (
              <li key={photo.id} className="shrink-0">
                <Link href={`/photos/photo/${photo.id}`} className={cn("block overflow-hidden rounded-lg", focusRing)}>
                  <Image
                    src={photo.src}
                    alt={photo.caption ?? ""}
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 640px) 30vw, 140px"
                    className="h-20 w-auto object-cover"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
