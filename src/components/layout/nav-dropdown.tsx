"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useId, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export interface NavDropdownProps {
  label: string
  /** Where the label itself goes — the section's overview page. */
  href: string
  icon?: ReactNode
  children: ReactNode
  /** Marks the trigger as the current page. */
  active?: boolean
}

/**
 * The blog entry in the top bar: a link with a disclosure beside it.
 *
 * ## Two controls, on purpose
 *
 * The label is a `<Link>` and the caret is a `<button>`. Splitting them is what
 * lets one nav item both navigate and open a panel: clicking the word goes to the
 * overview, clicking the caret opens the menu. A single element cannot do both
 * without guessing the user's intent.
 *
 * ## Hover opens it, but nothing depends on hover
 *
 * Pointer devices get the menu on `pointerenter`, which is what people expect from
 * a top bar. Everything that matters still works without it — the caret toggles,
 * `focus` opens it for keyboard users, and `Escape` closes it. Touch never gets a
 * sticky hover: `pointerType` is checked before opening.
 *
 * ## Why a close delay
 *
 * Moving from the label down to the panel crosses a few pixels of gap. Closing on
 * `pointerleave` immediately makes that gap impossible to cross, so the close is
 * deferred and cancelled on re-entry.
 */
export function NavDropdown({ label, href, icon, children, active = false }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef(0)
  const panelId = useId()

  function cancelClose() {
    window.clearTimeout(closeTimer.current)
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 160)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown, { passive: true })
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        // Only a real mouse opens on hover; a tap must not leave it stuck open.
        if (event.pointerType !== "mouse") return
        cancelClose()
        setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return
        scheduleClose()
      }}
      onFocus={() => {
        cancelClose()
        setOpen(true)
      }}
      onBlur={(event) => {
        if (containerRef.current?.contains(event.relatedTarget as Node | null)) return
        setOpen(false)
      }}
    >
      <div
        className={cn(
          "flex items-center rounded-md transition-colors duration-200",
          active || open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-1.5 rounded-md py-1.5 pr-1 pl-3 text-sm font-medium",
            focusRing
          )}
        >
          {icon}
          {label}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${label} 菜单`}
          className={cn("rounded-md py-1.5 pr-2 pl-1", focusRing)}
        >
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          /* Links close the panel; buttons do not — a button inside the menu may
             open its own dialog, and closing would unmount it. */
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) setOpen(false)
          }}
          className={cn(
            "absolute top-full left-0 z-50 mt-2 w-max min-w-[6.5rem] max-w-[min(80vw,14rem)] overflow-hidden rounded-xl",
            "border border-border/70 bg-popover/95 p-1.5",
            "shadow-xl shadow-black/10 ring-1 ring-black/[0.03] backdrop-blur-xl",
            "origin-top-left animate-[nav-panel-in_160ms_ease-out] motion-reduce:animate-none",
            "dark:shadow-black/40 dark:ring-white/5"
          )}
        >
          {/* Pointer triangle, aligned under the caret. */}
          <span
            aria-hidden
            className="absolute -top-[5px] left-4 size-2 rotate-45 rounded-[1px] border-t border-l border-border/70 bg-popover"
          />
          {children}
        </div>
      ) : null}
    </div>
  )
}
