import type { Localized } from "@/types/content"

/**
 * The tools menu's data.
 *
 * ## Shapes
 *
 * Two levels, like the reference: a category, and the entries inside it. A
 * category with no entries yet is still declared — it is a promise of what this
 * page will hold, and the menu renders it as "还没有收录" rather than hiding it, so
 * the shape of the collection is visible before it is filled.
 *
 * ## Missing hrefs are deliberate
 *
 * An entry with no `href` is a name that has been decided but whose address has
 * not been checked yet. The menu renders those as plain text, never as a link —
 * a link that goes nowhere is worse than a label that admits it is not ready.
 *
 * ## Where the addresses came from
 *
 * Every `href` here was read off the published link directory at
 * `tblog.mmzhiku.xyz/collections` rather than guessed. That site's own grouping
 * differs from the nine categories below, so entries are filed by what they are,
 * not by where they were found.
 */
export interface ToolEntry {
  label: Localized<string>
  /** Omitted until the address is verified. Text-only entries render as labels. */
  href?: string
  /** The bare domain, shown under the name. Kept short on purpose. */
  domain?: string
  /** One short line for the `/tools` page; the menu ignores it. */
  note?: Localized<string>
}

export interface ToolCategory {
  id: string
  label: Localized<string>
  items: ToolEntry[]
}

export const toolCategories: ToolCategory[] = [
  {
    id: "drawing",
    label: { zh: "画图工具", en: "Images" },
    items: [
      {
        label: { zh: "抠抠图", en: "KouKouTu" },
        href: "https://www.koukoutu.com/removebgtool/all",
        domain: "koukoutu.com",
        note: { zh: "一键去背景，批量处理，输出透明 PNG。", en: "One-click background removal." },
      },
      {
        label: { zh: "OneImage", en: "OneImage" },
        href: "https://oneimage.co/",
        domain: "oneimage.co",
        note: { zh: "压缩、裁剪、模糊、转格式，全部在浏览器里完成。", en: "Compress and convert in the browser." },
      },
      {
        label: { zh: "在线图像工具箱", en: "Photo toolkit" },
        href: "https://phototool.cn/",
        domain: "phototool.cn",
        note: { zh: "格式转换、压缩、裁剪与批量下载。", en: "Convert, compress, crop, batch download." },
      },
      {
        label: { zh: "GIF 背景移除", en: "GIF background remover" },
        href: "https://adworker.ai/zh/tools/gif-background-remover/",
        domain: "adworker.ai",
        note: { zh: "识别并去掉 GIF 动图的背景。", en: "Removes the background from animated GIFs." },
      },
    ],
  },
  {
    id: "dev-helper",
    label: { zh: "开发辅助工具", en: "Developer helpers" },
    items: [
      {
        label: { zh: "网络测速 · 中科大", en: "USTC speed test" },
        href: "https://test.ustc.edu.cn/",
        domain: "test.ustc.edu.cn",
        note: { zh: "测本地带宽与网络延迟。", en: "Bandwidth and latency." },
      },
      {
        label: { zh: "ITDOG 网络工具", en: "ITDOG network tools" },
        href: "https://www.itdog.cn/",
        domain: "itdog.cn",
        note: { zh: "Ping、TCPing、网站测速、路由追踪、DNS 查询。", en: "Ping, TCPing, HTTP timing, traceroute, DNS." },
      },
      {
        label: { zh: "Ollama", en: "Ollama" },
        href: "https://ollama.com/",
        domain: "ollama.com",
        note: { zh: "本地跑开源大模型，一键部署。", en: "Run open models locally." },
      },
      {
        label: { zh: "PatorJK", en: "PatorJK" },
        href: "https://patorjk.com/",
        domain: "patorjk.com",
        note: { zh: "ASCII 艺术字生成器与一堆小工具。", en: "ASCII art and assorted generators." },
      },
    ],
  },
  {
    id: "stock",
    label: { zh: "在线素材库", en: "Stock assets" },
    items: [
      {
        label: { zh: "StarDots 图床", en: "StarDots hosting" },
        href: "https://dashboard.stardots.io/?lang=zh",
        domain: "stardots.io",
        note: { zh: "图片托管与 CDN 加速，支持图片转换与分发。", en: "Image hosting with CDN." },
      },
      {
        label: { zh: "SauceNAO", en: "SauceNAO" },
        href: "https://saucenao.com/",
        domain: "saucenao.com",
        note: { zh: "以图搜图，找插画与同人图的出处。", en: "Reverse image search for illustrations." },
      },
    ],
  },
  {
    id: "design",
    label: { zh: "设计制作类工具", en: "Design and production" },
    items: [
      {
        label: { zh: "Figma", en: "Figma" },
        href: "https://www.figma.com/",
        domain: "figma.com",
        note: { zh: "在线 UI/UX 设计协作。", en: "Collaborative interface design." },
      },
      {
        label: { zh: "shadcn/ui", en: "shadcn/ui" },
        href: "https://ui.shadcn.com/",
        domain: "ui.shadcn.com",
        note: { zh: "这个站点自己用的组件库。", en: "The component library this site is built on." },
      },
      {
        label: { zh: "Magic UI", en: "Magic UI" },
        href: "https://magicui.design/",
        domain: "magicui.design",
        note: { zh: "可直接复制的动效组件。", en: "Copy-paste animated components." },
      },
      {
        label: { zh: "Aceternity UI", en: "Aceternity UI" },
        href: "https://ui.aceternity.com/",
        domain: "ui.aceternity.com",
        note: { zh: "视觉冲击强的开源动效组件。", en: "High-impact animated components." },
      },
      {
        label: { zh: "Uiverse", en: "Uiverse" },
        href: "https://uiverse.io/",
        domain: "uiverse.io",
        note: { zh: "社区驱动的按钮、输入框、卡片元素库。", en: "Community UI elements." },
      },
      {
        label: { zh: "CodePen", en: "CodePen" },
        href: "https://codepen.io/",
        domain: "codepen.io",
        note: { zh: "实时编写与分享前端片段。", en: "Front-end snippets in the browser." },
      },
      {
        label: { zh: "Awwwards", en: "Awwwards" },
        href: "https://www.awwwards.com/",
        domain: "awwwards.com",
        note: { zh: "网页设计作品评选，找灵感用。", en: "Web design awards and inspiration." },
      },
    ],
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

/** How many addresses are still missing, for the /tools page to state plainly. */
export const pendingLinks = toolCategories.reduce(
  (total, category) => total + category.items.filter((item) => !item.href).length,
  0
)
