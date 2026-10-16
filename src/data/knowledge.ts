/**
 * Knowledge-base directions.
 *
 * The knowledge base is a second, long-lived layer next to the blog: a blog post
 * stays as it was published, a note here is meant to be revised for years. Only
 * the five directions themselves exist today — **no individual note page has been
 * written yet**, so `hasPublishedNotes` is `false` for all of them. The page uses
 * that flag instead of guessing, so it never links to a route that would 404.
 *
 * Bilingual strings live in the data file rather than in `src/i18n`: they are
 * content (like a blog title), while interface labels keep coming from the
 * dictionary. Nothing here reads the clock, so the page stays prerenderable.
 */

/** A string that exists in both site languages. */
export interface LocalizedText {
  zh: string
  en: string
}

export interface KnowledgeTopic {
  title: LocalizedText
}

export interface KnowledgeDirection {
  /** Stable id, used as the React key and as an anchor for future note routes. */
  key: string
  title: LocalizedText
  /** One-line summary shown on the direction card. */
  summary: LocalizedText
  /**
   * Notes this direction holds — written and still to be written. None of them
   * are published yet; see `hasPublishedNotes`.
   */
  noteCount: number
  /** False for every direction today: no note route exists to link to. */
  hasPublishedNotes: boolean
  /** 2–3 headline topics, shown as non-interactive chips. */
  topics: KnowledgeTopic[]
  /**
   * The matching blog category, when one exists. Blog categories are the only
   * live route for these subjects, so a direction with one links to the blog
   * category filter and a direction without one stays a plain, non-navigational
   * card.
   */
  blogCategory?: string
}

export const knowledgeDirections: KnowledgeDirection[] = [
  {
    key: "cpp",
    title: { zh: "C / C++", en: "C / C++" },
    summary: {
      zh: "把语言细节讲清楚：内存模型、对象生命周期与零开销抽象，以及在 MCU 上的取舍。",
      en: "The language details that matter: memory model, object lifetime, zero-overhead abstraction, and the trade-offs on an MCU.",
    },
    noteCount: 18,
    hasPublishedNotes: false,
    topics: [
      {
        title: {
          zh: "内存模型与对象生命周期",
          en: "Memory model & object lifetime",
        },
      },
      {
        title: { zh: "指针、引用与 const 正确性", en: "Pointers, references, const correctness" },
      },
      {
        title: { zh: "嵌入式里的现代 C++ 取舍", en: "Modern C++ trade-offs in embedded code" },
      },
    ],
  },
  {
    key: "stm32",
    title: { zh: "STM32", en: "STM32" },
    summary: {
      zh: "外设驱动、时钟树、中断与 DMA，从寄存器到 HAL 的可复用配置记录。",
      en: "Peripheral drivers, clock tree, interrupts and DMA — reusable configuration notes from registers up to HAL.",
    },
    noteCount: 26,
    hasPublishedNotes: false,
    topics: [
      { title: { zh: "时钟树与总线使能", en: "Clock tree & bus enables" } },
      { title: { zh: "中断、DMA 与外设驱动", en: "Interrupts, DMA & peripheral drivers" } },
      { title: { zh: "寄存器与 HAL 的取舍", en: "Register-level vs HAL" } },
    ],
    blogCategory: "STM32",
  },
  {
    key: "freertos",
    title: { zh: "FreeRTOS", en: "FreeRTOS" },
    summary: {
      zh: "任务与优先级设计、同步原语与内存管理，以及实时性问题的定位方法。",
      en: "Task and priority design, synchronisation primitives, memory management, and how to pin down real-time problems.",
    },
    noteCount: 14,
    hasPublishedNotes: false,
    topics: [
      { title: { zh: "任务与优先级设计", en: "Tasks & priority design" } },
      { title: { zh: "队列、信号量与互斥量", en: "Queues, semaphores & mutexes" } },
      { title: { zh: "内存管理与实时性排查", en: "Memory management & real-time debugging" } },
    ],
    blogCategory: "FreeRTOS",
  },
  {
    key: "linux",
    title: { zh: "Linux", en: "Linux" },
    summary: {
      zh: "系统编程、设备树与驱动开发，配上一套顺手的性能与调试工具链。",
      en: "Systems programming, device tree and driver development, with a debugging and profiling toolchain that fits.",
    },
    noteCount: 22,
    hasPublishedNotes: false,
    topics: [
      { title: { zh: "系统编程：进程与线程", en: "Systems programming: processes & threads" } },
      { title: { zh: "设备树与驱动开发", en: "Device tree & driver development" } },
      { title: { zh: "性能分析与调试工具链", en: "Profiling & debugging toolchain" } },
    ],
    blogCategory: "Linux",
  },
  {
    key: "vision",
    title: { zh: "计算机视觉", en: "Computer vision" },
    summary: {
      zh: "从图像处理基础到传统算法，再到模型部署与推理加速的工程做法。",
      en: "From image-processing fundamentals and classical algorithms to model deployment and inference acceleration.",
    },
    noteCount: 11,
    hasPublishedNotes: false,
    topics: [
      { title: { zh: "图像处理基础", en: "Image processing fundamentals" } },
      { title: { zh: "传统算法与特征工程", en: "Classical algorithms & features" } },
      { title: { zh: "模型部署与推理加速", en: "Model deployment & inference acceleration" } },
    ],
  },
]

/**
 * Build-time placeholders for the dashboard stat row.
 *
 * These three numbers are **not** counted from anything: the modules that would
 * provide them (projects, the knowledge notes, the photo albums) either have no
 * data file yet or are being written in parallel, so importing them here would
 * break this page's typecheck for reasons that have nothing to do with it. They
 * are literals on purpose and must be replaced, one by one, by real counts once
 * those data files exist. `articles` on the dashboard is already real (it comes
 * from `listPosts`) and is deliberately not part of this constant.
 *
 * `notes` is kept equal to the sum of `knowledgeDirections[].noteCount` (91).
 */
export const dashboardPlaceholderCounts = {
  projects: 6,
  notes: 91,
  photos: 48,
} as const
