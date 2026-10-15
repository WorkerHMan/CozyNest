import Link from "next/link"
import { Container } from "@/components/layout/container"
import { navItems, siteConfig } from "@/config/site"
import { getDictionary, type Locale } from "@/i18n"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/40">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-5 rounded-md bg-linear-to-br from-brand to-brand-2"
            />
            <span className="font-heading text-base font-semibold">
              {siteConfig.name}
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {dict.metadata.description}
          </p>
        </div>

        <nav aria-label={dict.footer.sections} className="space-y-3">
          {/* Uppercase tracked label keeps footer headings distinct from links. */}
          <h2 className="eyebrow text-muted-foreground">{dict.footer.sections}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground ${focusRing}`}
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="eyebrow text-muted-foreground">{dict.footer.about}</h2>
          <p className="text-sm text-muted-foreground">{dict.footer.builtWith}</p>
        </div>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 py-6 text-xs text-muted-foreground">
        <p>
          © {siteConfig.since} {siteConfig.name}. {dict.footer.rights}
        </p>
        <p>{dict.home.badge}</p>
      </Container>
    </footer>
  )
}
