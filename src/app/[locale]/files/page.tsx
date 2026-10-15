import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function FilesPage(props: PageProps<"/[locale]/files">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.files}
      description={dict.modules.files}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
