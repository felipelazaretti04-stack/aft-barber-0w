"use client"

import Link from "next/link"
import { ArrowUpRight, Building2, DollarSign, Sparkles, TrendingUp, UserCheck, UserMinus } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { allTenants } from "@/lib/mock-data"
import { formatBRL, formatDateBR } from "@/lib/format"

const monthlyGrowth = [
  { month: "Mai", tenants: 12 },
  { month: "Jun", tenants: 18 },
  { month: "Jul", tenants: 27 },
  { month: "Ago", tenants: 34 },
  { month: "Set", tenants: 41 },
  { month: "Out", tenants: 49 },
  { month: "Nov", tenants: 58 },
  { month: "Dez", tenants: 65 },
  { month: "Jan", tenants: 72 },
  { month: "Fev", tenants: 84 },
  { month: "Mar", tenants: 96 },
  { month: "Abr", tenants: 108 },
]

const monthlyMRR = [
  { month: "Mai", mrr: 1240 },
  { month: "Jun", mrr: 1890 },
  { month: "Jul", mrr: 2780 },
  { month: "Ago", mrr: 3500 },
  { month: "Set", mrr: 4250 },
  { month: "Out", mrr: 5100 },
  { month: "Nov", mrr: 6090 },
  { month: "Dez", mrr: 6850 },
  { month: "Jan", mrr: 7620 },
  { month: "Fev", mrr: 8950 },
  { month: "Mar", mrr: 10240 },
  { month: "Abr", mrr: 11580 },
]

const statusVariant: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  suspended: { label: "Suspenso", className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  churned: { label: "Cancelado", className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
}

const planVariant: Record<string, string> = {
  starter: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
}

export default function AdminDashboardPage() {
  const total = allTenants.length
  const active = allTenants.filter((t) => t.status === "active").length
  const trial = allTenants.filter((t) => t.status === "trial").length
  const churned = allTenants.filter((t) => t.status === "churned").length
  const mrr = allTenants.reduce((sum, t) => sum + t.mrr, 0)
  const arr = mrr * 12

  const recent = [...allTenants].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ).slice(0, 5)

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Visão geral"
        description="Métricas globais da plataforma AFT Barber"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Exportar relatório
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              MRR
            </CardDescription>
            <CardTitle className="text-2xl">{formatBRL(mrr)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +13.1% no mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">ARR</CardDescription>
            <CardTitle className="text-2xl">{formatBRL(arr)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">projeção anual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Total tenants
            </CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <UserCheck className="h-3.5 w-3.5" />
              Ativos
            </CardDescription>
            <CardTitle className="text-2xl">{active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{((active / total) * 100).toFixed(0)}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Trial</CardDescription>
            <CardTitle className="text-2xl">{trial}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-600">em conversão</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <UserMinus className="h-3.5 w-3.5" />
              Churned
            </CardDescription>
            <CardTitle className="text-2xl">{churned}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">cancelados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crescimento de tenants</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ tenants: { label: "Tenants", color: "var(--chart-1)" } }}
              className="h-[260px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowth} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="tenants"
                    stroke="var(--color-tenants)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MRR — últimos 12 meses</CardTitle>
            <CardDescription>Receita recorrente mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ mrr: { label: "MRR", color: "var(--chart-1)" } }}
              className="h-[260px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMRR} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(v: number) => [formatBRL(v), "MRR"]}
                  />
                  <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Últimas barbearias cadastradas</CardTitle>
            <CardDescription>Cadastros mais recentes na plataforma</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/tenants" className="gap-1">
              Ver todas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barbearia</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/{t.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${planVariant[t.plan]}`}>
                      {t.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusVariant[t.status]?.className}>
                      {statusVariant[t.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatBRL(t.mrr)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateBR(t.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/tenants/${t.id}`}>Detalhes</Link>
                    </Button>
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
