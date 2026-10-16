/**
 * Settings shared between the blocking pre-paint script and the React panel.
 *
 * Every option is expressed as a `data-*` attribute on <html> (plus `--radius`
 * as an inline custom property) so the whole feature is pure token overrides —
 * no component needs to know a setting exists. The lists below are the single
 * source of truth for the allowed values, and the script validates against them
 * so a corrupted localStorage entry can never produce an unreadable theme.
 */

export const settingsStorageKey = "cozynest.settings"

export const fontOptions = ["sans", "serif"] as const
export const shadowOptions = ["shallow", "deep"] as const
export const filterOptions = ["off", "sunset", "darken", "grayscale"] as const
export const themeColorOptions = [
  "green",
  "cyan",
  "violet",
  "amber",
  "rose",
  "blue",
] as const

export type FontOption = (typeof fontOptions)[number]
export type ShadowOption = (typeof shadowOptions)[number]
export type FilterOption = (typeof filterOptions)[number]
export type ThemeColorOption = (typeof themeColorOptions)[number]

export interface Settings {
  font: FontOption
  shadow: ShadowOption
  filter: FilterOption
  themeColor: ThemeColorOption
  /** Base corner radius in px; `--radius` is derived from it. */
  radius: number
}

export const defaultSettings: Settings = {
  font: "sans",
  shadow: "shallow",
  filter: "off",
  themeColor: "green",
  radius: 10,
}

export const radiusRange = { min: 0, max: 20, step: 2 } as const

/** Matches the shadcn `--radius` baseline of 0.625rem. */
const radiusBasePx = 10

/**
 * Runs as the first element of <body>, before anything paints, so a returning
 * visitor never sees the default theme flash and then change.
 */
export const settingsScript = `(function(){try{
var d=document.documentElement;
var f=${JSON.stringify(fontOptions)},s=${JSON.stringify(shadowOptions)},g=${JSON.stringify(filterOptions)},c=${JSON.stringify(themeColorOptions)};
var o={};try{o=JSON.parse(localStorage.getItem(${JSON.stringify(settingsStorageKey)})||"{}")||{}}catch(e){o={}}
var font=f.indexOf(o.font)>-1?o.font:${JSON.stringify(defaultSettings.font)};
var shadow=s.indexOf(o.shadow)>-1?o.shadow:${JSON.stringify(defaultSettings.shadow)};
var filter=g.indexOf(o.filter)>-1?o.filter:${JSON.stringify(defaultSettings.filter)};
var color=c.indexOf(o.themeColor)>-1?o.themeColor:${JSON.stringify(defaultSettings.themeColor)};
var r=typeof o.radius==="number"&&isFinite(o.radius)?Math.min(${radiusRange.max},Math.max(${radiusRange.min},o.radius)):${radiusBasePx};
d.setAttribute("data-font",font);
d.setAttribute("data-shadow",shadow);
d.setAttribute("data-filter",filter);
d.setAttribute("data-theme-color",color);
d.style.setProperty("--radius",(r/16)+"rem");
}catch(e){}})()`
