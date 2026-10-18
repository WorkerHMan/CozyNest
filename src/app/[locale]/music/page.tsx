import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function MusicPage(props: PageProps<"/[locale]/music">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.music}
      description={dict.modules.music}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
