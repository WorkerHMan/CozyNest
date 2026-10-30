import Link from "next/link"
import type { ReactNode } from "react"

import { photosLabels } from "@/config/photos-labels"
import { placeName } from "@/lib/album/place-name"
import type { AlbumData, Photo } from "@/lib/album/types"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** "2024-05-20 20:15" 鈥?minute precision, no seconds: nobody photographs a second. */
function when(iso: string, locale: Locale): string {
  const date = iso.slice(0, 10)
  const time = iso.slice(11, 16)
  return locale === "zh" ? `${date} ${time}` : `${date} 路 ${time}`
}

/**
 * The metadata column beside a photo.
 *
 * Only facts the album actually holds: when, where, which album, and the one
 * line the owner wrote. No EXIF dump 鈥?aperture and ISO are for the photographer,
 * not the visitor, and the point of this page is the picture.
 *
 * A photo with no date says so plainly instead of showing an empty row.
 */
export function PhotoMeta({
  photo,
  data,
  locale,
}: {
  photo: Photo
  data: AlbumData
  locale: Locale
}) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]
  const place = photo.placeId ? data.places.find((item) => item.id === photo.placeId) : undefined
  const albums = data.albums.filter((album) => photo.albumIds.includes(album.id))

  const rows: { term: string; value: ReactNode }[] = []

  rows.push({
    term: locale === "zh" ? "鏃堕棿" : "Taken",
    value: photo.takenAt ? when(photo.takenAt, locale) : locale === "zh" ? "娌℃湁鏃堕棿淇℃伅" : "No capture time",
  })

  if (place) {
    rows.push({
      term: locale === "zh" ? "鍦扮偣" : "Place",
      value: (
        <Link
          href={`/photos/place/${place.id}`}
          className={cn("underline decoration-dotted underline-offset-4 hover:text-foreground", focusRing)}
        >
          {placeName(place, locale)}
        </Link>
      ),
    })
  }

  if (albums.length > 0) {
    rows.push({
      term: label("albumsGroup"),
      value: albums.map((album) => (locale === "zh" ? album.title : album.titleEn)).join(" 路 "),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {photo.caption ? (
        <p className="text-base leading-relaxed text-pretty">{photo.caption}</p>
      ) : null}

      <dl className="flex flex-col gap-3 border-t border-border/60 pt-5 text-sm">
        {rows.map((row) => (
          <div key={row.term} className="flex gap-4">
            <dt className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{row.term}</dt>
            <dd className="min-w-0 font-mono text-xs text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
