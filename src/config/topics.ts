import type { Localized } from "@/types/content"

/**
 * 技术点 — the primary axis of the blog.
 *
 * One topic per article, kept deliberately coarse: tags are the fine-grained
 * axis. The star map reads from this list, so `id` is what an article's `topic`
 * field points at, and adding a topic is a single entry here.
 */
export interface Topic {
  id: string
  label: Localized<string>
  /** One line shown under the topic heading. */
  blurb: Localized<string>
  /**
   * Tailwind text colour for the dot and heading accent. Reuses the palette the
   * nav icons already use, so the two surfaces feel like one system.
   */
  accent: string
}

export const topics: readonly Topic[] = [
  {
    id: "cpp",
    label: { zh: "C / C++", en: "C / C++" },
    blurb: {
      zh: "语言基础、内存模型与嵌入式里的取舍。",
      en: "The language, the memory model, and the trade-offs embedded forces on you.",
    },
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "stm32",
    label: { zh: "STM32", en: "STM32" },
    blurb: {
      zh: "时钟、外设、中断与 DMA 的实操记录。",
      en: "Clocks, peripherals, interrupts and DMA, from registers to HAL.",
    },
    accent: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "freertos",
    label: { zh: "FreeRTOS", en: "FreeRTOS" },
    blurb: {
      zh: "调度、同步与实时性排查。",
      en: "Scheduling, synchronisation and hunting down real-time bugs.",
    },
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "linux",
    label: { zh: "Linux", en: "Linux" },
    blurb: {
      zh: "系统编程、驱动与调试工具链。",
      en: "System programming, drivers and the debugging toolchain.",
    },
    accent: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "vision",
    label: { zh: "计算机视觉", en: "Computer vision" },
    blurb: {
      zh: "图像处理与模型在边缘设备上的落地。",
      en: "Image processing, and getting models to run on edge hardware.",
    },
    accent: "text-rose-600 dark:text-rose-400",
  },
] as const

export function getTopic(id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id)
}

/** Spoken and written name of a topic; falls back to the raw id. */
export function topicLabel(id: string, locale: "zh" | "en"): string {
  return getTopic(id)?.label[locale] ?? id
}
