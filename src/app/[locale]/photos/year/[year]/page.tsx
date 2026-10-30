import Link from "next/link"
import { notFound } from "next/navigation"

import { HideMascot } from "@/components/common/hide-mascot"
import { Container } from "@/components/layout/container"
import { PhotoWall } from "@/components/photos/photo-wall"
import { photosLabels } from "@/config/photos-labels"
import { albumData } from "@/data/album"
import { defaultLocale, isLocale } from "@/i18n"
import { photosByYear, yearOf } from "@/lib/album/stats"

/**
 * One year of photos, as a wall.
 *
 * Every year that has a photo is prerendered; any other year 404s, because a
 * year with nothing in it is not a page — it is a missing page.
 */
export function generateStaticParams() {
  const years = new Set<number>()
  for (const photo of albumData.photos) {
    const year = yearOf(photo)
    if (year !== null) years.add(year)
  }
  return [...years].map((year) => ({ year: String(year) }))
}

export default async function PhotosYearPage(props: PageProps<"/[locale]/photos/year/[year]">) {
  const { locale: rawLocale, year } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const numeric = Number(year)
  const photos = Number.isInteger(numeric) ? photosByYear(albumData, numeric) : []
  if (photos.length === 0) notFound()

  return (
    <Container className="py-16 sm:py-20">
      <HideMascot />

      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{photosLabels.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {year}
        </h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground tabular-nums">
          {photos.length} {photosLabels.count[locale]}
        </p>
      </header>

      <div className="mt-10">
        <PhotoWall photos={photos} />
      </div>

      <p className="mt-12 border-t border-border/60 pt-6">
        <Link
          href="/photos"
          className="font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-foreground"
        >
          ← {photosLabels.backToAlbums[locale]}
        </Link>
      </p>
    </Container>
  )
}
