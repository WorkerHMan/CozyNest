import { Container } from "@/components/layout/container"
import { FootprintMap } from "@/features/photos/footprint-map"
import { PhotoCategories } from "@/features/photos/photo-categories"
import { PhotoSearch } from "@/features/photos/photo-search"
import { PhotoTimeline } from "@/features/photos/photo-timeline"
import { PhotosHead } from "@/features/photos/photos-head"
import { photosLabels } from "@/config/photos-labels"
import { albumData } from "@/data/album"
import { defaultLocale, isLocale } from "@/i18n"
import { albumStats, cityAggregates } from "@/lib/album/stats"
import { toSearchItems } from "@/lib/album/search"

/**
 * 相册 — the public album.
 *
 * Fully static: every figure on this page is derived from `src/data/album.ts` at
 * build time, so there is no API, no database and no query at runtime. That is
 * what makes the published set trustworthy — the page can only ever show what
 * the publisher wrote into that file (spec §4.1, §4.3).
 *
 * ## One empty state, not three
 *
 * With no photos the map, the rail and the timeline would each have nothing to
 * show, and three separate "nothing here yet" boxes say it three times. So an
 * empty album renders the head plus one honest paragraph and nothing else. The
 * components keep their own guards for the half-empty cases (photos but no
 * coordinates, photos but no dates).
 *
 * ## Search owns the timeline's slot
 *
 * `PhotoSearch` receives the timeline as children and swaps it for results while
 * something is typed, so searching never changes the URL.
 */
export default async function PhotosPage(props: PageProps<"/[locale]/photos">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const stats = albumStats(albumData)
  const aggregates = cityAggregates(albumData)
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  return (
    <Container className="py-16 sm:py-20">
      <PhotosHead stats={stats} locale={locale} />

      {stats.photoCount === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">{label("noPhotos")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {label("noPhotosHint")}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
            <FootprintMap places={albumData.places} aggregates={aggregates} locale={locale} />
            <PhotoCategories data={albumData} aggregates={aggregates} locale={locale} />
          </div>

          <section aria-label={label("timeline")} className="mt-14">
            <PhotoSearch
              items={toSearchItems(albumData)}
              places={albumData.places}
              albums={albumData.albums}
              locale={locale}
            >
              <PhotoTimeline data={albumData} locale={locale} />
            </PhotoSearch>
          </section>
        </>
      )}
    </Container>
  )
}
