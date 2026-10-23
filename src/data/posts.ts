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

  /* ---- written articles ---- */
  {
    slug: "stm32-dma-idle-receive",
    cover: "/hero/dusk-lake.webp",
    topic: "stm32",
    title: {
      zh: "STM32 用 DMA 加空闲中断收变长帧",
      en: "Receiving variable-length frames on STM32 with DMA and the idle interrupt",
    },
    summary: {
      zh: "逐字节中断在 115200 下每 87 微秒打断一次 CPU。换成人人都知道的 DMA 加空闲中断，再补上三个只有实测才会暴露的坑。",
      en: "Byte-by-byte interrupts cost a wake-up every 87µs. The DMA plus idle-line interrupt pattern is well known; the three failure modes around it are not.",
    },
    category: {
      zh: "STM32",
      en: "STM32",
    },
    publishedAt: "2026-02-08",
    readingMinutes: 12,
    tags: ["STM32", "DMA", "串口", "实测"],
    featured: true,
    body: [
        { kind: "h", text: "问题出在中断频率" },
        { kind: "p", text: "115200 波特率下每字节约 87 微秒。用 HAL_UART_Receive_IT 逐字节收，主循环只要有一段时间关中断超过 87 微秒，就会丢字节。这不是理论值：一次 memcpy 加上 Flash 写等待就能吞掉这个数量级。" },
        { kind: "p", text: "DMA 循环模式把搬运交给硬件，CPU 只在整帧结束时被叫醒一次。难点是「整帧结束」怎么知道：协议里没有长度字段，也没有固定结束符。空闲中断（IDLE）就是为这个场景准备的——总线连续一个字符时间没有新数据，硬件置位 IDLE 标志。" },
        { kind: "h", text: "配置" },
        { kind: "code", lang: "c", code: "// 环形 DMA，接收长度给满\nHAL_UARTEx_ReceiveToIdle_DMA(&huart1, rx_buf, sizeof(rx_buf));\n__HAL_DMA_DISABLE_IT(&hdma_usart1_rx, DMA_IT_HT);  // 关掉半传输中断\n\n// 回调里拿到的 Size 就是「到空闲为止已收到的字节数」\nvoid HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)\n{\n    ring_push(rx_buf, Size);\n    // 环形缓冲要按 Size 重新装载，否则下一次从错的位置开始\n    HAL_UARTEx_ReceiveToIdle_DMA(huart, rx_buf, sizeof(rx_buf));\n}" },
        { kind: "h", text: "三个只有实测才会暴露的坑" },
        { kind: "ul", items: ["半传输中断默认是开的。DMA 收到缓冲区一半时会触发 HT 回调，如果没关掉，一帧会被拆成两次上报，解析器看到半截数据。", "回调里必须重新装载 DMA。不重新调用 ReceiveToIdle_DMA，第二次接收不会启动，现象是「只收到第一帧」。", "空闲中断只在总线真的静下来时才来。如果两帧之间没有间隙（连续流），永远等不到 IDLE，要在协议里加长度或定期超时兜底。"] },
        { kind: "h", text: "什么时候不该用这套" },
        { kind: "p", text: "数据是连续流、帧间无间隔的场景（比如某些传感器持续推流），IDLE 不会触发。这时应该用「固定长度 DMA 加双缓冲」，或者在协议层加长度前缀，让解析器自己切帧。工具要匹配协议，不是反过来。" },
        { kind: "quote", text: "中断频率和波特率成正比。把 87 微秒换算成你能容忍的最长关中断时间，就知道该不该上 DMA 了。" },
    ],
  },
  {
    slug: "freertos-queue-or-semaphore",
    cover: "/hero/rooftop-berries.webp",
    topic: "freertos",
    title: {
      zh: "FreeRTOS 里该用队列还是信号量",
      en: "Choosing a queue over a semaphore in FreeRTOS",
    },
    summary: {
      zh: "两者底层都是队列，选错的代价是后期为了传一个状态而到处加静态变量。判断标准只有一条：你要传的是「发生了」还是「值」。",
      en: "Both are queues underneath. The cost of choosing wrong is a pile of static variables later. The test is whether you are publishing an event or a value.",
    },
    category: {
      zh: "FreeRTOS",
      en: "FreeRTOS",
    },
    publishedAt: "2026-01-27",
    readingMinutes: 9,
    tags: ["FreeRTOS", "队列", "同步"],
    body: [
        { kind: "h", text: "一条判断标准" },
        { kind: "p", text: "信号量说的是「某件事发生了」，它不携带内容，也不排队：连发十次二值信号量，接收方也只醒一次。队列说的是「这是第 N 个值」，每个值都占一个槽位，按顺序取。" },
        { kind: "p", text: "所以只要你想传的东西有内容（一个 ADC 读数、一个按键码、一帧长度），就该是队列。用信号量加一个全局变量，等于自己实现了一个容量为 1 且会丢数据的队列。" },
        { kind: "h", text: "一个重构过程" },
        { kind: "code", lang: "c", code: "// 之前：信号量 + 全局变量\nstatic volatile uint16_t g_adc;\nxSemaphoreGiveFromISR(adc_sem, &woken);\n\n// 之后：队列，容量按最坏情况给\nQueueHandle_t adc_q = xQueueCreate(8, sizeof(uint16_t));\nxQueueSendFromISR(adc_q, &sample, &woken);\n\n// 消费端一次取一个，自然限流\nuint16_t value;\nwhile (xQueueReceive(adc_q, &value, pdMS_TO_TICKS(100)) == pdTRUE) {\n    process(value);\n}" },
        { kind: "p", text: "换成队列后顺手解决了两个问题：ISR 里连发的数据不会再丢（容量 8 吸收突发）；消费端能用「取空为止」的循环代替一次处理一个，吞吐量上去了。" },
        { kind: "h", text: "容量不是随便写的" },
        { kind: "ul", items: ["生产者最快频率 × 消费者最坏延迟 = 至少需要的槽位。算出来是 3 就给 8，留突发余量。", "队列项是拷贝，不是引用。传结构体时队列会复制整块内存，大结构体应该传指针，并自己管生命周期。", "FromISR 版本必须用 FromISR 的 API，混用普通版本会在断言里挂掉。"] },
        { kind: "quote", text: "队列的容量是一个设计参数，不是一个「填个 10 就行」的占位值。容量就是你能容忍的突发长度。" },
    ],
  },
  {
    slug: "cpp-raii-c-handles",
    cover: "/hero/winter-snow.webp",
    topic: "cpp",
    title: {
      zh: "用 RAII 包住 C 库句柄",
      en: "Wrapping C handles in RAII",
    },
    summary: {
      zh: "C 库的 open/close 配对靠人记，一旦走到错误分支就会漏。用移动语义加析构函数把它们变成编译器负责的事。",
      en: "Pairing open/close by hand breaks on the first error branch. Move semantics plus a destructor hand the job to the compiler.",
    },
    category: {
      zh: "C / C++",
      en: "C / C++",
    },
    publishedAt: "2026-01-15",
    readingMinutes: 10,
    tags: ["C++", "RAII", "资源管理"],
    body: [
        { kind: "h", text: "漏关闭通常发生在错误分支" },
        { kind: "p", text: "一个函数里 open 之后有三处可能提前 return，而 close 只在最后一行。这种代码在正常路径上永远不会出错，只在设备忙、参数非法这类分支上泄漏——也就是最难复现的那一半场景。" },
        { kind: "h", text: "最小可用的包装" },
        { kind: "code", lang: "cpp", code: "class Fd {\npublic:\n    explicit Fd(int fd = -1) noexcept : fd_(fd) {}\n    ~Fd() { if (fd_ >= 0) ::close(fd_); }\n\n    Fd(const Fd&) = delete;\n    Fd& operator=(const Fd&) = delete;\n\n    Fd(Fd&& other) noexcept : fd_(std::exchange(other.fd_, -1)) {}\n    Fd& operator=(Fd&& other) noexcept {\n        if (this != &other) {\n            if (fd_ >= 0) ::close(fd_);\n            fd_ = std::exchange(other.fd_, -1);\n        }\n        return *this;\n    }\n\n    int get() const noexcept { return fd_; }\n    bool valid() const noexcept { return fd_ >= 0; }\nprivate:\n    int fd_;\n};" },
        { kind: "p", text: "关键的三处：拷贝构造删除（两个对象管一个句柄必然双重释放）；移动后把源句柄置为 -1（否则源对象析构时会关掉已经转移的句柄）；析构里判 -1（默认构造和移动后的对象都需要是安全的）。" },
        { kind: "h", text: "常见错误" },
        { kind: "ul", items: ["移动构造里忘了把源置空，程序在作用域结束时随机关掉一个还在用的 fd。", "加了拷贝但用引用计数，结果比直接删除拷贝更慢也更容易错——fd 是独占资源，不该共享。", "析构函数抛异常。析构默认 noexcept，抛就是 terminate，所以清理逻辑不能失败也不能报错。"] },
        { kind: "p", text: "这套写法对 C 库句柄是通用的：把 close 换成对应的释放函数，把 -1 换成库里的非法值，其余一模一样。文件、socket、设备、动态库句柄都适用。" },
    ],
  },
  {
    slug: "linux-ftrace-sched-latency",
    cover: "/hero/anime-sleep.webp",
    topic: "linux",
    title: {
      zh: "用 ftrace 抓一次调度延迟",
      en: "Chasing scheduler latency with ftrace",
    },
    summary: {
      zh: "服务偶发超时，perf 看不出来。用 ftrace 的 sched_switch 单独看「谁把线程挤下去了」，一次就定位到了那个每 100ms 醒一次的后台任务。",
      en: "An occasional timeout that perf could not explain. ftrace's sched_switch showed which thread was preempting it: a 100ms background task.",
    },
    category: {
      zh: "Linux",
      en: "Linux",
    },
    publishedAt: "2026-01-04",
    readingMinutes: 13,
    tags: ["Linux", "ftrace", "调度"],
    featured: true,
    body: [
        { kind: "h", text: "先排除最常见的两种" },
        { kind: "p", text: "超时先看两件事：是不是等锁，是不是等 IO。virsh 或者 /proc/pressure 能给出大致方向，但都答不了「这 8 毫秒里 CPU 在干嘛」。这个问题只有调度事件能回答。" },
        { kind: "h", text: "打开 sched_switch" },
        { kind: "code", lang: "bash", code: "cd /sys/kernel/debug/tracing\necho 0 > tracing_on\necho > trace\necho 1 > events/sched/sched_switch/enable\necho 1 > tracing_on\n# 复现一次超时\nsleep 10\necho 0 > tracing_on\ncat trace | grep -E 'myapp|kworker' | head -50" },
        { kind: "p", text: "输出里每一行都能看到「谁被换下、谁被换上、被换下的原因」。如果 myapp 频繁因为 preempted 被换出，说明有更高优先级的任务在抢；如果是 wakeup 说明它自己在等东西。" },
        { kind: "h", text: "这次的原因" },
        { kind: "p", text: "trace 里每 100 毫秒出现一次 kworker，正好落在超时的时间点上。追下去是一个 driver 的轮询定时器：它本身只跑几十微秒，但会关抢占，把 myapp 的实时线程压住。" },
        { kind: "ul", items: ["结论不是「驱动有 bug」，而是「这个线程需要更低的最坏延迟」，所以改用 SCHED_FIFO 加绑核。", "关抢占区间用 preemptirqsoff 的 tracer 可以直接测出最长一段，比自己数 trace 快。", "tracing 缓冲区默认很小，事件一多会覆盖。先设 buffer_size_kb 再抓。"] },
        { kind: "quote", text: "延迟问题的难点从来不是测不出来，而是不知道该测什么。调度事件把「这 8 毫秒去哪了」变成一条能读的时间线。" },
    ],
  },
  {
    slug: "vision-camera-acquire-calibrate",
    cover: "/hero/anime-profile.webp",
    topic: "vision",
    title: {
      zh: "从取图到标定：一条能跑通的相机链路",
      en: "From capture to calibration: a camera pipeline that holds up",
    },
    summary: {
      zh: "取图、去畸变、标定不是三个独立步骤，顺序错了误差会一路放大。这里记录一条在产线上验证过的链路和每一步的验收标准。",
      en: "Capture, undistort and calibrate are not independent steps; get the order wrong and the error compounds. A pipeline that survived a production line, with an acceptance check per step.",
    },
    category: {
      zh: "计算机视觉",
      en: "Computer vision",
    },
    publishedAt: "2025-12-22",
    readingMinutes: 14,
    tags: ["相机标定", "OpenCV", "重投影误差"],
    body: [
        { kind: "h", text: "顺序" },
        { kind: "p", text: "正确的顺序是：原始图 → 标定得到内参与畸变系数 → 去畸变 → 用去畸变后的图做测量。反过来先手工修图再标定，等于把修图的形变一起标进了内参里，之后所有测量都带着它。" },
        { kind: "h", text: "取图这一步的验收" },
        { kind: "p", text: "标定之前先确认图本身是稳定的：同一场景连拍 100 张，平均灰度波动应在 1% 以内，棋盘格边缘不应有拖影。自动曝光开启时这个条件基本不可能满足，所以要先把曝光锁死。" },
        { kind: "code", lang: "python", code: "criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)\nobjp = np.zeros((6 * 9, 3), np.float32)\nobjp[:, :2] = np.mgrid[0:9, 0:6].T.reshape(-1, 2)\n\nrms, K, dist, rvecs, tvecs = cv2.calibrateCamera(\n    obj_points, img_points, gray.shape[::-1], None, None\n)\nprint(\"RMS reprojection error:\", rms)\nassert rms < 0.3, \"标定不合格，别往下做\"" },
        { kind: "h", text: "验收标准" },
        { kind: "ul", items: ["重投影误差 RMS < 0.3 像素。超过 0.5 说明姿态覆盖不够或棋盘格没贴平，不要靠增加图片数量糊过去。", "姿态要覆盖画面四角和中心。只拍正面的板子，畸变系数是拟合不出来的。", "标定板占画面 1/3 以上。太小的话角点提取的亚像素误差会被放大。"] },
        { kind: "p", text: "最后一步常被忽略：标定完要拿一张独立图片做交叉验证，把已知尺寸的物体测一遍，看实际误差是否在公差内。RMS 只是拟合残差，不等于测量精度。" },
        { kind: "quote", text: "RMS 小说明模型拟合得好，不说明你的测量准。这两件事必须分别验证。" },
    ],
  },
  {
    slug: "stm32-clock-tree-mistakes",
    cover: "/hero/cartoon-goats.webp",
    topic: "stm32",
    title: {
      zh: "STM32 时钟树配置的三个常见错误",
      en: "Three common STM32 clock tree mistakes",
    },
    summary: {
      zh: "外设不工作、串口波特率对不上、定时器周期差一倍——这些症状往往都指向同一处：时钟源选错或分频器算错。",
      en: "A peripheral that stays silent, a baud rate that is wrong by a factor, a timer that runs at double speed: most of these trace back to one wrong clock.",
    },
    category: {
      zh: "STM32",
      en: "STM32",
    },
    publishedAt: "2025-12-10",
    readingMinutes: 9,
    tags: ["STM32", "时钟", "HAL"],
    body: [
        { kind: "h", text: "错误一：外设时钟没使能" },
        { kind: "p", text: "HAL 的初始化函数不会替你打开 RCC 时钟。寄存器写进去没有任何效果，读回来还是 0，看起来像「芯片坏了」。养成在 MX_XXX_Init 之前检查 __HAL_RCC_XXX_CLK_ENABLE 的习惯。" },
        { kind: "h", text: "错误二：串口时钟源搞混" },
        { kind: "p", text: "USART2 挂在 APB1，USART1 挂在 APB2，两者分频可以不同。波特率算错一倍的情况，八成是把外设挂的总线记错了。用 HAL_RCC_GetPCLK1Freq 之类的接口现算，不要抄别人的常量。" },
        { kind: "code", lang: "c", code: "// 不要写死 72000000，直接问 HAL 当前是多少\nuint32_t pclk = HAL_RCC_GetPCLK1Freq();\nhuart2.Init.BaudRate = 115200;\n// HAL 内部用 pclk 推算 BRR，前提是你把 huart2 的时钟源设对\n__HAL_RCC_USART2_CLK_ENABLE();" },
        { kind: "h", text: "错误三：定时器时钟被 ×2" },
        { kind: "p", text: "APB 预分频不为 1 时，定时器时钟是 APB 时钟的两倍。这是手册里的一行小字，但会让所有定时器周期差一倍。要算精确延时，从 RCC 的 D2PPRE1 位开始算，别从中断现象反推。" },
        { kind: "ul", items: ["先在 SystemClock_Config 之后打印一遍各总线频率，确认和你以为的一致。", "外设不响应时，第一件事是查时钟使能，第二件事是查引脚复用。", "改时钟树之后重新生成一遍定时器初始化，别只改 PLL 倍数。"] },
    ],
  },
  {
    slug: "cpp-compile-time-lookup",
    cover: "/hero/rooftop-berries.webp",
    topic: "cpp",
    title: {
      zh: "编译期查表：把运行时分支挪到编译期",
      en: "Compile-time tables instead of runtime branches",
    },
    summary: {
      zh: "一张 256 项的查表在运行时只是一次内存访问。用 constexpr 生成，能把分支预测失败和缓存未命中一起省掉。",
      en: "A 256-entry table is one memory read at runtime. Generated with constexpr, it removes the branch misprediction along with the branch.",
    },
    category: {
      zh: "C / C++",
      en: "C / C++",
    },
    publishedAt: "2025-11-28",
    readingMinutes: 11,
    tags: ["C++", "模板", "编译期"],
    body: [
        { kind: "h", text: "先看代价" },
        { kind: "p", text: "一个对每个字节做分支的解析循环，在数据随机时分支预测命中率接近 0，每次误预测大约 15 个周期。256 次访问就是几千个周期，比查表本身贵两个数量级。" },
        { kind: "h", text: "constexpr 生成" },
        { kind: "code", lang: "cpp", code: "struct Table {\n    unsigned char v[256];\n    constexpr Table() : v{} {\n        for (int i = 0; i < 256; ++i) {\n            v[i] = static_cast<unsigned char>((i >= 'a' && i <= 'z') ? i - 32 : i);\n        }\n    }\n};\n\nconstexpr Table kUpper{};\n// 编译期就算好了，运行时只是数组下标\nchar up(char c) { return static_cast<char>(kUpper.v[static_cast<unsigned char>(c)]); }" },
        { kind: "p", text: "关键是 constexpr 构造函数在编译期执行，表直接落在只读数据段。运行时没有初始化代码，也没有分支。同样的模式可以生成 CRC 表、sin 表、状态机转移表。" },
        { kind: "h", text: "什么时候不值得" },
        { kind: "ul", items: ["表太大导致 cache 压力上升，反而更慢。256 项的字节表很轻，65536 项就要重新算。", "分支本身可预测时查表没优势，编译器可能已经把它变成了条件传送。", "可读性也是成本。表生成逻辑要留注释说明它等价于哪个 if，否则半年后没人敢改。"] },
        { kind: "quote", text: "查表不是优化技巧，是把「判断」换成「寻址」。用之前先确认你付得起那次内存访问。" },
    ],
  },
  {
    slug: "freertos-stack-overflow-hunt",
    cover: "/hero/winter-snow.webp",
    topic: "freertos",
    title: {
      zh: "FreeRTOS 栈溢出：从上电就挂到定位",
      en: "FreeRTOS stack overflow: from boot-time crash to root cause",
    },
    summary: {
      zh: "现象是随机 HardFault，位置每次都不同。开了栈溢出检查之后，问题从「玄学」变成了「某个任务把栈用超了」。",
      en: "Random HardFaults at different addresses. Turning on the overflow check turned superstition into a measurable number.",
    },
    category: {
      zh: "FreeRTOS",
      en: "FreeRTOS",
    },
    publishedAt: "2025-11-15",
    readingMinutes: 10,
    tags: ["FreeRTOS", "栈", "调试"],
    body: [
        { kind: "h", text: "先把玄学变成数字" },
        { kind: "code", lang: "c", code: "#define configCHECK_FOR_STACK_OVERFLOW 2\n#define configUSE_MALLOC_FAILED_HOOK 1\n\nvoid vApplicationStackOverflowHook(TaskHandle_t task, char *name) {\n    (void)task;\n    // 断在这里，name 就是越界的任务\n    taskDISABLE_INTERRUPTS();\n    for (;;) { }\n}" },
        { kind: "p", text: "模式 2 会在切换上下文时检查栈指针附近的填充字节是否被改写，比模式 1（只比较栈指针）可靠，代价是每次切换多几条指令。定位阶段值得。" },
        { kind: "h", text: "高水位不是峰值" },
        { kind: "p", text: "uxTaskGetStackHighWaterMark 返回的是历史最小剩余量，单位是字而不是字节。它有用，但只在「最坏路径都跑过」之后才有意义。上电十分钟就看，会得到一个过于乐观的数字。" },
        { kind: "ul", items: ["printf 系列函数吃栈很凶，几百字节起步。把日志从任务里挪到独立的低优先级任务。", "中断嵌套会在被中断任务的栈上继续增长，最坏情况是「所有中断同时来」。", "局部大数组应该改静态或堆分配，别指望任务栈能装下。"] },
        { kind: "h", text: "这次的原因" },
        { kind: "p", text: "一个处理 Modbus 的任务里有个 256 字节的接收缓冲，加上解析函数的几层调用，峰值超过配置的 512 字。改法是缓冲移到静态区，任务栈反而可以降下来。" },
    ],
  },
  {
    slug: "linux-netns-local-lab",
    cover: "/hero/dusk-lake.webp",
    topic: "linux",
    title: {
      zh: "用网络命名空间搭一套本地联调环境",
      en: "A local test lab built from network namespaces",
    },
    summary: {
      zh: "想测断网、丢包、延迟翻倍，不用两台机器也不用 root 权限的虚拟机。两个命名空间加一对 veth 就够了。",
      en: "Testing disconnects, loss and doubled latency does not need two machines. Two namespaces and a veth pair are enough.",
    },
    category: {
      zh: "Linux",
      en: "Linux",
    },
    publishedAt: "2025-11-02",
    readingMinutes: 12,
    tags: ["Linux", "网络命名空间", "联调"],
    body: [
        { kind: "h", text: "为什么不用虚拟机" },
        { kind: "p", text: "虚拟机启停几十秒，改一次参数要等一次开机。命名空间是内核里的一层隔离，建立和销毁都是毫秒级，而且不占额外内存。测网络异常时，改回来的成本决定了你愿不愿意多测几种情况。" },
        { kind: "h", text: "最小拓扑" },
        { kind: "code", lang: "bash", code: "ip netns add client\nip netns add server\nip link add veth0 type veth peer name veth1\nip link set veth0 netns client\nip link set veth1 netns server\n\nip -n client addr add 10.0.0.1/24 dev veth0\nip -n server addr add 10.0.0.2/24 dev veth1\nip -n client link set veth0 up\nip -n server link set veth1 up\nip -n client link set lo up\n\nip netns exec client ping -c1 10.0.0.2" },
        { kind: "h", text: "开始制造问题" },
        { kind: "ul", items: ["延迟：tc qdisc add dev veth0 root netem delay 200ms", "丢包：tc qdisc change dev veth0 root netem loss 5%", "断网：ip -n client link set veth0 down，恢复只要 up", "带宽：tc qdisc change dev veth0 root tbf rate 1mbit burst 32kbit latency 400ms"] },
        { kind: "p", text: "这套东西的价值在于可重复：把上面几行写成脚本，每次回归测试都从干净状态开始。手工在真机上拔网线，永远没法做到一致。" },
        { kind: "quote", text: "能被脚本重建的环境，才值得在上面做实验。命名空间让「重建」的成本降到毫秒级。" },
    ],
  },
  {
    slug: "vision-white-balance-thresholds",
    cover: "/hero/cartoon-goats.webp",
    topic: "vision",
    title: {
      zh: "白平衡没做，颜色阈值就白调了",
      en: "Colour thresholds are wasted work without white balance",
    },
    summary: {
      zh: "同一块物料换一根灯管，HSV 阈值全部失效。原因不是阈值调得不好，而是成像的白平衡随光源漂了。",
      en: "Change one tube light and every HSV threshold stops working. The thresholds were never the problem; the white point moved.",
    },
    category: {
      zh: "计算机视觉",
      en: "Computer vision",
    },
    publishedAt: "2025-10-20",
    readingMinutes: 11,
    tags: ["OpenCV", "白平衡", "颜色阈值"],
    body: [
        { kind: "h", text: "现象" },
        { kind: "p", text: "产线上换了一批灯管，色温从 5000K 变成 6500K。原本红色物料的 H 值从 0 附近漂到 170 附近，阈值继续用就漏检。人眼几乎看不出灯光变了，因为大脑会自动校正。" },
        { kind: "h", text: "先做一次灰卡校正" },
        { kind: "code", lang: "python", code: "# 用画面里的灰卡区域估计通道增益\npatch = frame[y0:y1, x0:x1].reshape(-1, 3).mean(axis=0)\ngain = patch.mean() / patch          # BGR 三个通道各一个增益\nbalanced = np.clip(frame * gain, 0, 255).astype(np.uint8)" },
        { kind: "p", text: "如果场景里没有灰卡，退一步用「灰度世界」假设：整幅图的通道均值应该接近。这在物料占比不大的场景下够用，但背景有大量同色物体时会失效。" },
        { kind: "h", text: "标定与阈值的关系" },
        { kind: "ul", items: ["白平衡是标定的一部分，不是预处理的小技巧。它决定了同一颜色在不同光源下是否映射到同一数值。", "做完白平衡再取阈值，然后把阈值和校正参数一起版本管理。只改阈值不改参数，问题会以更隐蔽的方式回来。", "更稳的做法是换成与亮度、色温弱相关的特征（比如归一化 RGB 的比值），阈值区间会宽很多。"] },
        { kind: "quote", text: "光变了，颜色就变了。任何只看像素数值的算法，都要先回答「这台相机的白点在哪」。" },
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
