import type { Dictionary } from "@/i18n"

/** Keys of the navigation labels, shared by the nav config and the dictionary. */
export type NavKey = keyof Dictionary["nav"]

/** Keys of the module descriptions used by the placeholder pages. */
export type ModuleKey = keyof Dictionary["modules"]

export const siteConfig = {
  name: "CozyNest",
  author: "CozyNest",
  repository: "https://github.com/",
  email: "hello@example.com",
  /** Fixed rather than derived from the clock: reading the date during
   *  prerender is a build error under `cacheComponents`. */
  since: 2026,
  /**
   * Countdown target for the home page's time widget. Kept as a plain ISO date
   * so nothing reads the clock until a Client Component mounts (reading it
   * during prerender is a build error under `cacheComponents`).
   */
  countdownDate: "2027-02-06",
} as const

export interface NavItem {
  key: NavKey
  href: string
}

/**
 * Every destination, in footer/sheet order.
 *
 * The site has far more sections than a top bar can hold, and an overloaded nav
 * is an explicit anti-pattern, so this full list feeds the footer and the mobile
 * sheet while `primaryNavItems` is what the desktop bar renders inline.
 */
export const navItems: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "blog", href: "/blog" },
  { key: "projects", href: "/projects" },
  { key: "tools", href: "/tools" },
  { key: "knowledge", href: "/knowledge" },
  { key: "resources", href: "/resources" },
  { key: "photos", href: "/photos" },
  { key: "books", href: "/library/books" },
  { key: "music", href: "/library/music" },
  { key: "video", href: "/library/video" },
  { key: "files", href: "/files" },
  { key: "dashboard", href: "/dashboard" },
  { key: "board", href: "/board" },
]

/**
 * The four the header shows inline. Kept small deliberately: the earlier flat
 * list of eight already needed the sheet below `lg`, and each extra item pushes
 * the breakpoint further up.
 */
export const primaryNavItems: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "blog", href: "/blog" },
  { key: "projects", href: "/projects" },
  { key: "tools", href: "/tools" },
]

export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
