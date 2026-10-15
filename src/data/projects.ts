import type { Project } from "@/types/content"

/**
 * Placeholder projects for Phase 1.
 *
 * Phase 4 replaces this with the real portfolio module (architecture diagrams,
 * outcomes, per-project pages).
 */
export const projects: readonly Project[] = [
  {
    slug: "cozynest",
    name: "CozyNest",
    summary: {
      zh: "本站本身：Next.js App Router 与 TypeScript 构建的个人技术站，包含博客、知识库与作品集。",
      en: "This site: a personal tech site built on the Next.js App Router and TypeScript, with blog, knowledge base and portfolio.",
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    status: "active",
    year: 2026,
    featured: true,
  },
  {
    slug: "motor-control-firmware",
    name: "Motor Control Firmware",
    summary: {
      zh: "基于 STM32 与 FreeRTOS 的三相电机控制固件：SVPWM 调制、电流环与上位机参数整定。",
      en: "Three-phase motor control firmware on STM32 and FreeRTOS: SVPWM modulation, current loop and host-side tuning.",
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
      zh: "面向产线质检的视觉原型：传统图像处理做定位与测量，轻量模型负责缺陷分类。",
      en: "A line-inspection vision prototype: classical image processing for locating and measuring, a lightweight model for defect classification.",
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
      zh: "一组用于练习 Linux 字符设备、中断与并发控制的可加载内核模块集合。",
      en: "A set of loadable kernel modules for practising Linux char devices, interrupts and concurrency control.",
    },
    stack: ["C", "Linux", "Kbuild"],
    status: "active",
    year: 2026,
    featured: false,
  },
] as const

export function getFeaturedProjects(limit = 3): readonly Project[] {
  return projects.filter((project) => project.featured).slice(0, limit)
}
