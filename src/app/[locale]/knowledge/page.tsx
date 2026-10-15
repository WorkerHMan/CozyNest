import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function KnowledgePage(
  props: PageProps<"/[locale]/knowledge">
) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.knowledge}
      description={dict.modules.knowledge}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
