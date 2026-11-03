import type { Localized } from "@/types/content"

/**
 * The tools menu's data.
 *
 * ## Shapes
 *
 * Two levels, like the reference: a category, and the entries inside it. A
 * category with no entries yet is still declared — it is a promise of what this
 * page will hold, and the menu renders it as "还没有收录" rather than hiding it,
 * so the shape of the collection is visible before it is filled.
 *
 * ## Missing hrefs are deliberate
 *
 * An entry with no `href` is a name that has been decided but whose address has
 * not been checked yet. The menu renders those as plain text, never as a link —
 * a link that goes nowhere is worse than a label that admits it is not ready.
 *
 * Add a category or an entry by editing this file; nothing in the components
 * needs to change.
 */
export interface ToolEntry {
  label: Localized<string>
  /** Omitted until the address is verified. Text-only entries are skipped by links. */
  href?: string
  /** One short line for the `/tools` page; the menu ignores it. */
  note?: Localized<string>
}

export interface ToolCategory {
  id: string
  label: Localized<string>
  items: ToolEntry[]
}

/** The nine categories the reference menu groups its tools into. */
export const toolCategories: ToolCategory[] = [
  {
    id: "drawing",
    label: { zh: "画图工具", en: "Drawing" },
    items: [],
  },
  {
    id: "dev-helper",
    label: { zh: "开发辅助工具", en: "Developer helpers" },
    items: [],
  },
  {
    id: "stock",
    label: { zh: "在线素材库", en: "Stock assets" },
    items: [],
  },
  {
    id: "design",
    label: { zh: "设计制作类工具", en: "Design and production" },
    items: [],
  },
  {
    id: "writing",
    label: { zh: "写作辅助工具", en: "Writing aids" },
    items: [],
  },
  {
    id: "office",
    label: { zh: "在线办公工具", en: "Online office" },
    items: [],
  },
  {
    id: "notes",
    label: { zh: "文档笔记工具", en: "Docs and notes" },
    items: [],
  },
  {
    id: "learning",
    label: { zh: "在线编程学习", en: "Learning to code" },
    items: [],
  },
  {
    id: "docs",
    label: { zh: "在线教程和文档", en: "Tutorials and docs" },
    items: [
      { label: { zh: "Git 中文教程", en: "Git in Chinese" } },
      { label: { zh: "SVN 中文手册", en: "SVN handbook" } },
      { label: { zh: "jQuery API 中文文档", en: "jQuery API" } },
      { label: { zh: "Nginx 中文文档", en: "Nginx" } },
      { label: { zh: "Kafka 中文文档", en: "Kafka" } },
      { label: { zh: "MyBatis 中文文档", en: "MyBatis" } },
      { label: { zh: "微信小程序官方文档", en: "WeChat Mini Programs" } },
      { label: { zh: "Node.js 中文教程", en: "Node.js" } },
      { label: { zh: "Apache Web Server 文档", en: "Apache Web Server" } },
      { label: { zh: "Spring 文档中文版", en: "Spring" } },
      { label: { zh: "Golang 标准库中文文档", en: "Go standard library" } },
      { label: { zh: "Java 8 官方文档", en: "Java 8" } },
      { label: { zh: "Maven 官方文档", en: "Maven" } },
      { label: { zh: "Tomcat 8 官方文档", en: "Tomcat 8" } },
      { label: { zh: "Spring Boot 官方文档", en: "Spring Boot" } },
      { label: { zh: "RabbitMQ 官方文档", en: "RabbitMQ" } },
      { label: { zh: "RocketMQ 官方文档", en: "RocketMQ" } },
      { label: { zh: "Dubbo 中文文档", en: "Dubbo" } },
      { label: { zh: "Netty 官方文档", en: "Netty" } },
      { label: { zh: "Elasticsearch 官方文档", en: "Elasticsearch" } },
      { label: { zh: "Spring Cloud 官方文档", en: "Spring Cloud" } },
      { label: { zh: "Docker 官方文档", en: "Docker" } },
      { label: { zh: "Kubernetes 中文文档", en: "Kubernetes" } },
      { label: { zh: "Thymeleaf 官方文档", en: "Thymeleaf" } },
      { label: { zh: "Vue.js 中文文档", en: "Vue.js" } },
      { label: { zh: "React.js 官方文档", en: "React.js" } },
      { label: { zh: "Jenkins 中文文档", en: "Jenkins" } },
    ],
  },
]

/** Categories that actually have something to show. */
export const filledCategories = toolCategories.filter((category) => category.items.length > 0)
