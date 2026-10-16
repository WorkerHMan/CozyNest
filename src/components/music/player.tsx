"use client"

import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Track } from "@/data/music"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface PlayerLabels {
  play: string
  pause: string
  previous: string
  next: string
  nowPlaying: string
  seek: string
  volume: string
  notLoaded: string
  trackCountLabel: string
}

/**
 * The music transport.
 *
 * **It never autoplays, and it cannot**: there are no audio files in this
 * repository, so there is no `<audio>` element and no source to start. The
 * component is honest about that — it renders the transport state (current
 * track, play/pause, seek, volume) and repeats `dict.pages.music.notLoaded` at
 * the controls instead of animating a fake playhead.
 *
 * Accessibility:
 *  - every control is a real button with an accessible name, so the transport
 *    is fully keyboard operable;
 *  - the seek and volume sliders carry `aria-label`s, which Radix forwards to
 *    the slider thumb — the element that actually takes focus;
 *  - the current track in the list is marked with `aria-current`;
 *  - play/pause state is exposed as text and `aria-pressed`, not by the icon
 *    alone.
 *
 * The seek slider is `disabled` on purpose: with no file there is no
 * `currentTime` to read, so a draggable position would be a lie.
 */
export function Player({
  tracks,
  labels,
}: {
  tracks: readonly Track[]
  labels: PlayerLabels
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(70)

  const current = tracks[index]
  if (!current) return null

  const go = (delta: number) =>
    setIndex((i) => Math.min(tracks.length - 1, Math.max(0, i + delta)))

  const isFirst = index === 0
  const isLast = index === tracks.length - 1

  const controlRing =
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <section
        aria-label={labels.nowPlaying}
        className="space-y-5 self-start rounded-xl bg-card p-5 ring-1 ring-foreground/10"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Volume2 aria-hidden className="size-4 shrink-0" />
          <h2 className="text-sm font-medium">{labels.nowPlaying}</h2>
        </div>

        <div className="space-y-1">
          <p className="font-heading text-lg font-semibold text-balance">
            {current.title}
          </p>
          <p className="text-sm text-muted-foreground">{current.artist}</p>
        </div>

        <div className="space-y-2">
          {/* Read-only rather than disabled: the control keeps its place in the
              tab order and keeps its accessible name (`dict.pages.music.seekLabel`)
              while the zero-width range makes it impossible to drag a position
              that no audio could ever reach. */}
          <Slider
            aria-label={labels.seek}
            value={[0]}
            min={0}
            max={0}
            step={1}
          />
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>0:00</span>
            <span>{formatDuration(current.duration)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => go(-1)}
            disabled={isFirst}
            aria-label={labels.previous}
            className={cn("border-border-strong", controlRing)}
          >
            <SkipBack aria-hidden />
          </Button>
          <Button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-pressed={playing}
            aria-label={playing ? labels.pause : labels.play}
            className={controlRing}
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? labels.pause : labels.play}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => go(1)}
            disabled={isLast}
            aria-label={labels.next}
            className={cn("border-border-strong", controlRing)}
          >
            <SkipForward aria-hidden />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{labels.volume}</p>
          <Slider
            aria-label={labels.volume}
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([next]) => {
              if (typeof next === "number") setVolume(next)
            }}
          />
        </div>

        <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-pretty text-muted-foreground">
          {labels.notLoaded}
        </p>
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-medium">
          {tracks.length} {labels.trackCountLabel}
        </h2>
        <ul className="list-none divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          {tracks.map((track, trackIndex) => {
            const isCurrent = trackIndex === index
            return (
              <li key={track.id}>
                <div
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 p-3 transition-colors duration-200",
                    isCurrent ? "bg-muted/60" : "hover:bg-muted/30"
                  )}
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                    {trackIndex + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {track.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {track.artist}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${labels.play}: ${track.title}`}
                    onClick={() => {
                      setIndex(trackIndex)
                      setPlaying(true)
                    }}
                    className={cn("shrink-0", controlRing)}
                  >
                    <Play aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
