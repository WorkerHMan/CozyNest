"use client"

import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import Image from "next/image"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
} from "react"
import { CoverMusicControls } from "@/components/music/cover-music-controls"
import {
  getServerSnapshot as getSettingsServerSnapshot,
  getSnapshot as getSettingsSnapshot,
  subscribe as subscribeSettings,
  update as updateSettings,
} from "@/lib/site-settings"
import { Container } from "@/components/layout/container"
import { homeBanner } from "@/config/home-banner"
import type { Dictionary, Locale } from "@/i18n"
import { cn } from "@/lib/utils"

/** Long enough to register a wallpaper, short enough to keep it lively. */
const AUTOPLAY_MS = 5000
const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Three wave bands for the bottom edge.
 *
 * Every path repeats identically across the 1440 midpoint, which is what makes
 * the -50% drift loop without a seam.
 *
 * The fill is **pure white** at low opacity rather than a theme colour: a
 * page-coloured band over a photograph is exactly the white-wash problem this
 * cover had before, and white stays white in both light and dark mode.
 */
const WAVES = [
  {
    className: "wave-back",
    opacity: 0.12,
    d: "M0,64 C240,26 480,102 720,64 C960,26 1200,102 1440,64 C1680,26 1920,102 2160,64 C2400,26 2640,102 2880,64 L2880,120 L0,120 Z",
  },
  {
    className: "wave-mid",
    opacity: 0.18,
    d: "M0,82 C240,52 480,112 720,82 C960,52 1200,112 1440,82 C1680,52 1920,112 2160,82 C2400,52 2640,112 2880,82 L2880,120 L0,120 Z",
  },
  {
    className: "wave-front",
    opacity: 0.26,
    d: "M0,98 C240,74 480,122 720,98 C960,74 1200,122 1440,98 C1680,74 1920,122 2160,98 C2400,74 2640,122 2880,98 L2880,120 L0,120 Z",
  },
] as const

/**
 * The creed's reveal.
 *
 * Plain text, typed from the **first character**: the span is clipped from its
 * right edge and stepped, so it reads key-by-key.
 *
 * The centre-out box animation that used to wrap this is gone along with the
 * border — it only ever described the box's chrome, and with no box to draw it
 * would just re-hide character one until the clip passed the middle.
 */
const BANNER_CSS = `
/* Typed from the first character: clipped from the right edge, stepped so each
   glyph lands instead of sliding. */
@keyframes motto-type {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

.motto-type {
  display: inline-block;
  animation: motto-type 900ms steps(14, end) both;
}

/*
 * Water along the bottom edge. Each band holds the same wave drawn twice inside
 * a 2880-wide viewBox and drifts by exactly -50% of its own 200%-wide box — one
 * full repetition — so the loop is seamless instead of jumping at the seam.
 * The three speeds are deliberately not multiples of each other, which keeps the
 * bands from ever re-aligning into one obvious beat.
 */
@keyframes wave-drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}

@keyframes arrow-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(6px); }
}

.wave-back  { animation: wave-drift 27s linear infinite; }
.wave-mid   { animation: wave-drift 17s linear infinite reverse; }
.wave-front { animation: wave-drift 21s linear infinite; }
.arrow-bob  { animation: arrow-bob 2.4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .motto-type { animation: none; clip-path: none; }
  /* Standing water and a still arrow. The decoration carries no meaning, so
     freezing it loses nothing. */
  .wave-back, .wave-mid, .wave-front, .arrow-bob { animation: none; }
}
`

function subscribeReduceMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCE_MOTION_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const getReduceMotion = () => window.matchMedia(REDUCE_MOTION_QUERY).matches
const getReduceMotionOnServer = () => false

function subscribeHidden(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}
const getHidden = () => document.hidden
const getHiddenOnServer = () => false

/**
 * The illustrated cover: a full-viewport wallpaper carousel with the site
 * wordmark centred over it and the music player beneath.
 *
 * ## The overlay layers, and why they are ordered this way
 *
 * 1. **The slides.**
 * 2. **A page-coloured fade.** This sits *outside* the dark island below, so it
 *    follows the page theme: on a light page the photo dissolves into white, on
 *    a dark page into near-black. Either way the cover meets the Hero cleanly.
 * 3. **A `dark` island.** Every scrim, control and piece of text lives inside
 *    it, so the whole overlay resolves the *dark* palette regardless of the page
 *    theme.
 *
 * That third point is a bug fix. The scrim used to be mixed from `--background`,
 * which is near-white in light mode, so the artwork ended up under a white veil
 * and the glass panels turned white. The cover is photography: its overlay must
 * not follow the page theme, so it is pinned to the dark palette here.
 *
 * Controls also deliberately avoid `backdrop-blur`: blurring the bright parts of
 * a photo behind semi-transparent glass produces a milky smudge around the
 * buttons. Solid tints read cleanly over any artwork.
 *
 * ## Autoplay
 *
 * Follows the accessibility rule for automatically rotating content: previous,
 * next and play/pause are all present, rotation stops on hover and on focus,
 * stops while the tab is hidden, and never starts under `prefers-reduced-motion`
 * (where the toggle is not rendered at all, rather than offering a dead control).
 * Choosing a slide counts as taking control, so rotation stops until restarted.
 */
export function HomeBanner({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { slides, labels, credit, scrim, mottos } = homeBanner
  const total = slides.length

  const [index, setIndex] = useState(0)
  /** -1 until the first draw: the creed is chosen on the client, so a refresh
   *  does not always open on the same one. */
  const [mottoIndex, setMottoIndex] = useState(-1)
  const mottoRef = useRef(-1)
  /**
   * Autoplay is a *site setting*, not local state: the same switch lives in the
   * settings drawer, so both surfaces must read the one store or they would
   * disagree. `engaged` stays local — it is the session-only "the visitor took
   * over" hold, set by the arrows, and must not persist.
   */
  const { carouselAutoplay } = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot
  )
  /** Pointer or keyboard focus inside the cover. */
  const [engaged, setEngaged] = useState(false)

  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotion,
    getReduceMotionOnServer
  )
  const hidden = useSyncExternalStore(subscribeHidden, getHidden, getHiddenOnServer)

  const showRotationControl = !reduceMotion && total > 1
  const rotationRunning = carouselAutoplay && showRotationControl && !engaged && !hidden
  const autoplay = rotationRunning

  /**
   * Every visit starts on the cover.
   *
   * Without this, a refresh restores the previous scroll position and the
   * visitor lands halfway down the page instead of on the wallpaper. Taking
   * `scrollRestoration` off `auto` is what stops the browser overriding us, and
   * it is put back on unmount so back/forward elsewhere behaves normally.
   */
  useEffect(() => {
    if (typeof history === "undefined") return
    const previous = history.scrollRestoration
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => {
      history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setIndex((current) => (current + 1) % total), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [autoplay, total])

  /**
   * A new creed for every new wallpaper.
   *
   * The draw happens in the timer callback, not inside a state updater, so the
   * updater stays pure. It also skips the very first run: the creed is already
   * server-rendered, and replacing it a moment after paint would flash.
   */
  useEffect(() => {
    // Runs on mount too, so a refresh also draws a fresh creed. Deferred one
    // tick so it never fights the server-rendered markup.
    const id = setTimeout(() => {
      const count = mottos.length
      if (count <= 1) {
        setMottoIndex(0)
        return
      }
      let draw = Math.floor(Math.random() * count)
      if (draw === mottoRef.current) {
        draw = (draw + 1 + Math.floor(Math.random() * (count - 1))) % count
      }
      mottoRef.current = draw
      setMottoIndex(draw)
    }, 60)
    return () => clearTimeout(id)
  }, [index, mottos.length])

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + total) % total)
      // Session-only hold: picking a slide stops the rotation now, but it must
      // not switch the setting off for future visits.
      setEngaged(true)
    },
    [total]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        step(-1)
      }
      if (event.key === "ArrowRight") {
        event.preventDefault()
        step(1)
      }
    },
    [step]
  )

  const handleBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setEngaged(false)
    }
  }, [])

  const arrowClass =
    "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/70 text-foreground outline-none transition-colors duration-200 hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  const controlRing =
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.region[locale]}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={handleBlur}
      className="relative -mt-16 w-full overflow-hidden bg-background"
    >
      <div className="relative h-svh min-h-[32rem] w-full">
        {total === 0 ? (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: homeBanner.placeholderBackground }}
          />
        ) : (
          slides.map((slide, slideIndex) => {
            const active = slideIndex === index
            return (
              <div
                key={slide.src}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                  active ? "opacity-100" : "opacity-0"
                )}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt[locale]}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  quality={90}
                  className="size-full object-cover object-center"
                />
              </div>
            )
          })
        )}

        {/* Darkens the bottom edge so the enter button keeps its contrast.
            Deliberately NOT the page background: over a photograph a
            page-coloured fade becomes a white wash in light mode, which is what
            made the bottom of the cover look hazy. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-neutral-950/85 via-neutral-950/40 to-transparent"
        />

        {/* Everything below is pinned to the dark palette. */}
        <div className="dark absolute inset-0">
          <style>{BANNER_CSS}</style>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: scrim }}
          />

          {/* Water along the bottom edge, above the scrim and below the controls.
              Tall enough to read as sea rather than a stripe. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 overflow-hidden sm:h-44"
          >
            {WAVES.map((wave) => (
              <svg
                key={wave.className}
                className={`absolute inset-0 h-full w-[200%] ${wave.className}`}
                viewBox="0 0 2880 120"
                preserveAspectRatio="none"
                focusable="false"
              >
                <path d={wave.d} fill="#ffffff" fillOpacity={wave.opacity} />
              </svg>
            ))}
          </div>

          <Container className="relative flex h-full flex-col items-center justify-center pb-20 text-center">
            <p className="text-gradient-brand font-heading text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
              {dict.home.name}
            </p>

            {/* The creed, under the wordmark: revealed from the middle outwards
                like a text field being typed into. `key` re-mounts it when the
                creed changes, which is what restarts the reveal. */}
            <p
              key={mottoIndex}
              className={cn(
                "mt-5 font-mono text-xs text-foreground/90 sm:text-sm",
                // No creed drawn yet (first frame on the client): stay invisible
                // rather than flashing empty text.
                mottoIndex < 0 && "invisible"
              )}
            >
              <span className="motto-type">
                {mottoIndex < 0 ? "" : mottos[mottoIndex][locale]}
              </span>
            </p>

            <div data-slot="hero-player" className="mt-8 w-full max-w-sm">
              <CoverMusicControls locale={locale} />
            </div>
          </Container>

          {/* The way into the page: a bare down arrow, no button, no label text.
              Still a real anchor with an accessible name, so it works without
              JavaScript and is announced properly. */}
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
            <a
              href="#content"
              aria-label={labels.enter[locale]}
              className={cn(
                // A dark shadow keeps a light arrow legible now that it floats
                // over near-white water, and is invisible over dark photos.
                "arrow-bob grid size-11 place-items-center rounded-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] transition-colors duration-200 hover:text-white",
                controlRing
              )}
            >
              <ChevronDown aria-hidden className="size-5" />
            </a>
          </div>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={labels.previous[locale]}
                className={cn(arrowClass, "left-3 sm:left-6")}
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={labels.next[locale]}
                className={cn(arrowClass, "right-3 sm:right-6")}
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>

              {showRotationControl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (rotationRunning) {
                      updateSettings({ carouselAutoplay: false })
                      return
                    }
                    // Starting again also releases the session hold, otherwise
                    // `engaged` would keep it stopped and the button would lie.
                    setEngaged(false)
                    updateSettings({ carouselAutoplay: true })
                  }}
                  aria-label={
                    rotationRunning ? labels.pauseRotation[locale] : labels.startRotation[locale]
                  }
                  aria-pressed={rotationRunning}
                  className={cn(
                    "absolute right-4 bottom-5 z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-background/80 text-muted-foreground hover:text-foreground sm:right-6",
                    controlRing
                  )}
                >
                  {rotationRunning ? (
                    <Pause aria-hidden className="size-3.5" />
                  ) : (
                    <Play aria-hidden className="size-3.5" />
                  )}
                </button>
              ) : null}
            </>
          ) : null}

          {/* The dots are gone, but the current position is still announced. */}
          <p className="sr-only" aria-live="polite">
            {labels.counter[locale]
              .replace("{n}", String(index + 1))
              .replace("{total}", String(total))}
          </p>

          {credit ? (
            <p className="absolute bottom-5 left-4 rounded-full border border-border/60 bg-background/70 px-3 py-1 font-mono text-[0.6875rem] text-muted-foreground sm:left-6">
              {credit[locale]}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
