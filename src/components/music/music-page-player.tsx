"use client"

import { ChevronDown, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"

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

const LIST_PANEL_ID = "music-panel-list"
const LYRICS_PANEL_ID = "music-panel-lyrics"

/**
 * Radius of the cube sphere in the visualiser. Fixed: it is a property of the
 * artwork, not a control. It used to be a slider on this page, which put a
 * look-and-feel parameter in the same visual weight as playback.
 */
const SPHERE_SIZE = 2.6

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}

/**
 * The artwork's hue, derived from the track id.
 *
 * One number drives the whole page's accent: the sleeve gradient, the glow
 * under it, the progress bar, the active row, and the play button. That is the
 * "album art colours" rule for music players — each track should feel like its
 * own record rather than the same skin with a different name.
 */
function trackHue(id: string): number {
  let hue = 180
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return hue
}

const copy = {
  nowPlaying: { zh: "正在播放", en: "Now playing" },
  notPlaying: { zh: "暂未播放", en: "Not playing" },
  play: { zh: "播放", en: "Play" },
  pause: { zh: "暂停", en: "Pause" },
  previous: { zh: "上一首", en: "Previous track" },
  next: { zh: "下一首", en: "Next track" },
  seek: { zh: "播放进度", en: "Playback position" },
  volume: { zh: "音量", en: "Volume" },
  mute: { zh: "静音", en: "Mute" },
  pick: { zh: "播放这首", en: "Play this track" },
  list: { zh: "播放列表", en: "Playlist" },
  lyrics: { zh: "歌词", en: "Lyrics" },
  noLyrics: { zh: "这首还没有歌词", en: "No lyrics for this track yet" },
  noLyricsHint: {
    zh: "这几首多为器乐与人声采样，没有可对照的歌词文本。",
    en: "These tracks are mostly instrumental or sampled vocals, with no lyric text to show.",
  },
  expand: { zh: "展开", en: "Expand" },
  collapse: { zh: "收起", en: "Collapse" },
  stage: { zh: "3D 舞台", en: "3D stage" },
  stageHint: { zh: "拖动旋转 · 点击起波纹", en: "Drag to rotate · tap for ripples" },
}

/**
 * The /music stage: a reactive cube shell behind, transport and the foldable
 * playlist on the left, lyrics on the right.
 *
 * ## Dark by design
 *
 * The visualiser only reads as a visualiser against black, so this section paints
 * its own surface instead of inheriting the page tokens — inside it, colours are
 * explicit white-on-black rather than theme colours that would invert in light
 * mode.
 *
 * ## Why the lyrics moved right
 *
 * The right-hand column used to be empty apart from a hint line: nothing sat over
 * the cube, so the cube was the content. Lyrics are the one thing that can share
 * that column without competing with it — they are text, they want a tall narrow
 * measure, and a listener reads them exactly where the music is playing. So the
 * left column keeps the controls and the queue, and the right column is the lyric
 * sheet. It follows Apple Music and every lyric-forward player for the same
 * reason.
 *
 * Both panels still fold, and independently: the stage is one screen tall, so
 * collapsing is how you make room. This mirrors the dock's own controller, so
 * both players fold the same way.
 *
 * Lyrics are drawn straight from the track config. When the lines carry
 * timestamps the current one lights up and is scrolled into view; when a track
 * ships no lyrics at all the panel says so instead of pretending. Nothing here
 * invents words to fill the space.
 */
export function MusicPagePlayer({ locale }: { locale: Locale }) {
  const { index, playing, currentTime, duration, volume } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  /**
   * Both panels fold independently. Both start open: the queue is a control
   * surface someone may want immediately, and the lyric sheet is the right-hand
   * column's whole purpose — collapsed, the column would be a void again.
   */
  const [open, setOpen] = useState({ list: true, lyrics: true })
  const activeLineRef = useRef<HTMLLIElement>(null)

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
  const lyrics = track.lyrics ?? []

  /**
   * Index of the line that is playing now, or -1. Only meaningful for timed
   * lyrics: with no timestamps there is nothing to follow, so nothing lights up.
   */
  let activeLine = -1
  if (lyrics.some((line) => line.time !== undefined)) {
    for (let i = 0; i < lyrics.length; i += 1) {
      const time = lyrics[i].time
      if (time !== undefined && time <= currentTime) activeLine = i
    }
  }

  // Keep the sung line in view. `nearest` scrolls the panel, never the page.
  useEffect(() => {
    if (!open.lyrics || activeLine < 0) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    activeLineRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    })
  }, [activeLine, open.lyrics])

  const hue = trackHue(track.id)
  const accent = `oklch(0.85 0.17 ${hue})`
  const accentDeep = `oklch(0.62 0.16 ${hue})`
  const sleeve = `linear-gradient(145deg, oklch(0.66 0.18 ${hue}) 0%, oklch(0.34 0.12 ${(hue + 44) % 360}) 100%)`

  const trackVars = {
    "--accent": accent,
    "--accent-deep": accentDeep,
  } as CSSProperties

  return (
    /* `select-none` across the whole stage: a left-drag is the camera control,
       and dragging that starts on a panel would otherwise select its text. */
    <section
      style={trackVars}
      className="relative isolate flex h-full flex-col overflow-hidden bg-[#05080b] text-white select-none"
    >
      <AudioVisualizer size={SPHERE_SIZE} />
      {/* Readability scrim: the cube shell is bright in the middle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,8,11,0.72)_62%,#05080b_100%)]"
      />

      <div className="relative mx-auto grid h-full w-full max-w-6xl min-h-0 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
        {/* Left: artwork, transport, queue. `min-h-0` lets the queue scroll
            inside a fixed-height column instead of pushing the section taller. */}
        <div className="flex min-h-0 flex-col">
          <div className="relative w-full max-w-[16rem]">
            {/* Glow in the record's own colour, so the sleeve sits in its light
                instead of on black. Painted before the sleeve so it stays behind. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-full opacity-35 blur-3xl transition-opacity duration-500"
              style={{ background: accentDeep }}
            />

            {/* Vinyl peeking out from behind the sleeve. Turns only while sound
                actually plays — a still record when nothing is playing is not
                decoration, it is a state. */}
            <div
              aria-hidden
              className={cn(
                "absolute top-1/2 -right-10 size-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#1b1b1b_28%,#0b0b0b_60%,#171717_100%)] shadow-2xl shadow-black/60",
                playing && "animate-spin [animation-duration:9s]"
              )}
            >
              {/* Spindle hole + label, so the rotation is legible. */}
              <span className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/70" />
            </div>

            <div
              className="relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10"
              style={{ background: sleeve }}
            >
              {/* A soft top-light keeps the flat gradient from looking printed. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(255,255,255,0.28),transparent_58%)]"
              />
              <span className="absolute inset-0 grid place-items-center px-3 text-center font-heading text-sm font-semibold text-white/80 text-balance">
                {track.title}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[0.6875rem] tracking-widest text-white/50 uppercase">
              {playing ? copy.nowPlaying[locale] : copy.notPlaying[locale]}
            </p>
            <h2
              aria-live="polite"
              className="mt-1 font-heading text-xl font-semibold tracking-tight text-balance"
            >
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
              className="h-5 flex-1 cursor-pointer accent-[var(--accent)]"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[0.625rem] text-white/50 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Transport and volume in one row: the play button is the page's one
              primary action, so it carries the record's colour and the others
              stay quiet around it. */}
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
                "grid size-14 place-items-center rounded-full bg-[var(--accent)] text-black shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.03]",
                focusRing
              )}
            >
              {playing ? (
                <Pause aria-hidden className="size-6 fill-current" />
              ) : (
                <Play aria-hidden className="size-6 fill-current" />
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

            {/* Volume: icon toggles mute, the slider is the precise control. Two
                controls for two different jobs, sitting together so the row
                does not open a gap between them. */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVolume(muted ? 0.5 : 0)}
                aria-label={copy.mute[locale]}
                aria-pressed={muted}
                className={cn(
                  "grid size-9 place-items-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white",
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
                className="hidden h-5 w-20 cursor-pointer accent-[var(--accent)] sm:block"
              />
            </div>
          </div>

          {/* The queue folds, so a listener who only wants the controls can put
              it away and leave the stage to the cube. */}
          <section className="mt-4 flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-white/[0.03]">
            <h3>
              <button
                type="button"
                aria-expanded={open.list}
                aria-controls={LIST_PANEL_ID}
                aria-label={`${copy.list[locale]} — ${
                  open.list ? copy.collapse[locale] : copy.expand[locale]
                }`}
                onClick={() => setOpen((current) => ({ ...current, list: !current.list }))}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[0.6875rem] tracking-widest text-white/45 uppercase transition-colors duration-200 hover:text-white/75",
                  focusRing
                )}
              >
                <span>{copy.list[locale]}</span>
                <span className="font-mono text-[0.625rem] tracking-normal text-white/30 tabular-nums">
                  {index + 1} / {heroPlayer.tracks.length}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "ml-auto size-4 transition-transform duration-200",
                    open.list && "rotate-180"
                  )}
                />
              </button>
            </h3>

            {open.list ? (
              <ul
                id={LIST_PANEL_ID}
                className="min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto px-1.5 pb-2"
              >
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
                        {/* The playing row is marked with a live dot rather than a
                            "▶" character: a glyph is not an icon, and this one also
                            tells the eye that sound is moving. */}
                        <span
                          aria-hidden
                          className={cn(
                            "grid w-5 shrink-0 place-items-center font-mono text-[0.625rem] tabular-nums",
                            active ? "text-[var(--accent)]" : "text-white/40"
                          )}
                        >
                          {active && playing ? (
                            <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                          ) : (
                            String(itemIndex + 1).padStart(2, "0")
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm",
                              active ? "font-medium text-[var(--accent)]" : "text-white/85"
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
            ) : null}
          </section>
        </div>

        {/* Right: the lyric sheet over the cube. Hidden on small screens — a
            stacked empty column would only push the controls around; the phone
            treatment is a slide-up sheet, which is a separate change. */}
        <div className="hidden min-h-0 flex-col lg:flex">
          <div className="flex flex-wrap items-baseline justify-end gap-x-3 gap-y-1 text-right">
            <span className="eyebrow text-white/25">{copy.stage[locale]}</span>
            <span className="font-mono text-[0.625rem] text-white/25">
              {copy.stageHint[locale]}
            </span>
          </div>

          <section
            className={cn(
              "mt-3 flex min-h-0 flex-col rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm",
              // Collapsed, the sheet hugs its header instead of stretching an
              // empty box down the whole column.
              open.lyrics && "flex-1"
            )}
          >
            <h3>
              <button
                type="button"
                aria-expanded={open.lyrics}
                aria-controls={LYRICS_PANEL_ID}
                aria-label={`${copy.lyrics[locale]} — ${
                  open.lyrics ? copy.collapse[locale] : copy.expand[locale]
                }`}
                onClick={() => setOpen((current) => ({ ...current, lyrics: !current.lyrics }))}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-[0.6875rem] tracking-widest text-white/45 uppercase transition-colors duration-200 hover:text-white/75",
                  focusRing
                )}
              >
                <span>{copy.lyrics[locale]}</span>
                {lyrics.length > 0 ? (
                  <span className="font-mono text-[0.625rem] tracking-normal text-white/30 tabular-nums">
                    {Math.max(activeLine + 1, 1)} / {lyrics.length}
                  </span>
                ) : null}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "ml-auto size-4 transition-transform duration-200",
                    open.lyrics && "rotate-180"
                  )}
                />
              </button>
            </h3>

            {open.lyrics ? (
              <div id={LYRICS_PANEL_ID} className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                {lyrics.length === 0 ? (
                  <div className="grid h-full place-items-center py-6 text-center">
                    <div>
                      <p className="font-heading text-lg font-semibold text-white/55">
                        {copy.noLyrics[locale]}
                      </p>
                      <p className="mx-auto mt-2 max-w-[20rem] text-xs leading-relaxed text-white/30">
                        {copy.noLyricsHint[locale]}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2.5 py-2 text-base leading-relaxed">
                    {lyrics.map((line, lineIndex) => (
                      <li
                        key={`${line.text}-${lineIndex}`}
                        ref={lineIndex === activeLine ? activeLineRef : undefined}
                        aria-current={lineIndex === activeLine ? "true" : undefined}
                        className={cn(
                          "transition-colors duration-200",
                          lineIndex === activeLine
                            ? "font-medium text-[var(--accent)]"
                            : "text-white/45"
                        )}
                      >
                        {line.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  )
}
