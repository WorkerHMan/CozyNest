import type { Locale } from "@/i18n/config"
import type { Article } from "@/types/content"

/**
 * Placeholder articles for Phase 1.
 *
 * These exist so the home page can render a realistic layout before the blog
 * module lands. Phase 2 replaces this file with real MDX files read from disk.
 */
export const articles: readonly Article[] = [
  {
    slug: "stm32-clock-tree-notes",
    title: {
      zh: "STM32 时钟树梳理：从 HSE 到外设时钟",
      en: "STM32 clock tree, end to end: from HSE to peripheral clocks",
    },
    summary: {
      zh: "整理 PLL 倍频、AHB/APB 分频与外设时钟使能的关系，并给出一份可直接对照的配置检查表。",
      en: "How PLL multiplication, AHB/APB prescalers and peripheral clock enables relate, with a checklist you can follow while configuring.",
    },
    category: { zh: "STM32", en: "STM32" },
    publishedAt: "2026-01-18",
    readingMinutes: 12,
    tags: ["STM32", "时钟", "HAL"],
    featured: true,
  },
  {
    slug: "freertos-task-priority-pitfalls",
    title: {
      zh: "FreeRTOS 任务优先级的几个常见坑",
      en: "Common FreeRTOS task-priority pitfalls",
    },
    summary: {
      zh: "优先级反转、阻塞式延时与栈溢出：如何用运行时统计与栈水位把问题定位到具体任务。",
      en: "Priority inversion, blocking delays and stack overflow: using run-time stats and stack high-water marks to pin the problem to a task.",
    },
    category: { zh: "FreeRTOS", en: "FreeRTOS" },
    publishedAt: "2026-01-09",
    readingMinutes: 9,
    tags: ["FreeRTOS", "RTOS", "调试"],
    featured: true,
  },
  {
    slug: "linux-driver-debug-workflow",
    title: {
      zh: "Linux 驱动调试工作流：从 dmesg 到 ftrace",
      en: "A Linux driver debugging workflow: from dmesg to ftrace",
    },
    summary: {
      zh: "把 dmesg、动态调试、ftrace 与 perf 串成一条可复用的排查链路，覆盖加载失败与性能问题。",
      en: "Chaining dmesg, dynamic debug, ftrace and perf into one reusable workflow that covers both load failures and performance issues.",
    },
    category: { zh: "Linux", en: "Linux" },
    publishedAt: "2025-12-21",
    readingMinutes: 15,
    tags: ["Linux", "驱动", "ftrace"],
    featured: true,
  },
  {
    slug: "opencv-pipeline-on-edge-device",
    title: {
      zh: "在边缘设备上收敛一条 OpenCV 处理流水线",
      en: "Tightening an OpenCV pipeline on an edge device",
    },
    summary: {
      zh: "从分辨率、色彩空间与内存拷贝三个方向入手，把单帧处理耗时压到原来的三分之一。",
      en: "Attacking resolution, colour space and memory copies to cut per-frame latency to a third of the original.",
    },
    category: { zh: "计算机视觉", en: "Computer vision" },
    publishedAt: "2025-12-02",
    readingMinutes: 11,
    tags: ["OpenCV", "性能", "边缘计算"],
    featured: true,
  },
] as const

export function getFeaturedArticles(limit = 3): readonly Article[] {
  return articles.filter((article) => article.featured).slice(0, limit)
}

export function formatArticleDate(isoDate: string, locale: Locale): string {
  // Parsing a fixed ISO string and formatting with an explicit time zone keeps
  // prerendering deterministic and free of any clock read.
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`))
}
