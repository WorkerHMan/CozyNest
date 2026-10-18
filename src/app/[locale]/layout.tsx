import type { Metadata } from "next"
import { JetBrains_Mono, Nunito } from "next/font/google"
import { notFound } from "next/navigation"
import { MeritCursor } from "@/components/common/merit-cursor"
import { MusicDock } from "@/components/layout/music-dock"
import { PaimonMascot } from "@/components/paimon/paimon-mascot"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { siteConfig } from "@/config/site"
import { defaultLocale, getDictionary, isLocale, locales } from "@/i18n"
import "../globals.css"

/**
 * Round and friendly, but still a *text* face: Nunito's terminals are rounded
 * while the letterforms stay legible at 12–16px, so the same family can carry
 * body copy and headings. Display-rounded faces (Baloo, Fredoka) look cuter on a
 * hero but turn tiring in a paragraph.
 *
 * It is also the reason the Chinese fallbacks in globals.css are rounded too —
 * one family cannot cover CJK without megabytes of webfont.
 */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

/**
 * The root layout lives inside `[locale]`, which is what gives a Server
 * Component access to the language before <html> is rendered. Both locales are
 * enumerated here so every page below it prerenders once per language.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata(
  props: LayoutProps<"/[locale]">
): Promise<Metadata> {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return {
    title: {
      default: dict.metadata.title,
      template: `%s · ${siteConfig.name}`,
    },
    description: dict.metadata.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author }],
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: dict.metadata.title,
      description: dict.metadata.description,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      // Next.js 16 stopped overriding scroll-behavior during navigation; this
      // opts back in so anchor links glide while route changes stay instant.
      data-scroll-behavior="smooth"
      // next-themes writes the theme class here before hydration.
      suppressHydrationWarning
      className={`${nunito.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/*
       * ZCOOL KuaiLe (站酷快乐体) — the Chinese face: round, chubby, hand-drawn,
       * the "a child wrote this" look.
       *
       * Loaded as a stylesheet rather than through next/font on purpose: the
       * family ships 93 unicode-range slices. next/font would download and
       * self-host all of them, while a plain stylesheet lets the browser fetch
       * only the slices the page actually renders — the difference between
       * ~2 MB up front and a few tens of KB per page.
       */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* The no-page-custom-font rule points at `pages/_document.js`, which does
          not exist in the App Router. This layout is the root, so the stylesheet
          applies to every route rather than to one page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"
        precedence="default"
      />
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
          >
            {dict.actions.skipToContent}
          </a>
          <SiteHeader locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} />
          {/* Music keeps playing across pages: the audio element belongs to the
              store, and this dock is just the control surface for it. */}
          <MusicDock locale={locale} />
          {/* Wooden-fish cursor + the floating merit counter. */}
          <MeritCursor locale={locale} />
          {/* The mascot, and the settings drawer it opens. Outside the page tree
              so it survives navigation and can read the site settings store. */}
          <PaimonMascot locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  )
}
