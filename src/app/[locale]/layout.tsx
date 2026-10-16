import type { Metadata } from "next"
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { siteConfig } from "@/config/site"
import { settingsScript } from "@/config/settings"
import { defaultLocale, getDictionary, isLocale, locales } from "@/i18n"
import "../globals.css"

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${plexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Blocking, first in <body>: applies the saved settings to <html>
            before anything paints, so a returning visitor never sees the
            defaults flash and then change. */}
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* `data-shell` is the image-filter target. It deliberately excludes
              <body>, where Radix mounts its portals, because a CSS filter turns
              its element into a containing block and would break them. */}
          <div data-shell className="flex flex-1 flex-col">
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
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
