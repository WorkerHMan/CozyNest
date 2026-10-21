import { MusicPagePlayer } from "@/components/music/music-page-player"
import { defaultLocale, isLocale } from "@/i18n"

/**
 * 音乐 — the full player page.
 *
 * Full-bleed on purpose: the player paints its own dark surface, because a
 * reactive cube shell only reads as a visualiser against black. Wrapping it in a
 * container with page padding would leave light strips down both sides.
 *
 * The player is a client component bound to the site-wide audio store, so this
 * page stays a Server Component.
 */
export default async function MusicPage(props: PageProps<"/[locale]/music">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  return (
    /* Exactly one screen tall and clipped: the player owns the viewport, so the
       footer sits below the fold and nothing scrolls it into view. */
    <div className="h-[calc(100svh-4rem)] overflow-hidden">
      <MusicPagePlayer locale={locale} />
    </div>
  )
}
