"use client"

import Image from "next/image"
import Link from "next/link"
import MiniSearch from "minisearch"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { photosLabels } from "@/config/photos-labels"
import type { AlbumData } from "@/lib/album/types"
import {
  matchesFilters,
  parseQuery,
  queryTermsFor,
  type SearchItem,
} from "@/lib/album/search"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const DEBOUNCE_MS = 120

/**
 * The album's search.
 *
 * ## It replaces the timeline rather than sitting above it
 *
 * The timeline arrives as `children` — a server-rendered node — and is shown when
 * the box is empty. Once something is typed the results take its place, so the
 * page never jumps to a different route and the back button still means "leave
 * the album" (spec §8.5).
 *
 * ## Why the index is built in the browser
 *
 * A separate index file would be a second request for the same bytes; the items
 * are already here as props. The index is built on the **first search**, not on
 * mount, so a visitor who never searches never pays for it.
 *
 * ## Why 「小狗」 finds dogs
 *
 * MiniSearch tokenises on whitespace, so a Chinese caption is a single token and
 * cannot be matched word-by-word. The working route is the fixed concept
 * vocabulary: each typed word maps to concept ids first, and those ids are what
 * the `tags` field stores.
 */
export function PhotoSearch({
  items,
  places,
  albums,
  locale,
  children,
}: {
  items: SearchItem[]
  places: AlbumData["places"]
  albums: AlbumData["albums"]
  locale: Locale
  children: ReactNode
}) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  const [value, setValue] = useState("")
  const [results, setResults] = useState<SearchItem[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const indexRef = useRef<MiniSearch<SearchItem> | null>(null)

  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const taxonomy = useMemo(() => ({ places, albums }), [places, albums])

  function getIndex(): MiniSearch<SearchItem> {
    if (indexRef.current) return indexRef.current
    const index = new MiniSearch<SearchItem>({
      fields: ["caption", "place", "placeEn", "bucket", "tags"],
      storeFields: ["id"],
      searchOptions: { boost: { tags: 3, caption: 2 }, prefix: true, fuzzy: 0.2 },
    })
    index.addAll(items)
    indexRef.current = index
    return index
  }

  // `/` focuses the box, `Esc` clears it — from anywhere on the page, unless the
  // visitor is already typing somewhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

      if (event.key === "/" && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
      }
      if (event.key === "Escape" && target === inputRef.current) {
        setValue("")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const parsed = parseQuery(value, taxonomy)
      const isEmpty =
        parsed.terms.length === 0 && parsed.year === null && parsed.placeId === null && parsed.albumId === null

      if (isEmpty) {
        setResults(null)
        return
      }

      const filtered = items.filter((item) => matchesFilters(item, parsed))
      if (parsed.terms.length === 0) {
        setResults(filtered)
        return
      }

      const index = getIndex()
      const matched = index.search(queryTermsFor(parsed.terms).join(" "), {
        filter: (result) => filtered.some((item) => item.id === result.id),
      })
      setResults(
        matched
          .map((hit) => byId.get(String(hit.id)))
          .filter((item): item is SearchItem => item !== undefined)
      )
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [value, items, byId, taxonomy])

  const searching = results !== null

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="eyebrow text-muted-foreground">{label("timeline")}</h2>
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={label("searchPlaceholder")}
            aria-label={label("searchPlaceholder")}
            className={cn(
              "h-9 w-56 rounded-full border border-border/70 bg-background/60 px-3.5 text-sm placeholder:text-muted-foreground/70 focus-visible:border-brand/60",
              focusRing
            )}
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[0.625rem] text-muted-foreground/60"
          >
            /
          </kbd>
        </div>
      </div>

      <div className="mt-4">
        {searching ? (
          results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm">{label("searchEmpty").replace("{q}", value.trim())}</p>
              <p className="mt-2 text-xs text-muted-foreground">{label("searchHint")}</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/photos/photo/${item.id}`}
                    className={cn("group block overflow-hidden rounded-xl", focusRing)}
                  >
                    <Image
                      src={item.src}
                      alt={item.caption}
                      width={item.width}
                      height={item.height}
                      sizes="(max-width: 640px) 45vw, 22vw"
                      placeholder={item.blur ? "blur" : "empty"}
                      blurDataURL={item.blur || undefined}
                      className="aspect-square w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                    />
                    <p className="mt-1.5 truncate text-xs">{item.caption}</p>
                    <p className="truncate font-mono text-[0.625rem] text-muted-foreground">
                      {locale === "zh" ? item.place : item.placeEn || item.place} · {item.bucket}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          children
        )}
      </div>
    </>
  )
}
