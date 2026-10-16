"use client"

import { ArrowDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useSyncExternalStore } from "react"
import { wallpapers } from "@/data/wallpapers"
import type { Dictionary, Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 7000

/**
 * `prefers-reduced-motion` as an external store.
 *
 * A MediaQueryList is created once and reused, and the snapshot is a boolean,
 * so it is stable for `useSyncExternalStore` (creating a new list per call
 * would return a fresh object every time and loop forever).
 */
let mql: MediaQueryList | null = null
function getMql() {
  mql ??= window.matchMedia("(prefers-reduced-motion: reduce)")
  return mql
}
function subscribeReduced(cb: () => void) {
  const m = getMql()
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}
const getReduced = () => getMql().matches
const getReducedOnServer = () => false

/**
 * The gate: a full-viewport wallpaper slideshow that carries the first
 * impression, with the creed over it.
 *
 * Accessibility and motion rules are copied from the design system's carousel
 * requirements (the `enterprise-gateway` pattern), because a rotating hero is
 * the classic place to break them:
 *  - every control is a real button, so it is keyboard operable;
 *  - auto-rotation can be paused, and stops while focus is inside the carousel
 *    or while the tab is hidden;
 *  - under `prefers-reduced-motion` it never advances on its own and renders
 *    the first slide's final state;
 *  - the height is reserved (`100svh`), so nothing shifts as slides change.
 */
export function HeroGate({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const labels = dict.home.gate
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [hidden, setHidden] = useState(false)
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReduced,
    getReducedOnServer
  )

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const paused = reduced || userPaused || focusWithin || hidden

  useEffect(() => {
    if (paused) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % wallpapers.length),
      AUTOPLAY_MS
    )
    return () => clearInterval(id)
  }, [paused])

  const go = (step: number) =>
    setIndex((i) => (i + step + wallpapers.length) % wallpapers.length)

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.slidePrefix}
      className="relative isolate h-[100svh] min-h-[32rem] overflow-hidden border-b border-border/60"
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1)
        if (event.key === "ArrowRight") go(1)
      }}
    >
      {wallpapers.map((wallpaper, i) => {
        const active = i === index
        return (
          <div
            key={wallpaper.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${labels.slidePrefix} ${i + 1} / ${wallpapers.length}`}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
              active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {wallpaper.image ? (
              <Image
                src={wallpaper.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundImage: wallpaper.background }}
              />
            )}
          </div>
        )
      })}

      {/* Readability scrim: the creed must clear 4.5:1 over any wallpaper. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent"
      />

      <div className="relative flex h-full flex-col justify-end pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="max-w-2xl font-heading text-2xl leading-snug font-semibold text-balance sm:text-3xl lg:text-4xl">
            {wallpapers[index].creed[locale]}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.prev}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong bg-background/60 backdrop-blur-md outline-none hover:bg-background/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong bg-background/60 backdrop-blur-md outline-none hover:bg-background/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? labels.play : labels.pause}
              aria-pressed={userPaused}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong bg-background/60 backdrop-blur-md outline-none hover:bg-background/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {userPaused || reduced ? (
                <Play aria-hidden className="size-4" />
              ) : (
                <Pause aria-hidden className="size-4" />
              )}
            </button>

            <div className="ml-1 flex items-center gap-2">
              {wallpapers.map((wallpaper, i) => (
                <button
                  key={wallpaper.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${labels.slidePrefix} ${i + 1} / ${wallpapers.length}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full outline-none transition-[width,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    i === index
                      ? "w-6 bg-brand"
                      : "w-1.5 bg-foreground/40 hover:bg-foreground/70"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard users need a reachable way past a full-height gate; without it
          they must tab through the whole carousel to reach the page. */}
      <a
        href="#content"
        className="absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {labels.down}
        <ArrowDown aria-hidden className="size-3.5" />
      </a>
    </section>
  )
}
