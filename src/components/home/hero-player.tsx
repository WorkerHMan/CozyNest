"use client"

import { Music2, Pause, Play, SkipBack, SkipForward, VolumeX, X } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { heroPlayer } from "@/config/hero-player"
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
import type { Locale } from "@/i18n"

/** Collapse when the player has been left alone this long. */
const IDLE_COLLAPSE_MS = 20_000

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, "0")}`
}

/**
 * The cover's music player — a **view** over `@/lib/audio-store`, not the owner
 * of the audio. The element lives in the store so playback survives a route
 * change and the dock shares exactly the same sound.
 *
 * Behaviours that matter here:
 *
 *  - `start()` on mount boots the engine and attempts autoplay. Nothing else may
 *    boot it, so a direct visit to an inner page stays silent.
 *  - Collapsed by default; a brand dot marks it while playing.
 *  - **Collapsing is not stopping.** The X folds the panel away and leaves the
 *    music running — the ⏸ button is the only thing that pauses. That is why the
 *    X is labelled "collapse" rather than "close".
 *  - It folds itself away on a new wallpaper, and after 20 s of not being
 *    touched, but never pauses itself while doing so.
 *  - The seek bar is a native range input: keyboard, screen readers and touch
 *    dragging all work without extra code.
 */
export function HeroPlayer({ locale, slideIndex }: { locale: Locale; slideIndex: number }) {
  const { labels, credit, creditHref } = heroPlayer
  const { index, playing, unavailable, blocked, currentTime, duration } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const [collapsed, setCollapsed] = useState(true)
  /** Bumped by any interaction, which restarts the idle timer. */
  const [touched, setTouched] = useState(0)

  useEffect(() => {
    start()
  }, [])

  // Fold away when the wallpaper changes. Deferred by a tick so this is not a
  // synchronous setState inside an effect body.
  useEffect(() => {
    const id = setTimeout(() => setCollapsed(true), 0)
    return () => clearTimeout(id)
  }, [slideIndex])

  // Fold away after 20 s of no interaction. Only the UI changes: nothing here
  // touches playback.
  useEffect(() => {
    if (collapsed) return
    const id = setTimeout(() => setCollapsed(true), IDLE_COLLAPSE_MS)
    return () => clearTimeout(id)
  }, [collapsed, touched])

  const track = trackAt(index)

  const ring =
    "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label={
          playing
            ? labels.openPlaying[locale]
            : blocked
              ? labels.openBlocked[locale]
              : labels.open[locale]
        }
        className={cn(
          "relative mx-auto grid size-11 place-items-center rounded-full border border-border-strong bg-background/80 text-foreground hover:bg-background/95",
          ring
        )}
      >
        {blocked && !playing ? (
          <VolumeX aria-hidden className="size-4" />
        ) : (
          <Music2 aria-hidden className="size-4" />
        )}
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
    <div
      className="w-full rounded-2xl border border-border/60 bg-background/80 p-3"
      onPointerDown={() => setTouched((count) => count + 1)}
      onKeyDown={() => setTouched((count) => count + 1)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-left" aria-live="polite">
          <p className="text-sm font-medium">{track.title}</p>
          <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
            {track.artist}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label={labels.close[locale]}
          className={cn(
            "-mt-1 -mr-1 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground",
            ring
          )}
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div className="mt-1">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          step={0.1}
          value={Math.min(currentTime, duration > 0 ? duration : 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={labels.seek[locale]}
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="h-11 w-full cursor-pointer accent-[var(--brand)]"
        />
        <div className="-mt-1 flex justify-between font-mono text-[0.625rem] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => previous(playing)}
          aria-label={labels.previous[locale]}
          className={cn(
            "grid size-11 place-items-center rounded-full text-foreground hover:bg-background/60",
            ring
          )}
        >
          <SkipBack aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? labels.pause[locale] : labels.play[locale]}
          aria-pressed={playing}
          className={cn(
            "grid size-11 place-items-center rounded-full bg-brand text-[var(--brand-foreground)] hover:opacity-90",
            ring
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
          className={cn(
            "grid size-11 place-items-center rounded-full text-foreground hover:bg-background/60",
            ring
          )}
        >
          <SkipForward aria-hidden className="size-4" />
        </button>
      </div>

      {unavailable ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {labels.unavailable[locale]}
        </p>
      ) : null}

      {blocked && !unavailable ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {labels.autoplayBlocked[locale]}
        </p>
      ) : null}

      <p className="mt-2 text-center font-mono text-[0.625rem] text-muted-foreground">
        <span className="sr-only">{labels.musicCredit[locale]}: </span>
        <a
          href={creditHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "rounded-sm underline decoration-dotted underline-offset-2 hover:text-foreground",
            ring
          )}
        >
          {credit}
        </a>
      </p>
    </div>
  )
}
