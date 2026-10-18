import type { Dictionary } from "./zh"

export const en: Dictionary = {
  metadata: {
    title: "CozyNest — Personal tech site",
    description:
      "CozyNest is my personal tech site: notes on embedded systems, low-level software and computer vision, plus a reusable knowledge base and project portfolio.",
  },
  nav: {
    home: "Home",
    blog: "Blog",
    projects: "Portfolio",
    music: "Music",
    photos: "Photos",
    video: "Video",
    books: "Books",
    tools: "Tools",
    games: "Games",
  },
  actions: {
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    toggleTheme: "Toggle theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    toggleLanguage: "Switch language",
    languageName: { zh: "中文", en: "English" },
    skipToContent: "Skip to main content",
  },
  home: {
    badge: "Phase 1 · Foundation in place",
    greeting: "Hi, I'm",
    name: "CozyNest",
    role: "Embedded software / Low-level systems / Computer vision",
    intro:
      "This is where I collect day-to-day engineering notes and project work: from C/C++ and bare-metal drivers, through STM32, FreeRTOS and Linux systems programming, to shipping computer-vision pipelines.",
    ctaPrimary: "Read the blog",
    ctaSecondary: "Browse projects",
    stageLabel: "3D stage",
    stageHint: "WebGL pending",
    stats: {
      articles: "articles",
      projects: "projects",
      notes: "notes",
    },
    directions: {
      title: "Focus areas",
      subtitle: "The areas I keep investing in; the knowledge base is built around them.",
      items: {
        cpp: {
          title: "C / C++",
          description:
            "Language fundamentals, the memory model, pointers and templates, and the trade-offs of modern C++ on embedded targets.",
        },
        stm32: {
          title: "STM32",
          description:
            "Peripheral drivers, clock trees, interrupts and DMA — from bare registers up to the HAL.",
        },
        freertos: {
          title: "FreeRTOS",
          description:
            "Task scheduling, queues and semaphores, memory management, and how to debug real-time behaviour.",
        },
        linux: {
          title: "Linux",
          description:
            "Systems programming, processes and threads, device tree and driver work, profiling and debugging.",
        },
        vision: {
          title: "Computer vision",
          description:
            "Image-processing fundamentals, classical algorithms, and deploying and accelerating deep models.",
        },
      },
    },
    posts: {
      title: "Latest articles",
      subtitle: "Recent notes and write-ups.",
    },
    projects: {
      title: "Featured projects",
      subtitle: "Work I maintain or have completed.",
    },
    viewAll: "View all",
    comingSoon: "This module opens in a later phase",
  },
  modules: {
    blog: "Technical blog: Markdown/MDX authoring, categories and tags, full-text search and syntax highlighting.",
    projects:
      "Project portfolio: descriptions, tech stacks, architecture diagrams and outcomes.",
    music: "Music manager: playlists, now playing and a browsable library.",
    photos: "Photo manager: a wall of pictures organised by date and place.",
    video: "Video manager: archives, thumbnails and playlists.",
    books: "Reading: what's on the shelf, notes and highlighted passages.",
    tools: "Online tools: JSON formatting, Base64 encoding, timestamp conversion and more.",
    games: "Games: small playable experiments.",
  },
  placeholder: {
    badge: "Planned",
    backHome: "Back to home",
  },
  footer: {
    builtWith: "Built with Next.js, React, TypeScript and Tailwind CSS",
    rights: "All rights reserved",
    sections: "Site",
    about: "About",
  },
}
