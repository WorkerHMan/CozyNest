import type { Localized } from "@/types/content"

export interface Video {
  id: string
  title: Localized<string>
  /** Length in seconds, as a number so the list can format and sort it. */
  duration: number
  year: number
  description: Localized<string>
}

/**
 * Videos for the library.
 *
 * Same rule as the music module: **no video file references**. Every entry is a
 * placeholder whose only job is to make the list's structure, spacing and
 * duration formatting real, while the page states plainly that playback is not
 * wired up (`dict.pages.video.notLoaded`). Nothing here can autoplay.
 */
export const videos: readonly Video[] = [
  {
    id: "board-bring-up",
    title: { zh: "新板子上电第一分钟", en: "First minute on a new board" },
    duration: 412,
    year: 2026,
    description: {
      zh: "记录一块自制 STM32 板卡从供电、下载固件到串口打印第一行日志的全过程。",
      en: "A home-made STM32 board going from power-up to flashed firmware to its first line of serial output.",
    },
  },
  {
    id: "clock-tree-walkthrough",
    title: { zh: "时钟树配置走查", en: "Walking the clock tree" },
    duration: 936,
    year: 2026,
    description: {
      zh: "对着时钟树图逐个节点算分频系数，解释为什么串口波特率总是差一点点。",
      en: "Working through the clock tree node by node, and why a UART baud rate always comes out slightly off.",
    },
  },
  {
    id: "freertos-trace",
    title: { zh: "用跟踪工具看任务切换", en: "Watching task switches with a tracer" },
    duration: 728,
    year: 2025,
    description: {
      zh: "把 FreeRTOS 的调度过程录下来，找出那次偶发超时到底卡在哪个任务上。",
      en: "Recording the FreeRTOS scheduler to find which task an intermittent timeout was actually stuck behind.",
    },
  },
  {
    id: "kernel-module-first",
    title: { zh: "写第一个内核模块", en: "Writing a first kernel module" },
    duration: 1154,
    year: 2025,
    description: {
      zh: "从 Makefile 到 insmod，跑通一个能读写的字符设备并解释每个报错。",
      en: "From Makefile to insmod: getting a readable and writable character device working, and decoding each error.",
    },
  },
  {
    id: "vision-pipeline",
    title: { zh: "产线视觉流程搭建", en: "Building a line-inspection vision pipeline" },
    duration: 1526,
    year: 2025,
    description: {
      zh: "从标定、阈值分割到缺陷分类，把一整套视觉流程在台面上复现一遍。",
      en: "Calibration, thresholding and defect classification — the whole pipeline rebuilt on a bench.",
    },
  },
  {
    id: "desk-tour",
    title: { zh: "桌面走一圈", en: "A lap around the desk" },
    duration: 268,
    year: 2024,
    description: {
      zh: "展示常用的仪器、收纳与走线方式，顺手回答几个关于烙铁与电源的问题。",
      en: "The instruments, storage and cable routing I actually use, plus answers to a few soldering and power questions.",
    },
  },
] as const
