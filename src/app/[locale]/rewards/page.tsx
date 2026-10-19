import { siAlipay, siWechat } from "simple-icons"
import Image from "next/image"

import { Container } from "@/components/layout/container"
import { footer } from "@/config/footer"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * 赞赏 — the two payment codes get their own page.
 *
 * ## Why a page and not two icons in the footer
 *
 * The codes are tall posters, not square QR tiles: there is no way to show them
 * legibly in a 44 px footer row, and opening a full-bleed payment poster from a
 * footer icon is a jarring jump. A quiet page gives each code room, states what
 * it is, and keeps the footer's contact row to one icon per destination.
 *
 * The copy is deliberately plain: no countdowns, no "buy me a coffee" upsell. It
 * says what the money is for and that any amount is fine.
 */
const copy = {
  eyebrow: { zh: "赞赏", en: "Sponsor" },
  title: { zh: "请我喝杯茶", en: "Buy me a tea" },
  intro: {
    zh: "这里的笔记都是免费写的。如果它们帮你省下了几个小时，可以在这里请我喝杯茶。金额随意，一元也是心意。",
    en: "These notes are free to read. If they saved you a few hours, you can buy me a tea here. Any amount is fine — even a little.",
  },
  methods: {
    wechat: { zh: "微信", en: "WeChat" },
    alipay: { zh: "支付宝", en: "Alipay" },
  },
  hint: {
    zh: "点开大图后扫码，金额请自行填写确认。",
    en: "Open the image and scan it; you enter the amount yourself.",
  },
  thanks: {
    zh: "谢谢。你的支持会变成下一篇笔记的时间。",
    en: "Thank you — support turns into time for the next write-up.",
  },
}

const methods = [
  {
    key: "wechat",
    icon: siWechat,
    image: "/footer/qr-tip1.jpg",
    alt: { zh: "微信收款码", en: "WeChat payment QR code" },
  },
  {
    key: "alipay",
    icon: siAlipay,
    image: "/footer/qr-tip2.jpg",
    alt: { zh: "支付宝收款码", en: "Alipay payment QR code" },
  },
] as const

export default async function RewardsPage(props: PageProps<"/[locale]/rewards">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  return (
    <Container className="py-16 sm:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center text-brand">{copy.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      <ul className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {methods.map((method) => (
          <li key={method.key}>
            <a
              href={method.image}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border/60 p-5 transition-colors duration-200 hover:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    "size-4",
                    method.key === "wechat"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-sky-600 dark:text-sky-400"
                  )}
                  aria-hidden
                  focusable="false"
                >
                  <path d={method.icon.path} fill="currentColor" />
                </svg>
                {copy.methods[method.key][locale]}
              </span>
              <Image
                src={method.image}
                alt={method.alt[locale]}
                width={420}
                height={560}
                className="h-auto w-full max-w-[18rem] rounded-xl border border-border/40 bg-background"
              />
            </a>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-10 max-w-2xl space-y-2 text-center">
        <p className="font-mono text-xs text-muted-foreground">{copy.hint[locale]}</p>
        <p className="text-sm text-muted-foreground">{copy.thanks[locale]}</p>
        <p className="pt-4 font-mono text-[0.625rem] text-muted-foreground">
          {footer.designer}
        </p>
      </div>
    </Container>
  )
}
