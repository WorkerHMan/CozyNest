"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import { PaimonFigure, PaimonSilhouette } from "@/components/paimon/paimon-figure"
import { PaimonQuickMenu, useAutoDismiss } from "@/components/paimon/paimon-quick-menu"
import { paimon } from "@/config/paimon"
import type { Locale } from "@/i18n"
import {
  getServerSnapshot,
  getSnapshot,
  hydrate,
  subscribe,
  update,
  type PaimonPosition,
} from "@/lib/site-settings"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * The mascot on the page.
 *
 * ## Behaviours
 *
 *  - **Idle**: breathing, blinking and a swaying ahoge, all pure CSS, so the
 *    global `prefers-reduced-motion` rule in `globals.css` stops them for free.
 *  - **Head follow**: one `pointermove` listener writes three CSS custom
 *    properties on the root instead of calling `setState` — a pointer moving at
 *    120 Hz must not re-render React. Clamped to ±6 px / ±8°.
 *  - **Click**: a 420 ms shake plus happy closed eyes and a speech bubble. The
 *    poke lives on `click`, not `pointerup`, so assistive technology can trigger
 *    it too; a drag suppresses the click that follows.
 *  - **Right-click**: opens the quick menu, an arc of buttons around the right
 *    half. It closes itself after 10 s without interaction, on Escape, or on a
 *    press outside.
 *  - **Switched off**: the figure is replaced by a faint handle that brings it
 *    back on click — without it there would be no way back.
 *
 * Clicks on the mascot are excluded from the merit counter via `data-paimon`.
 */
export function PaimonMascot({ locale }: { locale: Locale }) {
  const { paimonEnabled, paimonPosition, carouselAutoplay } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const [menuOpen, setMenuOpen] = useState(false)
  const [poked, setPoked] = useState(false)
  /** Bumped per poke so the one-shot shake animation restarts. */
  const [shakeKey, setShakeKey] = useState(0)
  const [dragPos, setDragPos] = useState<PaimonPosition | null>(null)
  const [bubble, setBubble] = useState<{ id: number; text: string; idle: boolean } | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLButtonElement>(null)
  const menuFirstItem = useRef<HTMLButtonElement>(null)
  const pokeTimer = useRef<number | undefined>(undefined)
  const bubbleTimer = useRef<number | undefined>(undefined)
  const lastLine = useRef(-1)
  const interacted = useRef(false)
  const drag = useRef<{
    startX: number
    startY: number
    baseX: number
    baseY: number
    moved: boolean
  } | null>(null)
  /** Set when a press turned into a drag, so the trailing click is ignored. */
  const suppressClick = useRef(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const bumpMenuTimer = useAutoDismiss(menuOpen, paimon.menuIdleMs, closeMenu)

  // Settings live in localStorage, which does not exist during prerender.
  useEffect(() => {
    hydrate()
  }, [])

  /** Draw a line that is never the same one twice in a row. */
  const drawLine = useCallback(() => {
    const total = paimon.lines.length
    let index = Math.floor(Math.random() * total)
    if (index === lastLine.current) index = (index + 1) % total
    lastLine.current = index
    return paimon.lines[index][locale]
  }, [locale])

  const say = useCallback(
    (idle: boolean) => {
      setBubble({ id: Date.now(), text: drawLine(), idle })
      window.clearTimeout(bubbleTimer.current)
      // Unmount after the fade, not before it: the fade-out is delayed by
      // `bubbleMs`, so removing the node at `bubbleMs` would skip it entirely.
      bubbleTimer.current = window.setTimeout(
        () => setBubble(null),
        paimon.bubbleMs + paimon.bubbleFadeMs
      )
    },
    [drawLine]
  )

  const poke = useCallback(() => {
    interacted.current = true
    setShakeKey((key) => key + 1)
    setPoked(true)
    window.clearTimeout(pokeTimer.current)
    pokeTimer.current = window.setTimeout(() => setPoked(false), paimon.pokeMs)
    say(false)
  }, [say])

  // Idle self-talk: only after the visitor has poked it once, and only while the
  // tab is visible.
  useEffect(() => {
    if (!paimonEnabled) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      if (!interacted.current) return
      say(true)
    }, paimon.idleMs)
    return () => window.clearInterval(id)
  }, [paimonEnabled, say])

  // Head follow. Skipped entirely on touch and under reduced motion.
  useEffect(() => {
    if (!paimonEnabled) return
    if (typeof window === "undefined") return
    const fine = window.matchMedia("(pointer: fine)")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!fine.matches || reduce.matches) return

    let frame = 0
    function onMove(event: PointerEvent) {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const node = rootRef.current
        if (!node) return
        const rect = node.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height * 0.45
        const dx = clamp((event.clientX - centerX) / 160, -1, 1)
        const dy = clamp((event.clientY - centerY) / 160, -1, 1)
        node.style.setProperty("--paimon-px", `${(dx * 6).toFixed(2)}px`)
        node.style.setProperty("--paimon-py", `${(dy * 4).toFixed(2)}px`)
        node.style.setProperty("--paimon-pr", `${(dx * 8).toFixed(2)}deg`)
      })
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [paimonEnabled])

  // While the menu is open: focus its first item, close on Escape, close on a
  // press outside the mascot.
  useEffect(() => {
    if (!menuOpen) return
    menuFirstItem.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setMenuOpen(false)
      mascotRef.current?.focus()
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest("[data-paimon]")) return
      setMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [menuOpen])

  useEffect(() => {
    return () => {
      window.clearTimeout(pokeTimer.current)
      window.clearTimeout(bubbleTimer.current)
    }
  }, [])

  const position = dragPos ?? paimonPosition ?? paimon.defaultPosition
  const { labels, clamp: limits } = paimon

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: position.x,
      baseY: position.y,
      moved: false,
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const state = drag.current
    if (!state) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < paimon.dragThresholdPx) return
    state.moved = true
    setDragPos({
      x: clamp(state.baseX + (dx / window.innerWidth) * 100, limits.minX, limits.maxX),
      y: clamp(state.baseY + (dy / window.innerHeight) * 100, limits.minY, limits.maxY),
    })
  }

  function handlePointerUp() {
    const state = drag.current
    drag.current = null
    if (!state) return
    if (state.moved) {
      // A drag is not a poke. Swallow the click that follows this pointerup.
      suppressClick.current = true
      if (dragPos) update({ paimonPosition: dragPos })
      setDragPos(null)
    }
  }

  function handleClick() {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    // A poke and the menu are mutually exclusive: poking closes the menu.
    setMenuOpen(false)
    poke()
  }

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault()
    setMenuOpen(true)
  }

  /**
   * The figure is positioned by its centre, so the percentages need a cap that
   * leaves room for the arc menu on the right — otherwise a 330px mascot at 92%
   * would put both the character and its menu off screen.
   */
  const positionStyle = {
    left: `min(${position.x}%, calc(100% - ${paimon.rightReserve}px))`,
    top: `min(${position.y}%, calc(100% - ${paimon.bottomReserve}px))`,
  }

  if (!paimonEnabled) {
    return (
      <>
        <button
          type="button"
          data-paimon
          onClick={() => update({ paimonEnabled: true })}
          onContextMenu={handleContextMenu}
          aria-label={labels.restore[locale]}
          title={labels.handleHint[locale]}
          style={positionStyle}
          className={cn(
            "fixed z-30 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border/40 bg-background/30 text-muted-foreground opacity-30 transition-opacity duration-200 hover:opacity-70 focus-visible:opacity-100",
            focusRing
          )}
        >
          <PaimonSilhouette size={18} />
        </button>
        {menuOpen ? (
          <div data-paimon style={positionStyle} className="fixed z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="relative size-11">
              <PaimonQuickMenu
                locale={locale}
                carouselAutoplay={carouselAutoplay}
                paimonEnabled={paimonEnabled}
                onToggleCarousel={() => {
                  update({ carouselAutoplay: !carouselAutoplay })
                  bumpMenuTimer()
                }}
                onTogglePaimon={() => {
                  update({ paimonEnabled: true })
                  setMenuOpen(false)
                }}
                onInteraction={bumpMenuTimer}
                firstItemRef={menuFirstItem}
              />
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div
      ref={rootRef}
      data-paimon
      style={positionStyle}
      className="fixed z-30 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative">
        {bubble ? (
          <div
            key={bubble.id}
            aria-live={bubble.idle ? "off" : "polite"}
            aria-atomic="true"
            className="pointer-events-none absolute right-0 bottom-full mb-2 w-max max-w-[15rem] rounded-2xl border border-border/60 bg-background/95 px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg"
            style={{
              animation: `paimon-bubble-in 220ms ease-out, paimon-bubble-out ${paimon.bubbleFadeMs}ms ease-in ${paimon.bubbleMs}ms forwards`,
            }}
          >
            {bubble.text}
          </div>
        ) : null}

        <button
          ref={mascotRef}
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          onPointerCancel={() => {
            drag.current = null
            setDragPos(null)
          }}
          onContextMenu={handleContextMenu}
          onKeyDown={(event) => {
            if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
              event.preventDefault()
              setMenuOpen(true)
            }
          }}
          aria-label={labels.poke[locale]}
          aria-expanded={menuOpen}
          title={labels.poke[locale]}
          className={cn("block cursor-grab touch-none rounded-full active:cursor-grabbing", focusRing)}
        >
          <div key={shakeKey} className={shakeKey ? "paimon-shake" : undefined}>
            <PaimonFigure
              mood={poked ? "poked" : "idle"}
              size={paimon.size}
              className="drop-shadow-[0_18px_30px_rgba(15,23,42,0.22)]"
            />
          </div>
        </button>

        {menuOpen ? (
          <PaimonQuickMenu
            locale={locale}
            carouselAutoplay={carouselAutoplay}
            paimonEnabled={paimonEnabled}
            onToggleCarousel={() => {
              update({ carouselAutoplay: !carouselAutoplay })
              bumpMenuTimer()
            }}
            onTogglePaimon={() => {
              update({ paimonEnabled: false })
              setMenuOpen(false)
            }}
            onInteraction={bumpMenuTimer}
            firstItemRef={menuFirstItem}
          />
        ) : null}
      </div>
    </div>
  )
}
