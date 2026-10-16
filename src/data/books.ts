import type { Localized } from "@/types/content"

export type BookShelf = "novels" | "technical"
export type BookStatus = "reading" | "finished" | "planned"

export interface Book {
  id: string
  /** Titles are not translated — a book keeps the name it was published under. */
  title: string
  author: string
  year: number
  shelf: BookShelf
  status: BookStatus
  /** Percent read. Only meaningful while `status` is `"reading"`. */
  progress: number
  /** One line of my own about the book, bilingual. */
  note: Localized<string>
}

export const bookShelves: readonly BookShelf[] = ["novels", "technical"]

export function isBookShelf(value: string | undefined): value is BookShelf {
  return typeof value === "string" && bookShelves.includes(value as BookShelf)
}

export const books: readonly Book[] = [
  {
    id: "three-body",
    title: "三体",
    author: "刘慈欣",
    year: 2008,
    shelf: "novels",
    status: "finished",
    progress: 100,
    note: {
      zh: "把宇宙尺度上的猜疑链写成了悬念，读完之后看星空的感觉都不一样了。",
      en: "Turns cosmic-scale suspicion into suspense — the night sky reads differently afterwards.",
    },
  },
  {
    id: "the-unbearable-lightness-of-being",
    title: "不能承受的生命之轻",
    author: "Milan Kundera",
    year: 1984,
    shelf: "novels",
    status: "reading",
    progress: 62,
    note: {
      zh: "轻与重的反复辩证，读几页就要停下来想一会儿。",
      en: "Lightness and weight argued back and forth; a few pages at a time is enough to need a pause.",
    },
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    year: 2021,
    shelf: "novels",
    status: "finished",
    progress: 100,
    note: {
      zh: "硬核设定配上出奇温暖的友谊线，是我读过最顺畅的一本科幻。",
      en: "Hard science with a surprisingly warm friendship at the centre — the smoothest science fiction I have read.",
    },
  },
  {
    id: "the-three-body-death-s-end",
    title: "死神永生",
    author: "刘慈欣",
    year: 2010,
    shelf: "novels",
    status: "planned",
    progress: 0,
    note: {
      zh: "先把《三体》读完再开，听说尺度会更大。",
      en: "Queued for after the first volume; the scale is supposedly even larger.",
    },
  },
  {
    id: "the-pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    year: 1999,
    shelf: "technical",
    status: "finished",
    progress: 100,
    note: {
      zh: "不是讲语法，是讲怎么为半年后的自己写代码。",
      en: "Not about syntax — about writing code for the version of yourself six months from now.",
    },
  },
  {
    id: "designing-data-intensive-applications",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    year: 2017,
    shelf: "technical",
    status: "reading",
    progress: 38,
    note: {
      zh: "一致性、复制与分区讲得最清楚的一本，配合实际故障看收获更大。",
      en: "The clearest treatment of consistency, replication and partitioning; pairs best with a real outage to study.",
    },
  },
  {
    id: "computer-systems-a-programmers-perspective",
    title: "Computer Systems: A Programmer's Perspective",
    author: "Randal E. Bryant & David R. O'Hallaron",
    year: 2015,
    shelf: "technical",
    status: "reading",
    progress: 55,
    note: {
      zh: "把 C 代码一路追到汇编与缓存，嵌入式方向补底子最有效。",
      en: "Follows C down into assembly and caches — the most effective grounding for embedded work.",
    },
  },
  {
    id: "mastering-stm32",
    title: "Mastering STM32",
    author: "Carmine Noviello",
    year: 2018,
    shelf: "technical",
    status: "finished",
    progress: 100,
    note: {
      zh: "从寄存器讲到 HAL，外设初始化那几章值得反复翻。",
      en: "From registers up to the HAL; the peripheral initialisation chapters are worth rereading.",
    },
  },
  {
    id: "the-definitive-guide-to-freertos",
    title: "Mastering the FreeRTOS Real Time Kernel",
    author: "Richard Barry",
    year: 2016,
    shelf: "technical",
    status: "finished",
    progress: 100,
    note: {
      zh: "官方作者写的，队列与优先级反转的图例一看就懂。",
      en: "Written by the kernel's author; the diagrams for queues and priority inversion land immediately.",
    },
  },
  {
    id: "understanding-the-linux-kernel",
    title: "Understanding the Linux Kernel",
    author: "Daniel P. Bovet & Marco Cesati",
    year: 2005,
    shelf: "technical",
    status: "planned",
    progress: 0,
    note: {
      zh: "留到需要动内核源码的时候再啃，现在太重。",
      en: "Saved for the day I actually patch the kernel — too heavy for casual reading.",
    },
  },
  {
    id: "learning-opencv",
    title: "Learning OpenCV 4",
    author: "Adrian Kaehler & Gary Bradski",
    year: 2019,
    shelf: "technical",
    status: "planned",
    progress: 0,
    note: {
      zh: "当作视觉项目的查表手册用，不指望从头读完。",
      en: "Kept as a lookup manual for vision work rather than something to read start to finish.",
    },
  },
] as const

export function getBooksByShelf(shelf: BookShelf): readonly Book[] {
  return books.filter((book) => book.shelf === shelf)
}
