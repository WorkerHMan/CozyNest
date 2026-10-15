import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function PhotosPage(props: PageProps<"/[locale]/photos">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.photos}
      description={dict.modules.photos}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
