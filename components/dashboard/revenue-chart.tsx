"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { day: "Qua", revenue: 980 },
  { day: "Qui", revenue: 1240 },
  { day: "Sex", revenue: 1850 },
  { day: "Sáb", revenue: 2100 },
  { day: "Dom", revenue: 0 },
  { day: "Seg", revenue: 1100 },
  { day: "Ter", revenue: 1250 },
]

export function RevenueChart() {
  return (
    <ChartContainer
      config={{
        revenue: {
          label: "Receita",
          color: "var(--chart-1)",
        },
      }}
      className="h-[240px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-xs"
            tickFormatter={(v: number) => `R$${v}`}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]}
          />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
