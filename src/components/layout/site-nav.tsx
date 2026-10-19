"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { NavDropdown } from "@/components/layout/nav-dropdown"
import { NavIcon } from "@/components/layout/nav-icon"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { isActiveHref, type NavKey } from "@/config/site"
import { isLocale } from "@/i18n/config"
import { cn } from "@/lib/utils"

export interface SiteNavLink {
  href: string
  label: string
  /** Which icon to draw; the same key the dictionary uses. */
  name: NavKey
}

interface SiteNavProps {
  links: readonly SiteNavLink[]
  /** Accessible name for the nav landmarks. */
  navLabel: string
  /** Accessible name for the mobile menu trigger. */
  triggerLabel: string
  /** Heading shown at the top of the mobile sheet. */
  sheetTitle: string
  closeLabel: string
  /**
   * Server-rendered panel for the blog entry. The menu content is built where the
   * article data lives and handed to this client island as a node, so the nav
   * stays a client component without importing the archive or the tag index.
   */
  blogMenu?: ReactNode
}

/**
 * `usePathname` reports the internal route (`/zh/blog`) while prerendering and
 * the browser URL (`/blog`) on the client, because proxy.ts rewrites between
 * them. Stripping a leading locale segment makes both agree, which keeps the
 * active state stable and avoids a hydration mismatch.
 */
function normalizePathname(pathname: string): string {
  const segments = pathname.split("/")
  if (isLocale(segments[1])) {
    const rest = segments.slice(2).join("/")
    return rest === "" ? "/" : `/${rest}`
  }
  return pathname === "" ? "/" : pathname
}

/** Visible focus indicator for every operable control (WCAG 2.4.7). */
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function SiteNav({
  links,
  navLabel,
  triggerLabel,
  sheetTitle,
  closeLabel,
  blogMenu,
}: SiteNavProps) {
  const pathname = usePathname()
  const current = normalizePathname(pathname ?? "/")

  return (
    <>
      <nav aria-label={navLabel} className="hidden lg:flex lg:items-center lg:gap-1">
        {links.map((link) => {
          const active = isActiveHref(current, link.href)

          /* The blog entry opens a panel instead of navigating; every other
             section stays a plain link. */
          if (link.name === "blog" && blogMenu) {
            return (
              <NavDropdown
                key={link.href}
                label={link.label}
                active={active}
                icon={<NavIcon name={link.name} className="hidden size-3.5 shrink-0 xl:block" />}
              >
                {blogMenu}
              </NavDropdown>
            )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                focusRing,
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {/* Eight sections plus an icon each is ~90px more than the row has
                  at `lg`, so the top-bar icons only appear from `xl` where the
                  space exists. The mobile sheet and the footer have room at every
                  width and always show them. */}
              <NavIcon name={link.name} className="hidden size-3.5 shrink-0 xl:block" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* The inline nav needs ~833px in English with all eight sections, so it
          only appears from `lg`; below that the sheet avoids a horizontal
          scrollbar on tablets. */}
      <div className="lg:hidden">
        {/* The Sheet is uncontrolled and keyed on the current path: under
            `cacheComponents` a navigation hides this route with React <Activity>
            instead of unmounting it, so an open sheet would otherwise survive
            the jump. Changing the key remounts the sheet in its closed state,
            which avoids an effect that sets state. */}
        <Sheet key={current}>
          <SheetTrigger asChild>
            {/* size-10 keeps the tap target well above the 24px web minimum
                instead of the 28px icon-sm default. */}
            <Button
              variant="ghost"
              className={cn("size-10", focusRing)}
              aria-label={triggerLabel}
            >
              <Menu aria-hidden className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 gap-0 p-0"
            showCloseButton={false}
            aria-describedby={undefined}
          >
            <SheetHeader className="flex-row items-center justify-between border-b p-4">
              <SheetTitle className="font-heading text-base">{sheetTitle}</SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className={cn("size-10", focusRing)}
                  aria-label={closeLabel}
                >
                  <X aria-hidden className="size-4" />
                </Button>
              </SheetClose>
            </SheetHeader>
            {/* gap-2 provides the 8px minimum spacing between adjacent tap targets. */}
            <nav aria-label={navLabel} className="flex flex-col gap-2 p-4">
              {links.map((link) => {
                const active = isActiveHref(current, link.href)
                return (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                        focusRing,
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <NavIcon name={link.name} className="size-4 shrink-0" />
                      {link.label}
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
