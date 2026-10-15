import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">
) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.dashboard}
      description={dict.modules.dashboard}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
