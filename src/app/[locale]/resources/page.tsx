import { ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { resourceGroups, resources, type ResourceGroup } from "@/data/resources"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

/**
 * Resource roundup.
 *
 * Every link leaves the site, so each one carries `target="_blank"` plus
 * `rel="noopener noreferrer"`, an `ExternalLink` icon, and an accessible name
 * that says so — a link that silently opens a new tab is a small but real
 * usability problem.
 *
 * The whole card is one link target via the stretched-link pattern, so a
 * keyboard user gets a single stop per entry.
 */
export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const labels = dict.pages.resources

  const groupLabel: Record<ResourceGroup, string> = {
    articles: labels.groups.articles,
    projects: labels.groups.projects,
    software: labels.groups.software,
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${resources.length} ${labels.countLabel}`}
      />

      <div className="mt-10 space-y-12">
        {resourceGroups.map((group) => {
          const entries = resources.filter((entry) => entry.group === group)
          if (entries.length === 0) return null

          return (
            <section key={group} className="space-y-4">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {groupLabel[group]}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <article className="relative h-full rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm leading-relaxed font-semibold text-balance">
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${entry.title[resolved]} — ${labels.externalLabel}`}
                            className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {entry.title[resolved]}
                            <ExternalLink
                              aria-hidden
                              className="ml-1.5 inline size-3.5 text-muted-foreground"
                            />
                          </a>
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          {entry.source}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                        {entry.description[resolved]}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </Container>
  )
}
