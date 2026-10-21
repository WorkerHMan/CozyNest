import { CalendarDays, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getTopic } from "@/config/topics"
import { formatArticleDate, type Article } from "@/data/posts"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** Cover tile derived from the slug, used only when an article has no artwork. */
function fallbackCover(id: string): { background: string } {
  let hue = 180
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return {
    background: `linear-gradient(140deg, oklch(0.52 0.13 ${hue}), oklch(0.74 0.11 ${(hue + 52) % 360}))`,
  }
}

/**
 * 文章卡片 — the grid card used by every article listing.
 *
 * Modelled on the reference the owner pointed at: artwork on top with the title set
 * over it, then the excerpt, a date + topic row, and tags along the bottom. A grid
 * of equal cards reads like a shelf; the earlier horizontal layout read like a
 * feed, which is the wrong feel for an archive.
 *
 * The title is white over the image, so it gets a gradient scrim — white text
 * straight onto an arbitrary photo fails contrast the moment the photo is light.
 */
export function PostCard({ article, locale }: { article: Article; locale: Locale }) {
  const topic = getTopic(article.topic)
  const href = `/blog/${article.slug}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow duration-200 hover:shadow-lg hover:shadow-black/10">
      <Link href={href} className={cn("relative block aspect-[16/9]", focusRing)}>
        {article.cover ? (
          <Image
            src={article.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span aria-hidden className="absolute inset-0" style={fallbackCover(article.slug)} />
        )}

        {/* Scrim: white text over an arbitrary photo needs it to stay readable. */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/35 to-transparent"
        />
        <h4 className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 font-heading text-base font-semibold leading-snug text-balance text-white drop-shadow">
          {article.title[locale]}
        </h4>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {article.summary[locale]}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 font-mono text-[0.6875rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays aria-hidden className="size-3" />
            <time dateTime={article.publishedAt}>
              {formatArticleDate(article.publishedAt, locale)}
            </time>
          </span>
          {topic ? (
            <Link
              href={`/blog/topic/${topic.id}`}
              className={cn("inline-flex items-center gap-1 hover:underline", topic.accent, focusRing)}
            >
              <Tag aria-hidden className="size-3" />
              {topic.label[locale]}
            </Link>
          ) : null}
        </div>

        {article.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {article.tags.slice(0, 4).map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className={cn(
                    "inline-block rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[0.625rem] text-brand transition-colors duration-200 hover:bg-brand/20",
                    focusRing
                  )}
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
