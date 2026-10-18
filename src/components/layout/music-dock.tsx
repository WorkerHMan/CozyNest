"use client"

import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"
import { heroPlayer } from "@/config/hero-player"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  next,
  previous,
  subscribe,
  toggle,
  trackAt,
} from "@/lib/audio-store"
import { toPublicPath } from "@/lib/path"
import { cn } from "@/lib/utils"

/**
 * Bottom-left dock for the music, shown on every page except the cover.
 *
 * Two rules shape it:
 *
 *  - **It only appears once the cover has started playback.** `ready` comes from
 *    the store, so landing directly on `/blog` leaves the page silent with no
 *    dock — music continues across pages, it never *begins* on an inner one.
 *  - **It is a view, not a player.** The audio element is owned by
 *    `@/lib/audio-store`, which is why the track does not restart when the route
 *    changes.
 *
 * The credit line stays with the expanded cover player; the dock keeps the track
 * title visible instead, which is the more useful thing at 44px.
 */
export function MusicDock({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const { index, playing, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const isHome = toPublicPath(pathname ?? "/") === "/"
  if (isHome || !ready) return null

  const track = trackAt(index)

  const control =
    "grid size-11 shrink-0 place-items-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <div className="fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-border-strong bg-background/90 p-1 shadow-lg shadow-black/20 backdrop-blur-md">
      <button
        type="button"
        onClick={() => previous(playing)}
        aria-label={heroPlayer.labels.previous[locale]}
        className={cn(control, "text-foreground hover:bg-muted")}
      >
        <SkipBack aria-hidden className="size-4" />
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? heroPlayer.labels.pause[locale] : heroPlayer.labels.play[locale]}
        aria-pressed={playing}
        className={cn(control, "bg-brand text-[var(--brand-foreground)] hover:opacity-90")}
      >
        {playing ? (
          <Pause aria-hidden className="size-4" />
        ) : (
          <Play aria-hidden className="size-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() => next(playing)}
        aria-label={heroPlayer.labels.next[locale]}
        className={cn(control, "text-foreground hover:bg-muted")}
      >
        <SkipForward aria-hidden className="size-4" />
      </button>

      <span className="ml-1 hidden min-w-0 pr-3 text-xs font-medium sm:block">
        <span className="block max-w-44 truncate">{track.title}</span>
        <span className="block max-w-44 truncate font-mono text-[0.625rem] text-muted-foreground">
          {track.artist}
        </span>
      </span>
    </div>
  )
}
