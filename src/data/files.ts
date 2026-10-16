import type { LocalizedText } from "@/data/knowledge"
import type { Locale } from "@/i18n/config"

/**
 * Sample file listing.
 *
 * There is no storage backend yet, so these are placeholder rows: the metadata is
 * real data (name, category, byte size, ISO date, bilingual description) and the
 * table renders it as-is, but **no file behind them can be downloaded**. The page
 * renders the download control disabled and says why, rather than pointing at a
 * URL that does not exist. Dates are fixed strings — nothing here reads the
 * clock, which would be a build error under `cacheComponents`.
 */

export type FileCategoryKey = "datasheet" | "driver" | "script" | "doc"

export interface FileCategory {
  key: FileCategoryKey
  /**
   * Category names are content, like a blog category, so they are bilingual here
   * instead of in `src/i18n` (which is owned elsewhere and not editable).
   */
  label: LocalizedText
}

export interface FileEntry {
  /** Unique within this list; also used as the React key. */
  name: string
  category: FileCategoryKey
  /** Size in bytes. Rendered through `formatFileSize`. */
  size: number
  /** ISO calendar date, `YYYY-MM-DD`. */
  updatedAt: string
  description: LocalizedText
}

/** Display order of the filter chips; also the order used in the table. */
export const fileCategories: FileCategory[] = [
  { key: "datasheet", label: { zh: "数据手册", en: "Datasheets" } },
  { key: "driver", label: { zh: "驱动代码", en: "Drivers" } },
  { key: "script", label: { zh: "脚本", en: "Scripts" } },
  { key: "doc", label: { zh: "文档", en: "Documents" } },
]

export const files: FileEntry[] = [
  {
    name: "STM32F407ZGT6-datasheet.pdf",
    category: "datasheet",
    size: 4_312_064,
    updatedAt: "2025-10-14",
    description: {
      zh: "主控的电气特性、引脚复用与外设资源速查，画原理图时对着看。",
      en: "Electrical characteristics, pin alternate functions and peripheral resources — kept open while drawing a schematic.",
    },
  },
  {
    name: "MPU6050-register-map.pdf",
    category: "datasheet",
    size: 1_845_248,
    updatedAt: "2025-09-28",
    description: {
      zh: "六轴传感器的寄存器手册，调 I2C 驱动时用得上。",
      en: "Register map for the six-axis IMU; handy while debugging an I2C driver.",
    },
  },
  {
    name: "stm32-i2c-driver.c",
    category: "driver",
    size: 12_288,
    updatedAt: "2025-12-05",
    description: {
      zh: "带超时与重试的阻塞式 I2C 驱动，在 FreeRTOS 下包一层互斥量即可复用。",
      en: "Blocking I2C driver with timeouts and retries; wrap it in a mutex and it works under FreeRTOS.",
    },
  },
  {
    name: "stm32-i2c-driver.h",
    category: "driver",
    size: 3_072,
    updatedAt: "2025-12-05",
    description: {
      zh: "上面那份驱动的接口头文件，只暴露句柄与读写函数。",
      en: "Interface header for the driver above — it exposes nothing but the handle and the read/write calls.",
    },
  },
  {
    name: "freertos-task-template.c",
    category: "driver",
    size: 8_192,
    updatedAt: "2026-01-09",
    description: {
      zh: "任务、队列与看门狗的标准骨架，新建工程时直接复制。",
      en: "A standard task, queue and watchdog skeleton that I copy into every new project.",
    },
  },
  {
    name: "linux-chardev-driver.c",
    category: "driver",
    size: 15_360,
    updatedAt: "2025-12-21",
    description: {
      zh: "字符设备最小实现：file_operations、ioctl 与 misc 注册。",
      en: "Minimal character-device implementation: file_operations, ioctl and misc registration.",
    },
  },
  {
    name: "build-flash.py",
    category: "script",
    size: 6_144,
    updatedAt: "2025-11-19",
    description: {
      zh: "一键编译并烧写的脚本，支持多目标与串口自动探测。",
      en: "One-command build-and-flash script with multiple targets and serial-port autodetection.",
    },
  },
  {
    name: "serial-plot.py",
    category: "script",
    size: 4_096,
    updatedAt: "2025-10-30",
    description: {
      zh: "把串口里的 CSV 实时画成曲线，用来观察 PID 调参效果。",
      en: "Plots CSV streamed over serial in real time — useful while tuning a PID loop.",
    },
  },
  {
    name: "batch-image-resize.py",
    category: "script",
    size: 5_120,
    updatedAt: "2026-01-04",
    description: {
      zh: "批量缩放与格式转换，给数据集做准备。",
      en: "Batch resize and format conversion for preparing a dataset.",
    },
  },
  {
    name: "freertos-checklist.md",
    category: "doc",
    size: 9_216,
    updatedAt: "2026-01-22",
    description: {
      zh: "新建 FreeRTOS 工程前必查的清单：优先级、栈大小与中断安全。",
      en: "The checklist I run before starting a FreeRTOS project: priorities, stack sizes, interrupt safety.",
    },
  },
  {
    name: "linux-driver-debug-notes.md",
    category: "doc",
    size: 24_576,
    updatedAt: "2025-12-24",
    description: {
      zh: "把 dmesg、ftrace、perf 的排查路径整理成一页速查表。",
      en: "The dmesg / ftrace / perf debugging path compressed into a one-page cheat sheet.",
    },
  },
]

const sizeUnits = ["B", "KB", "MB", "GB"] as const

/**
 * Human-readable byte size (`B` / `KB` / `MB`), with at most one decimal so the
 * column width stays stable. Stepped by 1024, which is what a file manager shows.
 */
export function formatFileSize(bytes: number, locale: Locale): string {
  let value = Math.max(bytes, 0)
  let unit = 0
  while (value >= 1024 && unit < sizeUnits.length - 1) {
    value /= 1024
    unit += 1
  }
  const rounded = unit === 0 ? Math.round(value) : Math.round(value * 10) / 10
  const formatted = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(rounded)
  return `${formatted} ${sizeUnits[unit]}`
}
