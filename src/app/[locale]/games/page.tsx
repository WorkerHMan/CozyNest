import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function GamesPage(props: PageProps<"/[locale]/games">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.games}
      description={dict.modules.games}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
