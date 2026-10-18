import { locales } from "@/i18n"

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`)

/**
 * `usePathname` reports the internal route (`/zh/blog`) while prerendering and
 * the browser URL (`/blog`) on the client, because proxy.ts rewrites between
 * them. Stripping a leading locale segment makes both agree, which keeps route
 * checks stable and avoids a hydration mismatch.
 *
 * Shared rather than duplicated: the music dock, the nav and the mascot all need
 * to answer "is this the home page?" and they must answer it the same way.
 */
export function toPublicPath(pathname: string): string {
  const stripped = pathname.replace(localePrefix, "")
  return stripped === "" ? "/" : stripped
}
