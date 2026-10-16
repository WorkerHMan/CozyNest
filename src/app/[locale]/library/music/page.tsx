import Link from "next/link"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { Container } from "@/components/layout/container"
import { Player } from "@/components/music/player"
import { getPlaylist, playlists } from "@/data/music"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Music library.
 *
 * Playlist choice follows the information architecture rule that filter state
 * belongs in the URL (`?list=<key>`), so a shared link opens the same list and
 * back/forward works. The player is keyed on the active playlist: switching
 * lists remounts it, which resets the transport to the first track instead of
 * leaving an index pointing into a different list.
 */
export default function MusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <Suspense
      fallback={
        <Container className="py-12 sm:py-16">
          <PageSkeleton />
        </Container>
      }
    >
      <MusicContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function MusicContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const labels = dict.pages.music
  const search = await searchParams
  const rawList = typeof search.list === "string" ? search.list : undefined
  const active = getPlaylist(rawList ?? "") ?? playlists[0]

  const chipClass = (isActive: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      isActive
        ? "bg-brand text-[var(--brand-foreground)]"
        : "border border-border-strong bg-card text-muted-foreground hover:text-foreground"
    )

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${active.tracks.length} ${labels.trackCountLabel}`}
      />

      <nav aria-label={labels.playlistsLabel} className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {playlists.map((playlist) => {
            const isActive = playlist.key === active.key
            return (
              <li key={playlist.key}>
                <Link
                  href={`/library/music?list=${playlist.key}`}
                  aria-current={isActive ? "true" : undefined}
                  className={chipClass(isActive)}
                >
                  {playlist.title} ({playlist.tracks.length})
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-10">
        <Player
          key={active.key}
          tracks={active.tracks}
          labels={{
            play: labels.play,
            pause: labels.pause,
            previous: labels.previous,
            next: labels.next,
            nowPlaying: labels.nowPlaying,
            seek: labels.seekLabel,
            volume: labels.volumeLabel,
            notLoaded: labels.notLoaded,
            trackCountLabel: labels.trackCountLabel,
          }}
        />
      </div>
    </Container>
  )
}
