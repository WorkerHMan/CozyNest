import Link from "next/link"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { listPosts } from "@/lib/blog"

/**
 * Star map: the articles as a constellation.
 *
 * Positions are derived from a hash of the slug, not from `Math.random()` —
 * randomness during prerender is a build error under `cacheComponents`, and a
 * stable layout is also what lets the points be deep-linked and diffed.
 *
 * Accessibility: every star is a real `<Link>` whose accessible name is the
 * article title. The title is `sr-only` on small screens rather than hidden, so
 * the name survives on mobile; the legend maps colours back to category names,
 * so the colour coding is never the only carrier of meaning.
 */
function hash(text: string, salt: number): number {
  let value = 2166136261 ^ salt
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

/** Kept inside 15–85% so labels never overflow the panel. */
function position(slug: string): { x: number; y: number } {
  const x = 15 + ((hash(slug, 1) % 1000) / 1000) * 70
  const y = 15 + ((hash(slug, 2) % 1000) / 1000) * 70
  return { x, y }
}

export default async function StarMapPage(
  props: PageProps<"/[locale]/blog/starmap">
) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const posts = listPosts(resolved)

  const categories = [...new Set(posts.map((post) => post.category))]
  const colorOf = (category: string) => {
    const index = categories.indexOf(category)
    // `--chart-1..5` are the design system's categorical tokens.
    return `var(--chart-${(index % 5) + 1})`
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={dict.blog.starmap}
        subtitle={dict.blog.starmapHint}
        meta={`${dict.blog.resultsPrefix} ${posts.length} ${dict.blog.resultsSuffix}`}
      />

      <div className="relative mt-8 aspect-[4/3] w-full rounded-2xl border border-border/60 bg-card/40 sm:aspect-[16/9]">
        <div aria-hidden className="bg-grid absolute inset-0 rounded-2xl opacity-40" />

        {posts.map((post) => {
          const { x, y } = position(post.slug)
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                aria-hidden
                className="mx-auto block size-3 rounded-full ring-2 ring-background motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-150"
                style={{ background: colorOf(post.category) }}
              />
              <span className="mt-1.5 block w-24 text-center text-xs leading-tight text-muted-foreground group-hover:text-foreground sm:w-32">
                <span className="sr-only sm:not-sr-only">{post.title}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <section className="mt-6">
        <h2 className="eyebrow text-muted-foreground">
          {dict.blog.starmapLegend}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {categories.map((category) => (
            <li key={category} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: colorOf(category) }}
              />
              {category}
            </li>
          ))}
        </ul>
      </section>
    </Container>
  )
}
