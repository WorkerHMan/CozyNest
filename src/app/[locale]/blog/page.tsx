import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function BlogPage(props: PageProps<"/[locale]/blog">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.blog}
      description={dict.modules.blog}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
