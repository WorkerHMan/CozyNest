import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Base64Tool } from "@/components/tools/base64-tool"
import { JsonFormatter } from "@/components/tools/json-formatter"
import { SnakeGame } from "@/components/tools/snake-game"
import { TimestampTool } from "@/components/tools/timestamp-tool"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

/**
 * Online tools.
 *
 * Every tool runs entirely in the browser — nothing is uploaded — which is both
 * the honest description and the reason there is no API route behind this page.
 * Heading order is h1 (page) → h2 (each tool) → h3 (the game inside the games
 * section), so no level is skipped.
 */
export default async function ToolsPage(props: PageProps<"/[locale]/tools">) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const labels = dict.pages.tools

  const panel = "rounded-xl bg-card p-5 ring-1 ring-foreground/10"

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader title={labels.title} subtitle={labels.subtitle} />

      <div className="mt-10 space-y-6">
        <div className={panel}>
          <JsonFormatter labels={labels} />
        </div>
        <div className={panel}>
          <Base64Tool labels={labels} />
        </div>
        <div className={panel}>
          <TimestampTool labels={labels} />
        </div>
      </div>

      <section className="mt-14 space-y-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {labels.gamesTitle}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {labels.gamesSubtitle}
        </p>
        <div className={panel}>
          <SnakeGame labels={labels} />
        </div>
      </section>
    </Container>
  )
}
