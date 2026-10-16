import type { Locale } from "@/i18n/config"

/**
 * Date formatting for post metadata.
 *
 * This lives in its own module, deliberately free of any `node:fs` import.
 * `@/lib/blog` reads content from disk, so importing *anything runtime-valued*
 * from it inside a Client Component drags `node:fs` into the browser bundle and
 * fails the Turbopack build with:
 *
 *   "the chunking context (unknown) does not support external modules
 *    (request: node:fs)"
 *
 * Type-only imports from `@/lib/blog` are still fine — they are erased.
 */
export function formatPostDate(isoDate: string, locale: Locale): string {
  // A fixed ISO string with an explicit time zone keeps prerendering
  // deterministic and free of any clock read.
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`))
}
