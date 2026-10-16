import { Countdown } from "@/components/home/countdown"
import { FeaturedPosts } from "@/components/home/featured-posts"
import { FeaturedProjects } from "@/components/home/featured-projects"
import { Hero } from "@/components/home/hero"
import { HeroGate } from "@/components/home/hero-gate"
import { TechDirections } from "@/components/home/tech-directions"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { getFeaturedPosts, listPosts } from "@/lib/blog"

/**
 * Home page. Content comes from the MDX library, so there is exactly one source
 * of truth for articles. The gate and the countdown are Client Components (the
 * countdown reads the clock, which would be a build error during prerender
 * under `cacheComponents`).
 */
export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const posts = listPosts(resolved)

  return (
    <>
      <HeroGate dict={dict} locale={resolved} />
      {/* The gate's down-indicator targets this, so keyboard users can skip the
          full-height slideshow without tabbing through every control. */}
      <div id="content">
        <Hero dict={dict} postCount={posts.length} />
        <TechDirections dict={dict} />
        <FeaturedPosts
          dict={dict}
          locale={resolved}
          posts={getFeaturedPosts(resolved, 3)}
        />
        <FeaturedProjects dict={dict} locale={resolved} />
        <Countdown dict={dict} />
      </div>
    </>
  )
}
