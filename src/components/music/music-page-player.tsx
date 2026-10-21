"use client"

import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { AudioVisualizer } from "@/components/music/audio-visualizer"
import { heroPlayer } from "@/config/hero-player"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  goTo,
  next,
  previous,
  resumeAnalyser,
  seek,
  setVolume,
  subscribe,
  toggle,
  trackAt,
} from "@/lib/audio-store"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}

function artBackground(id: string): string {
  let hue = 180
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return `linear-gradient(140deg, oklch(0.55 0.16 ${hue}), oklch(0.72 0.13 ${(hue + 48) % 360}))`
}

const copy = {
  nowPlaying: { zh: "正在播放", en: "Now playing" },
  notPlaying: { zh: "暂未播放", en: "Not playing" },
  list: { zh: "播放列表", en: "Playlist" },
  lyrics: { zh: "歌词", en: "Lyrics" },
  noLyrics: { zh: "暂无歌词", en: "No lyrics" },
  noLyricsHint: {
    zh: "这些曲子是器乐与人声采样，还没有整理歌词文本。",
    en: "These tracks are instrumental or sampled vocals; no lyric text has been transcribed yet.",
  },
  play: { zh: "播放", en: "Play" },
  pause: { zh: "暂停", en: "Pause" },
  previous: { zh: "上一首", en: "Previous track" },
  next: { zh: "下一首", en: "Next track" },
  seek: { zh: "播放进度", en: "Playback position" },
  volume: { zh: "音量", en: "Volume" },
  mute: { zh: "静音", en: "Mute" },
  pick: { zh: "播放这首", en: "Play this track" },
}

/**
 * The /music stage: a reactive cube shell behind, controls and the playlist on
 * the left, lyrics on the right.
 *
 * ## Dark by design
 *
 * The visualiser only reads as a visualiser against black, so this section paints
 * its own surface instead of inheriting the page tokens — inside it, colours are
 * explicit white-on-black rather than theme colours that would invert in light
 * mode.
 *
 * ## Lyrics are honestly empty
 *
 * The tracks ship with no lyric text, so the right panel says 暂无歌词 and explains
 * why. It keeps the shape of the layout without inventing content that does not
 * exist; when lyrics arrive, they replace that one block.
 *
 * ## One engine
 *
 * Bound to `@/lib/audio-store`, like the cover panel and the dock: three views of
 * one `<audio>`. The visualiser reads the same element through an `AnalyserNode`.
 */
export function MusicPagePlayer({ locale }: { locale: Locale }) {
  const { index, playing, currentTime, duration, volume } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const [tab, setTab] = useState<"list" | "lyrics">("list")
  /** Sphere radius, 1.6 (small) to 4.5 (large). Drives the visualiser. */
  const [sphereSize, setSphereSize] = useState(2.6)

  /**
   * Hide the mascot while this page is mounted.
   *
   * It floats above everything at `fixed z-30`, so on a full-screen player it
   * covered the visualiser. Done from the page rather than inside the mascot: a
   * route check there tripped the React Compiler's memoization rule, and this way
   * the change is scoped to the one page that needs it and restored on unmount.
   */
  useEffect(() => {
    const mascot = document.querySelector<HTMLElement>("[data-paimon]")
    if (!mascot) return
    const previous = mascot.style.display
    mascot.style.display = "none"
    return () => {
      mascot.style.display = previous
    }
  }, [])

  const track = trackAt(index)
  const muted = volume === 0

  return (
    /* `select-none` across the whole stage: a left-drag is the camera control,
       and dragging that starts on a panel would otherwise select its text. */
    <section className="relative isolate flex h-full flex-col overflow-hidden bg-[#05080b] text-white select-none">
      <AudioVisualizer size={sphereSize} />
      {/* Readability scrim: the cube shell is bright in the middle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,8,11,0.72)_62%,#05080b_100%)]"
      />

      <div className="relative mx-auto grid h-full w-full max-w-6xl min-h-0 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
        {/* Left: player and playlist. `min-h-0` lets the list scroll inside a
            fixed-height column instead of pushing the section taller. */}
        <div className="flex min-h-0 flex-col">
          <div className="relative w-full max-w-[16rem]">
            {/* Vinyl peeking out from behind the sleeve. */}
            <div
              aria-hidden
              className="absolute top-1/2 -right-10 size-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#1b1b1b_28%,#0b0b0b_60%,#171717_100%)] shadow-2xl shadow-black/60"
            />
            <div
              className="relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50"
              style={{ background: artBackground(track.id) }}
            >
              <span className="absolute inset-0 grid place-items-center px-3 text-center font-heading text-sm font-semibold text-white/80">
                {track.title}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[0.6875rem] tracking-widest text-white/50 uppercase">
              {playing ? copy.nowPlaying[locale] : copy.notPlaying[locale]}
            </p>
            <h2 aria-live="polite" className="mt-1 font-heading text-xl font-semibold">
              {track.title}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-white/50">{track.artist}</p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="w-9 shrink-0 font-mono text-[0.625rem] text-white/50 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 0}
              step={0.1}
              value={Math.min(currentTime, duration > 0 ? duration : 0)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label={copy.seek[locale]}
              aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
              className="h-5 flex-1 cursor-pointer accent-cyan-400"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[0.625rem] text-white/50 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => previous(playing)}
              aria-label={copy.previous[locale]}
              className={cn(
                "grid size-10 place-items-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white",
                focusRing
              )}
            >
              <SkipBack aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                resumeAnalyser()
                toggle()
              }}
              aria-label={playing ? copy.pause[locale] : copy.play[locale]}
              aria-pressed={playing}
              className={cn(
                "grid size-14 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20",
                focusRing
              )}
            >
              {playing ? (
                <Pause aria-hidden className="size-6" />
              ) : (
                <Play aria-hidden className="size-6" />
              )}
            </button>
            <button
              type="button"
              onClick={() => next(playing)}
              aria-label={copy.next[locale]}
              className={cn(
                "grid size-10 place-items-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white",
                focusRing
              )}
            >
              <SkipForward aria-hidden className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setVolume(muted ? 0.5 : 0)}
              aria-label={copy.mute[locale]}
              aria-pressed={muted}
              className={cn(
                "ml-auto grid size-10 place-items-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white",
                focusRing
              )}
            >
              {muted ? (
                <VolumeX aria-hidden className="size-4" />
              ) : (
                <Volume2 aria-hidden className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label={copy.volume[locale]}
              className="hidden h-5 w-24 cursor-pointer accent-cyan-400 sm:block"
            />
          </div>

          <ul className="mt-5 min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto pr-1">
            {heroPlayer.tracks.map((item, itemIndex) => {
              const active = itemIndex === index
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      resumeAnalyser()
                      goTo(itemIndex, true)
                    }}
                    aria-label={`${copy.pick[locale]}: ${item.title}`}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors duration-200 hover:bg-white/5",
                      focusRing,
                      active && "bg-white/10"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "w-5 shrink-0 text-center font-mono text-[0.625rem]",
                        active ? "text-cyan-300" : "text-white/40"
                      )}
                    >
                      {active && playing ? "▶" : String(itemIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm",
                          active ? "font-medium text-cyan-300" : "text-white/85"
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="block truncate font-mono text-[0.625rem] text-white/40">
                        {item.artist}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right: lyrics */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="eyebrow text-white/35">3D 舞台</span>
            <span className="font-mono text-[0.625rem] text-white/30">拖动可旋转 · 点击起波纹</span>
          </div>
          <div role="tablist" aria-label={copy.list[locale]} className="flex gap-2">
            {(["list", "lyrics"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                  focusRing,
                  tab === key
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {key === "list" ? (
                  <ListMusic aria-hidden className="size-4" />
                ) : null}
                {key === "list" ? copy.list[locale] : copy.lyrics[locale]}
              </button>
            ))}
          </div>

          <div className="mt-6 flex-1">
            {tab === "lyrics" ? (
              <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                <div>
                  <p className="font-heading text-2xl font-semibold text-white/80">
                    {copy.noLyrics[locale]}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/50">
                    {copy.noLyricsHint[locale]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[0.6875rem] tracking-widest text-white/40 uppercase">
                  {copy.list[locale]} · {index + 1} / {heroPlayer.tracks.length}
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold leading-snug text-balance">
                  {track.title}
                </p>
                <p className="mt-2 font-mono text-xs text-white/50">{track.artist}</p>
                <ul className="mt-5 space-y-1.5 text-xs text-white/45">
                  <li>· 按住左键拖动 → 旋转视角</li>
                  <li>· 轻点画面 → 激起一圈波纹</li>
                  <li>· 方块沿球面法线生长：北极是低频，南极是高频</li>
                </ul>
              </div>
            )}
          </div>

          {/* Bowl depth: the one shape parameter worth exposing. It is the radius
              of the sphere the floor is cut from, expressed as the height the rim
              ends up at. */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/60">球体大小</span>
              <span className="font-mono text-[0.625rem] text-white/40 tabular-nums">
                {sphereSize.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={1.6}
              max={4.5}
              step={0.01}
              value={sphereSize}
              onChange={(event) => setSphereSize(Number(event.target.value))}
              aria-label="球体大小"
              aria-valuetext={sphereSize.toFixed(2)}
              className="mt-2 h-5 w-full cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between font-mono text-[0.5625rem] text-white/30">
              <span>小</span>
              <span>大</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
