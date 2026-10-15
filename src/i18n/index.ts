import type { Locale } from "./config"
import { en } from "./dictionaries/en"
import { zh } from "./dictionaries/zh"

/**
 * The Chinese dictionary is the source of truth for the shape: `en` is typed as
 * `Dictionary`, so a missing or misspelled key in either language fails the build
 * instead of silently rendering `undefined`.
 */
export type Dictionary = typeof zh

const dictionaries: Record<Locale, Dictionary> = { zh, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export type { Locale }
export { defaultLocale, isLocale, locales, resolveLocale } from "./config"
