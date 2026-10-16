import Link from "next/link"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { Container } from "@/components/layout/container"
import { PhotoGallery } from "@/components/photos/photo-gallery"
import { photoAlbums, photos } from "@/data/photos"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Photo gallery.
 *
 * The album filter lives in the URL (`?album=<key>`, with "all" as the
 * default), exactly like the blog's category filter, so a filtered view is
 * shareable and survives back/forward. The chips are server-rendered `<Link>`s
 * with `aria-current` on the active one; only the lightbox is a Client
 * Component, which keeps the gallery itself statically prerenderable.
 */
export default function PhotosPage(props: PageProps<"/[locale]/photos">) {
  return (
    <Suspense
      fallback={
        <Container className="py-12 sm:py-16">
          <PageSkeleton />
        </Container>
      }
    >
      <PhotosContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}

async function PhotosContent({
  params,
  searchParams,
}: {
  params: PageProps<"/[locale]/photos">["params"]
  searchParams: PageProps<"/[locale]/photos">["searchParams"]
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const search = await searchParams
  const rawAlbum = typeof search.album === "string" ? search.album : undefined
  const activeAlbum = photoAlbums.find((album) => album.key === rawAlbum)

  const visible = activeAlbum
    ? photos.filter((photo) => photo.album === activeAlbum.key)
    : photos

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "bg-brand text-[var(--brand-foreground)]"
        : "border border-border-strong bg-card text-muted-foreground hover:text-foreground"
    )

  const countByAlbum = new Map<string, number>()
  for (const photo of photos) {
    countByAlbum.set(photo.album, (countByAlbum.get(photo.album) ?? 0) + 1)
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={dict.pages.photos.title}
        subtitle={dict.pages.photos.subtitle}
        meta={`${visible.length} ${dict.pages.photos.photoCountLabel}`}
      />

      <nav aria-label={dict.pages.photos.title} className="mt-8">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/photos"
              aria-current={activeAlbum ? undefined : "true"}
              className={chipClass(!activeAlbum)}
            >
              {dict.pages.photos.allAlbums} ({photos.length})
            </Link>
          </li>
          {photoAlbums.map((album) => {
            const active = activeAlbum?.key === album.key
            return (
              <li key={album.key}>
                <Link
                  href={`/photos?album=${album.key}`}
                  aria-current={active ? "true" : undefined}
                  className={chipClass(active)}
                >
                  {album.title[resolved]} ({countByAlbum.get(album.key) ?? 0})
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {dict.pages.photos.empty}
        </p>
      ) : (
        <PhotoGallery
          photos={visible}
          locale={resolved}
          labels={{
            close: dict.pages.photos.close,
            previous: dict.pages.photos.previous,
            next: dict.pages.photos.next,
          }}
        />
      )}
    </Container>
  )
}
