import { Container } from "@/components/layout/container"
import { MusicPagePlayer } from "@/components/music/music-page-player"
import { defaultLocale, isLocale } from "@/i18n"

/**
 * 音乐 — the full player page.
 *
 * The player is a client component bound to the site-wide audio store, so this
 * page stays a Server Component: it only owns the heading and the copy around the
 * player.
 */
const copy = {
  eyebrow: { zh: "音乐", en: "Music" },
  title: { zh: "音乐", en: "Music" },
  intro: {
    zh: "这里的曲子都是 CC 署名授权，可以自由播放。首页封面和左下角播放条用的是同一个引擎，所以在这里点开的每一首都会同步过去。",
    en: "Every track here is CC BY licensed. The cover player and the bottom-left dock share this engine, so whatever you start here carries over to them.",
  },
}

export default async function MusicPage(props: PageProps<"/[locale]/music">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{copy.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      <div className="mt-10">
        <MusicPagePlayer locale={locale} />
      </div>
    </Container>
  )
}
