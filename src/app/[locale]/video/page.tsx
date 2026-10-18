import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function VideoPage(props: PageProps<"/[locale]/video">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.video}
      description={dict.modules.video}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
