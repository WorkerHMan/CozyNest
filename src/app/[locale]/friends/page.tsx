import { Container } from "@/components/layout/container"
import { footer } from "@/config/footer"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

/**
 * 友链 — the friend-links page the footer points at.
 *
 * There is no link list yet, so rather than render an empty grid it explains how
 * to be added. When the first links arrive, they go in a small array here and the
 * empty state disappears.
 */
const friends: readonly { name: string; href: string; note: string }[] = []

export default async function FriendsPage(props: PageProps<"/[locale]/friends">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  getDictionary(locale)

  const copy = {
    title: { zh: "友链", en: "Friend links" },
    intro: {
      zh: "一些我常看的站点。想交换链接的话，在 GitHub 上开个 issue 带上你的站名、地址和一句话介绍就行。",
      en: "Sites I read. To trade links, open an issue on GitHub with your name, URL and a one-line description.",
    },
    empty: {
      zh: "还没有友链——这一栏是空的，不是加载失败。",
      en: "No links yet — this list is genuinely empty, not a loading failure.",
    },
    rulesTitle: { zh: "交换条件", en: "What I look for" },
    rules: {
      zh: ["能正常访问、没有弹窗广告", "有一定量的原创内容", "我已经把你加进列表，你再加我"],
      en: [
        "It loads, and it has no pop-up ads",
        "It has some original writing on it",
        "It already lists this site before asking me to list back",
      ],
    },
  }

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      {friends.length === 0 ? (
        <p className="mt-10 max-w-2xl rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
          {copy.empty[locale]}
        </p>
      ) : (
        <ul className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <li key={friend.href} className="rounded-xl border border-border/60 p-4">
              <a
                href={friend.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-brand"
              >
                {friend.name}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{friend.note}</p>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 max-w-2xl">
        <h2 className="eyebrow text-muted-foreground">{copy.rulesTitle[locale]}</h2>
        <ul className="mt-3 space-y-2 pl-5">
          {copy.rules[locale].map((rule) => (
            <li key={rule} className="list-disc text-sm leading-relaxed text-muted-foreground">
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 font-mono text-xs text-muted-foreground">{footer.designer}</p>
    </Container>
  )
}
