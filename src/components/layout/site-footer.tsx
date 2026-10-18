import { Code2, HeartHandshake, Link2, MessageCircle, QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"

import { FooterUptime } from "@/components/layout/footer-uptime"
import { NavIcon } from "@/components/layout/nav-icon"
import { Container } from "@/components/layout/container"
import { footer } from "@/config/footer"
import { navItems, siteConfig } from "@/config/site"
import { getDictionary, type Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Platform ids map to an icon; the QR platforms share a fallback.
 *
 * `Code2` stands in for GitHub: lucide dropped brand marks, and pulling a whole
 * icon pack in for one glyph is not worth it.
 */
const PLATFORM_ICONS = {
  github: Code2,
  wechat: MessageCircle,
  qq: MessageCircle,
  tip: HeartHandshake,
  friends: Link2,
} as const

/**
 * The site-wide footer.
 *
 * Three blocks on top — who this is, the sections, and where to find me — then a
 * single metadata bar underneath.
 *
 * The QR codes reveal on hover **and** on focus, using `group-hover` and
 * `group-focus-within` rather than JavaScript: three QR images permanently on
 * screen would dominate the footer, and a hover-only reveal would be unreachable
 * from a keyboard.
 *
 * The visitor figures are `null` in the config. Rendering a plausible-looking
 * zero would be worse than rendering `—`: a made-up statistic is a lie the page
 * cannot walk back.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const labels = footer.labels

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-5 shrink-0"
            />
            <span className="font-heading text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-pretty text-muted-foreground">
            {dict.metadata.description}
          </p>
        </div>

        <nav aria-label={labels.sections[locale]} className="space-y-3">
          <h2 className="eyebrow text-muted-foreground">{labels.sections[locale]}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
                    focusRing
                  )}
                >
                  <NavIcon name={item.key} className="size-4 shrink-0" />
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="eyebrow text-muted-foreground">{labels.platforms[locale]}</h2>
          <ul className="flex flex-wrap gap-2">
            {footer.platforms.map((platform) => {
              const Icon = PLATFORM_ICONS[platform.id]
              const name = labels[platform.id][locale]
              const shared = cn(
                "grid size-11 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors duration-200 hover:border-brand/50 hover:text-foreground",
                focusRing
              )

              if (platform.href) {
                return (
                  <li key={platform.id}>
                    <Link
                      href={platform.href}
                      aria-label={name}
                      title={name}
                      className={shared}
                      {...(platform.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <Icon aria-hidden className="size-4" />
                    </Link>
                  </li>
                )
              }

              return (
                <li key={platform.id} className="group relative">
                  <button
                    type="button"
                    aria-label={`${name} — ${labels.scan[locale]}`}
                    className={cn(shared, "cursor-pointer")}
                  >
                    <Icon aria-hidden className="size-4" />
                  </button>
                  {/* Hover *and* focus-within: the same affordance must work
                      from a keyboard, not just a mouse. */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 flex-col items-center gap-1 rounded-xl border border-border/60 bg-background/95 p-2 shadow-lg group-hover:flex group-focus-within:flex">
                    {platform.qr ? (
                      <Image
                        src={platform.qr}
                        alt={labels.qrPlaceholder[locale]}
                        width={132}
                        height={132}
                        className="size-33 rounded-lg"
                      />
                    ) : (
                      <span className="grid size-33 place-items-center">
                        <QrCode aria-hidden className="size-6" />
                      </span>
                    )}
                    <span className="whitespace-nowrap font-mono text-[0.625rem] text-muted-foreground">
                      {labels.scan[locale]}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="eyebrow text-muted-foreground">{labels.siteInfo[locale]}</h2>
          <ul className="space-y-2 text-sm">
            <li className="inline-flex items-baseline gap-1">
              <span className="text-muted-foreground">{labels.designer[locale]}</span>
              <span className="text-foreground">{footer.designer}</span>
            </li>
            <li>
              <FooterUptime
                since={footer.launchedOn}
                label={labels.uptime[locale]}
                unit={labels.days[locale]}
              />
            </li>
            <li className="inline-flex items-baseline gap-1">
              <span className="text-muted-foreground">{labels.total[locale]}</span>
              <span id={footer.counter.uvId} className="font-mono text-foreground">
                —
              </span>
            </li>
            <li className="inline-flex items-baseline gap-1">
              <span className="text-muted-foreground">{labels.views[locale]}</span>
              <span id={footer.counter.pvId} className="font-mono text-foreground">
                —
              </span>
            </li>
            <li className="font-mono text-[0.625rem] text-muted-foreground">
              {labels.visitorsOff[locale]}
            </li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border/60 py-6 text-xs text-muted-foreground">
        <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            © {siteConfig.since} {siteConfig.name}. {labels.rights[locale]}
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span>{labels.designer[locale]}</span>
            <span className="text-foreground">{footer.designer}</span>
          </span>
        </p>
        {footer.filing.label ? (
          <a
            href={footer.filing.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-mono transition-colors duration-200 hover:text-foreground", focusRing)}
          >
            {labels.filing[locale]} {footer.filing.label}
          </a>
        ) : null}
      </Container>

      {/* Lazy, after everything else: a counter must never delay the page, and
          nothing here depends on it having loaded. */}
      <Script src={footer.counter.script} strategy="lazyOnload" />
    </footer>
  )
}
