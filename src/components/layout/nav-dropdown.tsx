"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useId, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export interface NavDropdownProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  /** Marks the trigger as the current page. */
  active?: boolean
}

/**
 * A nav item that opens a panel instead of navigating.
 *
 * Opened by click, not hover: hover menus are unreachable on touch and awkward
 * for keyboard users. The trigger advertises state with `aria-expanded` and
 * points at the panel with `aria-controls`.
 *
 * Closing is handled three ways because all three are expected of a menu: a
 * second click on the trigger, `Escape`, and a click outside. Focus returns to
 * the trigger after Escape so keyboard users stay oriented.
 */
export function NavDropdown({ label, icon, children, active = false }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
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
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
          focusRing,
          active || open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        {icon}
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          /* Links close the panel; buttons do not. A button inside the menu may
             open its own dialog, and closing the menu would unmount it. */
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) setOpen(false)
          }}
          className={cn(
            "absolute top-full left-0 z-50 mt-1.5 w-[min(80vw,10.5rem)] rounded-lg border border-border/60",
            "bg-popover/95 p-1 shadow-lg shadow-black/20 backdrop-blur-md"
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
