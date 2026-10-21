"use client"

import { ArrowLeft, ArrowRight, CornerDownRight, Dices } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const SPIN_MS = 3200
const STEP_MS = 520
/** Cards past this angle face away; showing them would mirror the titles. */
const MAX_ANGLE = 96
/** A gap of one third of a card, so a card occupies 3/4 of the arc it is given. */
const GAP_RATIO = 1 / 3

const copy = {
  previous: { zh: "上一篇", en: "Previous" },
  next: { zh: "下一篇", en: "Next" },
  open: { zh: "打开这篇", en: "Open this one" },
  pick: { zh: "转到这篇", en: "Turn to this one" },
  spin: { zh: "随机一篇", en: "Pick one" },
  spinning: { zh: "转动中…", en: "Spinning…" },
  hint: {
    zh: "转一下，停在正面的那篇就是结果；也可以左右自己挑。",
    en: "Spin, and whatever stops at the front is the pick — or turn it yourself.",
  },
}

function fallbackCover(id: string): string {
  let hue = 180
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return `linear-gradient(150deg, oklch(0.56 0.13 ${hue}), oklch(0.76 0.11 ${(hue + 54) % 360}))`
}

export interface StageItem {
  slug: string
  title: string
  summary: string
  topic: string
  date: string
  cover?: string
}

/**
 * 随机文章 picker — the articles standing in a **cylinder ring**.
 *
 * ## Flat cards, ring arrangement
 *
 * The cards are ordinary flat panels. The cylinder comes entirely from the
 * arrangement: each card sits at `i × 360/N` degrees on a circle of `drumRadius`,
 * turned to face outward, and the whole ring rotates. That reads as a drum without
 * bending any card, and the text stays sharp because it is never transformed
 * per-strip.
 *
 * ## Width comes from the geometry
 *
 * A card gets `2πR / N` of arc. Keeping a gap of a third of a card means the card
 * occupies three quarters of that arc, so the width is derived rather than picked
 * — change the count or the radius and the gap stays one third.
 *
 * ## Five, not ten, on screen
 *
 * A ring can only show its front arc: past 90° the cards curve back behind the
 * drum, and showing their reverse mirrors the titles. `MAX_ANGLE` therefore stops
 * just short of that, which is why five cards are visible at once.
 *
 * ## The spin picks first
 *
 * The target index is drawn before the ring moves, then the ring is stepped to it
 * with an ease-in-out curve — accelerate, then brake. Every frame commits an
 * integer index, so the card at the front is the one held in state.
 */
export function RandomStage({
  items,
  locale,
  onDone,
  autoSpin = false,
  compact = false,
  tone = "light",
}: {
  items: readonly StageItem[]
  locale: Locale
  onDone?: (slug: string) => void
  autoSpin?: boolean
  compact?: boolean
  tone?: "light" | "dark"
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  /** Continuous position in card slots, used while the ring turns. */
  const [position, setPosition] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const frame = useRef(0)

  const total = items.length
  const step = total > 0 ? 360 / total : 360
  const current = items[index]

  /* The drum is sized so its visible arc spans about two thirds of the viewport,
     and the cards are portrait — narrow and tall. */
  const drumRadius = compact ? 600 : 560
  const arc = (2 * Math.PI * drumRadius) / Math.max(1, total)
  const cardWidth = Math.min(compact ? 300 : 280, Math.round(arc / (1 + GAP_RATIO)))
  const cardHeight = cardWidth

  function turn(delta: number) {
    if (spinning || total === 0) return
    setIndex((value) => (value + delta + total) % total)
    setPosition((value) => value + delta)
  }

  /* `laps` is a whole number of extra turns. Fractional laps would leave `position`
     off the slot grid after the spin settles, and the ring would stop between cards. */
  function travelTo(target: number, duration = SPIN_MS, laps = 2) {
    const start = performance.now()
    const from = position
    const forward = (target - from + total) % total
    const steps = forward + total * laps

    setSpinning(true)

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      // Accelerate, then brake.
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
      const reached = from + eased * steps
      setPosition(reached)
      setIndex(((Math.round(reached) % total) + total) % total)

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      setIndex(target)
      setPosition(from + steps)
      setSpinning(false)
      window.setTimeout(() => onDone?.(items[target].slug), 1000)
    }

    frame.current = requestAnimationFrame(tick)
  }

  function spin() {
    if (spinning || total === 0) return
    const target = Math.floor(Math.random() * total)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* Reduced motion still gets movement — a short single pass. Jumping straight
         to the article read as "the button did nothing". */
      travelTo(target, 900, 0)
      return
    }

    // Two or three whole turns, drawn per spin.
    travelTo(target, SPIN_MS, 2 + Math.floor(Math.random() * 2))
  }

  function open(slug: string) {
    router.push(`/blog/${slug}`)
  }

  /* No "already spun" latch here on purpose.
   *
   * React StrictMode runs effects twice in development: a latch set on the first
   * run survives into the second, which then skips the spin — the wheel opened and
   * never moved, but only in `next dev`. Letting the cleanup cancel the timer is
   * enough: the first run is cancelled, the second fires exactly one spin. */
  useEffect(() => {
    if (!autoSpin || total === 0) return
    const timer = window.setTimeout(spin, 500)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, total])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  if (total === 0) return null

  return (
    <div>
      <div
        className={cn(
          "relative overflow-x-clip [perspective:1500px]",
          compact ? "h-[24rem]" : "h-[20rem] sm:h-[23rem]"
        )}
      >
        <div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={{
            transform: `translateZ(-${drumRadius}px) rotateY(${-position * step}deg)`,
            transition: spinning ? "none" : `transform ${STEP_MS}ms ease-out`,
          }}
        >
          {items.map((item, itemIndex) => {
            // Signed angle from the front, in degrees.
            let offset = ((((itemIndex - position) % total) + total) % total) * step
            if (offset > 180) offset -= 360
            if (Math.abs(offset) > MAX_ANGLE) return null

            const front = Math.abs(offset) < step / 2
            const background = item.cover ? `url(${item.cover})` : fallbackCover(item.slug)

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => (front ? open(item.slug) : turn(offset > 0 ? 1 : -1))}
                aria-label={
                  front
                    ? `${copy.open[locale]}: ${item.title}`
                    : `${copy.pick[locale]}: ${item.title}`
                }
                className={cn(
                  "absolute top-1/2 left-1/2 overflow-hidden rounded-lg bg-neutral-900",
                  /* The front card is the answer, so it gets a heavier frame and a
                     slightly larger footprint than its neighbours. */
                  front
                    ? "border-2 border-white/70 ring-2 ring-brand/40"
                    : "border border-border/40",
                  focusRing
                )}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  marginLeft: -cardWidth / 2,
                  marginTop: -cardHeight / 2,
                  transform: `rotateY(${itemIndex * step}deg) translateZ(${drumRadius}px) scale(${
                    front ? 1.06 : 1
                  })`,
                  opacity: front ? 1 : 0.26,
                  boxShadow: front ? "0 30px 60px -18px rgba(0,0,0,0.8)" : undefined,
                  transition: "opacity 300ms ease",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: background }}
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/90 via-black/50 to-transparent"
                />
                <span
                      className={cn(
                        "absolute inset-x-0 line-clamp-2 px-3 text-left font-heading font-semibold leading-snug text-white drop-shadow",
                        compact ? "text-xs" : "text-sm"
                      )}
                      style={{ bottom: 30 }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="absolute inset-x-0 px-3 text-left font-mono text-[0.5625rem] text-white/60"
                      style={{ bottom: 14 }}
                    >
                      {item.date} · {item.topic}
                    </span>

              </button>
            )
          })}
        </div>
      </div>

      <div className={cn("text-center", compact ? "mt-1" : "mt-3")}>
        <p
          aria-live="polite"
          className={cn(
            "font-heading font-semibold tracking-tight text-balance",
            tone === "dark" ? "text-white drop-shadow-lg" : "",
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          )}
        >
          {current.title}
        </p>
        <p
          className={cn(
            "mt-1 line-clamp-2 text-xs",
            tone === "dark" ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {current.summary}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[0.625rem]",
            tone === "dark" ? "text-white/40" : "text-muted-foreground"
          )}
        >
          {current.date} · {current.topic}
        </p>
      </div>

      {compact ? (
        <p
          aria-live="polite"
          className="mt-1 text-center font-mono text-[0.625rem] text-muted-foreground"
        >
          {spinning ? copy.spinning[locale] : ""}
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => turn(-1)}
              disabled={spinning}
              aria-label={copy.previous[locale]}
              className={cn(
                "grid size-11 place-items-center rounded-full border border-border/60 text-foreground transition-colors duration-200 hover:bg-muted disabled:opacity-40",
                focusRing
              )}
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>

            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-[var(--brand-foreground)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-60",
                focusRing
              )}
            >
              <Dices aria-hidden className="size-4" />
              {spinning ? copy.spinning[locale] : copy.spin[locale]}
            </button>

            <button
              type="button"
              onClick={() => turn(1)}
              disabled={spinning}
              aria-label={copy.next[locale]}
              className={cn(
                "grid size-11 place-items-center rounded-full border border-border/60 text-foreground transition-colors duration-200 hover:bg-muted disabled:opacity-40",
                focusRing
              )}
            >
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => open(current.slug)}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline",
                focusRing
              )}
            >
              {copy.open[locale]}
              <CornerDownRight aria-hidden className="size-3.5" />
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">{copy.hint[locale]}</p>
        </>
      )}
    </div>
  )
}
