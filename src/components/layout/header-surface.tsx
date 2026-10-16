"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Scroll position as an external store. The snapshot is a boolean, so it is
 * stable across calls; subscribing to `scroll` is the external-system
 * subscription that `useSyncExternalStore` is for (an effect that called
 * `setState` on mount would be rejected by the React 19 lint rule).
 */
function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true })
  return () => window.removeEventListener("scroll", cb)
}
const getScrolled = () => window.scrollY > 24
const getScrolledOnServer = () => false

/**
 * The sticky header surface.
 *
 * Over the full-height gate the bar is nearly transparent so the wallpaper
 * reads edge to edge; once the visitor scrolls it becomes a solid, blurred bar.
 * It stays *present* in both states — the design system's landing rules require
 * navigation to remain visible, and a bar that is truly hidden until scroll
 * leaves keyboard users tabbing into off-screen controls.
 */
export function HeaderSurface({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolled,
    getScrolledOnServer
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled
          ? "border-border/60 bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      {children}
    </header>
  )
}
