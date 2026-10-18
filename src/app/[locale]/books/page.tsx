import { PlaceholderPage } from "@/components/common/placeholder-page"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

export default async function BooksPage(props: PageProps<"/[locale]/books">) {
  const { locale } = await props.params
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale)

  return (
    <PlaceholderPage
      title={dict.nav.books}
      description={dict.modules.books}
      badge={dict.placeholder.badge}
      backHome={dict.placeholder.backHome}
    />
  )
}
