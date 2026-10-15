import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function ToolsPage(props: PageProps<"/[locale]/tools">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.tools}
      description={dict.modules.tools}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
