export const zh = {
  metadata: {
    title: "CozyNest — 个人技术站",
    description:
      "CozyNest 是我的个人技术站点：记录嵌入式、系统与计算机视觉方向的笔记，整理可复用的知识库，并展示项目作品。",
  },
  nav: {
    home: "首页",
    blog: "博客",
    projects: "作品集",
    music: "音乐",
    photos: "相册",
    video: "视频",
    books: "书籍",
    tools: "工具",
    games: "游戏",
  },
  actions: {
    openMenu: "打开导航菜单",
    closeMenu: "关闭导航菜单",
    toggleTheme: "切换主题",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "跟随系统",
    toggleLanguage: "切换语言",
    languageName: { zh: "中文", en: "English" },
    skipToContent: "跳到主要内容",
  },
  home: {
    badge: "第一期 · 基础框架已就绪",
    greeting: "你好，我是",
    name: "CozyNest",
    role: "嵌入式软件 / 系统底层 / 计算机视觉",
    intro:
      "我在这里沉淀日常的技术笔记与项目实践：从 C/C++ 与裸机驱动，到 STM32、FreeRTOS 与 Linux 系统编程，再到计算机视觉的工程落地。",
    ctaPrimary: "阅读文章",
    ctaSecondary: "查看项目",
    stageLabel: "3D 舞台",
    stageHint: "WebGL 待接入",
    stats: {
      articles: "篇文章",
      projects: "个项目",
      notes: "条笔记",
    },
    directions: {
      title: "技术方向",
      subtitle: "长期投入的几个方向，知识库会围绕它们展开。",
      items: {
        cpp: {
          title: "C / C++",
          description:
            "语言基础、内存模型、指针与模板，以及现代 C++ 在嵌入式中的取舍。",
        },
        stm32: {
          title: "STM32",
          description:
            "外设驱动、时钟树、中断与 DMA，从寄存器到 HAL 库的完整实践记录。",
        },
        freertos: {
          title: "FreeRTOS",
          description:
            "任务调度、队列与信号量、内存管理，以及实时性问题的排查方法。",
        },
        linux: {
          title: "Linux",
          description:
            "系统编程、进程与线程、设备树与驱动开发、性能与调试工具链。",
        },
        vision: {
          title: "计算机视觉",
          description:
            "图像处理基础、传统算法与深度学习模型的部署与加速实践。",
        },
      },
    },
    posts: {
      title: "最新文章",
      subtitle: "最近的笔记与实践总结。",
    },
    projects: {
      title: "精选项目",
      subtitle: "正在维护或已完成的项目作品。",
    },
    viewAll: "查看全部",
    comingSoon: "该模块将在后续阶段开放",
  },
  modules: {
    blog: "技术博客：Markdown/MDX 写作、分类标签、全文搜索与代码高亮。",
    projects: "项目作品集：项目介绍、技术栈、架构图与实现成果。",
    music: "音乐管理器：歌单整理、正在播放与曲库归档。",
    photos: "相册管理器：按时间与地点整理的照片墙。",
    video: "视频管理器：视频归档、封面与播放列表。",
    books: "书籍阅读：在读清单、读书笔记与划线摘录。",
    tools: "在线工具：JSON 格式化、Base64 编解码、时间戳转换等。",
    games: "游戏：小游戏与玩法实验。",
  },
  placeholder: {
    badge: "规划中",
    backHome: "返回首页",
  },
  footer: {
    builtWith: "使用 Next.js、React、TypeScript 与 Tailwind CSS 构建",
    rights: "保留所有权利",
    sections: "站点导航",
    about: "关于本站",
  },
}

export type Dictionary = typeof zh
