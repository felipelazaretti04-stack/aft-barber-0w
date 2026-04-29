"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Instagram,
  MapPin,
  Phone,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { allTenants, auditLogs, plans } from "@/lib/mock-data"
import { formatBRL, formatDateBR, formatDateTimeBR } from "@/lib/format"
import { toast } from "sonner"

const statusVariant: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  suspended: { label: "Suspenso", className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  churned: { label: "Cancelado", className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
}

interface PaymentRow {
  id: string
  date: string
  amount: number
  method: string
  status: "paid" | "pending" | "failed"
}

const mockPayments: PaymentRow[] = [
  { id: "inv_104", date: "2026-04-01T00:00:00Z", amount: 99, method: "Cartão •••• 4242", status: "paid" },
  { id: "inv_103", date: "2026-03-01T00:00:00Z", amount: 99, method: "Cartão •••• 4242", status: "paid" },
  { id: "inv_102", date: "2026-02-01T00:00:00Z", amount: 99, method: "Cartão •••• 4242", status: "paid" },
  { id: "inv_101", date: "2026-01-01T00:00:00Z", amount: 99, method: "Cartão •••• 4242", status: "paid" },
  { id: "inv_100", date: "2025-12-01T00:00:00Z", amount: 99, method: "Pix", status: "paid" },
  { id: "inv_099", date: "2025-11-01T00:00:00Z", amount: 99, method: "Cartão •••• 4242", status: "paid" },
]

const paymentStatus: Record<string, { label: string; className: string }> = {
  paid: { label: "Pago", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  pending: { label: "Pendente", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  failed: { label: "Falhou", className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
}

export default function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const tenant = allTenants.find((t) => t.id === id)
  if (!tenant) notFound()

  const plan = plans.find((p) => p.id === tenant.plan)!
  const tenantLogs = auditLogs.filter((log) => log.tenant_id === tenant.id)
  const totalGenerated = mockPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

  // Mock usage
  const barberUsage = Math.min(plan.max_barbers, Math.floor(plan.max_barbers * 0.7))
  const apptUsage = Math.floor(plan.max_appointments * 0.55)

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/admin/tenants">
          <ArrowLeft className="h-4 w-4" />
          Todas as barbearias
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{tenant.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
            <span className="text-muted-foreground">/{tenant.slug}</span>
            <Badge variant="outline" className={statusVariant[tenant.status]?.className}>
              {statusVariant[tenant.status]?.label}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {tenant.plan}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success(`Impersonando ${tenant.name}`)}>
            <UserCog className="h-4 w-4" />
            Impersonar
          </Button>
          {tenant.status === "suspended" ? (
            <Button size="sm" className="gap-2" onClick={() => toast.success("Tenant reativado")}>
              <ShieldCheck className="h-4 w-4" />
              Reativar
            </Button>
          ) : (
            <Button variant="destructive" size="sm" className="gap-2" onClick={() => toast.success("Tenant suspenso")}>
              <Ban className="h-4 w-4" />
              Suspender
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Descrição</p>
              <p>{tenant.description}</p>
            </div>
            <Separator />
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{tenant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{tenant.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              <span>{tenant.instagram}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Cadastrada em {formatDateBR(tenant.created_at)}</span>
            </div>
            <Separator />
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <Link href={`/booking/${tenant.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir página pública
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Uso atual
            </CardTitle>
            <CardDescription>Plano {plan.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Barbeiros</span>
                <span className="font-medium">
                  {barberUsage} / {plan.max_barbers === 999 ? "∞" : plan.max_barbers}
                </span>
              </div>
              <Progress value={plan.max_barbers === 999 ? 30 : (barberUsage / plan.max_barbers) * 100} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Agendamentos do mês</span>
                <span className="font-medium">
                  {apptUsage.toLocaleString("pt-BR")} /{" "}
                  {plan.max_appointments === 99999 ? "∞" : plan.max_appointments.toLocaleString("pt-BR")}
                </span>
              </div>
              <Progress
                value={plan.max_appointments === 99999 ? 30 : (apptUsage / plan.max_appointments) * 100}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="font-semibold">847</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviços</p>
                <p className="font-semibold">14</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Última atividade</p>
                <p className="font-semibold text-sm">há 12 min</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Login admin</p>
                <p className="font-semibold text-sm">há 2 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Faturamento gerado</CardTitle>
            <CardDescription>Receita total para a plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-semibold">{formatBRL(totalGenerated)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {mockPayments.filter((p) => p.status === "paid").length} pagamentos concluídos
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">MRR atual</p>
                <p className="font-semibold">{formatBRL(tenant.mrr)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LTV estimado</p>
                <p className="font-semibold">{formatBRL(tenant.mrr * 24)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Próxima cobrança</p>
                <p className="font-semibold text-sm">01/05/2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Método</p>
                <p className="font-semibold text-sm">Cartão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: payments, logs */}
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Histórico de pagamentos</TabsTrigger>
          <TabsTrigger value="logs">Logs do tenant</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>{formatDateBR(p.date)}</TableCell>
                    <TableCell className="font-medium">{formatBRL(p.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={paymentStatus[p.status]?.className}>
                        {p.status === "paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {paymentStatus[p.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver fatura
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTimeBR(log.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">{log.user_name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</code>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.ip}</TableCell>
                  </TableRow>
                ))}
                {tenantLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      Nenhum log registrado para este tenant.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
