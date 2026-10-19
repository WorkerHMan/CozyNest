"use client"

import { ChevronUp } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const SIZE = 40
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** How long after the last scroll event the ring switches back to the arrow. */
const IDLE_MS = 1100

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  window.addEventListener("resize", onChange)
  return () => {
    window.removeEventListener("scroll", onChange)
    window.removeEventListener("resize", onChange)
  }
}

/** 0 at the top, 100 at the bottom, integer. */
function getProgress(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  if (scrollable <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)))
}

const getProgressOnServer = () => 0

const copy = {
  /* Visible text stays short; the accessible name keeps the verb, and still
     contains the visible word (WCAG "label in name"). */
  backToTop: { zh: "顶部", en: "Top" },
  ariaBack: { zh: "回到顶部", en: "Back to top" },
  read: { zh: "已浏览", en: "Read" },
}

/**
 * The scroll ring at the right end of the header.
 *
 * Two states, both driven by the scroll position:
 *
 *  - **While scrolling**: a bare ring with the percentage inside (0 at the top,
 *    100 at the bottom).
 *  - **Once you stop** (about a second): the number becomes an up arrow and the
 *    words 回到顶部 appear beside the ring. At rest the useful thing to say is
 *    what the control does, not a number nobody is watching.
 *
 * The ring stays in both states — the words are added to it, not swapped for it,
 * so the control never changes its visual anchor in the header.
 *
 * Scroll position is external state, read through `useSyncExternalStore` rather
 * than copied into React state on every event; only the idle flag is state, and
 * it is set from the event handler, never synchronously in the effect.
 *
 * At 0 the button is disabled: there is nowhere to go, and a control that does
 * nothing is worse than one that says so.
 */
export function ScrollRing({ locale }: { locale: Locale }) {
  const progress = useSyncExternalStore(subscribeScroll, getProgress, getProgressOnServer)
  const [idle, setIdle] = useState(true)

  useEffect(() => {
    let timer: number | undefined

    function onScroll() {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), IDLE_MS)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  function scrollToTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }

  const label =
    progress === 0
      ? copy.ariaBack[locale]
      : `${copy.ariaBack[locale]} · ${copy.read[locale]} ${progress}%`

  return (
    <button
      type="button"
      onClick={scrollToTop}
      disabled={progress === 0}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-11 shrink-0 items-center gap-1.5 rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground",
        focusRing,
        idle ? "pr-1 pl-0.5" : "w-11 justify-center",
        /* Gone at the top of the page. `invisible` rather than unmounting: the
           element keeps its box, so the header's right group does not reflow as
           you start scrolling — and `visibility: hidden` also drops it from the
           tab order and the accessibility tree. */
        progress === 0 && "invisible"
      )}
    >
      <span className="relative grid size-10 shrink-0 place-items-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute size-10 -rotate-90"
          aria-hidden
          focusable="false"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-border"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
            className="stroke-brand transition-[stroke-dashoffset] duration-150"
          />
        </svg>

        {idle ? (
          <ChevronUp aria-hidden className="size-4" />
        ) : (
          <span className="font-mono text-[0.625rem] tabular-nums">{progress}</span>
        )}
      </span>

      {/* The words only exist at rest, and only where there is room for them: a
          phone header has none. */}
      {idle ? (
        <span className="hidden text-xs whitespace-nowrap sm:inline">
          {copy.backToTop[locale]}
        </span>
      ) : null}
    </button>
  )
}
