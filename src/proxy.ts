import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isLocale, localeCookieName } from "@/i18n/config"

/**
 * Keeps the locale out of the public URL.
 *
 * Every route lives under `app/[locale]/`, which is what allows pages to stay
 * Server Components and stay prerenderable. This proxy maps a prefix-less
 * request (`/blog`) onto the visitor's locale (`/zh/blog`) with a rewrite, so the
 * address bar never changes. Requests that already carry a locale prefix are
 * passed through, and so are static files.
 *
 * Note: the response for a given URL therefore varies by cookie. If a shared
 * cache (for example Nginx `proxy_cache`) is put in front of the app, HTML
 * responses must be excluded from it or keyed on the locale cookie.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Already localised — nothing to do.
  const [, firstSegment] = pathname.split("/")
  if (isLocale(firstSegment)) {
    return NextResponse.next()
  }

  // Never rewrite asset and metadata requests.
  if (pathname.includes(".") && !pathname.endsWith("/")) {
    return NextResponse.next()
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Everything except Next.js internals and API routes.
    "/((?!_next/|api/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|json|webmanifest|woff|woff2)$).*)",
  ],
}
