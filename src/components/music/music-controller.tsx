"use client"

import {
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { heroPlayer } from "@/config/hero-player"
import type { Locale } from "@/i18n"
import {
  cycleMode,
  getServerSnapshot,
  getSnapshot,
  goTo,
  next,
  previous,
  seek,
  setVolume,
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

/** Stable gradient per track: no cover art ships with these files. */
function artBackground(id: string): string {
  let hue = 0
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return `linear-gradient(135deg, oklch(0.58 0.14 ${hue}), oklch(0.72 0.12 ${(hue + 58) % 360}))`
}

const MODE_META = {
  sequence: { icon: Repeat, zh: "顺序播放", en: "Play in order" },
  repeatOne: { icon: Repeat1, zh: "单曲循环", en: "Repeat one" },
  shuffle: { icon: Shuffle, zh: "随机播放", en: "Shuffle" },
} as const

export interface MusicControllerProps {
  locale: Locale
  /** Extra classes on the panel; the parent decides width and placement. */
  className?: string
}

/**
 * The one music controller: cover, dock and (via the dock) every other page.
 *
 * ## Layout
 *
 * A collapsible panel on top (playlist / lyrics tabs), then the current track
 * with a scrubber, then one row of seven controls:
 * play mode · lyrics · previous · play/pause · next · list · volume.
 *
 * The panel is opened *by* the list and lyrics buttons rather than always being
 * on screen — a permanently expanded queue would dominate the cover.
 *
 * ## It owns no audio
 *
 * Everything is bound to `@/lib/audio-store`, so this panel and the page player
 * are views over one element. That is why the dock and the cover can never
 * disagree about what is playing.
 */
export function MusicController({ locale, className }: MusicControllerProps) {
  const { index, playing, currentTime, duration, volume, mode, blocked, unavailable } =
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const [panel, setPanel] = useState<"closed" | "list" | "lyrics">("closed")

  const track = trackAt(index)
  const ModeIcon = MODE_META[mode].icon

  const copy = {
    playlist: { zh: "列表", en: "List" },
    lyrics: { zh: "歌词", en: "Lyrics" },
    noLyrics: {
      zh: "这首歌暂时还没有歌词。",
      en: "No lyrics for this track yet.",
    },
    seek: { zh: "播放进度", en: "Playback position" },
    play: { zh: "播放", en: "Play" },
    pause: { zh: "暂停", en: "Pause" },
    previous: { zh: "上一首", en: "Previous track" },
    next: { zh: "下一首", en: "Next track" },
    mode: { zh: "播放模式", en: "Play mode" },
    openLyrics: { zh: "显示歌词", en: "Show lyrics" },
    toggleList: { zh: "显示播放列表", en: "Show the playlist" },
    volume: { zh: "音量", en: "Volume" },
    mute: { zh: "静音", en: "Mute" },
    pick: { zh: "播放这首", en: "Play this track" },
    blocked: {
      zh: "浏览器拦截了播放，按一下播放键",
      en: "Playback was blocked — press play",
    },
    unavailable: { zh: "音频暂不可用", en: "Audio unavailable" },
  }

  const muted = volume === 0

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-background/95 p-3 shadow-xl shadow-black/10 backdrop-blur-md",
        className
      )}
    >
      {panel !== "closed" ? (
        <div className="mb-3">
          <div role="tablist" aria-label={copy.playlist[locale]} className="flex gap-1">
            {(["list", "lyrics"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={panel === tab}
                onClick={() => setPanel(tab)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-200",
                  focusRing,
                  panel === tab
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "list" ? copy.playlist[locale] : copy.lyrics[locale]}
              </button>
            ))}
          </div>

          {panel === "list" ? (
            <ul className="mt-1 max-h-52 divide-y divide-border/50 overflow-y-auto pr-1">
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
                        "flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors duration-200 hover:bg-muted/60",
                        focusRing,
                        active && "bg-muted/70"
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-8 shrink-0 rounded-md border border-border/40"
                        style={{ background: artBackground(item.id) }}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-xs",
                            active ? "font-medium text-brand" : "text-foreground"
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="block truncate font-mono text-[0.625rem] text-muted-foreground">
                          {item.artist}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-2 max-h-52 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              {copy.noLyrics[locale]}
            </p>
          )}
        </div>
      ) : null}

      {/* Current track */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="size-12 shrink-0 rounded-full border border-border/40 shadow-sm"
          style={{ background: artBackground(track.id) }}
        />
        <div className="min-w-0 flex-1">
          <p aria-live="polite" className="truncate text-sm font-medium">
            {track.title}
          </p>
          <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
            {track.artist}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          step={0.1}
          value={Math.min(currentTime, duration > 0 ? duration : 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={copy.seek[locale]}
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="h-6 w-full cursor-pointer accent-[var(--brand)]"
        />
        <div className="-mt-1 flex justify-between font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Seven controls */}
      <div className="mt-1 flex items-center justify-between gap-0.5">
        <button
          type="button"
          onClick={cycleMode}
          aria-label={`${copy.mode[locale]}: ${MODE_META[mode][locale]}`}
          title={`${copy.mode[locale]}: ${MODE_META[mode][locale]}`}
          className={cn(
            "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground",
            focusRing,
            mode !== "sequence" && "text-brand"
          )}
        >
          <ModeIcon aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setPanel(panel === "lyrics" ? "closed" : "lyrics")}
          aria-label={copy.openLyrics[locale]}
          aria-pressed={panel === "lyrics"}
          className={cn(
            "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground",
            focusRing,
            panel === "lyrics" && "text-brand"
          )}
        >
          <Mic2 aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => previous(playing)}
          aria-label={copy.previous[locale]}
          className={cn(
            "grid size-9 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted",
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
          aria-label={copy.next[locale]}
          className={cn(
            "grid size-9 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted",
            focusRing
          )}
        >
          <SkipForward aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setPanel(panel === "list" ? "closed" : "list")}
          aria-label={copy.toggleList[locale]}
          aria-pressed={panel === "list"}
          className={cn(
            "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground",
            focusRing,
            panel === "list" && "text-brand"
          )}
        >
          <ListMusic aria-hidden className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setVolume(muted ? 0.5 : 0)}
          aria-label={copy.mute[locale]}
          aria-pressed={muted}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground",
            focusRing
          )}
        >
          {muted ? (
            <VolumeX aria-hidden className="size-4" />
          ) : (
            <Volume2 aria-hidden className="size-4" />
          )}
        </button>
      </div>

      {/* Volume lives beside the row rather than in a menu: one slider, always
          visible on anything wider than a phone. */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        aria-label={copy.volume[locale]}
        className="mt-1 hidden h-5 w-full cursor-pointer accent-[var(--brand)] sm:block"
      />

      {blocked ? (
        <p className="mt-1 text-center text-[0.625rem] text-muted-foreground">
          {copy.blocked[locale]}
        </p>
      ) : null}
      {unavailable ? (
        <p className="mt-1 text-center text-[0.625rem] text-muted-foreground">
          {copy.unavailable[locale]}
        </p>
      ) : null}
    </div>
  )
}
