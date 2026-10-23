import type { Locale } from "@/i18n"

/** The two names a place carries. Deliberately structural, not `Place`. */
export interface PlaceNames {
  name: string
  nameEn: string
}

/**
 * A place's display name for a locale.
 *
 * The site's rule (spec §12) is that **place names follow the content, not the
 * interface**: a Chinese place stays 「杭州」 on the Chinese site and becomes
 * "Hangzhou" on the English one. That is a per-place fact, not a translation
 * exercise, so it comes from the data rather than from a dictionary.
 *
 * Falling back to `name` matters: a village with no English name must render
 * its real name, never an empty string.
 */
export function placeName(place: PlaceNames, locale: Locale): string {
  if (locale === "en" && place.nameEn) return place.nameEn
  return place.name
}
