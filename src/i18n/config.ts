/**
 * Locale configuration.
 *
 * The site is bilingual but the public URL carries no locale prefix: `proxy.ts`
 * rewrites `/blog` to `/zh/blog` (or `/en/blog`) based on the cookie below, so
 * the internal route tree keeps a real `[locale]` segment — which is what lets
 * the pages stay Server Components and stay prerenderable under
 * `cacheComponents`. The prefixed routes remain directly reachable too.
 */
export const locales = ["zh", "en"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "zh"

/** Cookie that remembers the visitor's language choice across requests. */
export const localeCookieName = "cozynest.locale"

/** How long the language choice is remembered, in seconds (one year). */
export const localeCookieMaxAge = 60 * 60 * 24 * 365

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}

/** Narrows an untrusted route param or cookie value to a supported locale. */
export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale
}
