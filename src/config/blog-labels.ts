import type { Localized } from "@/types/content"

/**
 * Blog chrome labels.
 *
 * Kept beside the content rather than in the site dictionary: these strings
 * belong to the blog module, and the project already puts per-feature copy in
 * `config/` (see `hero-player`, `paimon`, `home-banner`).
 */
export const blogLabels = {
  eyebrow: { zh: "博客", en: "Blog" },
  title: { zh: "技术笔记", en: "Notes" },
  intro: {
    zh: "按技术点与标签归档的实践记录。这里的每一篇都来自真实的排查或实现过程，不做教程复述。",
    en: "Field notes filed by topic and tag. Every piece comes from an actual debugging or implementation session, not a rewritten tutorial.",
  },
  count: { zh: "篇文章", en: "articles" },
  topicsTitle: { zh: "技术点", en: "Topics" },
  allTitle: { zh: "全部文章", en: "All articles" },
  featuredTitle: { zh: "精选", en: "Featured" },
  empty: {
    zh: "还没有文章——这个博客是慢慢攒的。",
    en: "Nothing here yet — this blog is being built up slowly.",
  },
  readMore: { zh: "阅读全文", en: "Read it" },
  backToList: { zh: "返回文章列表", en: "Back to all articles" },
  tagsTitle: { zh: "标签", en: "Tags" },
  bodyMissing: {
    zh: "这篇的正文还在写。",
    en: "The body of this article is still being written.",
  },
  articleOnlyZh: {
    zh: "",
    en: "This article is written in Chinese.",
  },
  notFoundTitle: { zh: "找不到这篇文章", en: "Article not found" },
  topicEyebrow: { zh: "技术点", en: "Topic" },
  tagEyebrow: { zh: "标签", en: "Tag" },
  archiveTitle: { zh: "归档", en: "Archive" },
  archiveIntro: {
    zh: "按月统计的写作密度。写得少的时候，这张图会很空——这是真话，不是渲染失败。",
    en: "Writing density by month. While the blog is young this grid stays mostly empty — that is the truth, not a rendering bug.",
  },
  archiveLink: { zh: "查看归档", en: "See the archive" },
  noPosts: { zh: "这里还没有文章。", en: "Nothing filed here yet." },
  backToBlog: { zh: "全部文章", en: "All articles" },
  totalThisYear: { zh: "篇", en: "posts" },
} as const satisfies Record<string, Localized<string>>
