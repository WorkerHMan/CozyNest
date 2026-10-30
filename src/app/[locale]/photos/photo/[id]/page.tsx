import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HideMascot } from "@/components/common/hide-mascot"
import { Container } from "@/components/layout/container"
import { PhotoKeyNav } from "@/components/photos/photo-key-nav"
import { PhotoMeta } from "@/components/photos/photo-meta"
import { photosLabels } from "@/config/photos-labels"
import { albumData } from "@/data/album"
import { defaultLocale, isLocale } from "@/i18n"
import { neighbours } from "@/lib/album/stats"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * One photo.
 *
 * The picture takes the room; the metadata sits beside it at a fixed narrow
 * measure. Paging is offered twice — as `←`/`→` for the keyboard and as real
 * links for everyone else — because a key binding alone would be unreachable on
 * a phone.
 *
 * A photo with no date has no neighbours by design (`neighbours` excludes it),
 * so its arrows are simply absent rather than disabled.
 */
export function generateStaticParams() {
  return albumData.photos.map((photo) => ({ id: photo.id }))
}

export default async function PhotosPhotoPage(props: PageProps<"/[locale]/photos/photo/[id]">) {
  const { locale: rawLocale, id } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const photo = albumData.photos.find((item) => item.id === id)
  if (!photo) notFound()

  const { previous, next } = neighbours(albumData, photo.id)
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  return (
    <Container className="py-16 sm:py-20">
      <HideMascot />
      <PhotoKeyNav
        previous={previous ? `/photos/photo/${previous.id}` : null}
        next={next ? `/photos/photo/${next.id}` : null}
        back="/photos"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <figure className="min-w-0">
          <Image
            src={photo.src}
            alt={photo.caption ?? ""}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            placeholder={photo.blur ? "blur" : "empty"}
            blurDataURL={photo.blur || undefined}
            className="w-full rounded-2xl border border-border/60"
          />
        </figure>

        <div className="flex min-w-0 flex-col gap-8">
          <PhotoMeta photo={photo} data={albumData} locale={locale} />

          <nav aria-label={label("timeline")} className="mt-auto flex items-center justify-between gap-4 border-t border-border/60 pt-5">
            {previous ? (
              <Link
                href={`/photos/photo/${previous.id}`}
                className={cn("font-mono text-xs underline decoration-dotted underline-offset-4", focusRing)}
              >
                ← {label("previous")}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/photos/photo/${next.id}`}
                className={cn("font-mono text-xs underline decoration-dotted underline-offset-4", focusRing)}
              >
                {label("next")} →
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <Link
            href="/photos"
            className={cn(
              "font-mono text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-foreground",
              focusRing
            )}
          >
            ← {label("backToAlbums")}
          </Link>
        </div>
      </div>
    </Container>
  )
}
