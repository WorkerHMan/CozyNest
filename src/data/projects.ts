import type { Project } from "@/types/content"

/**
 * The portfolio.
 *
 * `highlights` are outcomes rather than features — the point of the page is to
 * show what each project produced, and each one is a short, checkable claim.
 * Content is bilingual; product names are not translated.
 */
export const projects: readonly Project[] = [
  {
    slug: "cozynest",
    name: "CozyNest",
    summary: {
      zh: "本站本身：Next.js App Router 与 TypeScript 构建的个人技术站，含博客、知识库、相册与在线工具。",
      en: "This site: a personal tech site on the Next.js App Router and TypeScript, with blog, knowledge base, gallery and browser tools.",
    },
    highlights: {
      zh: [
        "全站中英双语，静态预渲染，语言切换不改 URL",
        "内建无障碍门禁：对比度、焦点环、动效降级都有实测依据",
      ],
      en: [
        "Fully bilingual and statically prerendered, with language switching that never changes the URL",
        "Accessibility is measured, not assumed: contrast, focus rings and motion fallbacks each have evidence behind them",
      ],
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "three.js"],
    status: "active",
    year: 2026,
    featured: true,
    repo: "https://github.com/",
  },
  {
    slug: "motor-control-firmware",
    name: "Motor Control Firmware",
    summary: {
      zh: "基于 STM32 与 FreeRTOS 的三相电机控制固件：SVPWM 调制、电流环，以及上位机参数整定。",
      en: "Three-phase motor control firmware on STM32 and FreeRTOS: SVPWM modulation, a current loop, and host-side parameter tuning.",
    },
    highlights: {
      zh: [
        "把电流环周期从 100 µs 压到 50 µs，同一颗 MCU 上多出一路闭环",
        "参数整定从前端寄存器改写改成上位机一键下发",
      ],
      en: [
        "Halved the current-loop period from 100 µs to 50 µs, which freed a second closed loop on the same MCU",
        "Replaced front-panel register editing with one-click host-side parameter push",
      ],
    },
    stack: ["C", "STM32", "FreeRTOS", "SVPWM"],
    status: "active",
    year: 2025,
    featured: true,
  },
  {
    slug: "vision-inspection-demo",
    name: "Vision Inspection Demo",
    summary: {
      zh: "面向产线质检的视觉原型：传统图像处理负责定位与测量，轻量模型负责缺陷分类。",
      en: "A line-inspection vision prototype: classical processing for locating and measuring, a lightweight model for defect classification.",
    },
    highlights: {
      zh: [
        "单帧处理耗时降到原来的三分之一（分辨率、色彩空间、内存拷贝三处下手）",
        "传统算法与轻量模型分工，标注量减少约七成",
      ],
      en: [
        "Cut per-frame latency to a third by attacking resolution, colour space and memory copies",
        "Splitting work between classical algorithms and a small model cut labelling effort by roughly 70%",
      ],
    },
    stack: ["C++", "OpenCV", "Python", "ONNX Runtime"],
    status: "archived",
    year: 2025,
    featured: true,
  },
  {
    slug: "kernel-module-lab",
    name: "Kernel Module Lab",
    summary: {
      zh: "一组用于练习 Linux 字符设备、中断与并发控制的课加载内核模块。",
      en: "A set of loadable kernel modules for practising Linux char devices, interrupts and concurrency control.",
    },
    highlights: {
      zh: ["每个模块都能单独 insmod/rmmod，用于复现 Oops 与死锁场景"],
      en: [
        "Every module loads and unloads on its own, so Oops and deadlock scenarios can be reproduced in isolation",
      ],
    },
    stack: ["C", "Linux", "Kbuild"],
    status: "active",
    year: 2026,
    featured: false,
  },
  {
    slug: "can-bus-toolkit",
    name: "CAN Bus Toolkit",
    summary: {
      zh: "一组 CAN 报文抓取与解码脚本：把 DBC 定义直接变成可读的物理量，并标出超时帧。",
      en: "A set of CAN capture and decode scripts: turn DBC definitions straight into readable physical values, and flag timed-out frames.",
    },
    highlights: {
      zh: [
        "把报文日志的解码时间从手工查表的小时级降到秒级",
        "超时与丢失帧会被单独标出，不再淹没在日志里",
      ],
      en: [
        "Brought decoding a capture log down from hours of manual lookup to seconds",
        "Timed-out and dropped frames are surfaced on their own instead of drowning in the log",
      ],
    },
    stack: ["Python", "cantools", "SocketCAN"],
    status: "active",
    year: 2026,
    featured: false,
  },
  {
    slug: "edge-inference-bench",
    name: "Edge Inference Bench",
    summary: {
      zh: "对比几种轻量模型在边缘设备上的真实推理延迟与内存占用，含量化前后对照。",
      en: "Compares real inference latency and memory footprint of several small models on edge devices, with before/after quantisation.",
    },
    highlights: {
      zh: ["给出量化后精度与延迟的取舍表，用来决定模型是否值得压"],
      en: [
        "Produces a trade-off table of post-quantisation accuracy against latency, to decide whether compressing a model pays off",
      ],
    },
    stack: ["Python", "ONNX Runtime", "TensorRT"],
    status: "planned",
    year: 2026,
    featured: false,
  },
] as const

export function getFeaturedProjects(limit = 3): readonly Project[] {
  return projects.filter((project) => project.featured).slice(0, limit)
}
