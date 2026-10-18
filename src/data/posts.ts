import type { Locale } from "@/i18n/config"
import type { Article, ArticleBlock, Localized } from "@/types/content"

/**
 * The blog's content store.
 *
 * ## Why this is a TypeScript module and not MDX on disk
 *
 * The project has no MDX pipeline (no `@next/mdx`, nothing in `next.config.ts`),
 * and adding one would pull in a loader plus remark/rehype — a real change to the
 * build, not a content change. Bodies are therefore stored as typed blocks, which
 * are prerender-safe, dependency-free and trivially swappable later.
 *
 * ## Adding a post
 *
 * Append one object. `topic` must match an id in `config/topics.ts`; `slug`
 * becomes the URL. Everything else — the index, topic pages, tag pages, the year
 * archive and the home page's featured strip — is derived below, so there is no
 * second list to keep in sync.
 */
const allArticles: readonly Article[] = [
  {
    slug: "stm32-clock-tree-notes",
    topic: "stm32",
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
    body: [
      {
        kind: "p",
        text: "拿到一块新板子，第一件事往往是把时钟配到能跑、跑得对。时钟树之所以让人头大，是因为它有三层彼此牵制的分频与倍频，改一处就会顺着树往上或往下影响一整片外设。",
      },
      { kind: "h", text: "三层结构" },
      {
        kind: "ul",
        items: [
          "振荡源层：HSE 外部晶振、HSI 内部 RC，决定基准精度。",
          "PLL 层：把基准倍频到 SYSCLK，受 VCO 输入/输出范围限制。",
          "总线层：AHB、APB1、APB2 各自分频，并决定定时器时钟是否再翻倍。",
        ],
      },
      { kind: "h", text: "一次完整的推导" },
      {
        kind: "p",
        text: "以 8MHz 外部晶振、目标 168MHz 为例：先把 HSE 分频到 1MHz 再倍频到 336MHz 作为 VCO 输出，最后除 2 得到 168MHz。之所以要中间那一步分频，是为了把 VCO 输入压在数据手册要求的一到两兆之间，否则 PLL 会锁不住。",
      },
      {
        kind: "code",
        lang: "c",
        code: "RCC_OscInitTypeDef osc = {0};\nosc.OscillatorType = RCC_OSCILLATORTYPE_HSE;\nosc.HSEState = RCC_HSE_ON;\nosc.PLL.PLLM = 8;   // 8MHz / 8  = 1MHz\nosc.PLL.PLLN = 336; // 1MHz * 336 = 336MHz\nosc.PLL.PLLP = 2;   // 336 / 2  = 168MHz",
      },
      { kind: "h", text: "检查表" },
      {
        kind: "ul",
        items: [
          "确认 VCO 输入与输出都在手册范围内，而不是只看最终 SYSCLK。",
          "APB1 有上限（常见 42MHz），超了会让挂在它下面的外设行为异常而不是报错。",
          "定时器时钟在 APB 分频不为 1 时会自动翻倍，算波特率与 PWM 时别漏掉。",
          "改完时钟后重新核对 Flash 等待周期，频率上去而等待周期没跟上会读到错数据。",
        ],
      },
      {
        kind: "quote",
        text: "时钟树的坑大多不是配错，而是配对了却没跟着改下游：Flash 等待周期、外设重初始化、以及那些默认时钟源没切换的模块。",
      },
    ],
  },
  {
    slug: "freertos-task-priority-pitfalls",
    topic: "freertos",
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
    body: [
      {
        kind: "p",
        text: "实时系统出的问题，症状几乎总在高优先级任务那边，根因却常常在低优先级那边。下面三个坑我踩过不止一次。",
      },
      { kind: "h", text: "一、用 vTaskDelay 当同步手段" },
      {
        kind: "p",
        text: "轮询等待一个标志位时顺手写个 vTaskDelay(10)，看上去把 CPU 让出去了，实际上把响应延迟和轮询周期焊死在一起：事件在第 9 毫秒到达，你也要等到第 10 毫秒。用二值信号量或任务通知，事件到了立刻唤醒。",
      },
      { kind: "h", text: "二、优先级高于临界区的假设不成立" },
      {
        kind: "p",
        text: "关中断或持锁期间，高优先级任务不是\"先跑\"，而是\"一起排队\"。如果临界区里还有阻塞调用，优先级反转就变成死等的另一种写法。临界区要短，且里面不能有会阻塞的东西。",
      },
      { kind: "h", text: "三、栈溢出报警前就把栈踩了" },
      {
        kind: "p",
        text: "xPortGetFreeHeapSize 看的是堆，任务栈要看 uxTaskGetStackHighWaterMark：它返回的是历史最低剩余量。留 20% 是经验值，不是保证——浮点、printf 家族与递归都会在最坏路径上多要不少。",
      },
      {
        kind: "code",
        lang: "c",
        code: "UBaseType_t high = uxTaskGetStackHighWaterMark(NULL);\nif (high < configMINIMAL_STACK_SIZE / 4) {\n    // 栈水位过低，先记录下来再决定是否降级",
      },
      {
        kind: "quote",
        text: "排查顺序建议：先开运行时统计看谁占 CPU，再看栈水位看谁快爆，最后才去读代码找逻辑。",
      },
    ],
  },
  {
    slug: "linux-driver-debug-workflow",
    topic: "linux",
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
    body: [
      {
        kind: "p",
        text: "驱动出问题分两类：加载不起来，和跑起来不对。前者的证据在 dmesg，后者的证据在 ftrace 与 perf，两条链路其实可以串成一套固定动作。",
      },
      { kind: "h", text: "第一层：它到底说了什么" },
      {
        kind: "code",
        lang: "bash",
        code: "dmesg -w\n# 或带上时间戳与级别\ndmesg --time-format=iso -H",
      },
      {
        kind: "p",
        text: "加载失败基本都能在这里看到：probe 返回的错误码、资源冲突、compatible 不匹配。注意错误码是\"谁返回的\"，而不是\"谁打印的\"。",
      },
      { kind: "h", text: "第二层：让它自己多说话" },
      {
        kind: "code",
        lang: "bash",
        code: "# 打开某个源的动态调试\n# echo 'file my_driver.c +p' > /sys/kernel/debug/dynamic_debug/control",
      },
      { kind: "h", text: "第三层：看时间去哪了" },
      {
        kind: "code",
        lang: "bash",
        code: "cd /sys/kernel/debug/tracing\necho function_graph > current_tracer\necho my_ioctl > set_graph_function\ncat trace_pipe",
      },
      {
        kind: "ul",
        items: [
          "function_graph 适合看调用层级与每段的耗时，缺点是本身有开销。",
          "想抓长尾延迟，用 perf 或 tracepoint，别用全量 ftrace。",
          "抓完立刻 echo nop > current_tracer，忘了关会一直拖慢系统。",
        ],
      },
    ],
  },
  {
    slug: "opencv-pipeline-on-edge-device",
    topic: "vision",
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
    body: [
      {
        kind: "p",
        text: "同一套算法在笔记本上跑 30fps，到板子上只剩 8fps。真正吃时间的往往不是算法本身，而是算法前后那些\"顺手\"的转换与拷贝。",
      },
      { kind: "h", text: "先量，再改" },
      {
        kind: "p",
        text: "给每一段单独计时，别信整体帧率：分辨率缩放、色彩空间转换、copyTo、以及最后的上采样经常各自就吃掉几毫秒。",
      },
      { kind: "h", text: "三个最有效的动作" },
      {
        kind: "ul",
        items: [
          "降分辨率：先在原图做检测，再回到原图裁出感兴趣区域，而不是把整帧缩小后处理。",
          "减少色彩空间往返：整条链路尽量只进一次 BGR→Gray 或 BGR→RGB，中间不要再转回来。",
          "干掉隐式拷贝：用 ROI 视图代替裁剪复制，注意 ROI 不是连续的，传给某些函数前仍需一次 copy。",
        ],
      },
      {
        kind: "code",
        lang: "cpp",
        code: "// 不用先缩放整帧，直接取子区域\ncv::Mat roi = frame(cv::Rect(x, y, w, h));\n// 需要连续内存时再显式复制一次\ncv::Mat contiguous;\nroi.copyTo(contiguous);",
      },
      {
        kind: "quote",
        text: "边缘设备上的性能优化，八成是在减少数据搬运，而不是换算法。",
      },
    ],
  },
] as const

/** Newest first. Ties break on slug so the order is stable across builds. */
export const articles: readonly Article[] = [...allArticles].sort((a, b) => {
  if (a.publishedAt === b.publishedAt) return a.slug.localeCompare(b.slug)
  return a.publishedAt < b.publishedAt ? 1 : -1
})

export function getAllArticles(): readonly Article[] {
  return articles
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug)
}

export function getFeaturedArticles(limit = 3): readonly Article[] {
  return articles.filter((article) => article.featured).slice(0, limit)
}

export function getArticlesByTopic(topic: string): readonly Article[] {
  return articles.filter((article) => article.topic === topic)
}

export function getArticlesByTag(tag: string): readonly Article[] {
  return articles.filter((article) => article.tags.includes(tag))
}

/** Every topic that currently has at least one article, with its count. */
export function getTopicCounts(): readonly { topic: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const article of articles) {
    counts.set(article.topic, (counts.get(article.topic) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
}

export function getTagCounts(): readonly { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const article of articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * Articles grouped by year, newest year first.
 *
 * Built for the archive timeline: the group order and the in-group order are both
 * fixed here, so the page never has to sort during prerender.
 */
export function getArchiveByYear(): readonly { year: string; articles: readonly Article[] }[] {
  const groups = new Map<string, Article[]>()
  for (const article of articles) {
    const year = article.publishedAt.slice(0, 4)
    const bucket = groups.get(year)
    if (bucket) bucket.push(article)
    else groups.set(year, [article])
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, list]) => ({ year, articles: list }))
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

/** `12` → `12 min` / `12 分钟`. */
export function formatReadingTime(minutes: number, locale: Locale): string {
  return locale === "zh" ? `${minutes} 分钟` : `${minutes} min`
}

export type { Article, ArticleBlock, Localized }
