import Link from "next/link"
import { Suspense } from "react"
import { AutoHideHeader } from "@/components/layout/auto-hide-header"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { SiteNav } from "@/components/layout/site-nav"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Container } from "@/components/layout/container"
import { navItems, siteConfig } from "@/config/site"
import { getDictionary, type Locale } from "@/i18n"

/**
 * Site header. Server Component: it only assembles data from the dictionary and
 * hands it to the client islands (the auto-hide shell, the nav and the toggles).
 *
 * The `<header>` element itself lives in `AutoHideHeader`, which is a Client
 * Component because visibility depends on scroll position; the children below
 * are still rendered on the server and passed through.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  const links = navItems.map((item) => ({
    href: item.href,
    label: dict.nav[item.key],
  }))

  return (
    <AutoHideHeader>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className="size-6 rounded-md bg-linear-to-br from-brand to-brand-2"
          />
          <span className="text-gradient-brand font-heading text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        {/* Suspense keeps the nav prerenderable once routes with dynamic params
            appear: usePathname is not knowable at build time for those. */}
        <Suspense fallback={<div aria-hidden className="hidden lg:block lg:h-8" />}>
          <SiteNav
            links={links}
            navLabel={dict.footer.sections}
            triggerLabel={dict.actions.openMenu}
            sheetTitle={dict.footer.sections}
            closeLabel={dict.actions.closeMenu}
          />
        </Suspense>

        <div className="flex items-center gap-1">
          <LocaleSwitcher
            locale={locale}
            labels={dict.actions.languageName}
            buttonLabel={dict.actions.toggleLanguage}
          />
          <ThemeToggle
            labels={{
              light: dict.actions.themeLight,
              dark: dict.actions.themeDark,
              system: dict.actions.themeSystem,
            }}
            buttonLabel={dict.actions.toggleTheme}
          />
        </div>
      </Container>
    </AutoHideHeader>
  )
}
