"use client"

import { useState } from "react"

import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** Wheel geometry, in the 200×200 viewBox. */
const CENTRE = 100
const RADIUS = 86
const SPIN_MS = 2600
const FULL_TURNS = 5

const copy = {
  eyebrow: { zh: "随便读", en: "Pick one" },
  title: { zh: "随机阅读", en: "Random read" },
  intro: {
    zh: "不知道从哪读起的时候，让转盘决定。",
    en: "When you cannot decide where to start, let the wheel decide.",
  },
  spin: { zh: "转一下", en: "Spin" },
  spinning: { zh: "转动中…", en: "Spinning…" },
  again: { zh: "再转一次", en: "Spin again" },
  result: { zh: "转到", en: "Landed on" },
  read: { zh: "去读", en: "Read it" },
  hint: { zh: `${"{n}"} 篇在轮盘上`, en: `${"{n}"} articles on the wheel` },
}

export interface WheelItem {
  slug: string
  title: string
  topic: string
}

interface RandomPickWheelProps {
  items: readonly WheelItem[]
  locale: Locale
}

/**
 * 随机阅读转盘.
 *
 * ## The landing always matches the result
 *
 * The target is drawn **first**, then the rotation is computed to put that
 * slice under the pointer. The other way round — spin, then read off whatever
 * happens to be under the pointer — depends on reconciling a CSS transition's
 * final transform with React state, and it drifts by a fraction of a degree per
 * spin until the wheel and the caption disagree.
 *
 * ## Motion
 *
 * `prefers-reduced-motion` skips the spin entirely and reveals the pick at once.
 * The animation is decoration; the article is the content.
 *
 * ## Accessibility
 *
 * The wheel is `aria-hidden` — it is a picture of a decision. The announcement is
 * the `aria-live` line, which names the article the moment the spin ends.
 */
export function RandomPickWheel({ items, locale }: RandomPickWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)

  const total = items.length
  const sector = total > 0 ? 360 / total : 360

  function slicePath(index: number): string {
    const start = ((index * sector - 90) * Math.PI) / 180
    const end = (((index + 1) * sector - 90) * Math.PI) / 180
    const x0 = CENTRE + RADIUS * Math.cos(start)
    const y0 = CENTRE + RADIUS * Math.sin(start)
    const x1 = CENTRE + RADIUS * Math.cos(end)
    const y1 = CENTRE + RADIUS * Math.sin(end)
    const large = sector > 180 ? 1 : 0
    return `M${CENTRE} ${CENTRE} L${x0} ${y0} A${RADIUS} ${RADIUS} 0 ${large} 1 ${x1} ${y1} Z`
  }

  function spin() {
    if (spinning || total === 0) return

    const next = Math.floor(Math.random() * total)
    setPicked(next)

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      // No spin at all: the result is the part that matters.
      setRotation(rotation)
      return
    }

    // Where the slice centre already sits, and where it has to end up (0° = 12
    // o'clock under the pointer).
    const centre = next * sector + sector / 2
    const desired = (360 - centre) % 360
    const current = ((rotation % 360) + 360) % 360
    const delta = ((desired - current + 360) % 360) + FULL_TURNS * 360

    setSpinning(true)
    setRotation(rotation + delta)
    window.setTimeout(() => setSpinning(false), SPIN_MS)
  }

  const chosen = picked !== null ? items[picked] : null

  return (
    <section
      aria-label={copy.title[locale]}
      className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 p-6"
    >
      <p className="eyebrow text-muted-foreground">{copy.eyebrow[locale]}</p>
      <h2 className="font-heading mt-1 text-lg font-semibold tracking-tight">
        {copy.title[locale]}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.intro[locale]}</p>

      <div className="relative mx-auto mt-4 flex items-center justify-center">
        {/* Pointer, fixed while the wheel turns under it. */}
        <span
          aria-hidden
          className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border-x-[6px] border-t-8 border-x-transparent border-t-brand"
        />
        <svg viewBox="0 0 200 200" className="size-52" aria-hidden focusable="false">
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CENTRE}px ${CENTRE}px`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                : undefined,
            }}
          >
            {items.map((item, index) => {
              const mid = ((index + 0.5) * sector - 90) * (Math.PI / 180)
              const labelX = CENTRE + RADIUS * 0.62 * Math.cos(mid)
              const labelY = CENTRE + RADIUS * 0.62 * Math.sin(mid)
              const active = picked === index
              return (
                <g key={item.slug}>
                  <path
                    d={slicePath(index)}
                    fill={`oklch(0.62 0.13 ${150 + index * 28})`}
                    stroke="var(--background)"
                    strokeWidth={1.5}
                    opacity={spinning || picked === null || active ? 1 : 0.45}
                    className="transition-opacity duration-300"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-mono text-[13px] font-semibold"
                  >
                    {index + 1}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || total === 0}
        className={cn(
          "mt-5 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-[var(--brand-foreground)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-60",
          focusRing
        )}
      >
        {spinning
          ? copy.spinning[locale]
          : picked === null
            ? copy.spin[locale]
            : copy.again[locale]}
      </button>

      {/* The announcement: the only part of this that assistive tech needs. */}
      <div aria-live="polite" className="mt-3 min-h-12 text-center">
        {chosen && !spinning ? (
          <>
            <p className="text-[0.625rem] text-muted-foreground">
              {copy.result[locale]} · {chosen.topic}
            </p>
            <a
              href={`/blog/${chosen.slug}`}
              className={cn("mt-0.5 inline-flex text-sm font-medium text-brand hover:underline", focusRing)}
            >
              {chosen.title}
            </a>
          </>
        ) : null}
      </div>

      <p className="mt-auto pt-2 text-center font-mono text-[0.625rem] text-muted-foreground">
        {copy.hint[locale].replace("{n}", String(total))}
      </p>
    </section>
  )
}
