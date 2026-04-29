import { ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { appointments, barbers, services, weekdayLabels } from "@/lib/mock-data"
import { formatBRL } from "@/lib/format"
import { BarberPerformanceChart } from "@/components/barbers/barber-performance-chart"

export default async function BarberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const barber = barbers.find((b) => b.id === id)
  if (!barber) notFound()

  const apts = appointments.filter((a) => a.barber_id === barber.id)
  const completed = apts.filter((a) => a.status === "completed")
  const revenue = completed.reduce((s, a) => s + a.price, 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/barbers">
            <ArrowLeft className="mr-1 h-4 w-4" /> Barbeiros
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={barber.avatar_url || "/placeholder.svg"} alt={barber.name} />
            <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold">{barber.name}</h1>
            <p className="text-sm text-muted-foreground">{barber.bio}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {barber.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {barber.phone}</span>
              <Badge variant={barber.active ? "default" : "secondary"}>{barber.active ? "Ativo" : "Inativo"}</Badge>
            </div>
          </div>
          <Button>Editar</Button>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="schedule">Horários</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{barber.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{barber.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{barber.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comissão</span><span>{barber.commission_pct}%</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cor na agenda</span>
                  <div className="h-5 w-5 rounded ring-1 ring-border" style={{ backgroundColor: barber.color }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Bio</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{barber.bio || "Sem bio"}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader><CardTitle>Horários de trabalho</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(barber.schedule).map((day) => {
                  const s = barber.schedule[day]
                  return (
                    <div
                      key={day}
                      className="flex flex-wrap items-center gap-3 p-3 rounded-md border"
                    >
                      <span className="font-medium w-24">{weekdayLabels[day]}</span>
                      {s.open ? (
                        <>
                          <span className="text-sm tabular-nums">{s.start} — {s.end}</span>
                          {s.lunch_start && (
                            <span className="text-xs text-muted-foreground">
                              (Almoço: {s.lunch_start} — {s.lunch_end})
                            </span>
                          )}
                          <Badge variant="secondary" className="ml-auto">Aberto</Badge>
                        </>
                      ) : (
                        <Badge variant="outline" className="ml-auto">Fechado</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader><CardTitle>Serviços executados</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map((s) => {
                  const offered = barber.service_ids.includes(s.id)
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between rounded-md border p-3 ${offered ? "" : "opacity-50"}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.duration_min}min</p>
                      </div>
                      <p className="font-semibold tabular-nums">{formatBRL(s.price)}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Atendimentos totais</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{apts.length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Faturamento</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold tabular-nums">{formatBRL(revenue)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Comissão recebida</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold tabular-nums">{formatBRL(revenue * barber.commission_pct / 100)}</p></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Performance dos últimos 30 dias</CardTitle></CardHeader>
            <CardContent><BarberPerformanceChart /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
