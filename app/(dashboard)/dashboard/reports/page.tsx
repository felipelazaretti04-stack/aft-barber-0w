"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CalendarDays,
  DollarSign,
  Download,
  Filter,
  Percent,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard/page-header"
import { appointments, barbers, services } from "@/lib/mock-data"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"

// Mock data para relatórios
const revenueData = [
  { date: "01/04", revenue: 1250 },
  { date: "02/04", revenue: 980 },
  { date: "03/04", revenue: 1520 },
  { date: "04/04", revenue: 1100 },
  { date: "05/04", revenue: 890 },
  { date: "06/04", revenue: 1680 },
  { date: "07/04", revenue: 1420 },
  { date: "08/04", revenue: 1350 },
  { date: "09/04", revenue: 1100 },
  { date: "10/04", revenue: 1550 },
  { date: "11/04", revenue: 1200 },
  { date: "12/04", revenue: 980 },
  { date: "13/04", revenue: 1680 },
  { date: "14/04", revenue: 1520 },
  { date: "15/04", revenue: 1350 },
  { date: "16/04", revenue: 1100 },
  { date: "17/04", revenue: 1420 },
  { date: "18/04", revenue: 1250 },
  { date: "19/04", revenue: 890 },
  { date: "20/04", revenue: 1680 },
  { date: "21/04", revenue: 1520 },
  { date: "22/04", revenue: 1350 },
  { date: "23/04", revenue: 1100 },
  { date: "24/04", revenue: 1420 },
  { date: "25/04", revenue: 1550 },
  { date: "26/04", revenue: 980 },
  { date: "27/04", revenue: 1680 },
  { date: "28/04", revenue: 1520 },
  { date: "29/04", revenue: 1450 },
  { date: "30/04", revenue: 1280 },
]

const barberPerformance = barbers.map((b, i) => ({
  id: b.id,
  name: b.name,
  avatar_url: b.avatar_url,
  revenue: [8450, 7230, 6890, 5420][i] || 0,
  appointments: [112, 98, 89, 72][i] || 0,
  avgTicket: [75.4, 73.8, 77.4, 75.3][i] || 0,
  occupancy: [82, 76, 74, 68][i] || 0,
  noShowRate: [3.2, 4.5, 2.8, 5.1][i] || 0,
}))

const topServices = services.slice(0, 10).map((s, i) => ({
  id: s.id,
  name: s.name,
  count: [156, 128, 98, 67, 45, 32, 28, 24, 18, 12][i] || 0,
  revenue: [11700, 5120, 7350, 2680, 990, 1280, 1400, 960, 720, 600][i] || 0,
}))

const paymentBreakdown = [
  { name: "Pix", value: 42, fill: "var(--chart-1)" },
  { name: "Crédito", value: 28, fill: "var(--chart-2)" },
  { name: "Débito", value: 18, fill: "var(--chart-3)" },
  { name: "Dinheiro", value: 12, fill: "var(--chart-4)" },
]

const heatmapData = [
  { hour: "09h", seg: 4, ter: 3, qua: 5, qui: 6, sex: 7, sab: 8 },
  { hour: "10h", seg: 6, ter: 5, qua: 7, qui: 8, sex: 9, sab: 10 },
  { hour: "11h", seg: 8, ter: 7, qua: 8, qui: 9, sex: 10, sab: 9 },
  { hour: "12h", seg: 2, ter: 2, qua: 3, qui: 3, sex: 4, sab: 6 },
  { hour: "13h", seg: 3, ter: 3, qua: 4, qui: 4, sex: 5, sab: 7 },
  { hour: "14h", seg: 7, ter: 6, qua: 7, qui: 8, sex: 9, sab: 10 },
  { hour: "15h", seg: 8, ter: 7, qua: 8, qui: 9, sex: 10, sab: 10 },
  { hour: "16h", seg: 7, ter: 6, qua: 7, qui: 8, sex: 9, sab: 9 },
  { hour: "17h", seg: 9, ter: 8, qua: 9, qui: 10, sex: 10, sab: 8 },
  { hour: "18h", seg: 10, ter: 9, qua: 10, qui: 10, sex: 10, sab: 6 },
  { hour: "19h", seg: 8, ter: 7, qua: 8, qui: 9, sex: 9, sab: 0 },
  { hour: "20h", seg: 5, ter: 4, qua: 5, qui: 6, sex: 7, sab: 0 },
]

const funnelData = [
  { name: "Visualizações", value: 1250, fill: "var(--chart-1)" },
  { name: "Início agendamento", value: 580, fill: "var(--chart-2)" },
  { name: "Selecionou serviço", value: 420, fill: "var(--chart-3)" },
  { name: "Selecionou horário", value: 320, fill: "var(--chart-4)" },
  { name: "Agendou", value: 245, fill: "var(--chart-5)" },
]

const periodOptions = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState("30d")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  // KPIs
  const totalRevenue = 42850
  const totalAppointments = 371
  const avgTicket = totalRevenue / totalAppointments
  const occupancyRate = 78
  const noShowRate = 3.8
  const newClients = 28

  const handleExportCSV = () => {
    // Simula exportação
    const csvContent = "data:text/csv;charset=utf-8,Barbeiro,Faturamento,Atendimentos,Ticket Médio,Ocupação,No-show\n"
      + barberPerformance.map((b) => `${b.name},${b.revenue},${b.appointments},${b.avgTicket},${b.occupancy}%,${b.noShowRate}%`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "relatorio-barbeiros.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Relatórios" description="Análise completa do desempenho da barbearia">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </PageHeader>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {period === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${dateRange.from.toLocaleDateString("pt-BR")} - ${dateRange.to.toLocaleDateString("pt-BR")}`
                  ) : (
                    dateRange.from.toLocaleDateString("pt-BR")
                  )
                ) : (
                  "Selecionar datas"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+12.5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atendimentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+8.2% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(avgTicket)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+4.1% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ocupação</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+2.3% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">No-show</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noShowRate}%</div>
            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
              <ArrowDown className="h-3 w-3" />
              <span>-0.5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newClients}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+16.7% vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita últimos 30 dias</CardTitle>
            <CardDescription>Evolução diária do faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Receita", color: "var(--chart-1)" },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} tickFormatter={(v) => `R$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>Distribuição por forma de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                pix: { label: "Pix", color: "var(--chart-1)" },
                credito: { label: "Crédito", color: "var(--chart-2)" },
                debito: { label: "Débito", color: "var(--chart-3)" },
                dinheiro: { label: "Dinheiro", color: "var(--chart-4)" },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Barber Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Barbeiro</CardTitle>
            <CardDescription>Desempenho individual da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Faturamento", color: "var(--chart-1)" },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barberPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--muted-foreground)" }} tickFormatter={(v) => `R$${v}`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)" }} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Serviços</CardTitle>
            <CardDescription>Serviços mais vendidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Quantidade", color: "var(--chart-2)" },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)" }} width={140} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Calor</CardTitle>
            <CardDescription>Horários mais movimentados (dia x hora)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground" />
                    <th className="p-2 text-center font-medium text-muted-foreground">Seg</th>
                    <th className="p-2 text-center font-medium text-muted-foreground">Ter</th>
                    <th className="p-2 text-center font-medium text-muted-foreground">Qua</th>
                    <th className="p-2 text-center font-medium text-muted-foreground">Qui</th>
                    <th className="p-2 text-center font-medium text-muted-foreground">Sex</th>
                    <th className="p-2 text-center font-medium text-muted-foreground">Sáb</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row) => (
                    <tr key={row.hour}>
                      <td className="p-2 text-muted-foreground">{row.hour}</td>
                      {["seg", "ter", "qua", "qui", "sex", "sab"].map((day) => {
                        const value = row[day as keyof typeof row] as number
                        const intensity = value / 10
                        return (
                          <td key={day} className="p-1">
                            <div
                              className="h-8 rounded flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: `oklch(0.55 0.21 263 / ${intensity})`,
                                color: intensity > 0.5 ? "white" : "var(--foreground)",
                              }}
                            >
                              {value > 0 ? value : "-"}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Da visualização ao agendamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((item, index) => {
                const prevValue = index > 0 ? funnelData[index - 1].value : item.value
                const pct = Math.round((item.value / funnelData[0].value) * 100)
                const conversionRate = index > 0 ? Math.round((item.value / prevValue) * 100) : 100
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.value} ({pct}%)
                        {index > 0 && (
                          <span className="ml-2 text-xs">
                            <ArrowDown className="h-3 w-3 inline" /> {conversionRate}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-8 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Barbeiro</CardTitle>
          <CardDescription>Métricas completas de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barbeiro</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
                <TableHead className="text-right">Atendimentos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Ocupação</TableHead>
                <TableHead className="text-right">No-show</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barberPerformance.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                        <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{b.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatBRL(b.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.appointments}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(b.avgTicket)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={b.occupancy >= 75 ? "default" : "secondary"}>{b.occupancy}%</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={b.noShowRate <= 4 ? "secondary" : "destructive"}>{b.noShowRate}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
