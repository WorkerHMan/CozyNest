import { HeartHandshake, Link2 } from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import { siGithub, siQq, siWechat } from "simple-icons"

import { FooterUptime } from "@/components/layout/footer-uptime"
import { NavIcon } from "@/components/layout/nav-icon"
import { VisitorInfo } from "@/components/layout/visitor-info"
import { Container } from "@/components/layout/container"
import { footer } from "@/config/footer"
import { navItems, siteConfig } from "@/config/site"
import { getDictionary, type Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Brand marks come from `simple-icons`, which ships the official paths. lucide
 * dropped brand icons in v1, and redrawing a logo from memory produces something
 * that looks almost-right — worse than a generic glyph.
 */
const BRANDS = {
  github: siGithub,
  wechat: siWechat,
  qq: siQq,
} as const

/** Non-brand entries are actions, so they keep the site's line-icon set. */
const ACTION_ICONS = { tip: HeartHandshake, friends: Link2 } as const

function BrandMark({ id, className }: { id: keyof typeof BRANDS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d={BRANDS[id].path} fill="currentColor" />
    </svg>
  )
}

/**
 * The site-wide footer: four bands, in the order they are read.
 *
 * 1. **站点导航** — where you can go.
 * 2. **联系方式** — how to reach me. Six 44 px buttons; the image ones open the
 *    poster in a new tab, because a hover popover is unreachable on touch.
 * 3. **站点信息** — designer, uptime, visitor counts.
 * 4. **版权声明** — the legal line.
 *
 * Each band is one wrapping row rather than a grid column: nine sections in a
 * grid meant two columns across five rows, which was the tall column that made
 * the whole footer heavy.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const labels = footer.labels

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/40">
      <Container className="py-8">
        {/* Band 1 — the nine sections, one wrapping row. */}
        <nav
          aria-label={labels.sections[locale]}
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
        >
          <span className="eyebrow text-muted-foreground">{labels.sections[locale]}</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
                focusRing
              )}
            >
              <NavIcon name={item.key} className="size-4 shrink-0" />
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        {/* Band 2 — how to reach me. */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
          <span className="eyebrow text-muted-foreground">{labels.platforms[locale]}</span>
          <ul className="flex flex-wrap items-center gap-3">
            {footer.platforms.map((platform) => {
              const name = labels[platform.id][locale]
              const action = ACTION_ICONS[platform.id as keyof typeof ACTION_ICONS]
              const brand = BRANDS[platform.id as keyof typeof BRANDS]

              return (
                <li key={platform.id}>
                  {/*
                   * Same 16 px mark as the nav row, no pill around it — that is
                   * what made these read as larger than the section icons.
                   *
                   * The `after:` layer widens the hit area to 32 px without
                   * changing the visual size: 16 px alone would be below the
                   * 24 px WCAG minimum for a pointer target.
                   *
                   * Label and tooltip are the platform's own name (GitHub,
                   * WeChat, QQ…), not "open the image": the destination is a
                   * plain page or profile now, not a picture to inspect.
                   */}
                  <Link
                    href={platform.href}
                    aria-label={name}
                    title={name}
                    className={cn(
                      "relative grid size-4 place-items-center text-muted-foreground transition-colors duration-200 after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
                      focusRing
                    )}
                    {...(platform.newTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {brand ? (
                      <BrandMark id={platform.id as keyof typeof BRANDS} className="size-4" />
                    ) : action ? (
                      (() => {
                        const Icon = action
                        return <Icon aria-hidden className="size-4" />
                      })()
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
          <VisitorInfo locale={locale} />
        </div>

        {/* Band 3 — site info, inline. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs">
          <span className="eyebrow text-muted-foreground">{labels.siteInfo[locale]}</span>
          <span className="inline-flex items-baseline gap-1">
            <span className="text-muted-foreground">{labels.designer[locale]}</span>
            <span className="text-foreground">{footer.designer}</span>
          </span>
          <span aria-hidden className="text-border">·</span>
          <FooterUptime
            since={footer.launchedOn}
            label={labels.uptime[locale]}
            units={{
              days: labels.days[locale],
              hours: labels.hours[locale],
              minutes: labels.minutes[locale],
              seconds: labels.seconds[locale],
            }}
          />
          <span aria-hidden className="text-border">·</span>
          <span className="inline-flex items-baseline gap-1">
            <span className="text-muted-foreground">{labels.total[locale]}</span>
            <span id={footer.counter.uvId} className="font-mono text-foreground">
              —
            </span>
          </span>
          <span aria-hidden className="text-border">·</span>
          <span className="inline-flex items-baseline gap-1">
            <span className="text-muted-foreground">{labels.views[locale]}</span>
            <span id={footer.counter.pvId} className="font-mono text-foreground">
              —
            </span>
          </span>
          <span className="font-mono text-[0.625rem] text-muted-foreground">
            {labels.visitorsOff[locale]}
          </span>
        </div>
      </Container>

      {/* Band 4 — the legal line. */}
      <Container className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-border/60 py-4 text-xs text-muted-foreground">
        <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            © {siteConfig.since} {siteConfig.name}. {labels.rights[locale]}
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span>{labels.designer[locale]}</span>
            <span className="text-foreground">{footer.designer}</span>
          </span>
        </p>
        <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href="/disclaimer"
            className={cn("transition-colors duration-200 hover:text-foreground", focusRing)}
          >
            {labels.disclaimer[locale]}
          </Link>
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
        </div>
      </Container>

      {/* Lazy, after everything else: a counter must never delay the page, and
          nothing here depends on it having loaded. */}
      <Script src={footer.counter.script} strategy="lazyOnload" />
    </footer>
  )
}
