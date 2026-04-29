import { ArrowLeft, Cake, Calendar, MessageCircle, Pencil, Phone, Plus, Star } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentStatusBadge } from "@/components/dashboard/status-badge"
import { ClientSpendChart } from "@/components/clients/client-spend-chart"
import { appointments, clients, getBarber, getService } from "@/lib/mock-data"
import { formatBRL, formatDateBR, formatRelativeBR, formatTimeBR } from "@/lib/format"

function getDaysUntilBirthday(birthday: string): number {
  const today = new Date()
  const [, mm, dd] = birthday.split("-").map(Number)
  const next = new Date(today.getFullYear(), mm - 1, dd)
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next.getTime() - today.getTime()) / 86400000)
}

function getAge(birthday: string): number {
  const [yy, mm, dd] = birthday.split("-").map(Number)
  const today = new Date()
  let age = today.getFullYear() - yy
  if (today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd)) age--
  return age
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = clients.find((c) => c.id === id)
  if (!client) notFound()

  const history = appointments
    .filter((a) => a.client_id === client.id)
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
  const completed = history.filter((h) => h.status === "completed")
  const ticketAvg = completed.length > 0 ? client.total_spent / client.visit_count : 0
  const daysUntilBirthday = getDaysUntilBirthday(client.birthday)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/clients">
          <ArrowLeft className="mr-1 h-4 w-4" /> Clientes
        </Link>
      </Button>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Coluna esquerda - sticky */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-3">
                <AvatarImage src={client.avatar_url || "/placeholder.svg"} alt={client.name} />
                <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{getAge(client.birthday)} anos</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {client.tags.map((t) => (
                  <Badge key={t} variant="outline" className="capitalize">
                    {t === "vip" && <Star className="h-3 w-3 mr-1" />}
                    {t === "aniversariante" && <Cake className="h-3 w-3 mr-1" />}
                    {t}
                  </Badge>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> Telefone
                  </span>
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Cake className="h-3.5 w-3.5" /> Aniversário
                  </span>
                  <span>{formatDateBR(client.birthday)} ({daysUntilBirthday}d)</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <p className="text-xs text-muted-foreground">Total gasto</p>
                  <p className="font-semibold tabular-nums">{formatBRL(client.total_spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ticket médio</p>
                  <p className="font-semibold tabular-nums">{formatBRL(ticketAvg)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visitas</p>
                  <p className="font-semibold">{client.visit_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Última</p>
                  <p className="font-semibold text-sm">
                    {client.last_visit_at ? formatRelativeBR(client.last_visit_at) : "Nunca"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" aria-label="WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" aria-label="Ligar">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full mt-2" asChild>
                <Link href="/dashboard/agenda">
                  <Plus className="mr-2 h-4 w-4" /> Novo agendamento
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita */}
        <div>
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="notes">Notas e preferências</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader><CardTitle>Histórico de agendamentos</CardTitle></CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem histórico</p>
                  ) : (
                    <ol className="relative border-l ml-3 space-y-4">
                      {history.map((h) => {
                        const s = getService(h.service_id)
                        const b = getBarber(h.barber_id)
                        return (
                          <li key={h.id} className="ml-6">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{s?.name}</p>
                                  <AppointmentStatusBadge status={h.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  com {b?.name} · {formatDateBR(h.start_at)} às {formatTimeBR(h.start_at)}
                                </p>
                              </div>
                              <p className="font-semibold tabular-nums">{formatBRL(h.price)}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card>
                <CardHeader><CardTitle>Fotos dos cortes</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square rounded-md bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Foto #{i}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Anotações</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{client.notes || "Sem notas"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Preferências</CardTitle></CardHeader>
                <CardContent>
                  {client.preferences.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem preferências cadastradas</p>
                  ) : (
                    <ul className="space-y-2">
                      {client.preferences.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total gasto</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold tabular-nums">{formatBRL(client.total_spent)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Visitas</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{client.visit_count}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ticket médio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold tabular-nums">{formatBRL(ticketAvg)}</p></CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Gastos por mês</CardTitle></CardHeader>
                <CardContent><ClientSpendChart /></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
