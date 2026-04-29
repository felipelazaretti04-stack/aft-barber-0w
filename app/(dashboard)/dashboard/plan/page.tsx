"use client"

import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { barbers, currentTenant, invoices, plans } from "@/lib/mock-data"
import { formatBRL, formatDateBR } from "@/lib/format"
import type { Plan, PlanTier } from "@/lib/types"

// Current plan usage
const currentUsage = {
  barbers: barbers.length,
  appointments_month: 342,
}

export default function PlanPage() {
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const currentPlan = plans.find((p) => p.id === currentTenant.plan) || plans[1]
  const daysRemaining = 12 // Mock
  const nextBillingDate = new Date()
  nextBillingDate.setDate(nextBillingDate.getDate() + daysRemaining)

  const barberUsagePercent = (currentUsage.barbers / currentPlan.max_barbers) * 100
  const appointmentUsagePercent = (currentUsage.appointments_month / currentPlan.max_appointments) * 100

  const handleUpgrade = (planId: PlanTier) => {
    setSelectedPlan(planId)
    setChangePlanDialogOpen(true)
  }

  const confirmPlanChange = () => {
    toast.success(`Plano alterado para ${plans.find((p) => p.id === selectedPlan)?.name}`)
    setChangePlanDialogOpen(false)
    setSelectedPlan(null)
  }

  const handleCancel = () => {
    toast.success("Assinatura cancelada. Você terá acesso até o final do período.")
    setCancelDialogOpen(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Plano e Faturamento" description="Gerencie sua assinatura e histórico de pagamentos" />

      {/* Current Plan Card */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plano {currentPlan.name}
                  <Badge variant="default" className="ml-2">Ativo</Badge>
                </CardTitle>
                <CardDescription>
                  Próxima cobrança em {daysRemaining} dias ({formatDateBR(nextBillingDate)})
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatBRL(currentPlan.price)}</p>
              <p className="text-sm text-muted-foreground">/mês</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Cartão de crédito</p>
              <p className="text-sm text-muted-foreground">Visa terminando em 1234</p>
            </div>
            <Button variant="outline" size="sm">Atualizar</Button>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setChangePlanDialogOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Mudar Plano
          </Button>
          <Button variant="ghost" className="text-destructive" onClick={() => setCancelDialogOpen(true)}>
            Cancelar Assinatura
          </Button>
        </CardFooter>
      </Card>

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Barbeiros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentUsage.barbers}</span>
              <span className="text-muted-foreground">de {currentPlan.max_barbers}</span>
            </div>
            <Progress
              value={barberUsagePercent}
              className={cn("mt-2", barberUsagePercent >= 80 && "bg-warning/20")}
            />
            {barberUsagePercent >= 80 && (
              <p className="text-xs text-warning mt-2">Quase no limite! Considere fazer upgrade.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos/mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentUsage.appointments_month}</span>
              <span className="text-muted-foreground">de {currentPlan.max_appointments.toLocaleString("pt-BR")}</span>
            </div>
            <Progress
              value={appointmentUsagePercent}
              className={cn("mt-2", appointmentUsagePercent >= 80 && "bg-warning/20")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Plans Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare os planos</CardTitle>
          <CardDescription>Escolha o melhor plano para sua barbearia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentTenant.plan
              const isUpgrade = plan.price > currentPlan.price
              const isDowngrade = plan.price < currentPlan.price

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-lg border p-6 transition-all",
                    isCurrent && "border-primary bg-primary/5 ring-2 ring-primary",
                    plan.id === "premium" && !isCurrent && "border-chart-3"
                  )}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 left-4 bg-primary">Plano Atual</Badge>
                  )}
                  {plan.id === "premium" && !isCurrent && (
                    <Badge className="absolute -top-2 left-4 bg-chart-3 text-chart-3-foreground">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Recomendado
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{formatBRL(plan.price)}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano atual
                    </Button>
                  ) : isUpgrade ? (
                    <Button className="w-full" onClick={() => handleUpgrade(plan.id)}>
                      <Zap className="mr-2 h-4 w-4" />
                      Fazer upgrade
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => handleUpgrade(plan.id)}>
                      Mudar para este
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>Suas faturas e pagamentos anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDateBR(invoice.date)}</TableCell>
                  <TableCell className="font-medium tabular-nums">{formatBRL(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "pending" ? "secondary" : "destructive"}>
                      {invoice.status === "paid" ? "Pago" : invoice.status === "pending" ? "Pendente" : "Falhou"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar mudança de plano</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  Você está mudando do plano <strong>{currentPlan.name}</strong> para o plano{" "}
                  <strong>{plans.find((p) => p.id === selectedPlan)?.name}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlan && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{plans.find((p) => p.id === selectedPlan)?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plans.find((p) => p.id === selectedPlan)?.max_barbers} barbeiros,{" "}
                      {plans.find((p) => p.id === selectedPlan)?.max_appointments.toLocaleString("pt-BR")} agendamentos/mês
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatBRL(plans.find((p) => p.id === selectedPlan)?.price || 0)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>

                {selectedPlan && plans.find((p) => p.id === selectedPlan)!.price > currentPlan.price && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cobrança imediata</AlertTitle>
                    <AlertDescription>
                      A diferença será cobrada proporcionalmente ao tempo restante do período atual.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmPlanChange}>
              Confirmar mudança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Ao cancelar, você perderá acesso a:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Agendamentos ilimitados</li>
                  <li>Página pública de reservas</li>
                  <li>Relatórios avançados</li>
                  <li>Galeria de fotos</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Manter plano
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancelar assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
