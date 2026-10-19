"use client"

import { ChevronDown, ChevronUp, Pause, Play } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useSyncExternalStore } from "react"

import { MusicController } from "@/components/music/music-controller"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  toggle,
  trackAt,
} from "@/lib/audio-store"
import { toPublicPath } from "@/lib/path"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Bottom-left music dock, revealed by scrolling.
 *
 * ## Two shapes
 *
 *  - **Folded (default)**: one row — play/pause, the track name, an expand
 *    chevron. It sits in the corner without covering content.
 *  - **Expanded**: a header row with a fold chevron, then the full controller
 *    (queue, lyrics, play mode, volume).
 *
 * ## When it appears
 *
 *  - **Home**: after scrolling past the cover, which carries its own panel.
 *  - **Inner pages**: after a short scroll.
 *  - **Never on `/music`**: that page is the player.
 *
 * It does not require prior playback — the dock is a control surface, and
 * pressing play in it boots the engine.
 */
const HOME_COVER_RATIO = 0.6
const INNER_PAGE_THRESHOLD = 240

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  window.addEventListener("resize", onChange)
  return () => {
    window.removeEventListener("scroll", onChange)
    window.removeEventListener("resize", onChange)
  }
}

/** One reader per page type; both return a boolean, so snapshots stay stable. */
function makeReader(isHome: boolean) {
  return () =>
    window.scrollY >
    (isHome ? window.innerHeight * HOME_COVER_RATIO : INNER_PAGE_THRESHOLD)
}

const getScrolledOnServer = () => false

export function MusicDock({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [folded, setFolded] = useState(true)
  const { index, playing } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const path = toPublicPath(pathname ?? "/")
  const isHome = path === "/"
  const isMusicPage = path === "/music" || path.startsWith("/music/")

  const scrolled = useSyncExternalStore(
    subscribeScroll,
    makeReader(isHome),
    getScrolledOnServer
  )

  if (isMusicPage) return null
  if (!scrolled) return null

  const track = trackAt(index)

  if (folded) {
    return (
      <div className="fixed bottom-4 left-4 z-40 flex w-[min(92vw,20rem)] items-center gap-1 rounded-full border border-border-strong bg-background/90 p-1 shadow-lg shadow-black/20 backdrop-blur-md">
        <button
          type="button"
          onClick={toggle}
          aria-label={
            playing
              ? locale === "zh"
                ? "暂停"
                : "Pause"
              : locale === "zh"
                ? "播放"
                : "Play"
          }
          aria-pressed={playing}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full bg-brand text-[var(--brand-foreground)] hover:opacity-90",
            focusRing
          )}
        >
          {playing ? (
            <Pause aria-hidden className="size-4" />
          ) : (
            <Play aria-hidden className="size-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFolded(false)}
          aria-label={locale === "zh" ? "展开播放器" : "Expand the player"}
          className={cn(
            "min-w-0 flex-1 truncate rounded-full px-2 py-2 text-left text-xs font-medium",
            focusRing
          )}
        >
          {track.title}
        </button>

        <button
          type="button"
          onClick={() => setFolded(false)}
          aria-label={locale === "zh" ? "展开播放器" : "Expand the player"}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground",
            focusRing
          )}
        >
          <ChevronUp aria-hidden className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[min(92vw,20rem)] space-y-1">
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/90 px-2 py-1 backdrop-blur-md">
        <span className="min-w-0 truncate text-xs font-medium">{track.title}</span>
        <button
          type="button"
          onClick={() => setFolded(true)}
          aria-label={locale === "zh" ? "收起播放器" : "Fold the player"}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground",
            focusRing
          )}
        >
          <ChevronDown aria-hidden className="size-4" />
        </button>
      </div>
      <MusicController locale={locale} />
    </div>
  )
}
