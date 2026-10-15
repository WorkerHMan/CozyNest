import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function ProjectsPage(
  props: PageProps<"/[locale]/projects">
) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.projects}
      description={dict.modules.projects}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
