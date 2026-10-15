import { Cpu, Eye, Layers, Radio, Terminal } from "lucide-react"
import type { ComponentType } from "react"
import { Container } from "@/components/layout/container"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeading } from "@/components/home/section-heading"
import type { Dictionary } from "@/i18n"

type DirectionKey = keyof Dictionary["home"]["directions"]["items"]

/** Icons live in code; the copy lives in the dictionaries. */
const icons: Record<DirectionKey, ComponentType<{ className?: string }>> = {
  cpp: Cpu,
  stm32: Radio,
  freertos: Layers,
  linux: Terminal,
  vision: Eye,
}

const order: readonly DirectionKey[] = ["cpp", "stm32", "freertos", "linux", "vision"]

export function TechDirections({ dict }: { dict: Dictionary }) {
  const { title, subtitle, items } = dict.home.directions

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {order.map((key) => {
          const Icon = icons[key]
          const item = items[key]
          return (
            <Card
              key={key}
              className="transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20"
            >
              <CardHeader>
                <span
                  aria-hidden
                  className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15 ring-inset backdrop-blur-sm"
                >
                  <Icon className="size-4.5" />
                </span>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </Container>
  )
}
