"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * The "磁力棒" field: bars radiating from a centre that lean toward the pointer.
 *
 * Implements the parameters recorded in the design system's motion section:
 *  - pull is clamped (`PULL`) so a bar can never leave its own hit box;
 *  - movement uses one springy easing token rather than per-bar timing;
 *  - **only one focal element per screen** carries this effect — it is not a
 *    global cursor replacement;
 *  - under `prefers-reduced-motion`, or on a coarse pointer, the bars are set
 *    once to their neutral final state and no listener is attached.
 *
 * Pointer moves write `style.transform` directly through refs: routing them
 * through React state would re-render the tree on every mouse event.
 */

const BAR_COUNT = 24
const PULL = 0.3
const MAX_SHIFT = 26
/** Base distance from the centre, in rem; also read by the reset transform. */
const BAR_BASE = "3.25rem"

export function MagneticField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bars = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const angleOf = (i: number) => (i * 360) / BAR_COUNT
    const transformFor = (i: number, shift = 0) =>
      `rotate(${angleOf(i)}deg) translateX(calc(${BAR_BASE} + ${shift}px))`

    const reset = () => {
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = transformFor(i)
      })
    }

    const fine = window.matchMedia("(pointer: fine)")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!fine.matches || reduce.matches) {
      reset()
      return
    }

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      if (rect.width === 0) return
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)

      bars.current.forEach((bar, i) => {
        if (!bar) return
        const rad = (angleOf(i) * Math.PI) / 180
        // Project the pointer offset onto this bar's own axis.
        const projection = dx * Math.cos(rad) + dy * Math.sin(rad)
        const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, projection * PULL))
        bar.style.transform = transformFor(i, Math.round(shift))
      })
    }

    // Listening on the window (not the element) lets the bars react to the
    // pointer anywhere, while the field itself stays pointer-events-none so it
    // never steals clicks from what sits behind it.
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", reset)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", reset)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative size-0">
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                bars.current[i] = el
              }}
              className={cn(
                "absolute top-0 left-0 h-1 w-13 origin-left rounded-full",
                "bg-linear-to-r from-brand to-brand-2 opacity-80",
                "will-change-transform",
                "transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
                "motion-reduce:transition-none"
              )}
              style={{ transform: `rotate(${(i * 360) / BAR_COUNT}deg) translateX(${BAR_BASE})` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
