"use client"

import { Eye, EyeOff, Pause, Play } from "lucide-react"
import { useCallback, useEffect, useRef, type RefObject } from "react"

import { homeBanner } from "@/config/home-banner"
import { paimon } from "@/config/paimon"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * The quick menu, arranged as an arc around the mascot's right half.
 *
 * ## Why an arc and not a drawer
 *
 * The owner asked for the menu to hug Paimon's right side rather than slide over
 * the page. Two items sit on a circle at ±30°, so they read as one curved bar
 * rather than a list.
 *
 * ## Geometry
 *
 * Everything is measured from the figure's centre, which is also the element's
 * `50% 50%` — the mascot is positioned by its centre, so `calc(50% + x)` lands
 * the items relative to the character rather than to the viewport.
 *
 * The radius is `size / 2 + 30`: just clear of the silhouette. Because the
 * mascot is clamped so its right edge stays on screen with 205px of room, the
 * items' outer edge always fits too.
 *
 * Buttons are 44 × 44 with only an icon, so each one carries its state in
 * `aria-pressed` and its meaning in `aria-label`; `title` gives the mouse user
 * the same words.
 */
const ANGLES_DEG = [-30, 30]

export interface PaimonQuickMenuProps {
  locale: Locale
  carouselAutoplay: boolean
  paimonEnabled: boolean
  onToggleCarousel: () => void
  onTogglePaimon: () => void
  /** Restarts the auto-dismiss countdown. */
  onInteraction: () => void
  firstItemRef: RefObject<HTMLButtonElement | null>
}

export function PaimonQuickMenu({
  locale,
  carouselAutoplay,
  paimonEnabled,
  onToggleCarousel,
  onTogglePaimon,
  onInteraction,
  firstItemRef,
}: PaimonQuickMenuProps) {
  const { labels } = paimon
  const radius = paimon.size / 2 + 30

  const items = [
    {
      key: "carousel",
      // The same words the cover's own pause button uses, so the two controls
      // are recognisably the same setting.
      label: carouselAutoplay
        ? homeBanner.labels.pauseRotation[locale]
        : homeBanner.labels.startRotation[locale],
      pressed: carouselAutoplay,
      icon: carouselAutoplay ? Pause : Play,
      onSelect: onToggleCarousel,
    },
    {
      key: "paimon",
      label: labels.showPaimon[locale],
      pressed: paimonEnabled,
      icon: paimonEnabled ? Eye : EyeOff,
      onSelect: onTogglePaimon,
    },
  ]

  return (
    <div
      role="group"
      aria-label={labels.menu[locale]}
      className="pointer-events-none absolute inset-0 z-20"
    >
      {items.map((item, index) => {
        const radians = (ANGLES_DEG[index] * Math.PI) / 180
        const x = Math.cos(radians) * radius
        const y = Math.sin(radians) * radius
        const Icon = item.icon
        return (
          <button
            key={item.key}
            ref={index === 0 ? firstItemRef : undefined}
            type="button"
            onClick={item.onSelect}
            onPointerEnter={onInteraction}
            onPointerMove={onInteraction}
            onFocus={onInteraction}
            aria-label={item.label}
            aria-pressed={item.pressed}
            title={item.label}
            style={{ left: `calc(50% + ${x.toFixed(1)}px)`, top: `calc(50% + ${y.toFixed(1)}px)` }}
            className={cn(
              "pointer-events-auto absolute grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border shadow-lg transition-colors duration-200",
              focusRing,
              item.pressed
                ? "border-transparent bg-brand text-[var(--brand-foreground)] hover:opacity-90"
                : "border-border-strong bg-background/95 text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * Counts down to the menu closing itself.
 *
 * Returns `bump`, which restarts the countdown; the caller runs that on every
 * interaction with the menu so a visitor who is mid-decision never has it vanish
 * underneath them.
 */
export function useAutoDismiss(open: boolean, timeoutMs: number, onExpire: () => void) {
  const timer = useRef<number | undefined>(undefined)
  const expire = useRef(onExpire)

  // Sync in an effect rather than during render: writing a ref while rendering
  // is exactly what concurrent rendering forbids.
  useEffect(() => {
    expire.current = onExpire
  }, [onExpire])

  const clear = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current)
      timer.current = undefined
    }
  }, [])

  const bump = useCallback(() => {
    clear()
    timer.current = window.setTimeout(() => expire.current(), timeoutMs)
  }, [clear, timeoutMs])

  useEffect(() => {
    if (!open) {
      clear()
      return
    }
    bump()
    return clear
  }, [open, bump, clear])

  return bump
}
