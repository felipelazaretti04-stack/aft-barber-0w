"use client"

import { useState, useTransition } from "react"
import {
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Download,
  RefreshCw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatBRL, formatDateBR } from "@/lib/format"
import { createCheckoutAction, cancelSubscriptionAction } from "@/app/actions/billing"
import { useSearchParams } from "next/navigation"

interface BillingInfo {
  out_plan_slug: string
  out_plan_name: string
  out_price_cents: number
  out_status: string
  out_trial_ends_at: string | null
  out_current_period_end: string | null
  out_cancel_at_period_end: boolean
  out_mp_subscription_id: string | null
  out_barbers_count: number
  out_barbers_limit: number | null
  out_services_count: number
  out_services_limit: number | null
}

interface Plan {
  id: string
  name: string
  slug: string
  price_cents: number
  description: string | null
}

interface Invoice {
  id: string
  amount_cents: number
  status: string
  paid_at: string | null
  period_start: string | null
  period_end: string | null
  pdf_url: string | null
  mp_payment_id: string | null
}

interface Props {
  tenantId: string
  billing: BillingInfo | null
  plans: Plan[]
  invoices: Invoice[]
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    "1 profissional",
    "Até 10 serviços",
    "200 agendamentos/mês",
    "Agendamento público",
    "Página da barbearia",
  ],
  free: [
    "1 profissional",
    "Até 10 serviços",
    "200 agendamentos/mês",
    "Agendamento público",
    "Página da barbearia",
  ],
  pro: [
    "Até 5 profissionais",
    "Até 30 serviços",
    "1.000 agendamentos/mês",
    "Notificações via WhatsApp",
    "Relatórios avançados",
    "PDV completo",
    "Lista de espera",
  ],
  premium: [
    "Profissionais ilimitados",
    "Serviços ilimitados",
    "Agendamentos ilimitados",
    "Campanhas de marketing",
    "Programa de fidelidade",
    "Branding personalizado",
    "Suporte prioritário",
  ],
}

export function PlanPageClient({ tenantId, billing, plans, invoices }: Props) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [upgradeSlug, setUpgradeSlug] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")

  const currentSlug = billing?.out_plan_slug ?? "starter"
  const currentPlan = plans.find((p) => p.slug === currentSlug)

  const periodEnd = billing?.out_current_period_end
    ? new Date(billing.out_current_period_end)
    : null
  const daysLeft = periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / 86_400_000))
    : null

  const barberPct =
    billing && billing.out_barbers_limit
      ? (billing.out_barbers_count / billing.out_barbers_limit) * 100
      : 0
  const servicePct =
    billing && billing.out_services_limit
      ? (billing.out_services_count / billing.out_services_limit) * 100
      : 0

  function handleUpgrade(slug: string) {
    if (slug === "free") return
    setUpgradeSlug(slug)
  }

  function confirmUpgrade() {
    if (!upgradeSlug) return
    startTransition(async () => {
      try {
        await createCheckoutAction(upgradeSlug)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao iniciar checkout"
        toast.error(msg)
      }
    })
    setUpgradeSlug(null)
  }

  function confirmCancel() {
    startTransition(async () => {
      try {
        await cancelSubscriptionAction()
        toast.success("Assinatura cancelada. Acesso mantido até o fim do período.")
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao cancelar"
        toast.error(msg)
      }
    })
    setCancelDialogOpen(false)
  }

  const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active:    { label: "Ativo",    variant: "default" },
    trial:     { label: "Trial",    variant: "secondary" },
    trialing:  { label: "Trial",    variant: "secondary" },
    suspended: { label: "Suspenso", variant: "destructive" },
    canceled:  { label: "Cancelado",variant: "destructive" },
  }
  const statusMeta = statusLabel[billing?.out_status ?? "trial"] ?? statusLabel["trial"]

  const trialEndDate = billing?.out_trial_ends_at
    ? new Date(billing.out_trial_ends_at)
    : null
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / 86_400_000))
    : null

  return (
    <>
      {/* Banner: cartão pendente */}
      {reason === "pending_payment" && (
        <Alert className="border-yellow-500/40 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
          <CreditCard className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>Cadastre um cartao para continuar</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Sua conta esta em trial. Adicione um cartao para garantir o acesso apos o periodo gratuito.</span>
            <Button size="sm" variant="outline" className="shrink-0 border-yellow-500 text-yellow-800 hover:bg-yellow-100 dark:text-yellow-200 dark:hover:bg-yellow-900/50" asChild>
              <a href="/onboarding/cartao">Cadastrar cartao</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Banner: conta bloqueada */}
      {reason === "blocked" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conta bloqueada</AlertTitle>
          <AlertDescription>
            Seu periodo de acesso encerrou sem um pagamento valido. Escolha um plano abaixo para reativar sua conta.
          </AlertDescription>
        </Alert>
      )}

      {/* Banner: dias restantes de trial (quando ok + trialing) */}
      {!reason && trialDaysLeft !== null && trialDaysLeft <= 7 && trialDaysLeft > 0 && (
        <Alert className="border-primary/30 bg-primary/5">
          <Calendar className="h-4 w-4 text-primary" />
          <AlertTitle>Trial ativo</AlertTitle>
          <AlertDescription>
            Voce tem <strong>{trialDaysLeft} {trialDaysLeft === 1 ? "dia" : "dias"}</strong> restantes de periodo gratuito.
            {trialEndDate && ` Primeira cobrança em ${formatDateBR(trialEndDate)}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Plano atual */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plano {billing?.out_plan_name ?? "Free"}
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                </CardTitle>
                <CardDescription>
                  {billing?.out_cancel_at_period_end
                    ? "Cancelamento agendado para o fim do período"
                    : periodEnd
                    ? `Próxima cobrança em ${daysLeft} dias (${formatDateBR(periodEnd)})`
                    : "Plano gratuito"}
                </CardDescription>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-3xl font-bold">
                {billing ? formatBRL((billing.out_price_cents ?? 0) / 100) : "R$ 0,00"}
              </p>
              <p className="text-sm text-muted-foreground">/mês</p>
            </div>
          </div>
        </CardHeader>
        {!billing?.out_cancel_at_period_end && currentSlug !== "free" && (
          <CardFooter className="gap-2 border-t pt-4">
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isPending}
            >
              Cancelar assinatura
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Uso atual */}
      {billing && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Profissionais
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{billing.out_barbers_count}</span>
                <span className="text-muted-foreground">
                  {billing.out_barbers_limit ? `de ${billing.out_barbers_limit}` : "ilimitado"}
                </span>
              </div>
              {billing.out_barbers_limit && (
                <Progress
                  value={barberPct}
                  className={cn("mt-2", barberPct >= 80 && "[&>div]:bg-warning")}
                />
              )}
              {barberPct >= 80 && billing.out_barbers_limit && (
                <p className="mt-1 text-xs text-warning">Quase no limite — considere fazer upgrade.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Serviços
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{billing.out_services_count}</span>
                <span className="text-muted-foreground">
                  {billing.out_services_limit ? `de ${billing.out_services_limit}` : "ilimitado"}
                </span>
              </div>
              {billing.out_services_limit && (
                <Progress
                  value={servicePct}
                  className={cn("mt-2", servicePct >= 80 && "[&>div]:bg-warning")}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparação de planos */}
      <Card>
        <CardHeader>
          <CardTitle>Compare os planos</CardTitle>
          <CardDescription>Escolha o melhor plano para sua barbearia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.slug === currentSlug
              const isUpgrade =
                !isCurrent &&
                plan.price_cents > (currentPlan?.price_cents ?? 0)

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-xl border p-6 transition-shadow",
                    isCurrent && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2",
                    plan.slug === "premium" && !isCurrent && "border-chart-3/60",
                  )}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-4 bg-primary">Plano atual</Badge>
                  )}
                  {plan.slug === "premium" && !isCurrent && (
                    <Badge className="absolute -top-3 left-4 bg-chart-3 text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Recomendado
                    </Badge>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">
                        {formatBRL(plan.price_cents / 100)}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    {plan.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    )}
                  </div>

                  <ul className="mb-6 space-y-2">
                    {(PLAN_FEATURES[plan.slug] ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano atual
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.slug)}
                      disabled={isPending}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Fazer upgrade
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.slug)}
                      disabled={isPending || plan.slug === "free"}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Mudar para este
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de faturas */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Faturas</CardTitle>
            <CardDescription>Suas faturas e pagamentos anteriores</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      {inv.period_start ? formatDateBR(inv.period_start) : "—"}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatBRL(inv.amount_cents / 100)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "default"
                            : inv.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {inv.status === "paid"
                          ? "Pago"
                          : inv.status === "pending"
                          ? "Pendente"
                          : "Falhou"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: confirmar upgrade */}
      <Dialog open={!!upgradeSlug} onOpenChange={() => setUpgradeSlug(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar upgrade</DialogTitle>
            <DialogDescription>
              Você será redirecionado para o Mercado Pago para concluir o pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {upgradeSlug && (
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Plano {plans.find((p) => p.slug === upgradeSlug)?.name}
                </p>
                <p className="text-2xl font-bold">
                  {formatBRL((plans.find((p) => p.slug === upgradeSlug)?.price_cents ?? 0) / 100)}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
              </div>
            )}
            <Alert className="mt-4">
              <CreditCard className="h-4 w-4" />
              <AlertTitle>Pagamento seguro</AlertTitle>
              <AlertDescription>
                O pagamento é processado pelo Mercado Pago. Você será cobrado mensalmente.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeSlug(null)}>
              Voltar
            </Button>
            <Button onClick={confirmUpgrade} disabled={isPending}>
              Ir para o checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: cancelar assinatura */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza? Você manterá o acesso até o fim do período atual.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Após o cancelamento, sua conta será rebaixada para o plano Free e você perderá
              acesso às funcionalidades Pro/Premium.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Manter plano
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={isPending}>
              Cancelar assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
