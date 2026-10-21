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
    cover: "/hero/dusk-lake.webp",
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
    cover: "/hero/winter-snow.webp",
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
    cover: "/hero/rooftop-berries.webp",
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
    cover: "/hero/anime-profile.webp",
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

  /* ---- demo filler: 16 more entries so the listings and the drum have volume ---- */
  {
    slug: "cpp-move-semantics",
    cover: "/hero/dusk-lake.webp",
    topic: "cpp",
    title: {
      zh: "C++ 移动语义：std::move 并不移动任何东西",
      en: "cpp move semantics",
    },
    summary: {
      zh: "std::move 只是一次类型转换，真正发生什么取决于被调用的构造函数。",
      en: "std::move 只是一次类型转换，真正发生什么取决于被调用的构造函数。",
    },
    category: { zh: "C / C++", en: "C / C++" },
    publishedAt: "2025-12-28",
    readingMinutes: 9,
    tags: ["C++", "移动语义", "右值"],
    body: [
        { kind: "p", text: "很多人以为 std::move 会搬运数据。它只把左值转成右值引用，绑定到移动构造函数——而那个函数可能是空的。" },
        { kind: "p", text: "判断标准很简单：类型是否真的持有资源。string、vector 会移动；只含 POD 的结构体和拷贝没区别。" },
    ],
  },
  {
    slug: "cpp-object-lifetime",
    cover: "/hero/winter-snow.webp",
    topic: "cpp",
    title: {
      zh: "对象生命周期与悬垂引用的三种典型场景",
      en: "cpp object lifetime",
    },
    summary: {
      zh: "返回局部引用、捕获失效引用、容器扩容后的指针失效。",
      en: "返回局部引用、捕获失效引用、容器扩容后的指针失效。",
    },
    category: { zh: "C / C++", en: "C / C++" },
    publishedAt: "2025-12-15",
    readingMinutes: 11,
    tags: ["C++", "生命周期", "调试"],
    body: [
        { kind: "p", text: "悬垂引用不会立刻崩，它在某次访问时给出随机结果——这类 bug 最难查。" },
        { kind: "p", text: "三个高频来源：返回局部变量引用、lambda 按引用捕获临时对象、vector 扩容后沿用旧迭代器。" },
    ],
  },
  {
    slug: "cpp-template-specialization",
    cover: "/hero/rooftop-berries.webp",
    topic: "cpp",
    title: {
      zh: "模板特化：编译期分发的三种写法",
      en: "cpp template specialization",
    },
    summary: {
      zh: "if constexpr、SFINAE、特化，各自适合什么场景。",
      en: "if constexpr、SFINAE、特化，各自适合什么场景。",
    },
    category: { zh: "C / C++", en: "C / C++" },
    publishedAt: "2025-11-30",
    readingMinutes: 10,
    tags: ["C++", "模板", "编译期"],
    body: [
        { kind: "p", text: "if constexpr 最好读，但要求条件在模板内部可用；SFINAE 兼容老代码；全特化适合按类型换实现。" },
    ],
  },
  {
    slug: "stm32-dma-cache",
    cover: "/hero/anime-profile.webp",
    topic: "stm32",
    title: {
      zh: "STM32H7 上 DMA 与 D-Cache 的一致性",
      en: "stm32 dma cache",
    },
    summary: {
      zh: "不开 MPU 配置就用 DMA，收到的数据可能是旧的。",
      en: "不开 MPU 配置就用 DMA，收到的数据可能是旧的。",
    },
    category: { zh: "STM32", en: "STM32" },
    publishedAt: "2025-11-22",
    readingMinutes: 13,
    tags: ["STM32", "DMA", "Cache"],
    body: [
        { kind: "p", text: "H7 的 D-Cache 让 CPU 看到的内存和外设写入的内存不是一回事。DMA 写进 RAM 后，CPU 可能读到缓存里的旧值。" },
        { kind: "p", text: "两种处理：把 DMA 缓冲区放到不可缓存区段，或者在收完后按行 invalidation。前者更简单也更不容易错。" },
    ],
  },
  {
    slug: "stm32-stop2-wakeup",
    cover: "/hero/cartoon-goats.webp",
    topic: "stm32",
    title: {
      zh: "低功耗实测：Stop2 模式的唤醒时间与电流",
      en: "stm32 stop2 wakeup",
    },
    summary: {
      zh: "实测数据比数据手册更有说服力。",
      en: "实测数据比数据手册更有说服力。",
    },
    category: { zh: "STM32", en: "STM32" },
    publishedAt: "2025-11-08",
    readingMinutes: 8,
    tags: ["STM32", "低功耗", "实测"],
    body: [
        { kind: "p", text: "空载 3.2µA，唤醒到主循环 1.8ms，唤醒源用 RTC 闹钟。" },
        { kind: "p", text: "注意：唤醒后外设时钟需要重新配置，很多人卡在这里。" },
    ],
  },
  {
    slug: "stm32-nvic-priority",
    cover: "/hero/anime-sleep.webp",
    topic: "stm32",
    title: {
      zh: "中断优先级分组：一个被忽略的全局设置",
      en: "stm32 nvic priority",
    },
    summary: {
      zh: "分组只设一次，但决定了所有中断的相对优先级。",
      en: "分组只设一次，但决定了所有中断的相对优先级。",
    },
    category: { zh: "STM32", en: "STM32" },
    publishedAt: "2025-10-26",
    readingMinutes: 7,
    tags: ["STM32", "中断", "NVIC"],
    body: [
        { kind: "p", text: "NVIC_SetPriorityGrouping 改的是抢占位和子优先级的划分。分组改了，之前算好的优先级数值全部含义变化。" },
    ],
  },
  {
    slug: "freertos-stack-sizing",
    cover: "/hero/dusk-lake.webp",
    topic: "freertos",
    title: {
      zh: "FreeRTOS 任务栈到底该开多大",
      en: "freertos stack sizing",
    },
    summary: {
      zh: "用高水位标记反推，而不是猜。",
      en: "用高水位标记反推，而不是猜。",
    },
    category: { zh: "FreeRTOS", en: "FreeRTOS" },
    publishedAt: "2025-10-18",
    readingMinutes: 9,
    tags: ["FreeRTOS", "栈", "内存"],
    body: [
        { kind: "p", text: "uxTaskGetStackHighWaterMark 返回历史最小剩余量（单位是字，不是字节）。跑满所有分支后再读，才是真实需求。" },
        { kind: "p", text: "留 30% 余量：中断嵌套和 printf 会额外吃栈。" },
    ],
  },
  {
    slug: "freertos-event-group",
    cover: "/hero/winter-snow.webp",
    topic: "freertos",
    title: {
      zh: "用事件组替掉一轮轮询",
      en: "freertos event group",
    },
    summary: {
      zh: "三个条件都满足才继续，用事件组比轮询省电。",
      en: "三个条件都满足才继续，用事件组比轮询省电。",
    },
    category: { zh: "FreeRTOS", en: "FreeRTOS" },
    publishedAt: "2025-10-05",
    readingMinutes: 8,
    tags: ["FreeRTOS", "事件组", "同步"],
    body: [
        { kind: "p", text: "xEventGroupWaitBits 可以等「任意一个」或「全部」，还能自动清除标志位——这正好是状态机需要的语义。" },
    ],
  },
  {
    slug: "freertos-timer-vs-queue",
    cover: "/hero/rooftop-berries.webp",
    topic: "freertos",
    title: {
      zh: "软件定时器还是队列：一个选择标准",
      en: "freertos timer vs queue",
    },
    summary: {
      zh: "回调里不能阻塞，这条决定了大部分选择。",
      en: "回调里不能阻塞，这条决定了大部分选择。",
    },
    category: { zh: "FreeRTOS", en: "FreeRTOS" },
    publishedAt: "2025-09-21",
    readingMinutes: 6,
    tags: ["FreeRTOS", "定时器", "队列"],
    body: [
        { kind: "p", text: "软件定时器回调跑在定时器服务任务里，阻塞它等于阻塞所有定时器。需要阻塞的操作，发消息给工作队列。" },
    ],
  },
  {
    slug: "linux-module-signing",
    cover: "/hero/anime-profile.webp",
    topic: "linux",
    title: {
      zh: "内核模块编译与签名踩坑记录",
      en: "linux module signing",
    },
    summary: {
      zh: "开了 Secure Boot 之后，insmod 会直接拒绝。",
      en: "开了 Secure Boot 之后，insmod 会直接拒绝。",
    },
    category: { zh: "Linux", en: "Linux" },
    publishedAt: "2025-09-12",
    readingMinutes: 12,
    tags: ["Linux", "内核模块", "签名"],
    body: [
        { kind: "p", text: "模块签名需要内核的证书链。自己编译的内核要先签模块再用，否则 insmod 返回 Invalid argument 而不告诉你原因。" },
    ],
  },
  {
    slug: "linux-perf-sched",
    cover: "/hero/cartoon-goats.webp",
    topic: "linux",
    title: {
      zh: "用 perf 定位一次上下文切换抖动",
      en: "linux perf sched",
    },
    summary: {
      zh: "每秒几万次切换，问题在锁竞争而不在调度器。",
      en: "每秒几万次切换，问题在锁竞争而不在调度器。",
    },
    category: { zh: "Linux", en: "Linux" },
    publishedAt: "2025-08-30",
    readingMinutes: 14,
    tags: ["Linux", "perf", "调度"],
    body: [
        { kind: "p", text: "perf sched latency 按等待时间排序，一眼看到最长的那几条。再 perf record 抓栈，多数是 mutex 竞争。" },
    ],
  },
  {
    slug: "linux-udev-names",
    cover: "/hero/anime-sleep.webp",
    topic: "linux",
    title: {
      zh: "udev 规则：让设备名稳定下来的正确做法",
      en: "linux udev names",
    },
    summary: {
      zh: "别用 ttyUSB0，用序列号匹配。",
      en: "别用 ttyUSB0，用序列号匹配。",
    },
    category: { zh: "Linux", en: "Linux" },
    publishedAt: "2025-08-16",
    readingMinutes: 7,
    tags: ["Linux", "udev", "串口"],
    body: [
        { kind: "p", text: "写 99-mydevice.rules，按 idVendor/idProduct 或序列号匹配，SYMLINK 出固定名字。插拔顺序就不会再影响设备路径。" },
    ],
  },
  {
    slug: "vision-pyramid-border",
    cover: "/hero/dusk-lake.webp",
    topic: "vision",
    title: {
      zh: "图像金字塔的边界处理会吃掉你的检测框",
      en: "vision pyramid border",
    },
    summary: {
      zh: "pyrDown 的边界复制会让靠近边缘的目标变形。",
      en: "pyrDown 的边界复制会让靠近边缘的目标变形。",
    },
    category: { zh: "计算机视觉", en: "计算机视觉" },
    publishedAt: "2025-08-02",
    readingMinutes: 9,
    tags: ["OpenCV", "金字塔", "检测"],
    body: [
        { kind: "p", text: "先做 copyMakeBorder 再 pyrDown，或者在原分辨率上检测小目标。边界被镜像复制的区域会产生假边缘。" },
    ],
  },
  {
    slug: "vision-light-normalize",
    cover: "/hero/winter-snow.webp",
    topic: "vision",
    title: {
      zh: "跑 Canny 之前先做一次光照归一化",
      en: "vision light normalize",
    },
    summary: {
      zh: "同一场景换个灯，阈值全废。",
      en: "同一场景换个灯，阈值全废。",
    },
    category: { zh: "计算机视觉", en: "计算机视觉" },
    publishedAt: "2025-07-19",
    readingMinutes: 10,
    tags: ["OpenCV", "Canny", "预处理"],
    body: [
        { kind: "p", text: "CLAHE 在 LAB 的 L 通道上做，比直接在灰度上做更稳，也不会把颜色信息一起压平。" },
    ],
  },
  {
    slug: "vision-camera-calibration",
    cover: "/hero/rooftop-berries.webp",
    topic: "vision",
    title: {
      zh: "相机标定：从棋盘格到重投影误差",
      en: "vision camera calibration",
    },
    summary: {
      zh: "误差低于 0.3 像素才算能用。",
      en: "误差低于 0.3 像素才算能用。",
    },
    category: { zh: "计算机视觉", en: "计算机视觉" },
    publishedAt: "2025-07-05",
    readingMinutes: 15,
    tags: ["相机标定", "重投影误差", "OpenCV"],
    body: [
        { kind: "p", text: "calibrateCamera 返回的 RMS 是重投影误差，不是「精度」。畸变大的镜头要用更多姿态，别只拍正面。" },
    ],
  },
  {
    slug: "vision-quantization-loss",
    cover: "/hero/anime-profile.webp",
    topic: "vision",
    title: {
      zh: "边缘设备上模型量化的精度损失评估",
      en: "vision quantization loss",
    },
    summary: {
      zh: "先量化再评估，不要用原模型的结果自我安慰。",
      en: "先量化再评估，不要用原模型的结果自我安慰。",
    },
    category: { zh: "计算机视觉", en: "计算机视觉" },
    publishedAt: "2025-06-21",
    readingMinutes: 11,
    tags: ["量化", "边缘设备", "评估"],
    body: [
        { kind: "p", text: "INT8 量化后逐层比对输出差异，找出误差放大的那一层。多数情况下问题在少数通道的离群值。" },
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
