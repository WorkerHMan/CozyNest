import type { Localized } from "@/types/content"

export type ResourceGroup = "articles" | "projects" | "software"

export interface ResourceEntry {
  id: string
  group: ResourceGroup
  title: Localized<string>
  description: Localized<string>
  /** Real, well-known URLs only — a roundup that 404s is worse than none. */
  url: string
  source: string
}

export const resources: readonly ResourceEntry[] = [
  {
    id: "interrupt",
    group: "articles",
    title: { zh: "Interrupt（Memfault 博客）", en: "Interrupt (Memfault blog)" },
    description: {
      zh: "嵌入式固件工程的长文合集，调试图、内存与固件更新的部分尤其扎实。",
      en: "Long-form embedded firmware writing; the debugging, memory and OTA pieces are especially solid.",
    },
    url: "https://interrupt.memfault.com/",
    source: "Memfault",
  },
  {
    id: "embedded-artistry",
    group: "articles",
    title: { zh: "Embedded Artistry", en: "Embedded Artistry" },
    description: {
      zh: "把嵌入式工程实践当成软件工程来写，测试与构建系统部分很实用。",
      en: "Treats embedded engineering as software engineering; the testing and build-system material is the practical part.",
    },
    url: "https://embeddedartistry.com/",
    source: "Embedded Artistry",
  },
  {
    id: "kernel-docs",
    group: "articles",
    title: { zh: "Linux 内核文档", en: "Linux kernel documentation" },
    description: {
      zh: "驱动开发的权威来源。先读它再读二手教程，能省很多时间。",
      en: "The authoritative source for driver work. Reading it before any second-hand tutorial saves a lot of time.",
    },
    url: "https://docs.kernel.org/",
    source: "kernel.org",
  },
  {
    id: "brendangregg",
    group: "articles",
    title: { zh: "Brendan Gregg 的性能分析资料", en: "Brendan Gregg on performance" },
    description: {
      zh: "perf、ftrace、eBPF 的系统性讲解，性能问题的排查范式基本出自这里。",
      en: "The systematic treatment of perf, ftrace and eBPF — most performance-debugging practice traces back here.",
    },
    url: "https://www.brendangregg.com/",
    source: "Brendan Gregg",
  },
  {
    id: "learnopencv",
    group: "articles",
    title: { zh: "LearnOpenCV", en: "LearnOpenCV" },
    description: {
      zh: "OpenCV 与视觉工程的教程合集，示例可直接跑。",
      en: "A tutorial collection for OpenCV and vision engineering, with runnable examples.",
    },
    url: "https://learnopencv.com/",
    source: "LearnOpenCV",
  },
  {
    id: "freertos-kernel",
    group: "projects",
    title: { zh: "FreeRTOS 内核", en: "FreeRTOS kernel" },
    description: {
      zh: "读调度器和队列的实现，比只查 API 文档更能理解行为边界。",
      en: "Reading the scheduler and queue implementation explains the behavioural edges far better than the API docs alone.",
    },
    url: "https://github.com/FreeRTOS/FreeRTOS-Kernel",
    source: "GitHub",
  },
  {
    id: "libopencm3",
    group: "projects",
    title: { zh: "libopencm3", en: "libopencm3" },
    description: {
      zh: "不依赖厂商库的 ARM Cortex-M 固件库，适合想弄清寄存器层的人。",
      en: "A vendor-library-free ARM Cortex-M firmware library, for when you want to see the register layer.",
    },
    url: "https://github.com/libopencm3/libopencm3",
    source: "GitHub",
  },
  {
    id: "zephyr",
    group: "projects",
    title: { zh: "Zephyr RTOS", en: "Zephyr RTOS" },
    description: {
      zh: "设备树与 Kconfig 驱动的现代 RTOS，工程组织方式值得借鉴。",
      en: "A modern RTOS organised around devicetree and Kconfig; its project structure is worth studying.",
    },
    url: "https://github.com/zephyrproject-rtos/zephyr",
    source: "GitHub",
  },
  {
    id: "opencv",
    group: "projects",
    title: { zh: "OpenCV", en: "OpenCV" },
    description: {
      zh: "视觉工程的基础库，源码里很多实现的取舍比文档写得更清楚。",
      en: "The foundation of vision work; many implementation trade-offs are clearer in the source than in the docs.",
    },
    url: "https://github.com/opencv/opencv",
    source: "GitHub",
  },
  {
    id: "bpftrace",
    group: "projects",
    title: { zh: "bpftrace", en: "bpftrace" },
    description: {
      zh: "用一行脚本追踪内核与用户态行为，排查现场问题极省事。",
      en: "Trace kernel and userspace behaviour in a one-liner; extremely effective for live problems.",
    },
    url: "https://github.com/bpftrace/bpftrace",
    source: "GitHub",
  },
  {
    id: "godbolt",
    group: "software",
    title: { zh: "Compiler Explorer", en: "Compiler Explorer" },
    description: {
      zh: "在线看编译器输出。讨论「这样写会不会多一次拷贝」时用它最快。",
      en: "Inspect compiler output online. The fastest way to settle an argument about an extra copy.",
    },
    url: "https://godbolt.org/",
    source: "godbolt.org",
  },
  {
    id: "perfetto",
    group: "software",
    title: { zh: "Perfetto", en: "Perfetto" },
    description: {
      zh: "系统级 trace 查看器，Android 与 Linux 上都好用。",
      en: "A system-wide trace viewer that works well on both Android and Linux.",
    },
    url: "https://ui.perfetto.dev/",
    source: "perfetto.dev",
  },
  {
    id: "wireshark",
    group: "software",
    title: { zh: "Wireshark", en: "Wireshark" },
    description: {
      zh: "协议分析的老工具。配合自写 dissector 能解私有协议。",
      en: "The long-standing protocol analyser; a custom dissector handles proprietary protocols.",
    },
    url: "https://www.wireshark.org/",
    source: "wireshark.org",
  },
  {
    id: "excalidraw",
    group: "software",
    title: { zh: "Excalidraw", en: "Excalidraw" },
    description: {
      zh: "画架构图和时序图的手绘风工具，够快也够清楚。",
      en: "A hand-drawn-style tool for architecture and sequence diagrams — fast and clear enough.",
    },
    url: "https://excalidraw.com/",
    source: "excalidraw.com",
  },
  {
    id: "saleae",
    group: "software",
    title: { zh: "Saleae Logic", en: "Saleae Logic" },
    description: {
      zh: "逻辑分析仪软件。抓 I²C/SPI 时序时几乎是最省事的选择。",
      en: "Logic-analyser software; close to the least painful option for capturing I²C and SPI timing.",
    },
    url: "https://www.saleae.com/",
    source: "saleae.com",
  },
] as const

export const resourceGroups: readonly ResourceGroup[] = [
  "articles",
  "projects",
  "software",
]
