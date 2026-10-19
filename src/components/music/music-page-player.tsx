"use client"

import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { useSyncExternalStore } from "react"

import { heroPlayer } from "@/config/hero-player"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  goTo,
  next,
  previous,
  seek,
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
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, "0")}`
}

/**
 * A deterministic gradient per track.
 *
 * The tracks ship without cover art, and inventing filenames would mean broken
 * images. Hashing the id gives each track a stable, distinct tile that looks
 * deliberate rather than missing.
 */
function artBackground(id: string): string {
  let hue = 0
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return `linear-gradient(135deg, oklch(0.58 0.14 ${hue}), oklch(0.72 0.12 ${(hue + 58) % 360}))`
}

/**
 * The music page player.
 *
 * It is a *view over the same audio store* as the cover player and the dock, not
 * a second `<audio>` element: starting a track here moves the cover player and
 * the dock with it, and one engine means one sound.
 *
 * There is no lyrics tab. The reference site has one because it fetches lyrics;
 * with no lyric data behind it, a tab that always says "暂无歌词" is dead UI.
 */
export function MusicPagePlayer({ locale }: { locale: Locale }) {
  const { index, playing, currentTime, duration, blocked, unavailable } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const track = trackAt(index)
  const copy = {
    nowPlaying: { zh: "正在播放", en: "Now playing" },
    playlist: { zh: "播放列表", en: "Playlist" },
    play: { zh: "播放", en: "Play" },
    pause: { zh: "暂停", en: "Pause" },
    previous: { zh: "上一首", en: "Previous track" },
    next: { zh: "下一首", en: "Next track" },
    position: { zh: "播放进度", en: "Playback position" },
    pick: { zh: "播放这首", en: "Play this track" },
    blocked: {
      zh: "浏览器拦截了自动播放，按一下播放键即可",
      en: "Your browser blocked autoplay — press play to start",
    },
    unavailable: { zh: "音频暂不可用", en: "Audio unavailable" },
    credit: { zh: "音乐来源", en: "Music" },
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
      {/* Now playing */}
      <section aria-label={copy.nowPlaying[locale]} className="space-y-5">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-black/5"
          style={{ background: artBackground(track.id) }}
        >
          {/* Decorative only: the track name is right below it. */}
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center font-heading text-6xl font-semibold text-white/25"
          >
            {track.title.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="space-y-1">
          <p className="eyebrow text-muted-foreground">{copy.nowPlaying[locale]}</p>
          <h2 aria-live="polite" className="font-heading text-xl font-semibold tracking-tight text-balance">
            {track.title}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">{track.artist}</p>
        </div>

        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 0}
            step={0.1}
            value={Math.min(currentTime, duration > 0 ? duration : 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label={copy.position[locale]}
            aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            className="h-11 w-full cursor-pointer accent-[var(--brand)]"
          />
          <div className="flex justify-between font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => previous(playing)}
            aria-label={copy.previous[locale]}
            className={cn(
              "grid size-11 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted",
              focusRing
            )}
          >
            <SkipBack aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? copy.pause[locale] : copy.play[locale]}
            aria-pressed={playing}
            className={cn(
              "grid size-14 place-items-center rounded-full bg-brand text-[var(--brand-foreground)] transition-opacity duration-200 hover:opacity-90",
              focusRing
            )}
          >
            {playing ? (
              <Pause aria-hidden className="size-5" />
            ) : (
              <Play aria-hidden className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => next(playing)}
            aria-label={copy.next[locale]}
            className={cn(
              "grid size-11 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted",
              focusRing
            )}
          >
            <SkipForward aria-hidden className="size-4" />
          </button>
        </div>

        {blocked ? (
          <p className="text-center text-xs text-muted-foreground">{copy.blocked[locale]}</p>
        ) : null}
        {unavailable ? (
          <p className="text-center text-xs text-muted-foreground">{copy.unavailable[locale]}</p>
        ) : null}
      </section>

      {/* Playlist */}
      <section aria-label={copy.playlist[locale]} className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="eyebrow text-muted-foreground">{copy.playlist[locale]}</h2>
          <span className="font-mono text-xs text-muted-foreground">{heroPlayer.tracks.length}</span>
        </div>

        <ul className="mt-3 divide-y divide-border/60">
          {heroPlayer.tracks.map((item, itemIndex) => {
            const active = itemIndex === index
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goTo(itemIndex, true)}
                  aria-label={`${copy.pick[locale]}: ${item.title}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors duration-200 hover:bg-muted/60",
                    focusRing,
                    active && "bg-muted/70"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "w-6 shrink-0 text-center font-mono text-xs",
                      active ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {active && playing ? (
                      <span className="inline-block">▶</span>
                    ) : (
                      String(itemIndex + 1).padStart(2, "0")
                    )}
                  </span>
                  <span
                    aria-hidden
                    className="size-9 shrink-0 rounded-md border border-border/40"
                    style={{ background: artBackground(item.id) }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        active ? "font-medium text-brand" : "text-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="block truncate font-mono text-[0.6875rem] text-muted-foreground">
                      {item.artist}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 font-mono text-[0.625rem] text-muted-foreground">
          <span className="sr-only">{copy.credit[locale]}: </span>
          <a
            href={heroPlayer.creditHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-foreground",
              focusRing
            )}
          >
            {heroPlayer.credit}
          </a>
        </p>
      </section>
    </div>
  )
}
