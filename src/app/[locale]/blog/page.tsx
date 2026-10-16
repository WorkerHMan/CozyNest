import Link from "next/link"
import { Suspense } from "react"
import { ActivityHeatmap } from "@/components/blog/activity-heatmap"
import { BlogSearch } from "@/components/blog/blog-search"
import {
  BlogViewTabs,
  isBlogView,
  type BlogView,
} from "@/components/blog/blog-view-tabs"
import { PostCard } from "@/components/blog/post-card"
import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"
import {
  defaultLocale,
  getDictionary,
  isLocale,
  type Dictionary,
  type Locale,
} from "@/i18n"
import {
  getActivityDays,
  getCategories,
  getFeaturedPosts,
  getTags,
  listPosts,
  type PostEntry,
} from "@/lib/blog"
import { cn } from "@/lib/utils"

/**
 * Blog index.
 *
 * All view and filter state lives in the URL (`?view=`, `?category=`, `?tag=`,
 * `?q=`), and every view is rendered on the server, so a filtered view is
 * shareable and works without JavaScript.
 *
 * `searchParams` is read **inside** the `<Suspense>` boundary rather than in the
 * page body: URL data accessed outside Suspense blocks the navigation, which
 * Next.js flags as "encountered URL data during prerendering or a navigation".
 * The title and article count are static and ship in the shell; only the
 * filterable part streams.
 */
export default async function BlogPage(props: PageProps<"/[locale]/blog">) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const posts = listPosts(resolved)

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
          {dict.blog.title}
        </h1>
        <p className="leading-relaxed text-pretty text-muted-foreground">
          {dict.blog.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <p className="font-mono text-xs text-muted-foreground">
            {dict.blog.resultsPrefix} {posts.length} {dict.blog.resultsSuffix}
          </p>
          <Link
            href="/blog/starmap"
            className="rounded-sm text-xs font-medium text-brand outline-none transition-colors duration-200 hover:text-brand-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {dict.blog.starmap}
          </Link>
        </div>
      </header>

      <Suspense fallback={<BlogViewsSkeleton />}>
        <BlogViews
          searchParams={props.searchParams}
          dict={dict}
          locale={resolved}
          posts={posts}
        />
      </Suspense>
    </Container>
  )
}

function BlogViewsSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-hidden>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

async function BlogViews({
  searchParams,
  dict,
  locale,
  posts,
}: {
  searchParams: PageProps<"/[locale]/blog">["searchParams"]
  dict: Dictionary
  locale: Locale
  posts: readonly PostEntry[]
}) {
  const search = await searchParams
  const rawView = typeof search.view === "string" ? search.view : "featured"
  const view: BlogView = isBlogView(rawView) ? rawView : "featured"
  const activeCategory =
    typeof search.category === "string" ? search.category : undefined
  const activeTag = typeof search.tag === "string" ? search.tag : undefined
  const initialQuery = typeof search.q === "string" ? search.q : ""

  const categories = getCategories(locale)
  const tags = getTags(locale)

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "bg-brand text-[var(--brand-foreground)]"
        : "bg-muted text-muted-foreground hover:text-foreground"
    )

  const cardList = (list: readonly PostEntry[]) => (
    <ul className="grid gap-4 sm:grid-cols-2">
      {list.map((post) => (
        <li key={post.slug}>
          {/* headingLevel 2: these cards are the top-level list on this page,
              so leaving them at h3 skipped a level (h1 -> h3). */}
          <PostCard post={post} locale={locale} dict={dict} headingLevel={2} />
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <div className="mt-8">
        <BlogSearch
          posts={posts}
          locale={locale}
          dict={dict}
          initialQuery={initialQuery}
        />
      </div>

      {/* While a search is active the browse views are hidden — `hidden` also
          removes them from the accessibility tree, so screen readers are not
          read a list that is not on screen. */}
      <div className="mt-8" hidden={initialQuery !== ""}>
        <BlogViewTabs
          active={view}
          basePath="/blog"
          label={dict.blog.title}
          views={dict.blog.views}
        />
      </div>

      <div className="mt-8" hidden={initialQuery !== ""}>
        {view === "featured" ? cardList(getFeaturedPosts(locale, 6)) : null}

        {view === "categories" ? (
          <div className="space-y-6">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/blog?view=categories"
                  aria-current={activeCategory ? undefined : "true"}
                  className={chipClass(!activeCategory)}
                >
                  {dict.blog.all} ({posts.length})
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={`/blog?view=categories&category=${encodeURIComponent(category.name)}`}
                    aria-current={
                      activeCategory === category.name ? "true" : undefined
                    }
                    className={chipClass(activeCategory === category.name)}
                  >
                    {category.name} ({category.count})
                  </Link>
                </li>
              ))}
            </ul>
            {cardList(
              posts.filter(
                (post) => !activeCategory || post.category === activeCategory
              )
            )}
          </div>
        ) : null}

        {view === "tags" ? (
          <div className="space-y-6">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/blog?view=tags"
                  aria-current={activeTag ? undefined : "true"}
                  className={chipClass(!activeTag)}
                >
                  {dict.blog.all} ({posts.length})
                </Link>
              </li>
              {tags.map((tag) => (
                <li key={tag.name}>
                  <Link
                    href={`/blog?view=tags&tag=${encodeURIComponent(tag.name)}`}
                    aria-current={activeTag === tag.name ? "true" : undefined}
                    className={chipClass(activeTag === tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </Link>
                </li>
              ))}
            </ul>
            {cardList(
              posts.filter((post) => !activeTag || post.tags.includes(activeTag))
            )}
          </div>
        ) : null}

        {view === "archive" ? (
          <div className="space-y-10">
            <ActivityHeatmap
              days={getActivityDays(locale)}
              legendLess={dict.blog.heatmapLess}
              legendMore={dict.blog.heatmapMore}
              summaryLabel={dict.blog.archiveSummary}
              emptyLabel={dict.blog.heatmapEmpty}
            />
            <div className="space-y-8">
              {Object.entries(
                posts.reduce<Record<string, PostEntry[]>>((groups, post) => {
                  const year = post.publishedAt.slice(0, 4)
                  groups[year] = [...(groups[year] ?? []), post]
                  return groups
                }, {})
              )
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([year, yearPosts]) => (
                  <section key={year} className="space-y-4">
                    <h2 className="font-mono text-sm font-semibold tracking-tight">
                      {year}
                    </h2>
                    <ul className="space-y-3">
                      {yearPosts.map((post) => (
                        <li
                          key={post.slug}
                          className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                        >
                          <time
                            dateTime={post.publishedAt}
                            className="font-mono text-xs text-muted-foreground"
                          >
                            {post.publishedAt}
                          </time>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="rounded-sm text-sm font-medium outline-none transition-colors duration-200 hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
