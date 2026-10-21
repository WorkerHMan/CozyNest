import { Archive, ChevronRight, FolderOpen, LayoutGrid, Sparkles, Tags } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { AutoHideHeader } from "@/components/layout/auto-hide-header"
import { RandomPickerHost, RandomPickerTrigger } from "@/components/blog/random-overlay"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { ScrollRing } from "@/components/layout/scroll-ring"
import { SiteNav } from "@/components/layout/site-nav"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Container } from "@/components/layout/container"
import { getTopic } from "@/config/topics"
import { navItems, siteConfig } from "@/config/site"
import { articles, formatArticleDate } from "@/data/posts"
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
    name: item.key,
  }))

  /* Built here on the server so the client nav never imports the article data.
     The panel only routes; 列表、分类、归档、标签 each have their own page, and the
     content the owner described (the dense grid, the tag counts) belongs there,
     not inside a menu. Labels stay to two characters: a dropdown is a signpost,
     not a table of contents. */
  const menuCopy = {
    overview: { zh: "总览", en: "Overview" },
    featured: { zh: "精选", en: "Featured" },
    topics: { zh: "分类", en: "Topics" },
    archive: { zh: "归档", en: "Archive" },
    tags: { zh: "标签", en: "Tags" },
    random: { zh: "随机", en: "Random" },
  }

  const menuItems = [
    { href: "/blog", label: menuCopy.overview[locale], icon: LayoutGrid },
    { href: "/blog/featured", label: menuCopy.featured[locale], icon: Sparkles },
    { href: "/blog/topics", label: menuCopy.topics[locale], icon: FolderOpen },
    { href: "/blog/archive", label: menuCopy.archive[locale], icon: Archive },
    { href: "/blog/tags", label: menuCopy.tags[locale], icon: Tags },
  ]

  /* 随机 is not a link: it opens the 3D picker over the current page and enters
     whichever article the wheel lands on. Everything it needs is passed down, so
     the client component never imports the article data itself. */
  const randomItems = articles.map((article) => ({
    slug: article.slug,
    title: article.title[locale],
    summary: article.summary[locale],
    topic: getTopic(article.topic)?.label[locale] ?? article.topic,
    date: formatArticleDate(article.publishedAt, locale),
    cover: article.cover,
  }))

  const blogMenu = (
    <div>
      <p className="px-2.5 pt-1 pb-1.5 text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground/60 uppercase">
        {dict.nav.blog}
      </p>
      <ul className="space-y-0.5">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
            >
              <item.icon
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground/70 transition-colors duration-150 group-hover:text-brand"
              />
              {item.label}
              <ChevronRight
                aria-hidden
                className="ml-auto size-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-50"
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mx-2 my-1.5 h-px bg-border/60" />
      <ul>
        <li>
          <RandomPickerTrigger locale={locale} />
        </li>
      </ul>
    </div>
  )

  return (
    <AutoHideHeader>
      {/* The negative left margin cancels the Container's own padding, so the
          logo sits flush to the container edge while the nav and the toggles
          keep their normal rhythm. */}
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="-ml-4 flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring sm:-ml-6 lg:-ml-8"
        >
          {/* Drop-in logo slot: overwrite public/brand/logo.png with the real
              mark and nothing here needs to change. `alt` is empty on purpose —
              the wordmark beside it already names the site, and announcing both
              would read it twice. */}
          <Image
            src="/brand/logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="size-9 shrink-0"
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
            blogMenu={blogMenu}
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
          <ScrollRing locale={locale} />
        </div>
      </Container>

      {/* Outside the dropdown on purpose: the menu unmounts when it closes, and
          the picker must survive that. */}
      <RandomPickerHost items={randomItems} locale={locale} />
    </AutoHideHeader>
  )
}
