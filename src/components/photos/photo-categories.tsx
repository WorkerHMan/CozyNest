import Link from "next/link"

import { photosLabels } from "@/config/photos-labels"
import { placeName } from "@/lib/album/place-name"
import type { AlbumData } from "@/lib/album/types"
import type { CityAggregate } from "@/lib/album/stats"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs transition-colors duration-200 hover:border-brand/60 hover:text-foreground"

/**
 * The right-hand rail: three ways to narrow the album.
 *
 * Spec §8.3 asks for all three at once rather than tabs, because someone
 * browsing by mood wants to see that albums and themes exist at the same time.
 * Counts sit in the chip itself — a category with one photo is not worth a click
 * and the number says so before you make it.
 *
 * Reuses the blog's topic chip rather than inventing a second chip style.
 */
export function PhotoCategories({
  data,
  aggregates,
  locale,
}: {
  data: AlbumData
  aggregates: CityAggregate[]
  locale: Locale
}) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  const tagCounts = new Map<string, number>()
  for (const photo of data.photos) {
    for (const tag of photo.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const places = new Map(data.places.map((place) => [place.id, place]))

  const groups = [
    {
      key: "albums" as const,
      title: label("albumsGroup"),
      items: data.albums.slice(0, 6).map((album) => ({
        key: album.id,
        href: `/photos/album/${album.slug}`,
        name: locale === "zh" ? album.title : album.titleEn,
        count: album.photoIds.length,
      })),
    },
    {
      key: "places" as const,
      title: label("placesGroup"),
      items: aggregates.slice(0, 6).map((city) => {
        const place = places.get(city.placeId)
        return {
          key: city.placeId,
          href: `/photos/place/${city.placeId}`,
          name: place ? placeName(place, locale) : city.placeId,
          count: city.count,
        }
      }),
    },
    {
      key: "tags" as const,
      title: label("tagsGroup"),
      items: tags.map(([tag, count]) => ({
        key: tag,
        href: `/photos?tag=${encodeURIComponent(tag)}`,
        name: tag,
        count,
      })),
    },
  ].filter((group) => group.items.length > 0)

  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`photos-${group.key}`}>
          <h2 id={`photos-${group.key}`} className="eyebrow text-muted-foreground">
            {group.title}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={cn(chip, focusRing)}>
                  <span>{item.name}</span>
                  <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
