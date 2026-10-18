"use client"

import { usePathname } from "next/navigation"
import { useCallback, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react"
import { locales } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Site header that hides on the home page until you start scrolling.
 *
 * ## Behaviour
 *
 * - **Home only.** Inner pages keep the bar permanently visible; hiding
 *   navigation on a page the visitor did not arrive at by scrolling would strand
 *   them.
 * - **Hidden above the fold, revealed after ~80px.** The cover illustration is
 *   the first impression; the bar slides down over it as soon as scrolling
 *   starts.
 * - **Revealed on focus.** The bar stays in the accessibility tree while hidden
 *   (no `inert`, no `aria-hidden`), so a keyboard user can still Tab into it —
 *   and the moment focus lands inside, it slides in. Without this, a keyboard
 *   user at the top of the page could focus controls they cannot see.
 * - **Reduced motion** disables the transition; the bar just appears.
 *
 * Scroll position is read through `useSyncExternalStore` rather than an effect
 * that calls `setState`: the project's React 19 lint config rejects synchronous
 * state updates in effect bodies, and this reports `false` on the server so
 * hydration matches.
 */

/** Reveal the bar after roughly this much scrolling. */
const REVEAL_AFTER_PX = 80

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`)

/**
 * `usePathname` reports the internal route (`/zh`) while prerendering and the
 * browser URL (`/`) on the client, because proxy.ts rewrites between them.
 * Normalising both makes the home check agree and avoids a hydration mismatch.
 */
function toPublicPath(pathname: string): string {
  const stripped = pathname.replace(localePrefix, "")
  return stripped === "" ? "/" : stripped
}

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  window.addEventListener("resize", onChange)
  return () => {
    window.removeEventListener("scroll", onChange)
    window.removeEventListener("resize", onChange)
  }
}

const getSnapshot = () => window.scrollY > REVEAL_AFTER_PX
const getServerSnapshot = () => false

export function AutoHideHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const scrolled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [focusWithin, setFocusWithin] = useState(false)

  const isHome = toPublicPath(pathname ?? "/") === "/"
  const visible = !isHome || scrolled || focusWithin

  const handleBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    // Only drop the reveal once focus has left the header entirely, so tabbing
    // between controls inside it does not make the bar flicker away.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusWithin(false)
    }
  }, [])

  return (
    <header
      onFocus={() => setFocusWithin(true)}
      onBlur={handleBlur}
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md",
        "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      {children}
    </header>
  )
}
