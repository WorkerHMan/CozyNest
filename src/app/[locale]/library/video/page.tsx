import { Clock, Play } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { videos } from "@/data/videos"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { formatDuration } from "@/lib/format"

/**
 * Video library.
 *
 * A list, not a player: there are no video files wired up, so nothing here is
 * an interactive `<video>` and nothing can start on its own. The tile reserves
 * a 16:9 box (no layout shift when real posters arrive), states the duration in
 * text rather than only inside a badge icon, and the page says plainly that
 * playback is not connected yet (`dict.pages.video.notLoaded`).
 *
 * The play control is rendered `disabled` rather than omitted: the affordance
 * is visible, the accessible name explains what it would be, and `disabled`
 * means a keyboard user cannot tab onto a button that does nothing.
 */
export default async function VideoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const labels = dict.pages.video

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${videos.length} × ${labels.durationLabel}`}
      />

      <p className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-pretty text-muted-foreground">
        {labels.notLoaded}
      </p>

      <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <li
            key={video.id}
            className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
          >
            {/* Reserved ratio: the box never changes size, with or without a
                poster frame. */}
            <div className="relative aspect-video w-full bg-muted">
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-br from-brand/25 via-transparent to-brand-2/25"
              />
              <button
                type="button"
                disabled
                aria-label={`${labels.playLabel}: ${video.title[resolved]}`}
                className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-background/70 text-foreground opacity-70">
                  <Play aria-hidden className="size-5" />
                </span>
              </button>
              <span className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 font-mono text-xs text-foreground">
                <Clock aria-hidden className="size-3" />
                {formatDuration(video.duration)}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-base leading-snug font-semibold text-balance">
                  {video.title[resolved]}
                </h2>
                <Badge variant="outline" className="shrink-0">
                  <span className="font-mono">{video.year}</span>
                </Badge>
              </div>

              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {video.description[resolved]}
              </p>

              <p className="mt-auto pt-1 font-mono text-xs text-muted-foreground">
                {labels.durationLabel} · {formatDuration(video.duration)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}
