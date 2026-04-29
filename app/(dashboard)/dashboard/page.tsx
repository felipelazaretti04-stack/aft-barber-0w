import { ArrowDown, ArrowUp, Calendar, DollarSign, Plus, ShoppingCart, TrendingUp, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/dashboard/page-header"
import { AppointmentStatusBadge } from "@/components/dashboard/status-badge"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { appointments, barbers, clients, currentUser, getBarber, getClient, getService, services } from "@/lib/mock-data"
import { formatBRL, formatTimeBR, getGreeting } from "@/lib/format"

function getTodayAppointments() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return appointments.filter((a) => {
    const d = new Date(a.start_at)
    return d >= today && d < tomorrow
  })
}

export default function DashboardPage() {
  const todayAppts = getTodayAppointments()
  const confirmed = todayAppts.filter((a) => a.status === "confirmed" || a.status === "in_progress" || a.status === "completed").length
  const pending = todayAppts.filter((a) => a.status === "pending").length
  const todayRevenue = todayAppts
    .filter((a) => a.status === "completed" || a.status === "in_progress" || a.status === "confirmed")
    .reduce((sum, a) => sum + a.price, 0)

  const upcoming = todayAppts
    .filter((a) => a.status !== "cancelled" && a.status !== "no_show")
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 5)

  const todayDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())

  // Top barbers
  const barberStats = barbers.map((b) => {
    const apptsForBarber = appointments.filter((a) => a.barber_id === b.id)
    const revenue = apptsForBarber.filter((a) => a.status === "completed").reduce((s, a) => s + a.price, 0)
    return { barber: b, count: apptsForBarber.length, revenue }
  }).sort((a, b) => b.revenue - a.revenue)

  // Top services
  const serviceStats = services.map((s) => {
    const count = appointments.filter((a) => a.service_id === s.id).length
    return { service: s, count }
  }).sort((a, b) => b.count - a.count).slice(0, 5)
  const totalServiceCount = serviceStats.reduce((s, x) => s + x.count, 0) || 1

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${currentUser.name.split(" ")[0]}!`}
        description={todayDate.charAt(0).toUpperCase() + todayDate.slice(1)}
      >
        <Button asChild>
          <Link href="/dashboard/agenda">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Link>
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(todayRevenue)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+15% vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {confirmed} confirmados · {pending} pendentes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos clientes (mês)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+33% vs mês passado</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos agendamentos + agenda hoje */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos agendamentos</CardTitle>
                <CardDescription>Os próximos atendimentos de hoje</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/agenda">Ver agenda</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento para hoje.</p>
            ) : (
              <ul className="divide-y">
                {upcoming.map((apt) => {
                  const client = getClient(apt.client_id)
                  const barber = getBarber(apt.barber_id)
                  const service = getService(apt.service_id)
                  return (
                    <li key={apt.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={client?.avatar_url || "/placeholder.svg"} alt={client?.name} />
                        <AvatarFallback>{client?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {service?.name} · com {barber?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">{formatTimeBR(apt.start_at)}</p>
                        <AppointmentStatusBadge status={apt.status} className="mt-1" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda de hoje</CardTitle>
            <CardDescription>Visão rápida das salas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {barbers.slice(0, 4).map((b) => {
                const count = todayAppts.filter((a) => a.barber_id === b.id).length
                return (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-md border">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                      <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                    </div>
                    <Badge variant="secondary" className="tabular-nums">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita últimos 7 dias</CardTitle>
            <CardDescription>Evolução do faturamento diário</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top barbeiros</CardTitle>
            <CardDescription>Ranking do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {barberStats.slice(0, 4).map((s, i) => (
                <li key={s.barber.id} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {i + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={s.barber.avatar_url || "/placeholder.svg"} alt={s.barber.name} />
                    <AvatarFallback>{s.barber.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.barber.name}</p>
                    <p className="text-xs text-muted-foreground">{s.count} atendimentos</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatBRL(s.revenue)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Top services + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Serviços mais vendidos</CardTitle>
            <CardDescription>Top 5 do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {serviceStats.map((s) => {
                const pct = Math.round((s.count / totalServiceCount) * 100)
                return (
                  <li key={s.service.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{s.service.name}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">{s.count} ({pct}%)</p>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
            <CardDescription>Acesso direto</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/dashboard/agenda">
                <Plus className="h-5 w-5" />
                <span className="text-xs">Novo agendamento</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/dashboard/clients">
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Cadastrar cliente</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/dashboard/pos">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Venda rápida</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/dashboard/blocks">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Bloquear horário</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
