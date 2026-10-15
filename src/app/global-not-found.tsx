import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "404 · CozyNest",
  description: "The requested page could not be found.",
}

/**
 * next-themes stores the choice under the `theme` key. This file bypasses the
 * root layout (and therefore ThemeProvider), so the theme class has to be
 * applied here before first paint instead.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light'}catch(_){}})()`

/**
 * Standalone 404 for URLs that match no route.
 *
 * This is deliberately self-contained: Next.js skips normal rendering for
 * unmatched URLs, so this file imports the global stylesheet and the fonts
 * itself and returns a complete HTML document. It cannot know the visitor's
 * locale, so the copy is bilingual, with `lang` set per block.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="size-6 rounded-md bg-linear-to-br from-brand to-brand-2"
              />
              <span className="text-gradient-brand font-heading text-lg font-semibold">
                CozyNest
              </span>
            </Link>

            <p className="font-mono text-6xl font-semibold text-gradient-brand">
              404
            </p>

            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              页面不存在
            </h1>
            <p className="text-sm text-muted-foreground">
              你访问的地址可能已被移动或删除。
            </p>
            <p lang="en" className="text-sm text-muted-foreground">
              The page you are looking for could not be found.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                返回首页
              </Link>
              <Link
                href="/"
                lang="en"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
