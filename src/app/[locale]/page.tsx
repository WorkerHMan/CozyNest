import { FeaturedPosts } from "@/components/home/featured-posts"
import { FeaturedProjects } from "@/components/home/featured-projects"
import { Hero } from "@/components/home/hero"
import { HomeBanner } from "@/components/home/home-banner"
import { RandomPickWheel } from "@/components/home/random-pick-wheel"
import { TechDirections } from "@/components/home/tech-directions"
import { YearProgress } from "@/components/home/year-progress"
import { articles } from "@/data/posts"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

/**
 * Home page. Fully static: every section reads from the dictionary and the
 * placeholder data files, so nothing here blocks the prerender.
 */
export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  return (
    <>
      {/* Illustrated cover: the header is hidden up here and slides in on
          scroll, and the cover's "enter" button jumps to #content below. */}
      <HomeBanner dict={dict} locale={resolved} />
      {/* The arrow scrolls to #content; the negative scroll margin carries the
          landing a little further down, so the view starts on the Hero's heading
          rather than on its top padding. */}
      <div id="content" className="scroll-mt-[-5rem]">
        <Hero dict={dict} />
        <TechDirections dict={dict} />
        <FeaturedPosts dict={dict} locale={resolved} />
        <FeaturedProjects dict={dict} locale={resolved} />
        {/* Closing band: the shape of the year, and a way in when the reader
            cannot pick. The 3D stage lives up in the hero. */}
        <section className="border-t border-border/60">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <YearProgress locale={resolved} />
            <RandomPickWheel
              locale={resolved}
              items={articles.map((article) => ({
                slug: article.slug,
                title: article.title[resolved],
                topic: article.topic,
              }))}
            />
          </div>
        </section>
      </div>
    </>
  )
}
