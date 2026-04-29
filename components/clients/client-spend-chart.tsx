"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Nov", spent: 75 },
  { month: "Dez", spent: 120 },
  { month: "Jan", spent: 75 },
  { month: "Fev", spent: 150 },
  { month: "Mar", spent: 75 },
  { month: "Abr", spent: 220 },
]

export function ClientSpendChart() {
  return (
    <ChartContainer config={{ spent: { label: "Gasto", color: "var(--chart-1)" } }} className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
          <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v: number) => `R$${v}`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="spent" fill="var(--color-spent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
