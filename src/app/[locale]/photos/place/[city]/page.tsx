import Link from "next/link"
import { notFound } from "next/navigation"

import { HideMascot } from "@/components/shared/hide-mascot"
import { Container } from "@/components/layout/container"
import { PhotoWall } from "@/features/photos/photo-wall"
import { photosLabels } from "@/config/photos-labels"
import { albumData } from "@/data/album"
import { defaultLocale, isLocale } from "@/i18n"
import { placeName } from "@/lib/album/place-name"
import { cityAggregates, photosByPlace } from "@/lib/album/stats"

/**
 * One city's photos.
 *
 * The name in the heading comes from the data, so the English site says
 * "Hangzhou" and the Chinese site says 「杭州」 for the same city (spec §12) —
 * while the URL stays the stable id.
 */
export function generateStaticParams() {
  return cityAggregates(albumData).map((city) => ({ city: city.placeId }))
}

export default async function PhotosPlacePage(props: PageProps<"/[locale]/photos/place/[city]">) {
  const { locale: rawLocale, city } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const place = albumData.places.find((item) => item.id === city)
  const photos = photosByPlace(albumData, city)
  if (!place || photos.length === 0) notFound()

  return (
    <Container className="py-16 sm:py-20">
      <HideMascot />

      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{photosLabels.placesGroup[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {placeName(place, locale)}
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
