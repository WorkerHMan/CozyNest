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
} as const

export interface NavItem {
  key: NavKey
  href: string
}

/**
 * Single source of truth for the site navigation. Every entry here is a route
 * that exists under `src/app/[locale]/`, so adding a section means adding the
 * route, one entry here, and one label pair in each dictionary.
 */
export const navItems: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "blog", href: "/blog" },
  { key: "knowledge", href: "/knowledge" },
  { key: "projects", href: "/projects" },
  { key: "photos", href: "/photos" },
  { key: "files", href: "/files" },
  { key: "tools", href: "/tools" },
  { key: "dashboard", href: "/dashboard" },
]

/** The non-home sections, used to generate the placeholder pages. */
export const moduleItems: readonly NavItem[] = navItems.filter(
  (item) => item.href !== "/"
)

export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
