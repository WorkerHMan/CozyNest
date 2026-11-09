import Link from "next/link"
import { notFound } from "next/navigation"

import { HideMascot } from "@/components/shared/hide-mascot"
import { Container } from "@/components/layout/container"
import { PhotoWall } from "@/features/photos/photo-wall"
import { photosLabels } from "@/config/photos-labels"
import { albumData } from "@/data/album"
import { defaultLocale, isLocale } from "@/i18n"

/**
 * One hand-picked album, as a wall.
 *
 * The rail links here, so the route has to exist — before it did, both album
 * chips on /photos opened a 404.
 *
 * Membership comes from `album.photoIds`, which the publisher writes; the page
 * does not re-derive it from `photo.albumIds`, so a photo can sit in an album
 * without being edited twice.
 */
export function generateStaticParams() {
  return albumData.albums.map((album) => ({ slug: album.slug }))
}

export default async function PhotosAlbumPage(props: PageProps<"/[locale]/photos/album/[slug]">) {
  const { locale: rawLocale, slug } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const album = albumData.albums.find((item) => item.slug === slug)
  if (!album) notFound()

  const photos = albumData.photos.filter((photo) => album.photoIds.includes(photo.id))

  return (
    <Container className="py-16 sm:py-20">
      <HideMascot />

      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{photosLabels.albumsGroup[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {locale === "zh" ? album.title : album.titleEn}
        </h1>
        {album.description ? (
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
            {album.description}
          </p>
        ) : null}
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
