"use client"

import { Search, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useDeferredValue, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dictionary, Locale } from "@/i18n"
import type { PostEntry } from "@/lib/blog"
// fs-free module: importing this from `@/lib/blog` would pull `node:fs` into
// the browser bundle and break the Turbopack build.
import { formatPostDate } from "@/lib/post-format"

/**
 * Client-side search over the article metadata.
 *
 * Three rules from the design system shaped this:
 *  - **Debounce**: filtering on every keystroke is an explicit anti-pattern, so
 *    the query goes through `useDeferredValue`; the URL is only written 300ms
 *    after the value settles.
 *  - **No blank "0 results"**: an empty result set is answered with suggestions
 *    (the busiest categories and tags) plus a way to clear, never a bare count.
 *  - **Deep linking**: the query is mirrored into `?q=` so a search is
 *    shareable, and `initialQuery` comes from the server so the link restores.
 *
 * The metadata list is passed in whole: for a personal blog it is small, so
 * filtering locally is instant and needs no round-trip.
 */
export function BlogSearch({
  posts,
  locale,
  dict,
  initialQuery,
}: {
  posts: readonly PostEntry[]
  locale: Locale
  dict: Dictionary
  initialQuery: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const deferred = useDeferredValue(query)
  const router = useRouter()
  const pathname = usePathname()
  const lastWritten = useRef(initialQuery)

  useEffect(() => {
    if (deferred === lastWritten.current) return
    const id = setTimeout(() => {
      lastWritten.current = deferred
      const trimmed = deferred.trim()
      router.replace(
        trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname,
        { scroll: false }
      )
    }, 300)
    return () => clearTimeout(id)
  }, [deferred, pathname, router])

  const needle = deferred.trim().toLowerCase()
  const results = needle
    ? posts.filter((post) =>
        [post.title, post.summary, post.category, ...post.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : []

  // Suggestions for the empty state, derived from what actually exists.
  const suggestions = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="max-w-md space-y-2">
        <Label htmlFor="blog-search">{dict.blog.searchLabel}</Label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.blog.searchPlaceholder}
            className="h-10 pl-9"
            autoComplete="off"
          />
        </div>
      </div>

      {needle ? (
        <section aria-label={dict.blog.searchLabel} className="space-y-4">
          <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
            {dict.blog.resultsPrefix} {results.length} {dict.blog.resultsSuffix}
          </p>

          {results.length === 0 ? (
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium">{dict.blog.noResults}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.blog.noResultsHint}
                </p>
              </div>
              {suggestions.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {suggestions.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => setQuery(tag)}
                        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
                      >
                        <Badge variant="outline">{tag}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href="/blog"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-strong px-3 text-sm font-medium outline-none transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X aria-hidden className="size-3.5" />
                {dict.blog.clearFilters}
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg p-2 outline-none transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <time
                      dateTime={post.publishedAt}
                      className="font-mono text-xs text-muted-foreground"
                    >
                      {formatPostDate(post.publishedAt, locale)}
                    </time>
                    <span className="text-sm font-medium">{post.title}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {post.category}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  )
}
