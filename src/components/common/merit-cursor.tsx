"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"
import { merit } from "@/config/merit"
import type { Locale } from "@/i18n"

/** Keeps rapid clicking from flooding the DOM. */
const MAX_BUBBLES = 18

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReduceMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCE_MOTION_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const getReduceMotion = () => window.matchMedia(REDUCE_MOTION_QUERY).matches
const getReduceMotionOnServer = () => false

const { cursor, cursorHotspot, rewards, cursorStruck, strikeMs } = merit

/**
 * Set on `<html>` while the "struck" frame should be shown.
 *
 * Scoped to `html` and inherited, deliberately **not** `html *`: buttons and
 * links keep their own `cursor: pointer`, so a clickable control never disguises
 * itself as a decorative knock.
 */
const STRIKE_CLASS = "cursor-struck"

/**
 * The wooden-fish cursor and its floating merit counter.
 *
 * The cursor is declared on `html` and therefore inherited by everything that
 * does not set its own — which means buttons and links keep `cursor: pointer`.
 * That is deliberate: a clickable control should still look clickable.
 *
 * It is gated on `(pointer: fine)` because touch devices have no cursor at all.
 *
 * The keys are declared here rather than in `globals.css` so the whole easter
 * egg stays self-contained and can be removed by deleting one component.
 */
/*
 * The rise is an absolute distance (`--rise`) rather than a percentage of the
 * element: a percentage resolves against the span's own height, so the previous
 * -220% only travelled about 44px and the counter barely appeared to move.
 *
 * The colour starts dark and lightens as it goes, while opacity falls the whole
 * way from its fade-in to zero — so the whole life of the bubble reads as one
 * continuous "dark, then slowly fading away" rather than a bright pop that only
 * dims at the end.
 *
 * A light glow (set in the component) keeps the dark glyphs legible while they
 * are still dark, over both the photo cover and the light page.
 */
const EASTER_EGG_CSS = `
@media (pointer: fine) {
  html {
    cursor: url("${cursor}") ${cursorHotspot.x} ${cursorHotspot.y}, auto;
  }
  html.${STRIKE_CLASS} {
    cursor: url("${cursorStruck}") ${cursorHotspot.x} ${cursorHotspot.y}, auto;
  }
}

@keyframes merit-float {
  0% {
    opacity: 0;
    color: #3a2a12;
    transform: translate(calc(-50% + 0px), calc(-50% - 0px)) scale(0.85);
  }
  10% {
    opacity: 0.95;
    color: #4a3517;
    transform: translate(calc(-50% + calc(var(--drift) * 0.1)), calc(-50% - calc(var(--rise) * 0.1))) scale(1);
  }
  100% {
    opacity: 0;
    color: #e6cb96;
    transform: translate(calc(-50% + var(--drift)), calc(-50% - var(--rise))) scale(1.08);
  }
}

@keyframes merit-fade {
  0%   { opacity: 0; }
  25%  { opacity: 1; }
  100% { opacity: 0; }
}

/*
 * The knock. Unlike the cursor — a static bitmap that cannot be animated — this
 * is a page element, so it can expand for real. It mirrors the text: dark amber
 * ring widening and lightening as it fades, centred on the click point.
 */
@keyframes merit-knock {
  0% {
    opacity: 0.85;
    border-color: #8a5a1a;
    transform: translate(-50%, -50%) scale(0.3);
  }
  55% {
    opacity: 0.45;
  }
  100% {
    opacity: 0;
    border-color: #f2ddb0;
    transform: translate(-50%, -50%) scale(1.95);
  }
}
`

interface Bubble {
  id: number
  x: number
  y: number
  drift: number
  /** Index into `merit.rewards`. */
  reward: number
}

export function MeritCursor({ locale }: { locale: Locale }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const nextId = useRef(0)
  /** Last reward drawn, so two clicks never show the same word twice running. */
  const lastReward = useRef(-1)
  /** Pending timer that clears the struck-cursor state. */
  const strikeTimer = useRef<number | undefined>(undefined)
  const reduced = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotion,
    getReduceMotionOnServer
  )

  useEffect(() => {
    const total = rewards.length

    /**
     * Uniform random, excluding the previous draw. Drawn in the handler rather
     * than inside the state updater so the updater stays pure.
     */
    function drawReward(): number {
      if (total <= 1) return 0
      let index = Math.floor(Math.random() * total)
      if (index === lastReward.current) {
        // Any non-zero shift lands on a different reward.
        index = (index + 1 + Math.floor(Math.random() * (total - 1))) % total
      }
      lastReward.current = index
      return index
    }

    function handlePointerDown(event: PointerEvent) {
      // Primary button only: right-click and drags should not rack up merit.
      if (event.button !== 0) return

      // The knock: swap the cursor to the struck frame for a moment. A CSS
      // cursor cannot animate, so a second frame is the only way to show impact.
      // The timeout guarantees it stays visible even on a very fast click.
      const root = document.documentElement
      root.classList.add(STRIKE_CLASS)
      window.clearTimeout(strikeTimer.current)
      strikeTimer.current = window.setTimeout(() => {
        root.classList.remove(STRIKE_CLASS)
      }, strikeMs)

      const drift = Math.round((Math.random() - 0.5) * 44)
      const reward = drawReward()
      setBubbles((previous) => {
        const next = [
          ...previous,
          { id: nextId.current++, x: event.clientX, y: event.clientY, drift, reward },
        ]
        return next.length > MAX_BUBBLES ? next.slice(next.length - MAX_BUBBLES) : next
      })
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.clearTimeout(strikeTimer.current)
      // Never leave the pressed frame stuck on after unmount.
      document.documentElement.classList.remove(STRIKE_CLASS)
    }
  }, [])

  const remove = useCallback((id: number) => {
    setBubbles((previous) => previous.filter((bubble) => bubble.id !== id))
  }, [])

  return (
    <>
      <style>{EASTER_EGG_CSS}</style>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      >
        {bubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="absolute"
            style={{ left: bubble.x, top: bubble.y }}
          >
            {/* The knock ring: expands from the click point in ~620ms. Skipped
                under reduced motion, where only the text's fade remains. */}
            {!reduced ? (
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 size-11 rounded-full border-2"
                style={{
                  animation: "merit-knock 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                }}
              />
            ) : null}

            <span
              onAnimationEnd={() => remove(bubble.id)}
              className="absolute top-0 left-0 font-heading text-sm font-semibold whitespace-nowrap"
              style={
                {
                  // Base colour for the no-motion variant; the float keyframes
                  // animate `color` from dark to light on top of this.
                  color: "#c8a86f",
                  // A light halo is what makes dark glyphs readable on the dark
                  // photo cover, and is invisible on the light page anyway.
                  filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                  // Absolute travel distance, so "how high it floats" is a single
                  // readable number rather than a percentage of the text height.
                  "--drift": `${bubble.drift}px`,
                  "--rise": "215px",
                  animation: reduced
                    ? "merit-fade 1200ms ease-out forwards"
                    : "merit-float 2000ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                } as CSSProperties
              }
            >
              {rewards[bubble.reward].label[locale]} {merit.increment}
            </span>
          </span>
        ))}
      </div>
    </>
  )
}
