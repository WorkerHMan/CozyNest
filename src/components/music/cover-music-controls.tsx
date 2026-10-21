"use client"

import { Music2, Pause, Play, SkipBack, SkipForward, X } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { heroPlayer } from "@/config/hero-player"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  next,
  previous,
  seek,
  start,
  subscribe,
  toggle,
  trackAt,
} from "@/lib/audio-store"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}

/**
 * The cover's music panel: a small boxed card of track info, then four controls.
 *
 * The card carries exactly enough to answer "what am I hearing?" — title, artist,
 * a scrubber, the times — and the CC BY credit line, which the licence requires
 * somewhere on the page. Nine controls would bury the wallpaper, so the cover
 * keeps only previous, play/pause, next and fold; the queue, lyrics and volume
 * live in the dock's full controller.
 *
 * The ✕ folds the panel to one round button and **does not pause**: closing a
 * panel is not a decision to stop the music.
 */
export function CoverMusicControls({ locale }: { locale: Locale }) {
  const { index, playing, currentTime, duration } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  /** Folded by default: the cover is a wallpaper first, a player second. */
  const [folded, setFolded] = useState(true)

  /**
   * Boots the audio engine when the cover mounts — and deliberately does **not**
   * start playing. Music is off by default: sound nobody asked for is a nuisance
   * on a page opened to read, and browsers block it anyway. `preload = "none"`
   * means this fetches no bytes; the first byte moves when play is pressed.
   *
   * Do not delete this call while tidying: it creates the single shared
   * `<audio>` element that the dock and the /music page drive.
   */
  useEffect(() => {
    start()
  }, [])

  const { labels, credit, creditHref } = heroPlayer
  const track = trackAt(index)

  const control =
    "grid size-11 place-items-center rounded-full border border-border-strong bg-background/70 text-foreground transition-colors duration-200 hover:bg-background/90"

  if (folded) {
    return (
      <button
        type="button"
        onClick={() => setFolded(false)}
        aria-label={playing ? labels.openPlaying[locale] : labels.open[locale]}
        className={cn("relative mx-auto", control, focusRing)}
      >
        <Music2 aria-hidden className="size-4" />
        {playing ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-brand ring-2 ring-background"
          />
        ) : null}
      </button>
    )
  }

  return (
    <div className="relative rounded-2xl border border-border/60 bg-background/80 p-3">
      {/* Fold lives in the corner of the card, as it did originally. In the button
          row it was a fourth equal-weight control next to transport buttons, and
          "close the panel" is not a transport action. */}
      <button
        type="button"
        onClick={() => setFolded(true)}
        aria-label={labels.close[locale]}
        className={cn(
          "absolute top-1 right-1 -mt-1 -mr-1 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground",
          focusRing
        )}
      >
        <X aria-hidden className="size-4" />
      </button>

      {/* Padding keeps the title clear of the corner button. */}
      <div className="min-w-0 pr-10 text-left">
        <p aria-live="polite" className="truncate text-sm font-medium">
          {track.title}
        </p>
        <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
          {track.artist}
        </p>
      </div>

      <div className="mt-1.5">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          step={0.1}
          value={Math.min(currentTime, duration > 0 ? duration : 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={locale === "zh" ? "播放进度" : "Playback position"}
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="h-6 w-full cursor-pointer accent-[var(--brand)]"
        />
        <div className="-mt-1 flex justify-between font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => previous(playing)}
          aria-label={labels.previous[locale]}
          className={cn(control, focusRing)}
        >
          <SkipBack aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? labels.pause[locale] : labels.play[locale]}
          aria-pressed={playing}
          className={cn(
            "grid size-11 place-items-center rounded-full bg-brand text-[var(--brand-foreground)] transition-opacity duration-200 hover:opacity-90",
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
          onClick={() => next(playing)}
          aria-label={labels.next[locale]}
          className={cn(control, focusRing)}
        >
          <SkipForward aria-hidden className="size-4" />
        </button>
      </div>

      {/* CC BY requires attribution; this is the line that satisfies it. */}
      <p className="mt-2 text-center font-mono text-[0.625rem] text-muted-foreground">
        <a
          href={creditHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-foreground",
            focusRing
          )}
        >
          {credit}
        </a>
      </p>
    </div>
  )
}
